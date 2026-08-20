import os
from app import socketio
from app.database.connection import get_connection
from app.repositories.message_repository import get_ticket_messages_query, insert_message_query, get_message_by_id_query
from app.utils.file_utils import save_attachments

def obtener_mensajes_service(ticket_id,user_id):

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT
                ticketId,
                usuarioTicketCreacion,
                usuarioTicketAsignado,
                usuarioSolicitudTicket
            FROM ticket
            WHERE ticketId = ?
            """,
            ticket_id
        )
        ticket = cursor.fetchone()

        if not ticket:
            return {
                "Mensaje": "Ticket no encontrado"
            }, 404

        allowed_users = [
            ticket.usuarioTicketCreacion,
            ticket.usuarioTicketAsignado,
            ticket.usuarioSolicitudTicket
        ]

        if user_id not in allowed_users:
            return {
                "Mensaje": "No autorizado"
            }, 403

        messages = get_ticket_messages_query(
            cursor,
            ticket_id
        )

        result = []

        for row in messages:
            result.append({
                "mensajeId":row.mensajeId,
                "ticketId":row.ticketId,
                "mensaje":row.mensaje,
                "fechaMensaje":str(row.fechaMensaje),
                "usuario": {
                    "userId":row.userId,
                    "nombre":row.nombreCompleto
                },
                "mine":row.userId == user_id,
                "archivo":{
                    "archivoId":row.adjuntoId,
                    "nomArchivo":row.nomArchivo,
                    "extension":row.tipoArchivo
                }
            })

        return {
            "Mensaje":
                "Mensajes obtenidos correctamente",
            "mensajes":
                result
        }


    except Exception as e:
        return {
            "Mensaje":
                "Error obteniendo mensajes",
            "Error":
                str(e)
        }, 400

    finally:
        cursor.close()
        conn.close()

def crear_mensaje_service(user_id,data,files):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        ticket_id = data.get("ticketId")
        mensaje = data.get("mensaje")
        if not ticket_id:
            return {
                "Mensaje": "ticketId es obligatorio"
            }, 400

        if not mensaje and len(files) == 0:

            return {
                "Mensaje": "Debe enviar mensaje o adjuntos"
            }, 400

        cursor.execute(
            """
            SELECT TOP 1 ticketId
            FROM ticket
            WHERE ticketId = ?
            """,
            ticket_id
        )

        ticket = cursor.fetchone()

        if not ticket:

            return {
                "Mensaje": "Ticket no existe"
            }, 404

        mensaje_id = insert_message_query(cursor,ticket_id,mensaje,user_id)

        attachments = []

        if files:   

            attachments = save_attachments(cursor,ticket_id,mensaje_id,user_id,files)

        conn.commit()

        message = get_message_by_id_query(
            cursor,
            mensaje_id
        )

        response = {
            "mensajeId": message.mensajeId,
            "ticketId": message.ticketId,
            "mensaje": message.mensaje,
            "fechaMensaje": str(message.fechaMensaje),
            "usuario": {
                "userId": message.userId,
                "nombre": message.nombreCompleto
            },
            "archivo":{
                "archivoId":attachments.adjuntoId,
                "nomArchivo":attachments.nomArchivo,
                "extension":attachments.tipoArchivo
                }
        }

        socketio.emit(
            "new_message",
            response,
            room=f"ticket_{ticket_id}"
        )

        return {
            "Mensaje": "Mensaje creado correctamente",
            "data": response
        }

    except Exception as e:

        conn.rollback()

        return {
            "Mensaje": "Error creando mensaje",
            "Error": str(e)
        }, 400

    finally:    
        cursor.close()
        conn.close()