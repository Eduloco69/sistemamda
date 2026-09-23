# Backend Mesa de Ayuda

## Proyecto desarrollado por 

```bat
Eduardo Bravo Diaz
```

## Antes de ejecutar

Tener instalado los siguientes programas

* Docker
* Python

Escribir el siguiente comando para clonar el .env

```bat
cp .env.example .env
```

Entra al archivo ``.env`` y modifica la variable ``DB_PASSWORD`` para cambiar la contraseña de la BD

## Ejecutar aplicación modo Dev

```bat
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
```

## Ejecutar aplicación modo Prod
