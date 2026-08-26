import os
from flask import Blueprint
from app.services.proxy_service import proxy_request

message_bp = Blueprint("message",__name__)

MESSAGE_SERVICE = os.getenv("MESSAGE_SERVICE")

@message_bp.route("",methods=["POST"])
def create_message():
    return proxy_request(f"{MESSAGE_SERVICE}/message")

@message_bp.route("/<ticket_id>",methods=["GET"])
def get_messages(ticket_id):
    return proxy_request(f"{MESSAGE_SERVICE}/message/{ticket_id}")