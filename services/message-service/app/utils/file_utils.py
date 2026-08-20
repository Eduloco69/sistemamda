import os
from werkzeug.utils import secure_filename


UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER")


def save_attachments(cursor,ticket_id,mensaje_id,user_id,files):

    adjuntos = []

    for file in files:

        os.makedirs(
            UPLOAD_FOLDER,
            exist_ok=True
        )

        if file.filename == "":
            continue

        filename = secure_filename(file.filename)

        file_path = os.path.join(
            UPLOAD_FOLDER,
            filename
        )

        file.save(file_path)

        extension = filename.rsplit(".", 1)[-1] if "." in filename else ""

        cursor.execute(
            """
            INSERT INTO adjunto (ticketId,mensajeId,nomArchivo,tipoArchivo,fechaArchivo,usuarioAdjunto) VALUES (?,?,?,?,GETDATE(),?)
            """,(ticket_id,mensaje_id,filename,extension,user_id)
        )

        adjunto_id = cursor.fetchone()[0]

        adjuntos.append({
            "adjuntoId": adjunto_id,
            "nombre": filename,
            "extension": extension
        })

    return adjuntos