from flask import request, jsonify
from app.services.empresas_service import *

def obtener_empresas():
    r, s = ver_empresas_service()
    return jsonify(r), s

def crear_empresa():
    data = request.json
    r, s = crear_empresas_service(data)
    return jsonify(r), s

def editar_empresa(empresaId):
    data = request.json
    r, s = editar_empresa_service(data, empresaId)
    return jsonify(r), s