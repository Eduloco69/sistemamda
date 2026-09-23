def resolve_creation_mode(permisos):

    if "CREAR_TICKETS_ADMIN" in permisos:
        return "ADMIN"

    if "CREAR_TICKET_TEC" in permisos:
        return "TECNICO"

    if "CREAR_TICKETS" in permisos:
        return "USUARIO"

    raise Exception("Sin permisos")