from flask import Blueprint
from shared.app.auth.middleware import auth_required
from app.controllers.empresa_controller import *

empresa_bp = Blueprint("empresa",__name__)

@empresa_bp.route("", methods=['GET'])
def get_empresas():
    return obtener_empresas()

@empresa_bp.route("", methods=['POST'])
def post_empresa():
    return crear_empresa()

@empresa_bp.route("/<int:empresaId>", methods=['PUT'])
def put_empresa(empresaId):
    return editar_empresa(empresaId)