from flask import request, jsonify
from app.services.notification_service import *

def test_mail_controller(destinatario):
    r, s = test_mail_service(destinatario)

    return jsonify(r), s

def mail_register_controller():
    data = request.json
    r, s = mail_register_service(data)

    return jsonify(r), s

def cambio_contraseña_controller():
    data = request.json
    r, s = mail_cambio_contraseña_service(data)

    return jsonify(r), s