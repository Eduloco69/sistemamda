from flask import Blueprint
from app.controllers.notification_controller import *

mail_bp = Blueprint("mail", __name__)

@mail_bp.route("/<string:mail>", methods=['POST'])
def test_mail_route(mail):
    return test_mail_controller(mail)

@mail_bp.route("/registro", methods=['POST'])
def mail_register():
    return mail_register_controller()

@mail_bp.route("/cambio-contraseña", methods=['POST'])
def cambio_contraseña():
    return cambio_contraseña_controller()