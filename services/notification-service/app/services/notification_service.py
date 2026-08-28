import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.templates.email_templates import *

FRONTEND_URL = os.getenv('FRONTEND_URL')

def enviar_correo(destinatario, asunto, contenido_html):

    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    mail_from = os.getenv("MAIL_FROM")

    mensaje = MIMEMultipart("alternative")

    mensaje["From"] = mail_from
    mensaje["To"] = destinatario
    mensaje["Subject"] = asunto

    contenido = MIMEText(
        contenido_html,
        "html",
        "utf-8"
    )

    mensaje.attach(contenido)

    try:
        with smtplib.SMTP(
            smtp_host,
            smtp_port
        ) as servidor:

            servidor.ehlo()

            servidor.starttls()

            servidor.ehlo()

            servidor.login(
                smtp_user,
                smtp_password
            )

            servidor.sendmail(
                mail_from,
                destinatario,
                mensaje.as_string()
            )

        return {
            'Mensaje':'Correo enviado correctamente'
        }, 200

    except Exception as e:
        return {
            'Mensaje':'No se ha logrado enviar el correo',
            'Error':str(e)
        }, 400

def test_mail_service(destinatario):
    contenido = prueba_mail()

    r, s = enviar_correo(destinatario, "Prueba Mail", contenido)

    return r, s

def mail_register_service(data):
    asunto = "Cuenta creada con exito"
    enlace_login = f"{FRONTEND_URL}/login"

    nombre_usuario = data['nombre_usuario']
    correo = data['correo']
    password = data['password']
    
    contenido = template_register(nombre_usuario, correo, password, enlace_login)

    r, s = enviar_correo(correo, asunto, contenido)

    return r, s

def mail_cambio_contraseña_service(data):
    nombre_usuario = data['nombre_usuario']
    token = data['token']
    correo = data['correo']
    asunto = 'Cambio de contraseña sistema MDA'

    url_cambio = f"{FRONTEND_URL}/cambiar-contraseña?token={token}"

    contenido = template_cambio_contraseña(nombre_usuario, url_cambio)

    r, s = enviar_correo(correo, asunto, contenido)

    return r, s