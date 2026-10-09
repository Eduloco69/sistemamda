import os 
from flask import Blueprint
from app.services.proxy_service import proxy_request

departamento_bp = Blueprint("departamento_bp", __name__)

TICKET_SERVICE = os.getenv("TICKET_SERVICE")

@departamento_bp.route("", methods=['GET'])
def ver_departamento():
    return proxy_request(f"{TICKET_SERVICE}/departamento")

@departamento_bp.route("", methods=['POST'])
def crear_departamento():
    return proxy_request(f"{TICKET_SERVICE}/departamento")

@departamento_bp.route("/<int:id_departamento>", methods=['PUT'])
def editar_departamento(id_departamento):
    return proxy_request(f"{TICKET_SERVICE}/departamento/{id_departamento}")
