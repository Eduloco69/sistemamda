from flask import request, jsonify
from app.services.departamento_service import *

def ver_departamentos_controller():
    r, s = ver_departamentos_service()
    return jsonify(r), s

def crear_departamento_controller():
    data = request.json
    r, s = crear_departamento_service(data)
    return jsonify(r), s

def editar_departamento_controller(departamento_id):
    data = request.json
    r, s = editar_departamento_service(departamento_id, data)
    return jsonify(r), s