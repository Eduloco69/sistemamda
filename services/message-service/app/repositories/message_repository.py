def get_ticket_messages_query(cursor, ticket_id):

    cursor.execute(
        """
        SELECT
            m.mensajeId,
            m.ticketId,
            m.mensaje,
            m.fechaMensaje,

            u.userId,

            CONCAT(
                u.userNom,
                ' ',
                u.userApPat
            ) as nombreCompleto,
            a.adjuntoId,
            a.nomOriginal,
            a.tipoArchivo

        FROM mensajesTicket m

        INNER JOIN usuario u
            ON m.userMensaje = u.userId
        LEFT JOIN adjunto a
            ON m.mensajeId = a.mensajeId
        WHERE m.ticketId = ?
        ORDER BY m.fechaMensaje ASC
        """,
        ticket_id
    )

    return cursor.fetchall()


def insert_message_query(
    cursor,
    ticket_id,
    mensaje,
    user_id
):

    cursor.execute(
        """
        INSERT INTO mensajesTicket
        (
            ticketId,
            mensaje,
            fechaMensaje,
            userMensaje
        )

        OUTPUT INSERTED.mensajeId

        VALUES
        (
            ?,
            ?,
            GETDATE(),
            ?
        )
        """,
        ticket_id,
        mensaje,
        user_id
    )

    row = cursor.fetchone()

    return row[0]


def get_message_by_id_query(cursor,mensaje_id):

    cursor.execute(
        """
        SELECT
            m.mensajeId,
            m.ticketId,
            m.mensaje,
            m.fechaMensaje,

            u.userId,

            CONCAT(
                u.userNom,
                ' ',
                u.userApPat
            ) as nombreCompleto

        FROM mensajesTicket m

        INNER JOIN usuario u
            ON m.userMensaje = u.userId

        WHERE m.mensajeId = ?
        """,
        mensaje_id
    )

    return cursor.fetchone()