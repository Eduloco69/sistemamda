from flask import request, jsonify
from app.services.ticket_service import *

def obtener_tickets():
    data = request.user
    user_id = data.get("userId")
    permisos = data.get("permisos", [])
    r, s = ver_tickets_service(user_id, permisos, request)

    return jsonify(r), s

def crear_ticket():
    user_data = request.user
    user_id = user_data.get("userId")
    permisos = user_data.get("permisos", [])

    data = request.form.to_dict()
    files = request.files.getlist("files")

    r, s = crear_tickets_service(user_id, permisos, data, files)

    return jsonify(r), s

def obtener_detalle(ticket_id):
    user_data = request.user
    user_id = user_data.get('userId')
    permisos = user_data.get('permisos', [])

    r, s = ver_detalle_ticket_service(ticket_id, user_id, permisos)

    return jsonify(r), s

def obtener_dashboard():
    r, s = ver_dashboard_service()
    return jsonify(r), s

def obtener_tecnicos():
    r, s = ver_tecnicos()
    return jsonify(r), s

def obtener_solicitante():
    correo = request.args.get('correo')
    r, s = solicitante_services(correo)
    return jsonify(r), s

def obtener_tipo_ticket():
    r, s = obtener_tipo_ticket_service()
    return jsonify(r), s

def crear_tipo_ticket():
    data = request.json
    r, s = crear_tipo_ticket_service(data)
    return jsonify(r), s

def editar_tipo_ticket(id):
    data = request.json
    r, s = editar_tipo_ticket_service(data, id)
    return jsonify(r), s

def archivo_controller(adjunto_id):
    return obtener_archivos_service(adjunto_id)

def asignar_ticket_controller(ticket_id):
    user = request.user
    data = request.json
    user_id = user.get("userId")
    permisos = user.get("permisos", [])
    r, s = asignar_ticket_service(ticket_id, data, user_id, permisos)

    return jsonify(r), s

def estados_ticket_controller(ticket_id):
    user = request.user
    user_id = user.get("userId")
    permisos = user.get("permisos", [])
    r, s = estados_ticket_service(ticket_id, user_id, permisos)

    return jsonify(r), s

def gestionar_ticket_controller(ticket_id):
    user = request.user
    data = request.form.to_dict()
    user_id = user.get("userId")
    permisos = user.get("permisos", [])
    files = request.files.getlist("files")
    r, s = gestionar_ticket_service(ticket_id, data, user_id, permisos, files)

    return jsonify(r), s