import os
from flask import Blueprint
from app.services.proxy_service import proxy_request

ticket_bp = Blueprint("ticket", __name__)

TICKET_SERVICE = os.getenv("TICKET_SERVICE")

@ticket_bp.route("", methods=["POST"])
def crear():
    return proxy_request(f"{TICKET_SERVICE}/ticket")

@ticket_bp.route("", methods=["GET"], strict_slashes=False)
def obtener():
    return proxy_request(f"{TICKET_SERVICE}/ticket")

@ticket_bp.route("/detalle/<int:ticket_id>", methods=["GET"])
def detalle(ticket_id):
    return proxy_request(f"{TICKET_SERVICE}/ticket/detalle/{ticket_id}")

@ticket_bp.route("/categoria", methods=['GET'])
def categoria():
    return proxy_request(f"{TICKET_SERVICE}/ticket/categoria")

@ticket_bp.route("/subcategoria/<int:categoria_id>", methods=['GET'])
def subcategoria(categoria_id):
    return proxy_request(f"{TICKET_SERVICE}/ticket/subcategoria/{categoria_id}")

@ticket_bp.route("/dashboard", methods=['GET'])
def dashboard():
    return proxy_request(f"{TICKET_SERVICE}/ticket/dashboard")

@ticket_bp.route("/tecnico", methods=['GET'])
def tecnicos():
    return proxy_request(f"{TICKET_SERVICE}/ticket/tecnico")

@ticket_bp.route("/tipoticket", methods=['GET'])
def tipo_tickets():
    return proxy_request(f"{TICKET_SERVICE}/ticket/tipoticket")

@ticket_bp.route("/solicitante", methods=['GET'])
def solicitante():
    return proxy_request(f"{TICKET_SERVICE}/ticket/solicitante")

@ticket_bp.route("/archivo/<int:adjunto_id>", methods=['GET'])
def obtener_archivo(adjunto_id):
    return proxy_request(f"{TICKET_SERVICE}/ticket/archivo/{adjunto_id}")