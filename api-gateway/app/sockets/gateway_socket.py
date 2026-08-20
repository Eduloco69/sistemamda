from app import socketio
from flask_socketio import join_room
from app.sockets.message_socket import message_client

@socketio.on("connect")
def handle_connect():
    print("Frontend conectado")

@socketio.on("disconnect")
def handle_disconnect():
    print("Frontend desconectado")

@socketio.on("join_ticket")
def handle_join_ticket(data):
    ticket_id = data["ticketId"]
    room = f"ticket_{ticket_id}"
    join_room(room)
    message_client.emit("join_ticket", data)