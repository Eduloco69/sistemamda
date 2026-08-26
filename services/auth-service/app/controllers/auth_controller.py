from flask import request, jsonify, make_response
from app.services.auth_service import register_user, login_user, perfil_user

def register():
    data = request.json
    r, s = register_user(data)
    return jsonify(r), s

def login():
    data = request.json
    r, s = login_user(data)

    if "error" in r:
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