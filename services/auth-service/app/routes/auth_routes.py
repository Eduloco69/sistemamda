from flask import Blueprint, request
from app.controllers.auth_controller import *
from shared.app.auth.middleware import auth_required

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/")
def ping():
    return "Conexión Ok"

@auth_bp.route("/register", methods=["POST"])
def register_route():
    return register()

@auth_bp.route("/login", methods=["POST"])
def login_route():
    return login()

@auth_bp.route("/perfil", methods=["GET"])
@auth_required
def perfil():
    return get_perfil()

@auth_bp.route("/logout", methods=["POST"])
def logout_route():
    return logout()

@auth_bp.route("/verify", methods=['GET'])
@auth_required
def verify():
    data = request.user
    return data

@auth_bp.route("/token", methods=['GET'])
def validar_token():
    return validar_token_controller()

@auth_bp.route("/cambiar_contraseña", methods=['POST'])
def cambiar_contraseña():
    return cambiar_contraseña_controller()

@auth_bp.route("/recuperar_contraseña", methods=['POST'])
def recuperar_contraseña():
    return recuperar_contraseña_controller()