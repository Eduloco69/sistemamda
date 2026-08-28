def prueba_mail():

    return f"""
        PRUEBA CORREO ENVIADO
    """

def plantilla_ticket_creado(nro_ticket,titulo,categoria,prioridad,solicitante):

    return f"""
    <!DOCTYPE html>

    <html>

    <head>

        <meta charset="UTF-8">

        <style>

            body {{
                font-family: Arial, sans-serif;
                background-color: #f4f6f8;
                margin: 0;
                padding: 30px;
            }}

            .container {{
                max-width: 600px;
                margin: auto;
                background-color: white;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            }}

            .header {{
                background-color: #2563eb;
                color: white;
                padding: 25px;
            }}

            .header h1 {{
                margin: 0;
                font-size: 22px;
            }}

            .content {{
                padding: 30px;
            }}

            .ticket {{
                background-color: #f8fafc;
                border-radius: 8px;
                padding: 20px;
                margin-top: 20px;
            }}

            .ticket-row {{
                margin-bottom: 12px;
            }}

            .label {{
                color: #64748b;
                font-size: 13px;
            }}

            .value {{
                font-size: 15px;
                font-weight: bold;
                color: #1e293b;
            }}

            .button {{
                display: inline-block;
                margin-top: 20px;
                padding: 12px 20px;
                background-color: #2563eb;
                color: white;
                text-decoration: none;
                border-radius: 6px;
            }}

            .footer {{
                padding: 20px;
                background-color: #f8fafc;
                color: #64748b;
                font-size: 12px;
                text-align: center;
            }}

        </style>

    </head>


    <body>

        <div class="container">

            <div class="header">

                <h1>
                    Mesa de Ayuda
                </h1>

                <p>
                    Nuevo ticket creado
                </p>

            </div>


            <div class="content">

                <p>
                    Hola <strong>{solicitante}</strong>,
                </p>

                <p>
                    Se ha creado correctamente un nuevo
                    ticket en la Mesa de Ayuda.
                </p>


                <div class="ticket">

                    <div class="ticket-row">

                        <div class="label">
                            Número de ticket
                        </div>

                        <div class="value">
                            {nro_ticket}
                        </div>

                    </div>


                    <div class="ticket-row">

                        <div class="label">
                            Título
                        </div>

                        <div class="value">
                            {titulo}
                        </div>

                    </div>


                    <div class="ticket-row">

                        <div class="label">
                            Categoría
                        </div>

                        <div class="value">
                            {categoria}
                        </div>

                    </div>


                    <div class="ticket-row">

                        <div class="label">
                            Prioridad
                        </div>

                        <div class="value">
                            {prioridad}
                        </div>

                    </div>

                </div>


                <p>
                    Puedes ingresar a la Mesa de Ayuda
                    para revisar el estado y seguimiento
                    de tu solicitud.
                </p>


                <a
                    href="http://localhost:5173"
                    class="button"
                >
                    Ver ticket
                </a>

            </div>


            <div class="footer">

                Este correo fue generado automáticamente
                por la Mesa de Ayuda.

                <br>

                Por favor, no respondas directamente
                a este mensaje.

            </div>

        </div>

    </body>

    </html>
    """

def template_register(nombre_usuario, correo, password, enlace_login):
    return f"""
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cuenta creada</title>
</head>

<body style="
    margin: 0;
    padding: 0;
    background-color: #f3f6fa;
    font-family: Arial, Helvetica, sans-serif;
    color: #1e293b;
">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 40px 20px;">
    <tr>
        <td align="center">

            <table width="600" cellpadding="0" cellspacing="0" border="0" style=" max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0;">
                <tr>
                    <td style="background-color: #1e40af;padding: 28px 35px;">
                        <div style="color: #ffffff;font-size: 22px;font-weight: bold;">
                            Mesa de Ayuda
                        </div>

                        <div style="color: #dbeafe;font-size: 14px;margin-top: 6px;">
                            Sistema de Gestión de Tickets
                        </div>
                    </td>
                </tr>

                <tr>
                    <td style="padding: 35px;">

                        <h1 style="margin: 0 0 20px 0;font-size: 24px;color: #1e3a8a;">
                            Cuenta creada correctamente
                        </h1>

                        <p style="font-size: 15px;line-height: 1.6;margin: 0 0 15px 0;">
                            Estimado/a <strong>{nombre_usuario}</strong>,
                        </p>

                        <p style="font-size: 15px;line-height: 1.6;margin: 0 0 25px 0;color: #475569;">
                            Se ha creado correctamente su cuenta de acceso
                            a la <strong>Mesa de Ayuda</strong>.
                            A continuación encontrará las credenciales
                            necesarias para ingresar al sistema.
                        </p>

                        <table
                            width="100%"
                            cellpadding="0"
                            cellspacing="0"
                            border="0"
                            style="
                                background-color: #eff6ff;
                                border: 1px solid #bfdbfe;
                                border-radius: 8px;
                                margin-bottom: 25px;
                            "
                        >
                            <tr>
                                <td style="padding: 20px;">

                                    <div style="font-size: 13px;color: #64748b;margin-bottom: 5px;">
                                        Correo electrónico
                                    </div>

                                    <div style="font-size: 15px;font-weight: bold;color: #1e3a8a;margin-bottom: 18px;">
                                        {correo}
                                    </div>

                                    <div style="font-size: 13px;color: #64748b;margin-bottom: 5px;">
                                        Contraseña temporal
                                    </div>

                                    <div style="font-size: 18px;font-weight: bold;letter-spacing: 1px;color: #1e3a8a;">
                                        {password}
                                    </div>

                                </td>
                            </tr>
                        </table>

                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 25px;" >
                            <tr>
                                <td style="border-left: 4px solid #2563eb;padding: 12px 15px;background-color: #f8fafc;color: #475569;font-size: 13px;line-height: 1.5;">
                                    Por motivos de seguridad, se recomienda
                                    cambiar su contraseña después de iniciar
                                    sesión por primera vez.
                                </td>
                            </tr>
                        </table>

                        <table width="100%" cellpadding="0" cellspacing="0" border="0" >
                            <tr>
                                <td align="center">

                                    <a
                                        href="{enlace_login}"
                                        style="
                                            display: inline-block;
                                            background-color: #2563eb;
                                            color: #ffffff;
                                            text-decoration: none;
                                            font-size: 15px;
                                            font-weight: bold;
                                            padding: 13px 30px;
                                            border-radius: 6px;
                                        "
                                    >
                                        Iniciar sesión
                                    </a>

                                </td>
                            </tr>
                        </table>

                        <p style=" margin: 28px 0 0 0; font-size: 13px; line-height: 1.5; color: #64748b; text-align: center; ">
                            Si el botón no funciona, puede ingresar
                            directamente al sistema utilizando el siguiente
                            enlace:
                            <br>

                            <a
                                href="{enlace_login}"
                                style="
                                    color: #2563eb;
                                    text-decoration: none;
                                "
                            >
                                {enlace_login}
                            </a>
                        </p>

                    </td>
                </tr>

                <tr>
                    <td style=" background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 35px; text-align: center; ">
                        <div style=" font-size: 12px; color: #64748b; line-height: 1.5; ">
                            Este correo ha sido generado automáticamente
                            por la Mesa de Ayuda.
                            <br>
                            Por favor, no responda directamente a este mensaje.
                        </div>
                    </td>
                </tr>

            </table>

        </td>
    </tr>
</table>

</body>
</html>
"""

def template_cambio_contraseña(nombre_usuario, url_cambio):
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperación de contraseña - Sistema MDA</title>
</head>

<body style="margin:0; padding:0; background-color:#f1f5f9; font-family:Arial, Helvetica, sans-serif; color:#334155;">

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9; padding:40px 15px;">
        <tr>
            <td align="center">

                <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 15px rgba(15,23,42,0.08);">

                    <!-- HEADER -->
                    <tr>
                        <td style="background-color:#2563eb; padding:28px 35px; text-align:center;">

                            <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:600;">
                                Sistema MDA
                            </h1>

                            <p style="margin:8px 0 0; color:#dbeafe; font-size:14px;">
                                Mesa de Ayuda
                            </p>

                        </td>
                    </tr>

                    <!-- CONTENIDO -->
                    <tr>
                        <td style="padding:40px 45px;">

                            <h2 style="margin:0 0 20px; color:#0f172a; font-size:21px;">
                                Recuperación de contraseña
                            </h2>

                            <p style="margin:0 0 16px; font-size:15px; line-height:1.6;">
                                Hola <strong>{nombre_usuario}</strong>,
                            </p>

                            <p style="margin:0 0 20px; font-size:15px; line-height:1.6; color:#475569;">
                                Hemos recibido una solicitud para cambiar la contraseña de tu cuenta en el
                                <strong>Sistema MDA</strong>.
                            </p>

                            <p style="margin:0 0 28px; font-size:15px; line-height:1.6; color:#475569;">
                                Para establecer una nueva contraseña, haz clic en el siguiente botón:
                            </p>

                            <!-- BOTÓN -->
                            <table cellpadding="0" cellspacing="0" border="0" align="center">
                                <tr>
                                    <td align="center" style="border-radius:8px; background-color:#2563eb;">

                                        <a href="{url_cambio}"
                                           target="_blank"
                                           style="display:inline-block; padding:14px 28px; color:#ffffff; font-size:15px; font-weight:600; text-decoration:none; border-radius:8px;">
                                            Cambiar contraseña
                                        </a>

                                    </td>
                                </tr>
                            </table>

                            <!-- AVISO -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:30px; background-color:#eff6ff; border-left:4px solid #2563eb; border-radius:5px;">
                                <tr>
                                    <td style="padding:15px 18px;">

                                        <p style="margin:0; font-size:13px; line-height:1.5; color:#475569;">
                                            <strong>Importante:</strong> este enlace es temporal y solo puede utilizarse
                                            una vez. Si no solicitaste el cambio de contraseña, puedes ignorar este correo.
                                        </p>

                                    </td>
                                </tr>
                            </table>

                            <!-- URL ALTERNATIVA -->
                            <p style="margin:30px 0 8px; font-size:13px; color:#64748b;">
                                Si el botón no funciona, puedes copiar y pegar el siguiente enlace en tu navegador:
                            </p>

                            <p style="margin:0; font-size:12px; line-height:1.5; word-break:break-all;">
                                <a href="{url_cambio}" target="_blank" style="color:#2563eb; text-decoration:none;">
                                    {url_cambio}
                                </a>
                            </p>

                        </td>
                    </tr>

                    <!-- FOOTER -->
                    <tr>
                        <td style="padding:22px 35px; background-color:#f8fafc; border-top:1px solid #e2e8f0; text-align:center;">

                            <p style="margin:0 0 6px; font-size:12px; color:#64748b;">
                                Este correo fue generado automáticamente por el Sistema MDA.
                            </p>

                            <p style="margin:0; font-size:11px; color:#94a3b8;">
                                Por favor, no respondas directamente a este mensaje.
                            </p>

                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
"""