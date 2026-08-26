from app.database.connection import get_connection
from app.utils.permisos import resolve_creation_mode
from app.utils.ticket_nro import generate_ticket_number
from app.utils.crear_ticket import *
from app.utils.solicitante import *
from flask import send_from_directory
import math

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
    
    validacion = validate_ticket_data(data)

    if not validacion["valido"]:

        return {
            "Mensaje":"Datos faltantes",
            "Error": validacion["errores"]
        }, 406

    mode = resolve_creation_mode(permisos)

    payload = build_payload(
        mode,
        user_id,
        data
    )

    try:

        conn = get_connection()
        cursor = conn.cursor()

        resolve_solicitante_for_payload(cursor, mode, payload, data)

        print(payload["usuarioSolicitudTicket"])
        print(payload["solicitanteTicket"])

        ticket_id = insert_ticket(cursor, payload)
        nro_ticket = generate_ticket_number(ticket_id)
        update_ticket_number(cursor, ticket_id, nro_ticket)
        mensaje_id = insert_initial_message(cursor, ticket_id, payload["ticketDesc"], user_id)
        save_attachments(cursor, ticket_id, mensaje_id, user_id, files)
        insert_history(cursor, ticket_id, user_id)

        conn.commit()

        return {
            'Mensaje':'Ticket creado correctamente',
            'ticketId':ticket_id,
            'NroTicket':nro_ticket
        }, 200
    except Exception as e:
        conn.rollback()
        return {
            'Mensaje':'Error creando Ticket', 
            'Error':str(e)
        }, 400
    finally:
        cursor.close()
        conn.close()

def ver_detalle_ticket_service(ticket_id, user_id, permisos):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        sql = "SELECT * FROM [MesaDeAyuda].[dbo].[v_detalle_tickets] where ticketId = ?"

        cursor.execute(sql, ticket_id)

        data = cursor.fetchone()

        if data is None:
            return {
                'Mensaje':'No se ha encontrado el Ticket'
            },404
        
        usuario_solicitud = data[13]
        
        if not 'VER_TICKETS_TODOS' in permisos and usuario_solicitud != user_id:
            return {
                'Mensaje':'Sin permisos'
            }, 403
            
        columns = [col[0] for col in cursor.description]
        ticket = dict(zip(columns, data))

        return {
            'Mensaje':'Ticket obtenido correctamente',
            'Ticket':ticket
        }, 200
    except Exception as e:
        return {
            'Mensaje':'Error obteniendo datos',
            'Error':str(e)
        }, 400

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
            }

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

def tipo_ticket_service():
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

def obtener_archivos_service(adjunto_id):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT
            adjuntoId,
            nomArchivo,
            tipoArchivo
        FROM adjunto
        WHERE adjuntoId = ?
        """, adjunto_id)

        adjunto = cursor.fetchone()

        if not adjunto:
            return {
                'Mensaje':'Archivo no encontrado'
            }, 404

        r = send_from_directory(
            UPLOAD_FOLDER,
            adjunto.nomArchivo,
            as_attachment=True,
            download_name=adjunto.nomArchivo
        )

        return r, 200
    
    except Exception as e:
        return {
            'Mensaje':'Error obteniendo archivo',
            'Error':str(e)
        }, 400
    finally:
        cursor.close()
        conn.close()