from flask import request, jsonify
from app.services.ticket_service import *

def obtener_tickets():
    data = request.user
    user_id = data.get("userId")
    permisos = data.get("permisos", [])
    tickets = ver_tickets(user_id, permisos, request)

    return jsonify(tickets)

def crear_ticket():
    user_data = request.user
    user_id = user_data.get("userId")
    permisos = user_data.get("permisos", [])

    data = request.form.to_dict()
    files = request.files.getlist("files")

    return crear_tickets_service(user_id, permisos, data, files)

def obtener_detalle(ticket_id):
    user_data = request.user
    user_id = user_data.get('userId')
    permisos = user_data.get('permisos', [])

    return ver_detalle_ticket(ticket_id, user_id, permisos)

def obtener_categorias():
    return ver_categorias()

def modificar_categoria(id):
    data = request.json
    return editar_categoria_service(id, data)

def obtener_subcategorias(categoria_id):
    return ver_subcategorias(categoria_id)

def obtener_dashboard():
    return ver_dashboard()

def obtener_tecnicos():
    return ver_tecnicos()

def obtener_solicitante():
    correo = request.args.get('correo')
    return solicitante_services(correo)

def obtener_tipo_ticket():
    return tipo_ticket_service()

def archivo_controller(adjunto_id):
    return obtener_archivos_service(adjunto_id)