from datetime import datetime
from zoneinfo import ZoneInfo

ZONA_CHILE = ZoneInfo("America/Santiago")


def fecha_chile(valor):
    if valor is None:
        return None

    if isinstance(valor, datetime):
        return valor.replace(tzinfo=ZONA_CHILE).isoformat()

    return valor


def formatear_fechas(data):
    if isinstance(data, dict):
        return {
            key: fecha_chile(value)
            for key, value in data.items()
        }

    if isinstance(data, list):
        return [
            formatear_fechas(item)
            for item in data
        ]

    return data