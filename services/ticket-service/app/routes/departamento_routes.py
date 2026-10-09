from flask import Blueprint
from shared.app.auth.middleware import auth_required
from app.controllers.departamento_controller import *

departamento_bp = Blueprint("departamento", __name__)

@departamento_bp.route("", methods=['GET'])
@auth_required
def ver_departamento():
    return ver_departamentos_controller()

@departamento_bp.route("", methods=['POST'])
@auth_required
def crear_departamento():
    return crear_departamento_controller()

@departamento_bp.route("/<int:id_departamento>", methods=['PUT'])
@auth_required
def editar_departamento(id_departamento):
    return editar_departamento_controller(id_departamento)