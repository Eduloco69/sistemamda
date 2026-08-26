from flask import Blueprint
from app.controllers.categoria_controller import *
from shared.app.auth.middleware import auth_required

categoria_bp = Blueprint("categoria", __name__)

@categoria_bp.route("", methods=['GET'])
@auth_required
def get_categoria():
    return obtener_categorias()

@categoria_bp.route("", methods=['POST'])
def post_categoria():
    return crear_categoria()

@categoria_bp.route("/<int:id>", methods=['PUT'])
@auth_required
def put_categoria(id):
    return modificar_categoria(id)

@categoria_bp.route("/subcategoria/<int:categoria_id>", methods=['GET'])
@auth_required
def get_subcategoria(categoria_id):
    return obtener_subcategorias(categoria_id)

@categoria_bp.route("/subcategoria/<int:categoria_id>", methods=['POST'])
def post_subcategoria(categoria_id):
    return crear_subcategoria(categoria_id)

@categoria_bp.route("/subcategoria/<int:subcategoria_id>", methods=['PUT'])
def put_subcategoria(subcategoria_id):
    return editar_subcategoria(subcategoria_id)