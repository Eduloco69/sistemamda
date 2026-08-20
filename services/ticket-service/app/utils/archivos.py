import os
from uuid import uuid4

UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER")

def save_uploaded_file(file):

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    extension = file.filename.split(".")[-1]

    filename = f"{uuid4()}.{extension}"

    full_path = os.path.join(
        UPLOAD_FOLDER,
        filename
    )

    file.save(full_path)

    return filename, extension

