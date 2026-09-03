import os
from flask_cors import CORS
from app import (create_app,socketio)

from app.sockets.gateway_socket import *
from app.sockets.message_socket import init_message_socket

from app.routes.auth_service.auth_routes import auth_bp
from app.routes.ticket_service.ticket_routes import ticket_bp
from app.routes.ticket_service.empresa_routes import empresa_bp
from app.routes.message_service.message_routes import message_bp
from app.routes.ticket_service.categoria_routes import categoria_bp

FRONTEND_URL = os.getenv('FRONTEND_URL')

app = create_app()
CORS(app, resources={r"/*": {"origins": FRONTEND_URL}})

app.register_blueprint(auth_bp,url_prefix="/auth")
app.register_blueprint(ticket_bp,url_prefix="/ticket")
app.register_blueprint(empresa_bp,url_prefix="/empresa")
app.register_blueprint(message_bp,url_prefix="/message")
app.register_blueprint(categoria_bp,url_prefix="/categoria")

init_message_socket()

if __name__ == "__main__":

    socketio.run(
        app,
        host="0.0.0.0",
        port=5000,
        debug=True,
        allow_unsafe_werkzeug=True
    )