/*Roles iniciales*/
INSERT INTO [MesaDeAyuda].[dbo].[rol] VALUES (1, 'Administrador' )
INSERT INTO [MesaDeAyuda].[dbo].[rol] VALUES (2, 'Supervisor' )
INSERT INTO [MesaDeAyuda].[dbo].[rol] VALUES (3, 'Tecnico' )
INSERT INTO [MesaDeAyuda].[dbo].[rol] VALUES (4, 'Usuario' )

/*Estado de Tickets*/
INSERT INTO [MesaDeAyuda].[dbo].[estadoTicket] VALUES (1, 'Abierto')
INSERT INTO [MesaDeAyuda].[dbo].[estadoTicket] VALUES (2, 'Anulado')
INSERT INTO [MesaDeAyuda].[dbo].[estadoTicket] VALUES (3, 'Asignado')
INSERT INTO [MesaDeAyuda].[dbo].[estadoTicket] VALUES (4, 'En Gestión')
INSERT INTO [MesaDeAyuda].[dbo].[estadoTicket] VALUES (5, 'Derivado')
INSERT INTO [MesaDeAyuda].[dbo].[estadoTicket] VALUES (6, 'Resuelto')
INSERT INTO [MesaDeAyuda].[dbo].[estadoTicket] VALUES (7, 'Reabierto')
INSERT INTO [MesaDeAyuda].[dbo].[estadoTicket] VALUES (8, 'Cerrado')

/*Categor�as Iniciales*/
SET IDENTITY_INSERT [MesaDeAyuda].[dbo].[categoria] ON;

INSERT INTO [MesaDeAyuda].[dbo].[categoria] (categoriaId,categoria) VALUES (1, 'Hardware' )
INSERT INTO [MesaDeAyuda].[dbo].[categoria] (categoriaId,categoria) VALUES (2, 'Software' )
INSERT INTO [MesaDeAyuda].[dbo].[categoria] (categoriaId,categoria) VALUES (3, 'Red' )
INSERT INTO [MesaDeAyuda].[dbo].[categoria] (categoriaId,categoria) VALUES (4, 'Seguridad' )
INSERT INTO [MesaDeAyuda].[dbo].[categoria] (categoriaId,categoria) VALUES (5, 'Acceso' )
INSERT INTO [MesaDeAyuda].[dbo].[categoria] (categoriaId,categoria) VALUES (6, 'Servicios' )

SET IDENTITY_INSERT [MesaDeAyuda].[dbo].[categoria] OFF;

/*Subcategorias iniciales*/
SET IDENTITY_INSERT [MesaDeAyuda].[dbo].[subCategoriaTicket] ON;

INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (1, 'Ordenadores de sobremesa y portátiles', 1)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (2, 'Impresoras y escáneres', 1)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (3, 'Dispositivos móviles', 1)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (4, 'Servidores', 1)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (5, 'Equipos de Red', 1)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (6, 'Periféricos', 1)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (7, 'Dispositivos de almacenamiento', 1)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (8, 'Equipos de videoconferencia', 1)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (9, 'Problemas de energía', 1)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (10, 'Docking stations', 1)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (11, 'Aplicaciones de S.O.', 2)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (12, 'Correo Electrónico', 2)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (13, 'Base de datos', 2)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (14, 'Instalación / actualización de software', 2)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (15, 'Licenciamiento', 2)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (16, 'Errores de sistema operativo', 2)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (17, 'Aplicaciones corporativas internas', 2)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (18, 'Problemas de conectividad', 3)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (19, 'Problemas de VPN', 3)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (20, 'Rendimiento lento de Internet/Red', 3)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (21, 'Acceso Wifi', 3)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (22, 'Problemas de LAN cableada', 3)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (23, 'Caídas de red general', 3)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (24, 'Problemas con proxy/firewall', 3)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (25, 'Virus y Malware', 4)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (26, 'Acceso no autorizado', 4)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (27, 'Intentos de Phishing', 4)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (28, 'Gestión de antivirus/EDR', 4)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (29, 'Restablecimiento de contraseñas', 5)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (30, 'Bloqueo de cuentas', 5)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (31, 'Problemas de permiso', 5)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (32, 'Baja de usuarios', 5)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (33, 'Modificación de accesos/roles', 5)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (34, 'Acceso remoto', 6)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (35, 'Interrupción del servicio de correo electrónico', 6)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (36, 'Fallos en la copia de seguridad y recuperación', 6)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (37, 'Configuracion de usuarios', 6)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (38, 'Solicitud de nuevos servicios TI', 6)
INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] (subCatId, subCat, categoriaId) VALUES (39, 'Gestión de respaldos (restore)', 6)

SET IDENTITY_INSERT [MesaDeAyuda].[dbo].[subCategoriaTicket] OFF;

/*Departamento inicial*/
SET IDENTITY_INSERT [MesaDeAyuda].[dbo].[departamento] ON;

INSERT INTO [MesaDeAyuda].[dbo].[departamento] (departamentoId, nombre, tipoDepartamento) VALUES (1, 'Administrador', 'tecnico')

SET IDENTITY_INSERT [MesaDeAyuda].[dbo].[departamento] OFF;

/*Permisos iniciales*/
INSERT INTO [MesaDeAyuda].[dbo].[permisos] VALUES (1, 'VER_MENU_TICKETS', 'Ver el menú de tickets')
INSERT INTO [MesaDeAyuda].[dbo].[permisos] VALUES (2, 'VER_TICKETS_TODOS', 'Ver tickets de todos')
INSERT INTO [MesaDeAyuda].[dbo].[permisos] VALUES (3, 'VER_MENU_DASHBOARDS', 'Ver dashboards')
INSERT INTO [MesaDeAyuda].[dbo].[permisos] VALUES (4, 'VER_MENU_USUARIOS', 'Ver el menú de parametrizacion usuarios')
INSERT INTO [MesaDeAyuda].[dbo].[permisos] VALUES (5, 'VER_MENU_CONFIGURACION', 'Ver el menú de configuración de sistema')
INSERT INTO [MesaDeAyuda].[dbo].[permisos] VALUES (6, 'VER_MENU_NUEVO_TICKET', 'Ver menú para crear ticket')
INSERT INTO [MesaDeAyuda].[dbo].[permisos] VALUES (7, 'VER_MENU_PERFIL', 'Ver perfil propio')
INSERT INTO [MesaDeAyuda].[dbo].[permisos] VALUES (8, 'CHATBOT', 'Ver y usar el chatbot para crear tickets')
INSERT INTO [MesaDeAyuda].[dbo].[permisos] VALUES (9, 'CREAR_TICKETS', 'Permite crear tickets propios')
INSERT INTO [MesaDeAyuda].[dbo].[permisos] VALUES (10, 'CREAT_TICKET_TEC', 'Permite crear tickets a otros usuarios, se asignan automaticamente a quien los envia')
INSERT INTO [MesaDeAyuda].[dbo].[permisos] VALUES (11, 'CREAR_TICKETS_ADMIN', 'Permite crear tickets a otros usuarios y asignarlos a uno mismo u otro usuario')
INSERT INTO [MesaDeAyuda].[dbo].[permisos] VALUES (12, 'ASIGNAR_TICKETS', 'Permite asignar un ticket a uno mismo')
INSERT INTO [MesaDeAyuda].[dbo].[permisos] VALUES (13, 'ASIGNAR_TICKETS_ADMIN', 'Permite asignar un ticket a uno mismo u otro usuario')
INSERT INTO [MesaDeAyuda].[dbo].[permisos] VALUES (14, 'MODIFICAR_TICKET', 'Permite modificar el tipo de ticket, categoría, subcategoría y prioridad de un ticket')
INSERT INTO [MesaDeAyuda].[dbo].[permisos] VALUES (15, 'GESTIONAR_TICKET', 'Permite modificar el estado de un ticket')
INSERT INTO [MesaDeAyuda].[dbo].[permisos] VALUES (16, 'GESTIONAR_TICKET_ADMIN', 'Permite modificar el estado de un ticket sin restricción')
INSERT INTO [MesaDeAyuda].[dbo].[permisos] VALUES (17, 'GESTIONAR_USUARIOS', 'Gestionar Usuarios')
INSERT INTO [MesaDeAyuda].[dbo].[permisos] VALUES (18, 'CREAR_USUARIOS', 'Crear usuarios')
INSERT INTO [MesaDeAyuda].[dbo].[permisos] VALUES (19, 'MODIFICAR_USUARIOS', 'Modificar Usuarios')
INSERT INTO [MesaDeAyuda].[dbo].[permisos] VALUES (20, 'BLOQUEAR_USUARIOS', 'Bloquear usuarios')
INSERT INTO [MesaDeAyuda].[dbo].[permisos] VALUES (21, 'GESTIONAR_PARAMETROS', 'Gestionar parametros')
INSERT INTO [MesaDeAyuda].[dbo].[permisos] VALUES (22, 'MODIFICAR_PARAMETROS', 'Modificar parametros')

/*Permisos a Administrador*/
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (1, 1);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (1, 2);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (1, 3);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (1, 4);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (1, 5);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (1, 6);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (1, 7);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (1, 8);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (1, 9);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (1, 10);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (1, 11);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (1, 12);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (1, 13);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (1, 14);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (1, 15);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (1, 16);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (1, 17);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (1, 18);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (1, 19);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (1, 20);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (1, 21);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (1, 22);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (2, 1);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (2, 2);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (2, 3);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (2, 4);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (2, 5);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (2, 6);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (2, 7);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (2, 8);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (2, 11);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (2, 13);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (2, 14);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (2, 16);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (2, 17);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (2, 18);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (2, 19);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (2, 20);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (2, 21);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (2, 22);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (3, 1);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (3, 2);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (3, 4);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (3, 6);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (3, 7);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (3, 8);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (3, 10);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (3, 12);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (3, 14);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (3, 15);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (4, 1);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (4, 6);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (4, 7);
INSERT INTO [MesaDeAyuda].[dbo].[rolPermiso] ([rolId], [permisoId]) VALUES (4, 9);

/*Prioridad Ticket*/
SET IDENTITY_INSERT [MesaDeAyuda].[dbo].[prioridadTicket] ON;

INSERT INTO [MesaDeAyuda].[dbo].[prioridadTicket]
(
    [idPrioridad],
    [prioridadTicket]
)
VALUES
    (1, 'Baja'),
    (2, 'Media'),
    (3, 'Alta'),
    (4, 'Crítica');

SET IDENTITY_INSERT [MesaDeAyuda].[dbo].[prioridadTicket] OFF;