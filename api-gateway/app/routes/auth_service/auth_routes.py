import os
from flask import Blueprint
from app.services.proxy_service import proxy_request

auth_bp = Blueprint("auth", __name__)

AUTH_SERVICE = os.getenv("AUTH_SERVICE")

@auth_bp.route("/login", methods=["POST"])
def login():
    return proxy_request(f"{AUTH_SERVICE}/auth/login")

@auth_bp.route("/register", methods=["POST"])
def register():
    return proxy_request(f"{AUTH_SERVICE}/auth/register")

@auth_bp.route("/perfil", methods=["GET"])
def perfil():
    return proxy_request(f"{AUTH_SERVICE}/auth/perfil")

@auth_bp.route("/logout", methods=["POST"])
def logout():
    return proxy_request(f"{AUTH_SERVICE}/auth/logout")

@auth_bp.route("/verify", methods=['GET'])
def verify():
    return proxy_request(f"{AUTH_SERVICE}/auth/verify")

@auth_bp.route("/token", methods=['GET'])
def validar_token():
    return proxy_request(f"{AUTH_SERVICE}/auth/token")

@auth_bp.route("/cambiar_contraseña", methods=['POST'])
def cambiar_contraseña():
    return proxy_request(f"{AUTH_SERVICE}/auth/cambiar_contraseña")

@auth_bp.route("/recuperar_contraseña", methods=['POST'])
def recuperar_contraseña():
    return proxy_request(f"{AUTH_SERVICE}/auth/recuperar_contraseña")
