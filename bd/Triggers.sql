CREATE TRIGGER trg_ticket_fechaActualizacion
ON [dbo].[ticket]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE t
    SET t.fechaActualizacionTicket = GETDATE()
    FROM [dbo].[ticket] t
    INNER JOIN inserted i
        ON t.ticketId = i.ticketId
    INNER JOIN deleted d
        ON t.ticketId = d.ticketId
    WHERE
        ISNULL(i.NroTicket, '') <> ISNULL(d.NroTicket, '')
        OR ISNULL(i.tituloTicket, '') <> ISNULL(d.tituloTicket, '')
        OR ISNULL(i.ticketDesc, '') <> ISNULL(d.ticketDesc, '')
        OR ISNULL(i.estadoTicket, -1) <> ISNULL(d.estadoTicket, -1)
        OR ISNULL(i.tipoTicket, -1) <> ISNULL(d.tipoTicket, -1)
        OR ISNULL(i.prioridadTicket, -1) <> ISNULL(d.prioridadTicket, -1)
        OR ISNULL(i.subcategoriaTicket, -1) <> ISNULL(d.subcategoriaTicket, -1)
        OR ISNULL(i.usuarioSolicitudTicket, -1) <> ISNULL(d.usuarioSolicitudTicket, -1)
        OR ISNULL(i.solicitanteTicket, -1) <> ISNULL(d.solicitanteTicket, -1)
        OR ISNULL(i.usuarioTicketCreacion, -1) <> ISNULL(d.usuarioTicketCreacion, -1)
        OR ISNULL(i.usuarioTicketAsignado, -1) <> ISNULL(d.usuarioTicketAsignado, -1);
END
GO