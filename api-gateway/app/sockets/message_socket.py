import os
import socketio as socketio_client
import threading
import time

from app import socketio


MESSAGE_SERVICE = os.getenv("MESSAGE_SERVICE")


message_client = socketio_client.Client(
    reconnection=True,
    reconnection_attempts=0,
    reconnection_delay=2,
    reconnection_delay_max=10
)


@message_client.event
def connect():
    print("====================================")
    print("Conectado a message-service")
    print("====================================")


@message_client.event
def disconnect():
    print("Desconectado de message-service")


@message_client.on("new_message")
def on_new_message(data):
    print("Mensaje recibido desde message-service:")
    print(data)

    socketio.emit("new_message", data)


def connect_to_message_service():
    while True:
        try:
            print(f"Intentando conectar a message-service: {MESSAGE_SERVICE}")

            message_client.connect(
                MESSAGE_SERVICE,
                transports=["polling"]
            )

            print("Conexión con message-service establecida")

            break

        except Exception as e:
            print("No se pudo conectar a message-service:")
            print(e)
            print("Reintentando en 5 segundos...")

            time.sleep(5)


def init_message_socket():
    thread = threading.Thread(
        target=connect_to_message_service,
        daemon=True
    )

    thread.start()