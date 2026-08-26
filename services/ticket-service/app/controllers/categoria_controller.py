from flask import request, jsonify
from app.services.categorias_service import *

def obtener_categorias():
    r, s = ver_categorias_service()
    return jsonify(r), s

def crear_categoria():
    data = request.json
    r, s = crear_categoria_service(data)
    return jsonify(r), s

def modificar_categoria(id):
    data = request.json
    r, s = editar_categoria_service(id, data)
    return jsonify(r), s

def obtener_subcategorias(categoria_id):
    r, s = ver_subcategorias_service(categoria_id)
    return jsonify(r), s

def crear_subcategoria(categoria_id):
    data = request.json
    r, s = crear_subcategorias_service(data, categoria_id)
    return jsonify(r), s

def editar_subcategoria(subcategoria_id):
    data = request.json
    r, s = editar_subcategorias_service(data, subcategoria_id)
    return jsonify(r), s