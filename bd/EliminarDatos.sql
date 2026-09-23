USE MesaDeAyuda;
GO

BEGIN TRY

    BEGIN TRANSACTION;

    -- ==========================================
    -- 1. Eliminar tablas hijas
    -- ==========================================

    DELETE FROM adjunto;
    DELETE FROM mensajesTicket;
    DELETE FROM historialTicket;
    DELETE FROM ticketEncuesta;

    DELETE FROM usuarioNotificacion;
    DELETE FROM notificacion;

    DELETE FROM derivacionTicket;

    DELETE FROM rolPermiso;

    DELETE FROM TokenChangePass;

    -- ==========================================
    -- 2. Eliminar tickets
    -- ==========================================

    DELETE FROM ticket;

    -- ==========================================
    -- 3. Eliminar usuarios y solicitantes
    -- ==========================================

    DELETE FROM usuario;
    DELETE FROM solicitante;

    -- ==========================================
    -- 4. Eliminar tablas de configuración
    -- ==========================================

    DELETE FROM tipoTicket;
    DELETE FROM subCategoriaTicket;
    DELETE FROM categoria;
    DELETE FROM empresas;
    DELETE FROM departamento;

    DELETE FROM permisos;
    DELETE FROM rol;

    DELETE FROM estadoTicket;
    DELETE FROM prioridadTicket;

    -- ==========================================
    -- 5. Reiniciar IDENTITIES
    -- ==========================================

    DBCC CHECKIDENT ('adjunto', RESEED, 0);
    DBCC CHECKIDENT ('mensajesTicket', RESEED, 0);
    DBCC CHECKIDENT ('historialTicket', RESEED, 0);
    DBCC CHECKIDENT ('ticketEncuesta', RESEED, 0);

    DBCC CHECKIDENT ('usuarioNotificacion', RESEED, 0);
    DBCC CHECKIDENT ('notificacion', RESEED, 0);

    DBCC CHECKIDENT ('derivacionTicket', RESEED, 0);
    DBCC CHECKIDENT ('rolPermiso', RESEED, 0);
    DBCC CHECKIDENT ('TokenChangePass', RESEED, 0);

    DBCC CHECKIDENT ('ticket', RESEED, 0);
    DBCC CHECKIDENT ('usuario', RESEED, 0);
    DBCC CHECKIDENT ('solicitante', RESEED, 0);

    DBCC CHECKIDENT ('tipoTicket', RESEED, 0);
    DBCC CHECKIDENT ('subCategoriaTicket', RESEED, 0);
    DBCC CHECKIDENT ('categoria', RESEED, 0);
    DBCC CHECKIDENT ('empresas', RESEED, 0);
    DBCC CHECKIDENT ('departamento', RESEED, 0);

    COMMIT TRANSACTION;

    PRINT 'Base de datos limpiada correctamente.';
    PRINT 'Los campos IDENTITY fueron reiniciados.';

END TRY
BEGIN CATCH

    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    PRINT 'ERROR: ' + ERROR_MESSAGE();

    THROW;

END CATCH;
GO