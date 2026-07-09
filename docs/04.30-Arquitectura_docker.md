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

## Estrategia de Comunicación: API Gateway y Frontend
Dado que el Frontend (Next.js) se ejecuta desde el navegador del usuario (Client-Side), este no puede comunicarse directamente usando los nombres de red internos de Docker (ej. `http://microservicio-asistencias`). 

Para resolver este desafío de conectividad y orquestar llamadas a los múltiples contenedores de backend (App Principal, Asistencias, Calificaciones), se implementará un **API Gateway** o mecanismo de proxy inverso (ya sea un contenedor dedicado como Nginx/Kong, o mediante los _rewrites_ de Next.js).

### Flujo de Red
1. **Red Interna Oculta:** Todos los microservicios y el backend principal vivirán en una red interna de Docker (`backend-network`), y **no** expondrán sus puertos hacia internet.
2. **Puerta de Enlace (Gateway):** Solo el API Gateway publicará su puerto al host/exterior.
3. **Frontend (Next.js):** El frontend enviará todas sus peticiones al API Gateway. El Gateway decidirá (según la URL) a qué contenedor interno reenviar la petición.

### Manejo de la URL en el Frontend (`NEXT_PUBLIC_API_URL`)
Las variables de entorno en Next.js con el prefijo `NEXT_PUBLIC_` se inyectan estáticamente **durante el proceso de build (construcción)** de la imagen Docker. Para manejar los distintos ambientes:

- **1. Entorno de Desarrollo (IDE):**
  Usa `.env.development` en tu máquina. El frontend apunta al puerto donde estés corriendo localmente el API Gateway o Backend principal.
  `NEXT_PUBLIC_API_URL=http://localhost:8081`

- **2. Entorno Local Dockerizado (Test de Prod en PC):**
  Cuando levantas todo el stack en tu PC con Docker Compose y el Gateway expone, por ejemplo, el puerto `8082`.
  Debes inyectar esta variable al construir el frontend:
  `docker build --build-arg NEXT_PUBLIC_API_URL=http://localhost:8082 ...`

- **3. Entorno Producción:**
  Para el servidor real, se inyecta el dominio público que expone el API Gateway:
  `docker build --build-arg NEXT_PUBLIC_API_URL=https://api.tu-dominio.com ...`
