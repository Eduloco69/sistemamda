from flask import request, jsonify, make_response
from app.services.auth_service import register_user, login_user, perfil_user

def register():
    data = request.json
    return jsonify(register_user(data))

def login():
    data = request.json
    result = login_user(data)

    if "error" in result:
        return jsonify(result), 401

    token = result["token"]

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

    data = perfil_user(user_id)

    return jsonify(data)