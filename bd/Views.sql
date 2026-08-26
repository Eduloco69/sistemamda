CREATE OR ALTER VIEW v_lista_tickets as (
    SELECT [ticketId]
          ,[NroTicket]
          ,[tituloTicket]
          ,b.[estadoTicketId]
          ,b.[estadoTicket]
          ,c.[tipoTicketId]
          ,c.[tipoTicket]
          ,d.[idPrioridad]
          ,d.[prioridadTicket]
          ,f.[categoriaId]
          ,f.[categoria]
          ,f.[color]
          ,e.subCat
          ,e.subCatId
          ,a.usuarioSolicitudTicket
          ,CASE 
            WHEN a.usuarioSolicitudTicket IS NOT NULL 
                THEN CONCAT(sol.userNom,' ',sol.userApPat,' ',sol.userApMat)
            ELSE soli.nombre
           END as usuarioSolicitante
          ,a.usuarioTicketAsignado
          ,CASE 
            WHEN a.usuarioTicketAsignado IS NOT NULL 
                THEN CONCAT(asig.userNom,' ',asig.userApPat,' ',asig.userApMat)
            ELSE 'Sin Asignar'
           END as usuarioAsignado
          ,[fechaCreacionTicket]
      FROM [MesaDeAyuda].[dbo].[ticket] a 
      LEFT JOIN [MesaDeAyuda].[dbo].[estadoTicket] b
        ON (a.estadoTicket = b.estadoTicketId)
      LEFT JOIN [MesaDeAyuda].[dbo].[tipoTicket] c
        ON (a.tipoTicket = c.tipoTicketId)
      LEFT JOIN [MesaDeAyuda].[dbo].[prioridadTicket] d
        ON (a.prioridadTicket = d.idPrioridad)
      LEFT JOIN [MesaDeAyuda].[dbo].[subCategoriaTicket] e
        ON (a.subcategoriaTicket = e.subCatId)
      LEFT JOIN [MesaDeAyuda].[dbo].[categoria] f
        ON (e.categoriaId = f.categoriaId)
      LEFT JOIN [MesaDeAyuda].[dbo].[usuario] sol
        ON (a.usuarioSolicitudTicket = sol.userId)
      LEFT JOIN [MesaDeAyuda].[dbo].[solicitante] soli
        ON (a.solicitanteTicket = soli.solicitanteId)
      LEFT JOIN [MesaDeAyuda].[dbo].[usuario] asig
        ON (a.usuarioTicketAsignado = asig.userId)
      LEFT JOIN [MesaDeAyuda].[dbo].[usuario] crea
        ON (a.usuarioTicketCreacion = crea.userId)
);

CREATE OR ALTER VIEW v_detalle_tickets as (
    SELECT [ticketId]
          ,[NroTicket]
          ,[tituloTicket]
          ,b.[estadoTicketId]
          ,b.[estadoTicket]
          ,c.[tipoTicketId]
          ,c.[tipoTicket]
          ,d.[idPrioridad]
          ,d.[prioridadTicket]
          ,f.[categoriaId]
          ,f.[categoria]
          ,e.subCat
          ,e.subCatId
          ,a.usuarioSolicitudTicket
          ,CASE 
            WHEN a.usuarioSolicitudTicket IS NOT NULL 
                THEN CONCAT(sol.userNom,' ',sol.userApPat,' ',sol.userApMat)
            ELSE soli.nombre
           END as usuarioSolicitante
          ,a.usuarioTicketAsignado
          ,CASE 
            WHEN a.usuarioTicketAsignado IS NOT NULL 
                THEN CONCAT(asig.userNom,' ',asig.userApPat,' ',asig.userApMat)
            ELSE 'Sin Asignar'
           END as usuarioAsignado
          ,[fechaCreacionTicket]
          ,[fechaActualizacionTicket]
      FROM [MesaDeAyuda].[dbo].[ticket] a 
      LEFT JOIN [MesaDeAyuda].[dbo].[estadoTicket] b
        ON (a.estadoTicket = b.estadoTicketId)
      LEFT JOIN [MesaDeAyuda].[dbo].[tipoTicket] c
        ON (a.tipoTicket = c.tipoTicketId)
      LEFT JOIN [MesaDeAyuda].[dbo].[prioridadTicket] d
        ON (a.prioridadTicket = d.idPrioridad)
      LEFT JOIN [MesaDeAyuda].[dbo].[subCategoriaTicket] e
        ON (a.subcategoriaTicket = e.subCatId)
      LEFT JOIN [MesaDeAyuda].[dbo].[categoria] f
        ON (e.categoriaId = f.categoriaId)
      LEFT JOIN [MesaDeAyuda].[dbo].[usuario] sol
        ON (a.usuarioSolicitudTicket = sol.userId)
      LEFT JOIN [MesaDeAyuda].[dbo].[solicitante] soli
        ON (a.solicitanteTicket = soli.solicitanteId)
      LEFT JOIN [MesaDeAyuda].[dbo].[usuario] asig
        ON (a.usuarioTicketAsignado = asig.userId)
      LEFT JOIN [MesaDeAyuda].[dbo].[usuario] crea
        ON (a.usuarioTicketCreacion = crea.userId)
);

CREATE OR ALTER VIEW v_tickets_por_estado as (
    SELECT  a.estadoTicketId,
            a.estadoTicket, 
            count(b.ticketId) as 'CantTickets'
      FROM [MesaDeAyuda].[dbo].[estadoTicket] a
      LEFT JOIN [MesaDeAyuda].[dbo].[ticket] b
	    ON a.estadoTicketId = b.estadoTicket
      GROUP BY  estadoTicketId,
                a.estadoTicket
)

CREATE OR ALTER VIEW v_tickets_hoy as (
    SELECT count(*) as 'TicketsHoy' 
    FROM [MesaDeAyuda].[dbo].[ticket] 
    WHERE convert(varchar(10), fechaCreacionTicket, 102) = convert(varchar(10), getdate(), 102)
);

CREATE OR ALTER VIEW v_tickets_ultimos_30_dias AS 
WITH ultimos_30_dias AS (
    SELECT 
        CAST(DATEADD(DAY, -29, GETDATE()) AS DATE) AS fecha

    UNION ALL

    SELECT 
        DATEADD(DAY, 1, fecha)
    FROM ultimos_30_dias
    WHERE fecha < CAST(GETDATE() AS DATE)
),
tickets_por_dia AS (
    SELECT
        CAST(fechaCreacionTicket AS DATE) AS fecha,
        COUNT(*) AS cantidad
    FROM ticket
    WHERE fechaCreacionTicket >= DATEADD(DAY, -30, GETDATE())
    GROUP BY CAST(fechaCreacionTicket AS DATE)
)
SELECT
    d.fecha,
    ISNULL(t.cantidad, 0) AS 'CantTickets'
FROM ultimos_30_dias d
LEFT JOIN tickets_por_dia t
    ON d.fecha = t.fecha;

CREATE OR ALTER VIEW v_tickets_por_categoria AS 
SELECT	a.categoriaId,		
		a.categoria,
		count(c.ticketId) as 'CantTickets'
FROM [MesaDeAyuda].[dbo].[categoria] a
LEFT JOIN [MesaDeAyuda].[dbo].[subCategoriaTicket] b 
	ON (b.categoriaId = a.categoriaId)
LEFT JOIN [MesaDeAyuda].[dbo].[ticket] c
	ON (b.subCatId = c.subcategoriaTicket)
GROUP BY	a.categoriaId,		
			a.categoria;