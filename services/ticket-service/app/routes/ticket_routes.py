from flask import Blueprint, request
from app.controllers.ticket_controller import *
from shared.app.auth.middleware import auth_required

ticket_bp = Blueprint("ticket", __name__)

@ticket_bp.route("/ping")
def ping():
    return "Conexión Ok"

@ticket_bp.route("", methods=['GET'])
@auth_required
def get_tickets():
    return obtener_tickets()

@ticket_bp.route("", methods=['POST'])
@auth_required
def post_ticket():
    return crear_ticket()

@ticket_bp.route("/detalle/<int:ticket_id>", methods=['GET'])
@auth_required
def get_detalle_ticket(ticket_id):
    return obtener_detalle(ticket_id)

@ticket_bp.route("/dashboard", methods=['GET'])
@auth_required
def get_dashboard():
    return obtener_dashboard()

@ticket_bp.route("/tecnico", methods=['GET'])
@auth_required
def get_tecnicos():
    return obtener_tecnicos()

@ticket_bp.route("/solicitante", methods=['GET'])
@auth_required
def get_solicitante():
    return obtener_solicitante()

@ticket_bp.route("/tipoticket", methods=['GET'])
@auth_required
def get_tipo_ticket():
    return obtener_tipo_ticket()

@ticket_bp.route("/archivo/<int:adjunto_id>", methods=['GET'])
@auth_required
def get_archivo(adjunto_id):
    return archivo_controller(adjunto_id)