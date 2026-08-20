from flask import request, jsonify

from app.services.message_service import obtener_mensajes_service, crear_mensaje_service

def get_messages(ticket_id):
    user = request.user
    user_id = user.get("userId")
    data = obtener_mensajes_service(ticket_id,user_id)

    return jsonify(data)

def create_message():
    user = request.user
    data = request.form
    files = request.files.getlist('files')
    print(f'archivo {files}')
    data = crear_mensaje_service(user["userId"],data,files)

    return jsonify(data)