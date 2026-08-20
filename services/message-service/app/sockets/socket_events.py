from flask_socketio import join_room
from app import socketio


@socketio.on("connect")
def on_connect():
    return ''

@socketio.on("join_ticket")
def join_ticket(data):

    ticket_id = data["ticketId"]
    room = f"ticket_{ticket_id}"

    join_room(room)