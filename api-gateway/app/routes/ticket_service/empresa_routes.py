import os 
from flask import Blueprint
from app.services.proxy_service import proxy_request

empresa_bp = Blueprint("empresa_bp", __name__)

TICKET_SERVICE = os.getenv("TICKET_SERVICE")

@empresa_bp.route("", methods=['GET'])
def empresas():
    return proxy_request(f"{TICKET_SERVICE}/empresa")

@empresa_bp.route("", methods=['POST'])
def crear_empresas():
    return proxy_request(f"{TICKET_SERVICE}/empresa")

@empresa_bp.route("/<int:empresaId>", methods=['PUT'])
def put_empresas(empresaId):
    return proxy_request(f"{TICKET_SERVICE}/empresa/{empresaId}")
