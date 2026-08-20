def find_usuario_by_email(cursor, correo):

    cursor.execute(
        """
        SELECT	userId,
                userNom + ' ' + userApPat + ' ' + userApMat as 'Nombre',
                userTelMovil
        FROM usuario
        WHERE userMail = ?
        """,
        (correo,)
    )

    row = cursor.fetchone()

    if row is None:
        return None

    return {
        "userId": row[0],
        "nombre":row[1],
        "telefono":row[2]
        }


def find_solicitante_by_email(cursor, correo):

    cursor.execute(
        """
        SELECT solicitanteId, nombre, telefono
        FROM solicitante
        WHERE correo = ?
        """,
        (correo,)
    )

    row = cursor.fetchone()

    if row is None:
        return None

    return {
        "solicitanteId": row[0],
        "nombre": row[1],
        "telefono": row[2]
    }


def insert_solicitante(cursor, solicitante_info):

    sql = """
    INSERT INTO solicitante
    (
        correo,
        nombre,
        telefono,
        fechaCreacion
    )

    OUTPUT INSERTED.solicitanteId

    VALUES
    (
        ?,?,?,
        GETDATE()
    )
    """

    cursor.execute(
        sql,
        (
            solicitante_info["correo"],
            solicitante_info.get("nombre"),
            solicitante_info.get("telefono")
        )
    )

    row = cursor.fetchone()

    return row[0]


def update_solicitante(cursor, solicitante_id, solicitante_info):

    cursor.execute(
        """
        UPDATE solicitante
        SET nombre = ?,
            telefono = ?
        WHERE solicitanteId = ?
        """,
        (
            solicitante_info.get("nombre"),
            solicitante_info.get("telefono"),
            solicitante_id
        )
    )

def resolve_solicitante(cursor, solicitante_info):

    print('Revisando correo')

    correo = solicitante_info.get("correo")

    print(f'correo solicitante: {correo}')

    usuario = find_usuario_by_email(cursor, correo)

    print(f'Usuario encontrado: {usuario}')

    if usuario:
        return {
            "usuarioSolicitudTicket": usuario["userId"],
            "solicitanteTicket": None
        }

    existente = find_solicitante_by_email(cursor, correo)

    if existente:

        update_solicitante(cursor, existente["solicitanteId"], solicitante_info)

        return {
            "usuarioSolicitudTicket": None,
            "solicitanteTicket": existente["solicitanteId"]
        }

    nuevo_id = insert_solicitante(cursor, solicitante_info)

    return {
        "usuarioSolicitudTicket": None,
        "solicitanteTicket": nuevo_id
    }