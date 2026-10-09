from app.database.connection import get_connection
from app.utils.permisos import resolve_creation_mode
from app.utils.crear_ticket import *
from app.utils.solicitante import *
from app.utils.archivos import *
from app.utils.is_color import is_color
from app.utils.fecha_hora import *
from flask import send_from_directory, send_file, request
from app.utils.limpiar_json import limpiar_para_json
import math
import requests
import json
import logging
import os

os.makedirs("/app/logs", exist_ok=True)

logging.basicConfig(
    filename="/app/logs/app.log",
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s",
    force=True
)

MAIL_SERVICE = f"{os.getenv('NOTIFICATION_SERVICE')}/mail"
MESSAGE_SERVICE = f"{os.getenv('MESSAGE_SERVICE')}/message"

ESTADOS_ID_A_NOMBRE = {
    1: 'Abierto',
    2: 'Anulado',
    3: 'Asignado',
    4: 'En Gestión',
    5: 'Derivado',
    6: 'Resuelto',
    7: 'Reabierto',
    8: 'Cerrado',
}

ESTADOS_NOMBRE_A_ID = {v: k for k, v in ESTADOS_ID_A_NOMBRE.items()}

TRANSICIONES_ESTADO = {
    1: [3],
    3: [2, 4],
    4: [2, 5, 6],
    5: [4, 5],
    6: [7, 8], 
    7: [4],
    2: [],
    8: [], 
}

ESTADOS_BLOQUEADOS_AQUI = {1, 3}

def ver_tickets_service(userId, permisos, request):
    conn = get_connection()
    cursor = conn.cursor()

    estado = request.args.get("estado")
    asignado = request.args.get("asignado")
    categoria = request.args.get("categoria")
    subcategoria = request.args.get("subcategoria")
    prioridad = request.args.get("prioridad")
    nro_ticket = request.args.get("nroTicket")
    fecha_desde = request.args.get("fechaDesde")
    fecha_hasta = request.args.get("fechaHasta")
    pagina = int(request.args.get("pagina", 1))

    where_conditions = []
    params = []

    if estado:
        where_conditions.append("estadoTicket = ?")
        params.append(estado)
    
    if asignado:
        where_conditions.append("usuarioTicketAsignado = ?")
        params.append(asignado)

    if prioridad:
        where_conditions.append("prioridadTicket = ?")
        params.append(prioridad)

    if categoria:
        where_conditions.append("categoriaId = ?")
        params.append(categoria)

    if subcategoria:
        where_conditions.append("subCatId = ?")
        params.append(subcategoria)

    if nro_ticket:
        where_conditions.append("NroTicket LIKE ?")
        params.append(f"%{nro_ticket}%")

    if fecha_desde:
        where_conditions.append("fechaCreacionTicket >= ?")
        params.append(fecha_desde)

    if fecha_hasta:
        where_conditions.append("fechaCreacionTicket <= ?")
        params.append(fecha_hasta)

    if 'VER_TICKETS_TODOS' not in permisos:
        where_conditions.append("usuarioSolicitudTicket = ?")
        params.append(userId)
        
    where_clause = ""

    if where_conditions:
        where_clause = "WHERE " + " AND ".join(where_conditions)

    sql_total = f"""SELECT COUNT(*) as total 
                    FROM [MesaDeAyuda].[dbo].[v_lista_tickets]
                    {where_clause}"""
    
    sql_tickets = f"""SELECT * 
                        FROM [MesaDeAyuda].[dbo].[v_lista_tickets]
                        {where_clause}
                        ORDER BY fechaCreacionTicket DESC
                        OFFSET ? ROWS
                        FETCH NEXT 12 ROWS ONLY"""
        
    try:
        cursor.execute(sql_total, params)

        row = cursor.fetchone()
        total_tickets = int(row[0])
        total_paginas = math.ceil(total_tickets/12)

        offset = (pagina-1)*12

        cursor.execute(sql_tickets, params + [offset])

        columns = [column[0] for column in cursor.description]

        tickets = [
            dict(zip(columns, row))
            for row in cursor.fetchall()
        ]

        return {
            'Mensaje':'Tickets obtenidos correctamente',
            'tickets':tickets,
            'pagina_actual':pagina,
            'total_paginas':total_paginas
        }, 200
    
    except Exception as e:
        return {
            'Mensaje':'Error al obtener los tickets',
            'Error':str(e)
            }, 400
    
def crear_tickets_service(user_id, permisos, data, files):
    sql_mail = "SELECT * FROM v_info_ticket_mail WHERE ticket_id = ?"

    validacion = validate_ticket_data(data)
    if not validacion["valido"]:
        return {"Mensaje": "Datos faltantes", "Error": validacion["errores"]}, 406

    mode = resolve_creation_mode(permisos)
    payload = build_payload(mode, user_id, data)

    conn = get_connection()
    cursor = conn.cursor()

    try:
        resolve_solicitante_for_payload(cursor, mode, payload, data)
        logging.info('resolve_solicitante_for_payload Ok')
        ticket_id = insert_ticket(cursor, payload)
        logging.info('ticket_id Ok')
        nro_ticket = generate_ticket_number(ticket_id)
        logging.info('nro_ticket Ok')
        update_ticket_number(cursor, ticket_id, nro_ticket)
        print('update_ticket_number Ok')
        mensaje_id = insert_initial_message(cursor, ticket_id, payload["ticketDesc"], user_id)
        logging.info('mensaje_id Ok')
        guardar_adjunto(cursor, ticket_id, mensaje_id, user_id, files)
        logging.info('guardar_adjunto Ok')
        insert_history(cursor, ticket_id, user_id)
        logging.info('insert_history Ok')

        conn.commit()
        logging.info("cursor ok")
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return {"Mensaje": "Error creando Ticket", "Error": str(e)}, 400

    response_mail = None
    try:
        cursor.execute(sql_mail, (ticket_id,))
        row = cursor.fetchone()
        columnas = [col[0] for col in cursor.description]
        datos = {col: limpiar_para_json(val) for col, val in zip(columnas, row)}

        if datos:
            mail = requests.post(
                url=f"{MAIL_SERVICE}/creacion-ticket",
                json=datos,
                timeout=10
            )
            try:
                mail_response = mail.json()
            except ValueError:
                mail_response = None

            response_mail = {"statusCode": mail.status_code, "response": mail_response}
    except Exception as e:
        response_mail = {"statusCode": None, "error": str(e)}
    finally:
        cursor.close()
        conn.close()

    return {
        "Mensaje": "Ticket creado correctamente",
        "ticketId": ticket_id,
        "NroTicket": nro_ticket,
        "responseMail": response_mail
    }, 200

def ver_detalle_ticket_service(ticket_id, user_id, permisos):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        sql = """
            SELECT *
            FROM [MesaDeAyuda].[dbo].[v_detalle_tickets]
            WHERE ticketId = ?
        """

        sql_derivacion = """
            SELECT *
            FROM [MesaDeAyuda].[dbo].[v_derivaciones_tickets]
            WHERE ticketId = ?
        """

        sql_solicitante = """
            SELECT *
            FROM v_solicitantes
            WHERE userId = ?
              AND TipoUsuario = ?
        """

        derivaciones = []
        asignado = None

        cursor.execute(sql, ticket_id)

        data = cursor.fetchone()

        if data is None:
            return {
                'Mensaje': 'No se ha encontrado el Ticket'
            }, 404

        usuario_solicitud = data[13]
        tipo_usuario = data[14]
        usuario_asignado = data[16]

        if 'VER_TICKETS_TODOS' not in permisos and usuario_solicitud != user_id:
            return {
                'Mensaje': 'Sin permisos'
            }, 403

        columns = [col[0] for col in cursor.description]
        ticket = dict(zip(columns, data))

        ticket = formatear_fechas(ticket)

        cursor.execute(sql_derivacion, ticket_id)
        data = cursor.fetchall()

        columns = [col[0] for col in cursor.description]

        for d in data:
            derivacion = dict(zip(columns, d))
            derivacion = formatear_fechas(derivacion)

            derivaciones.append(derivacion)

        cursor.execute(
            sql_solicitante,
            (usuario_solicitud, tipo_usuario)
        )

        data = cursor.fetchone()

        solicitante = None

        if data:
            columns = [col[0] for col in cursor.description]
            solicitante = dict(zip(columns, data))
            solicitante = formatear_fechas(solicitante)

        if usuario_asignado is not None:
            cursor.execute(
                sql_solicitante,
                (usuario_asignado, 'Interno')
            )

            data = cursor.fetchone()

            if data:
                columns = [col[0] for col in cursor.description]
                asignado = dict(zip(columns, data))
                asignado = formatear_fechas(asignado)

        estados, s = estados_ticket_service(
            ticket_id,
            user_id,
            permisos
        )

        return {
            'Mensaje': 'Ticket obtenido correctamente',
            'Ticket': ticket,
            'estados': estados,
            'derivaciones': derivaciones,
            'solicitante': solicitante,
            'Asignado': asignado
        }, 200

    except Exception as e:
        return {
            'Mensaje': 'Error obteniendo datos',
            'Error': str(e)
        }, 400

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def ver_dashboard_service():
    sql_estado = 'SELECT * FROM [MesaDeAyuda].[dbo].[v_tickets_por_estado] WHERE estadoTicketId not in (4,5,7)'
    sql_hoy = 'SELECT * FROM [MesaDeAyuda].[dbo].[v_tickets_hoy]'
    sql_30_dias = 'SELECT * FROM [MesaDeAyuda].[dbo].[v_tickets_ultimos_30_dias]'
    sql_categoria = 'SELECT * FROM [MesaDeAyuda].[dbo].[v_tickets_por_categoria]'

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(sql_estado)
        estados = [
            {
                "estadoTicketId": row.estadoTicketId,
                "nombre": row.estadoTicket,
                "cantidad": row.CantTickets
            }
            for row in cursor.fetchall()
        ]

        cursor.execute(sql_hoy)

        hoy = cursor.fetchone().TicketsHoy

        cursor.execute(sql_30_dias)

        ultimos_30_dias = [
            {
                "fecha": str(row.fecha),
                "cantidad": row.CantTickets
            }
            for row in cursor.fetchall()
        ]
        cursor.execute(sql_categoria)

        categorias = [
            {
                "categoriaId": row.categoriaId,
                "nombre": row.categoria,
                "cantidad": row.CantTickets
            }
            for row in cursor.fetchall()
        ]

        return {
            "ticketsHoy": hoy,
            "porEstado": estados,
            "ultimos30Dias": ultimos_30_dias,
            "porCategoria": categorias
        }, 200
    except Exception as e:
        return {
            'Mensaje':'Error obteniendo datos',
            'Error':str(e)
        }, 400
    finally:

        cursor.close()
        conn.close()

def ver_tecnicos():
    sql = """SELECT	userId,
                    CONCAT(userNom, ' ', userApPat, ' ' ,userApMat) as 'Nombre',
                    rolId
            FROM [MesaDeAyuda].[dbo].[usuario]
            WHERE rolId in (1,2,3)"""
    
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(sql)
        columns = [col[0] for col in cursor.description]
        tecnicos = [
            dict(zip(columns, row))
            for row in cursor.fetchall()
        ]

        return {
            'Mensaje':'Tecnicos obtenidos correctamente',
            'Tecnicos':tecnicos
        }, 200
    except Exception as e:
        return {
            'Mensaje':'Error obteniendo los datos',
            'Error':str(e)
        }, 400
    
def solicitante_services(correo):
    try:

        conn = get_connection()
        cursor = conn.cursor()

        usuario = find_usuario_by_email(cursor, correo)

        if usuario:
            return {
                'tipo': 'USUARIO',
                'usuarioId': usuario["userId"],
                'nombre': usuario['nombre'],
                'telefono': usuario['telefono']
            }, 200

        solicitante = find_solicitante_by_email(cursor, correo)

        if solicitante:
            return {
                'tipo': 'SOLICITANTE_EXISTENTE',
                'solicitanteId': solicitante["solicitanteId"],
                'nombre': solicitante["nombre"],
                'telefono': solicitante["telefono"]
            }, 200

        return {
            'tipo': 'SOLICITANTE_NUEVO'
        }, 200

    except Exception as e:
        return {
            'Mensaje':'Error buscando solicitante',
            'Error':str(e)
        }, 400
    finally:
        cursor.close()
        conn.close()

def obtener_tipo_ticket_service():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        sql = "SELECT * FROM [MesaDeAyuda].[dbo].[tipoTicket]"

        cursor.execute(sql)
        columns = [col[0] for col in cursor.description]
        tipos_ticket = [
            dict(zip(columns, row))
            for row in cursor.fetchall()
        ]

        return {
            'Mensaje':'Tipos de ticket obtenidos con exito',
            'TipoTicket':tipos_ticket
        }, 200
    except Exception as e:
        return {
            'Mensaje':'Error obteniendo los datos',
            'Error':str(e)
        }, 400

def crear_tipo_ticket_service(data):
    sql = '''   INSERT INTO [MesaDeAyuda].[dbo].[tipoTicket] 
                (tipoTicket, color, activo, adminflg)
                OUTPUT INSERTED.tipoTicketId
                VALUES (?, ?, 1, ?)'''

    tipoTicket = data['tipoTicket']
    color = data['color']
    adminflg = data['adminflg']

    try:
        conn = get_connection()
        cursor = conn.cursor()

        if not is_color(color):
            return {
                'Mensaje':'Color ingresado no valido'
            }, 406

        cursor.execute(sql, (tipoTicket, color, adminflg))

        row = cursor.fetchone()

        return {
            'Mensaje':'Tipo de ticket creado con exito',
            'TipoTicketId':row[0]
        }, 200
    except Exception as e:
        return {
            'Mensaje':'Error creando registro',
            'Error':str(e)
        }, 400
    finally:
        cursor.commit()
        cursor.close()
        conn.close()

def editar_tipo_ticket_service(data, id):
    sql = '''   UPDATE [MesaDeAyuda].[dbo].[tipoTicket] SET 
                tipoTicket = ?, color = ?, activo = ?, adminflg = ?
                WHERE tipoTicketId = ? 
                '''

    tipoTicket = data['tipoTicket']
    color = data['color']
    activo = data['activo']
    adminflg = data['adminflg']

    try:
        conn = get_connection()
        cursor = conn.cursor()

        if not is_color(color):
            return {
                'Mensaje':'Color ingresado no valido'
            }, 406

        cursor.execute(sql, (tipoTicket, color, activo, adminflg, id))

        cursor.commit()

        return {
            'Mensaje':'Registro modificado con exito'
        }, 200

    except Exception as e:
        return {
            'Mensaje':'Error modificando registro',
            'Error':str(e)
        }, 400    

def obtener_archivos_service(adjunto_id):
    conn = None
    cursor = None
    ftp = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT
                adjuntoId,
                nomArchivo,
                nomOriginal,
                tipoArchivo
            FROM adjunto
            WHERE adjuntoId = ?
            """,
            (adjunto_id,)
        )

        adjunto = cursor.fetchone()

        if not adjunto:
            return {
                "Mensaje": "Archivo no encontrado"
            }, 404

        archivo = obtener_adjunto(adjunto)

        return send_file(
            archivo,
            as_attachment=True,
            download_name=adjunto.nomOriginal
        ), 200
    except Exception as e:
        return {
            "Mensaje": "Error obteniendo archivo",
            "Error": str(e)
        }, 400
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
        if ftp:
            try:
                ftp.quit()
            except Exception:
                ftp.close()

def asignar_ticket_service(ticket_id, data, user_id, permisos):
    sql_asignar = '''UPDATE [MesaDeAyuda].[dbo].[ticket] 
                      SET [usuarioTicketAsignado] = ? 
                      WHERE [ticketId] = ?'''

    sql_estado = '''UPDATE [MesaDeAyuda].[dbo].[ticket] 
                     SET [estadoTicket] = 3
                     WHERE [ticketId] = ?'''

    sql_historial = '''INSERT INTO [MesaDeAyuda].[dbo].[historialTicket]
                        (ticketId, campoModificado, tipoDato, valorAnterior, valorNuevo, usuarioCambio, fechaCambio)
                        VALUES (?,?,?,?,?,?,GETDATE())'''

    sql_estado_actual = '''SELECT [estadoTicket], [usuarioTicketAsignado]
                            FROM [MesaDeAyuda].[dbo].[ticket] WHERE ticketId = ?'''

    sql_nombre_usuario = '''SELECT [userNom], [userApPat], [userApMat]
                             FROM [MesaDeAyuda].[dbo].[usuario]
                             WHERE [userId] = ?'''

    if 'ASIGNAR_TICKETS' not in permisos and 'ASIGNAR_TICKETS_ADMIN' not in permisos:
        return {
            'Mensaje': 'Usuario sin privilegios para asignar tickets'
        }, 401

    accion = data.get('accion')

    if accion == 'Tomar':
        nuevo_tec = user_id
    elif accion == 'Asignar':
        nuevo_tec = data.get('tecnico')
        if not nuevo_tec:
            return {'Mensaje': 'Falta indicar el técnico a asignar'}, 400
    else:
        return {'Mensaje': 'Acción inválida, debe ser "Tomar" o "Asignar"'}, 400

    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(sql_estado_actual, (ticket_id,))
        row = cursor.fetchone()
        if not row:
            return {'Mensaje': 'Ticket no encontrado'}, 404

        estado_actual_id, asignado_anterior_id = row[0], row[1]
        estado_actual_nombre = ESTADOS_ID_A_NOMBRE.get(estado_actual_id)

        if estado_actual_nombre == 'Derivado':
            return {
                'Mensaje': 'No es posible asignar un ticket mientras está en estado "Derivado"'
            }, 400

        def obtener_nombre_completo(uid):
            if uid is None:
                return 'Sin asignar'
            cursor.execute(sql_nombre_usuario, (uid,))
            r = cursor.fetchone()
            if not r:
                return 'Usuario desconocido'
            return ' '.join(p for p in (r[0], r[1], r[2]) if p)

        nombre_anterior = obtener_nombre_completo(asignado_anterior_id)
        nombre_nuevo = obtener_nombre_completo(nuevo_tec)

        cursor.execute(sql_asignar, (nuevo_tec, ticket_id))
        cursor.execute(sql_estado, (ticket_id,))
        cursor.execute(sql_historial, (
            ticket_id, 'Asignacion', 'Tecnico', nombre_anterior, nombre_nuevo, user_id
        ))

        conn.commit()

        return {
            'Mensaje': 'Ticket Asignado',
            'TecnicoAnterior': nombre_anterior,
            'TecnicoNuevo': nombre_nuevo
        }, 200

    except Exception as e:
        if conn:
            conn.rollback()
        return {'Mensaje': 'Error asignando ticket', 'Error': str(e)}, 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def estados_ticket_service(ticket_id, user_id, permisos):

    sql_estado_act = """
        SELECT
            t.ticketId,
            t.estadoTicket,
            t.usuarioSolicitudTicket
        FROM [MesaDeAyuda].[dbo].[ticket] t
        WHERE t.ticketId = ?
    """

    conn = None
    cursor = None

    try:

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            sql_estado_act,
            (ticket_id,)
        )

        row = cursor.fetchone()

        if not row:
            return {
                'Mensaje': 'Ticket no encontrado'
            }, 404

        estado_actual_id = row[1]
        usuario_creador_id = row[2]

        estado_actual_nombre = ESTADOS_ID_A_NOMBRE.get(
            estado_actual_id
        )

        if estado_actual_nombre is None:
            return {
                'Mensaje': (
                    f'Estado con ID {estado_actual_id} '
                    'no reconocido'
                )
            }, 500

        es_staff = (
            'ASIGNAR_TICKETS' in permisos
            or 'ASIGNAR_TICKETS_ADMIN' in permisos
        )

        es_creador = (
            usuario_creador_id == user_id
        )

        prox_estados_ids = TRANSICIONES_ESTADO.get(
            estado_actual_id,
            []
        )

        estados_permitidos = []

        for estado_id in prox_estados_ids:
            if estado_id == 3:
                if es_staff:
                    estados_permitidos.append(
                        estado_id
                    )

            elif estado_id == 7:
                if es_creador or es_staff:
                    estados_permitidos.append(
                        estado_id
                    )

            elif estado_id == 8:
                if es_creador:
                    estados_permitidos.append(
                        estado_id
                    )

            else:
                if es_staff:
                    estados_permitidos.append(
                        estado_id
                    )

        prox_estados = [
            {
                'estadoId': estado_id,
                'estadoNombre': ESTADOS_ID_A_NOMBRE[estado_id]
            }
            for estado_id in estados_permitidos
            if estado_id in ESTADOS_ID_A_NOMBRE
        ]

        return {
            'Mensaje': 'Datos obtenidos correctamente',
            'EstadoActual': {
                'estadoId': estado_actual_id,
                'estadoNombre': estado_actual_nombre
            },
            'ProximosEstados': prox_estados
        }, 200

    except Exception as e:
        return {
            'Mensaje': 'Error obteniendo datos',
            'Error': str(e)
        }, 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def _manejar_derivado(cursor, ticket_id, data, user_id, files):
    empresa_id = data.get('empresaId')
    nro_ticket = data.get('nroTicket')

    if not empresa_id or not nro_ticket:
        return {
            'Mensaje': 'Debe indicar empresaId y nroTicket para derivar el ticket'
        }, 400

    sql_derivacion = '''INSERT INTO [MesaDeAyuda].[dbo].[derivacionTicket]
                        (ticketId, empresaId, nroTicket, fechaDerivacion, derivacionFinalizada)
                        VALUES (?, ?, ?, GETDATE(), 0)'''
    cursor.execute(sql_derivacion, (ticket_id, empresa_id, nro_ticket))
    return None


def _manejar_resuelto(cursor, ticket_id, data, user_id, files):
    resolucion = data.get('resolucion')

    if not resolucion:
        return {
            'Mensaje': 'Debe indicar el detalle de la resolución del ticket'
        }, 400

    form = {
        'ticketId': str(ticket_id),
        'mensaje': resolucion
    }

    archivos = []

    for archivo in files:
        archivos.append(
            (
                'files',
                (
                    archivo.filename,
                    archivo.stream,
                    archivo.mimetype
                )
            )
        )

    token = request.cookies.get('access_token')

    r = requests.post(
        url=MESSAGE_SERVICE,
        data=form,
        files=archivos,
        cookies={
            'access_token': token
        }
    )

    if not r.ok:
        return {
            'Mensaje': 'Error enviando la resolución al servicio de mensajes',
            'Error': r.text
        }, r.status_code

    return None

def _validar_derivaciones_pendientes(cursor, ticket_id):
    sql_derivaciones_pendientes = '''
        SELECT COUNT(*)
        FROM [MesaDeAyuda].[dbo].[derivacionTicket]
        WHERE [ticketId] = ?
          AND [derivacionFinalizada] = 0
          AND [activo] = 1
    '''

    cursor.execute(sql_derivaciones_pendientes, (ticket_id,))
    cantidad_pendientes = cursor.fetchone()[0]

    if cantidad_pendientes > 0:
        return {
            'Mensaje': 'El ticket posee derivaciones pendientes de gestión'
        }, 400

    return None

MANEJADORES_ESTADO = {
    5: _manejar_derivado, 
    6: _manejar_resuelto,  
}

MANEJADORES_TRANSICION = {
    (5, 4): _validar_derivaciones_pendientes,
}

def gestionar_ticket_service(ticket_id, data, user_id, permisos, files=None):
    sql_estado_actual = '''SELECT [estadoTicket], [usuarioSolicitudTicket]
                            FROM [MesaDeAyuda].[dbo].[ticket]
                            WHERE [ticketId] = ?'''

    sql_update_estado = '''UPDATE [MesaDeAyuda].[dbo].[ticket]
                            SET [estadoTicket] = ?
                            WHERE [ticketId] = ?'''

    sql_historial = '''INSERT INTO [MesaDeAyuda].[dbo].[historialTicket]
                        (ticketId, campoModificado, tipoDato, valorAnterior, valorNuevo, usuarioCambio, fechaCambio)
                        VALUES (?,?,?,?,?,?,GETDATE())'''

    nuevo_estado_id = int(data.get('nuevoEstado'))

    if not isinstance(nuevo_estado_id, int) or nuevo_estado_id not in ESTADOS_ID_A_NOMBRE:
        return {
            'Mensaje': f'Estado con ID "{nuevo_estado_id}" no es válido'
        }, 400

    if nuevo_estado_id in ESTADOS_BLOQUEADOS_AQUI:
        if nuevo_estado_id == 3:  # Asignado
            return {
                'Mensaje': 'Para asignar un ticket use el endpoint de asignación'
            }, 400
        return {
            'Mensaje': f'No es posible cambiar el ticket al estado "{ESTADOS_ID_A_NOMBRE[nuevo_estado_id]}"'
        }, 400

    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(sql_estado_actual, (ticket_id,))
        row = cursor.fetchone()

        if not row:
            return {'Mensaje': 'Ticket no encontrado'}, 404

        estado_actual_id = row[0]
        usuario_creador_id = row[1]

        if estado_actual_id not in ESTADOS_ID_A_NOMBRE:
            return {
                'Mensaje': f'Estado actual con ID {estado_actual_id} no reconocido'
            }, 500

        es_staff = 'ASIGNAR_TICKETS' in permisos or 'ASIGNAR_TICKETS_ADMIN' in permisos
        es_creador = usuario_creador_id == user_id

        if nuevo_estado_id == 7: 
            if not (es_creador or es_staff):
                return {'Mensaje': 'Usuario sin privilegios para reabrir el ticket'}, 401
        elif nuevo_estado_id == 8: 
            if not es_creador:
                return {'Mensaje': 'Solo el usuario que creó el ticket puede cerrarlo'}, 401
        else:
            if not es_staff:
                return {'Mensaje': 'Usuario sin privilegios para gestionar tickets'}, 401

        transiciones_permitidas = TRANSICIONES_ESTADO.get(estado_actual_id, [])

        if nuevo_estado_id not in transiciones_permitidas:
            return {
                'Mensaje': f'No es posible cambiar de "{ESTADOS_ID_A_NOMBRE[estado_actual_id]}" '
                           f'a "{ESTADOS_ID_A_NOMBRE[nuevo_estado_id]}"'
            }, 400

        handler_transicion = MANEJADORES_TRANSICION.get((estado_actual_id, nuevo_estado_id))
        if handler_transicion:
            error = handler_transicion(cursor, ticket_id)
            if error is not None:
                return error

        handler = MANEJADORES_ESTADO.get(nuevo_estado_id)
        if handler:
            error = handler(cursor, ticket_id, data, user_id, files)
            if error is not None:
                return error

        cursor.execute(sql_update_estado, (nuevo_estado_id, ticket_id))
        cursor.execute(sql_historial, (
            ticket_id, 'Estado', 'Estado',
            ESTADOS_ID_A_NOMBRE[estado_actual_id],
            ESTADOS_ID_A_NOMBRE[nuevo_estado_id],
            user_id
        ))

        conn.commit()

        return {
            'Mensaje': 'Ticket actualizado correctamente',
            'EstadoAnteriorId': estado_actual_id,
            'EstadoNuevoId': nuevo_estado_id
        }, 200

    except Exception as e:
        if conn:
            conn.rollback()
        return {'Mensaje': 'Error gestionando ticket', 'Error': str(e)}, 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def modificar_derivacion_service(derivacion_id, user_id, permisos, data):
    sql_derivacion = '''
        SELECT
            [derivacionId],
            [ticketId],
            [empresaId],
            [nroTicket],
            [comentario],
            [derivacionFinalizada],
            [activo]
        FROM [MesaDeAyuda].[dbo].[derivacionTicket]
        WHERE [derivacionId] = ?
    '''

    conn = None
    cursor = None

    try:
        if not (
            'GESTIONAR_TICKET' in permisos
            or 'GESTIONAR_TICKET_ADMIN' in permisos
        ):
            return {
                'Mensaje': 'Usuario sin privilegios para modificar la derivación'
            }, 401

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(sql_derivacion, (derivacion_id,))
        derivacion = cursor.fetchone()

        if not derivacion:
            return {
                'Mensaje': 'Derivación no encontrada'
            }, 404

        (
            derivacion_id_db,
            ticket_id,
            empresa_id_actual,
            nro_ticket_actual,
            comentario_actual,
            derivacion_finalizada_actual,
            activo_actual
        ) = derivacion

        campos_modificados = []

        if 'empresaId' in data:
            nuevo_empresa_id = data.get('empresaId')

            if nuevo_empresa_id != empresa_id_actual:
                campos_modificados.append({
                    'campo': 'empresaId',
                    'tipoDato': 'empresaId',
                    'valorAnterior': str(empresa_id_actual),
                    'valorNuevo': str(nuevo_empresa_id)
                })

        if 'nroTicket' in data:
            nuevo_nro_ticket = data.get('nroTicket')

            if nuevo_nro_ticket != nro_ticket_actual:
                campos_modificados.append({
                    'campo': 'nroTicket',
                    'tipoDato': 'nroTicket',
                    'valorAnterior': str(nro_ticket_actual),
                    'valorNuevo': str(nuevo_nro_ticket)
                })

        if 'comentario' in data:
            nuevo_comentario = data.get('comentario')

            if nuevo_comentario != comentario_actual:
                campos_modificados.append({
                    'campo': 'comentario',
                    'tipoDato': 'comentario',
                    'valorAnterior': comentario_actual or '',
                    'valorNuevo': nuevo_comentario or ''
                })

        if 'activo' in data:
            nuevo_activo = data.get('activo')

            # Normalizar a boolean/int
            nuevo_activo = 1 if bool(nuevo_activo) else 0

            if nuevo_activo != activo_actual:
                campos_modificados.append({
                    'campo': 'activo',
                    'tipoDato': 'activo',
                    'valorAnterior': str(activo_actual),
                    'valorNuevo': str(nuevo_activo)
                })

        if not campos_modificados:
            return {
                'Mensaje': 'No se detectaron cambios en la derivación'
            }, 400

        campos_update = []
        valores_update = []

        for cambio in campos_modificados:
            campo = cambio['campo']

            campos_update.append(f'[{campo}] = ?')

            if campo == 'empresaId':
                valores_update.append(data.get('empresaId'))

            elif campo == 'nroTicket':
                valores_update.append(data.get('nroTicket'))

            elif campo == 'comentario':
                valores_update.append(data.get('comentario'))

            elif campo == 'activo':
                valores_update.append(
                    1 if bool(data.get('activo')) else 0
                )

        valores_update.append(derivacion_id)

        sql_update = f'''
            UPDATE [MesaDeAyuda].[dbo].[derivacionTicket]
            SET {', '.join(campos_update)}
            WHERE [derivacionId] = ?
        '''

        cursor.execute(sql_update, valores_update)

        sql_historial = '''
            INSERT INTO [MesaDeAyuda].[dbo].[historialTicket]
            (
                [ticketId],
                [campoModificado],
                [tipoDato],
                [valorAnterior],
                [valorNuevo],
                [usuarioCambio],
                [fechaCambio]
            )
            VALUES (?, ?, ?, ?, ?, ?, GETDATE())
        '''

        for cambio in campos_modificados:
            cursor.execute(sql_historial, (
                ticket_id,
                'DERIVACION',
                cambio['tipoDato'],
                cambio['valorAnterior'],
                cambio['valorNuevo'],
                user_id
            ))

        conn.commit()

        return {
            'Mensaje': 'Derivación modificada correctamente',
            'DerivacionId': derivacion_id,
            'TicketId': ticket_id
        }, 200

    except Exception as e:
        if conn:
            conn.rollback()

        return {
            'Mensaje': 'Error modificando derivación',
            'Error': str(e)
        }, 500

    finally:
        if cursor:
            cursor.close()

        if conn:
            conn.close()

def finalizar_derivacion_service(derivacion_id, user_id, permisos):
    sql_derivacion = '''
        SELECT
            [derivacionId],
            [ticketId],
            [derivacionFinalizada],
            [activo]
        FROM [MesaDeAyuda].[dbo].[derivacionTicket]
        WHERE [derivacionId] = ?
    '''

    sql_finalizar = '''
        UPDATE [MesaDeAyuda].[dbo].[derivacionTicket]
        SET
            [derivacionFinalizada] = 1,
            [fechaFinalización] = GETDATE()
        WHERE [derivacionId] = ?
    '''

    sql_historial = '''
        INSERT INTO [MesaDeAyuda].[dbo].[historialTicket]
        (
            [ticketId],
            [campoModificado],
            [tipoDato],
            [valorAnterior],
            [valorNuevo],
            [usuarioCambio],
            [fechaCambio]
        )
        VALUES (?, ?, ?, ?, ?, ?, GETDATE())
    '''

    conn = None
    cursor = None

    try:
        if not (
            'GESTIONAR_TICKET' in permisos
            or 'GESTIONAR_TICKET_ADMIN' in permisos
        ):
            return {
                'Mensaje': 'Usuario sin privilegios para finalizar la derivación'
            }, 401

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(sql_derivacion, (derivacion_id,))
        derivacion = cursor.fetchone()

        if not derivacion:
            return {
                'Mensaje': 'Derivación no encontrada'
            }, 404

        (
            derivacion_id_db,
            ticket_id,
            derivacion_finalizada,
            activo
        ) = derivacion

        if not activo:
            return {
                'Mensaje': 'No es posible finalizar una derivación inactiva'
            }, 400

        if derivacion_finalizada:
            return {
                'Mensaje': 'La derivación ya se encuentra finalizada'
            }, 400

        cursor.execute(sql_finalizar, (derivacion_id,))

        cursor.execute(sql_historial, (
            ticket_id,
            'DERIVACION',
            'derivacionFinalizada',
            '0',
            '1',
            user_id
        ))

        conn.commit()

        return {
            'Mensaje': 'Derivación finalizada correctamente',
            'DerivacionId': derivacion_id,
            'TicketId': ticket_id
        }, 200

    except Exception as e:
        if conn:
            conn.rollback()

        logging.exception(
            'Error finalizando derivación %s',
            derivacion_id
        )

        return {
            'Mensaje': 'Error finalizando derivación',
            'Error': str(e)
        }, 500

    finally:
        if cursor:
            cursor.close()

        if conn:
            conn.close()