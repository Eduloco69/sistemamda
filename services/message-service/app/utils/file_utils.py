import os
from uuid import uuid4
from ftplib import FTP
from werkzeug.utils import secure_filename


FTP_HOST = os.getenv('FTP_HOST')
FTP_PORT = os.getenv('FTP_PORT')
FTP_USER = os.getenv('FTP_USER')
FTP_PASSWORD = os.getenv('FTP_PASSWORD')
FTP_FOLDER = os.getenv('FTP_FOLDER')


def save_attachments(cursor, ticket_id, mensaje_id, user_id, files):

    adjuntos = []

    ftp = None

    try:
        ftp = FTP()

        ftp.connect(
            host=FTP_HOST,
            port=FTP_PORT
        )

        ftp.login(
            user=FTP_USER,
            passwd=FTP_PASSWORD
        )

        ftp.cwd(FTP_FOLDER)

        for file in files:

            if not file or file.filename == "":
                continue

            original_filename = secure_filename(file.filename)

            extension = (
                original_filename.rsplit(".", 1)[-1].lower()
                if "." in original_filename
                else ""
            )

            filename = (
                f"{uuid4()}.{extension}"
                if extension
                else str(uuid4())
            )

            file.stream.seek(0)

            ftp.storbinary(
                f"STOR {filename}",
                file.stream
            )

            cursor.execute(
                """
                INSERT INTO adjunto
                (
                    ticketId,
                    mensajeId,
                    nomArchivo,
                    nomOriginal,
                    tipoArchivo,
                    fechaArchivo,
                    usuarioAdjunto
                )
                OUTPUT INSERTED.adjuntoId
                VALUES (?, ?, ?, ?, ?, GETDATE(), ?)
                """,
                (
                    ticket_id,
                    mensaje_id,
                    filename,
                    original_filename,
                    extension,
                    user_id
                )
            )

            adjunto_id = cursor.fetchone()[0]

            adjuntos.append({
                "adjuntoId": adjunto_id,
                "nombre": original_filename,
                "nombreServidor": filename,
                "extension": extension
            })

        return adjuntos

    except Exception as e:
        raise

    finally:
        if ftp:
            try:
                ftp.quit()
            except Exception:
                ftp.close()