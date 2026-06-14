# Requerimientos de Arquitectura y Despliegue (Docker)

## Estructura del Repositorio
El proyecto se mantendrá como un **Monorepo** (un único repositorio) que contendrá tanto el código del Frontend como el del Backend, incluyendo la base de datos y los microservicios. Esto facilitará el despliegue orquestado mediante Docker Compose.

## Arquitectura de Contenedores
Se aplicará el principio de "un proceso por contenedor", separando los servicios de manera independiente para garantizar escalabilidad, tolerancia a fallos y facilidad de actualización.

La arquitectura constará de los siguientes **5 contenedores independientes**:

1. **Contenedor Frontend**: Alojará la aplicación cliente (ej. React/Angular/Vue).
2. **Contenedor Base de Datos**: Alojará el motor de base de datos relacional o NoSQL (ej. MySQL, PostgreSQL, MongoDB).
3. **Contenedor App Principal (Backend)**: Contendrá la lógica central del servidor y enrutamiento principal.
4. **Contenedor Microservicio de Asistencias**: Servicio dedicado exclusivamente a la gestión de asistencias.
5. **Contenedor Microservicio de Calificaciones**: Servicio dedicado exclusivamente a la gestión de notas y calificaciones.

## Estructura Interna del Backend (Proyecto Maven)
Dado que el backend está desarrollado en Java/Spring Boot con una arquitectura multi-módulo de Maven, la estructura de carpetas evolucionará de la siguiente manera para soportar los nuevos contenedores:

```text
/backend
│
├── pom.xml (POM padre)
│
├── /commons     (Librería: DTOs, utilidades compartidas. No dockerizado)
├── /security    (Librería: Filtros JWT, config. No dockerizado)
│
├── /core        (App Principal)
│   ├── src/...
│   └── Dockerfile               (Contenedor 3)
│
├── /microservicio-asistencias   (Nuevo Módulo)
│   ├── src/...
│   └── Dockerfile               (Contenedor 4)
│
└── /microservicio-calificaciones (Nuevo Módulo)
    ├── src/...
    └── Dockerfile               (Contenedor 5)
```

## Orquestación
- Se utilizará un archivo `docker-compose.yml` en la raíz del proyecto para definir, levantar y conectar todos los contenedores simultáneamente con el comando `docker-compose up`.
- Los servicios del backend (App Principal y Microservicios) se comunicarán entre sí y con la base de datos a través de la red interna de Docker.
