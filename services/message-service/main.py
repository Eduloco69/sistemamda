from app import create_app, socketio

from app.routes.message_routes import message_bp
import app.sockets.socket_events

app = create_app()

app.register_blueprint(message_bp,url_prefix="/message")

if __name__ == "__main__":
    socketio.run(
        app,
        host="0.0.0.0",
        port=5000,
        debug=True,
        allow_unsafe_werkzeug=True
    )