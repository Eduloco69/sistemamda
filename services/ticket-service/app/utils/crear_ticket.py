import os
import json
from app.utils.archivos import save_uploaded_file
from app.utils.solicitante import resolve_solicitante
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER")

def build_payload(mode,user_id,data):

    payload = dict(data)
    payload["usuarioTicketCreacion"] = user_id
    payload["solicitanteTicket"] = None

    if mode == "USUARIO":
        payload["usuarioSolicitudTicket"] = user_id
        payload["usuarioTicketAsignado"] = None

    elif mode == "TECNICO":
        payload["usuarioTicketAsignado"] = user_id

    elif mode == "ADMIN" or mode == "SUPERVISOR":
        pass

    return payload

def insert_ticket(cursor,p):

    sql = """
    INSERT INTO ticket
    (
        tituloTicket,
        ticketDesc,
        estadoTicket,
        tipoTicket,
        prioridadTicket,
        subcategoriaTicket,
        usuarioSolicitudTicket,
        solicitanteTicket,
        usuarioTicketCreacion,
        usuarioTicketAsignado,
        fechaActualizacionTicket
    )

    OUTPUT INSERTED.ticketId

    VALUES
    (
        ?,?,?,?,?,?,?,?,?,?,
        GETDATE()
    )
    """

    cursor.execute(
        sql,
        (
            p["tituloTicket"],
            p["ticketDesc"],
            1,
            p["tipoTicket"],
            p["prioridadTicket"],
            p["subcategoriaTicket"],
            p["usuarioSolicitudTicket"],
            p["solicitanteTicket"],
            p["usuarioTicketCreacion"],
            p["usuarioTicketAsignado"]
        )
    )

    row = cursor.fetchone()

    return row[0]

def resolve_solicitante_for_payload(cursor, mode, payload, data):

    print('revisando mode')

    if mode == "USUARIO":
        return

    print('mode revisado')

    solicitante_info = data.get("solicitanteInfo")

    print(f'info solicitante: {solicitante_info}')

    if not solicitante_info:
        raise Exception("Falta informacion del solicitante")
    
    if isinstance(solicitante_info, str):
        try:
            solicitante_info = json.loads(
                solicitante_info
            )
        except json.JSONDecodeError:
            raise Exception(
                "solicitanteInfo no contiene un JSON válido"
            )
    
    print('info Solicitante ok')

    resultado = resolve_solicitante(cursor, solicitante_info)

    print(f'resolve solicitante:{resultado}')

    payload["usuarioSolicitudTicket"] = resultado["usuarioSolicitudTicket"]
    payload["solicitanteTicket"] = resultado["solicitanteTicket"]


def update_ticket_number(cursor,ticket_id,nro):

    cursor.execute(
        """
        UPDATE ticket
        SET NroTicket = ?
        WHERE ticketId = ?
        """,
        (nro,ticket_id)
    )

def save_attachments(cursor,ticket_id,mensaje_id,user_id,files):

    for file in files:

        os.makedirs(
            UPLOAD_FOLDER,
            exist_ok=True
        )

        if file.filename == "":
            continue

        filename = secure_filename(file.filename)

        file_path = os.path.join(
            UPLOAD_FOLDER,
            filename
        )

        file.save(file_path)

        cursor.execute(
            """
            INSERT INTO adjunto (ticketId,mensajeId,nomArchivo,tipoArchivo,fechaArchivo,usuarioAdjunto) VALUES (?,?,?,?,GETDATE(),?)
            """,(ticket_id,mensaje_id,filename,filename.split(".")[-1],user_id)
        )

def insert_history(cursor,ticket_id,user_id):

    cursor.execute(
        """
        INSERT INTO historialTicket
        (
            ticketId,
            campoModificado,
            tipoDato,
            valorNuevo,
            usuarioCambio,
            fechaCambio
        )

        VALUES
        (
            ?,
            'CREACION',
            'SYSTEM',
            'Ticket creado',
            ?,
            GETDATE()
        )
        """,
        (ticket_id,user_id)
    )

def insert_initial_message(cursor,ticket_id,mensaje,user_id):

    sql = """
    INSERT INTO mensajesTicket (ticketId,mensaje,fechaMensaje,userMensaje)

    OUTPUT INSERTED.mensajeId

    VALUES (?,?,GETDATE(),?)
    """

    cursor.execute(sql,(ticket_id,mensaje,user_id))

    row = cursor.fetchone()

    return row[0]

def validate_ticket_data(data):

    errores = []

    titulo = data.get("tituloTicket")
    descripcion = data.get("ticketDesc")
    tipo = data.get("tipoTicket")
    prioridad = data.get("prioridadTicket")
    subcategoria = data.get("subcategoriaTicket")

    if not titulo or not str(titulo).strip():

        errores.append(
            "El título del ticket es obligatorio"
        )

    if not descripcion or not str(descripcion).strip():

        errores.append(
            "La descripción del ticket es obligatoria"
        )

    if not tipo or tipo == "undefined":

        errores.append(
            "El tipo de ticket es obligatorio"
        )

    if not prioridad or prioridad == "undefined":

        errores.append(
            "La prioridad del ticket es obligatoria"
        )

    if not subcategoria or subcategoria == "undefined":

        errores.append(
            "La subcategoría del ticket es obligatoria"
        )


    if errores:

        return {
            "valido": False,
            "errores": errores
        }


    return {
        "valido": True,
        "errores": []
    }