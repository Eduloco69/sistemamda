from flask import request, jsonify, make_response
from app.services.auth_service import *

def register():
    data = request.json
    r, s = register_user(data)
    return jsonify(r), s

def login():
    data = request.json
    r, s = login_user(data)

    if "Error" in r:
        return jsonify(r), s

    token = r["token"]

    response = make_response({"message": "Login exitoso"})

    response.set_cookie(
        "access_token",
        token,
        httponly=True,
        secure=False,
        samesite="Lax",
        max_age=60*60*12
    )

    return response

def logout():
    response = make_response({"message": "Logout exitoso"})
    response.delete_cookie("access_token")
    return response

def get_perfil():
    user_id = request.user["userId"]
    r, s = perfil_user(user_id)

    return jsonify(r), s

def validar_token_controller():
    token = request.args.get('token')
    r, s = val_change_pass_service(token)

    return jsonify(r), s

def cambiar_contraseña_controller():
    token = request.args.get('token')
    data = request.json
    if not token:
        return jsonify({
            'Mensaje':'Token obligatorio'
        }), 422
    
    r, s = cambiar_contraseña_service(token, data)

    return jsonify(r), s

def recuperar_contraseña_controller():
    mail = request.args.get('mail')
    r, s = recuperar_contraseña_service(mail)

    return jsonify(r), s