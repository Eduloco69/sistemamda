import os
from flask import Blueprint
from app.services.proxy_service import proxy_request

categoria_bp = Blueprint("categoria_bp", __name__)

TICKET_SERVICE = os.getenv("TICKET_SERVICE")

@categoria_bp.route("", methods=['GET'])
def categoria():
    return proxy_request(f"{TICKET_SERVICE}/categoria")

@categoria_bp.route("", methods=['POST'])
def post_categoria():
    return proxy_request(f"{TICKET_SERVICE}/categoria")

@categoria_bp.route("/<int:id>", methods=['PUT'])
def put_categoria(id):
    return proxy_request(f"{TICKET_SERVICE}/categoria/{id}")

@categoria_bp.route("/subcategoria/<int:categoria_id>", methods=['GET'])
def subcategoria(categoria_id):
    return proxy_request(f"{TICKET_SERVICE}/categoria/subcategoria/{categoria_id}")

@categoria_bp.route("/subcategoria/<int:categoria_id>", methods=['POST'])
def post_subcategoria(categoria_id):
    return proxy_request(f"{TICKET_SERVICE}/categoria/subcategoria/{categoria_id}")

@categoria_bp.route("/subcategoria/<int:subcategoria_id>", methods=['PUT'])
def put_subcategoria(subcategoria_id):
    return proxy_request(f"{TICKET_SERVICE}/categoria/subcategoria/{subcategoria_id}")