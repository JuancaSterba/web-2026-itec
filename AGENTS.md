# AGENTS.md — Backoffice Académico ITEC 2026

Sistema de gestión académica del ITEC N°1 (carreras, materias, alumnos, profesores, inscripciones, asistencias y notas). Arquitectura de microservicios orquestada con Docker; toda petición entra por el API Gateway (validación JWT centralizada).

## Stack
- **Backend:** Java 17, Spring Boot 3.2.5, Spring Security (JWT), Spring Cloud Gateway, Maven.
- **Frontend:** Next.js 16, React 18, TypeScript, Tailwind, shadcn/ui.
- **Datos/Infra:** MySQL (BDs `backoffice_itec`, `db_asistencias`, `db_calificaciones`), Docker Compose.

## Estructura
- `api-gateway/` — enrutador `/api/v1/**` (:8080)
- `backend/` — core multi-módulo (`api`, `commons`, `core`, `security`): maestros y auth (:8081 docker / :8082 local)
- `ms-asistencias/` (:8083) · `ms-notas/` (:8084) — microservicios aislados
- `frontend/` — cliente Next.js (:3000)
- `docs/` — requerimientos, reglas de negocio, diagramas (ver `docs/INDEX.md`)
- `.agents/` — roles (architect, backend, frontend, devops, tester, reviewer) · `.superpowers/` — planes/specs
- `.remember/PENDIENTES.md` — **única fuente de verdad** de tareas y deudas

## Comandos
- Todo el ecosistema: `docker compose up --build -d` (raíz)
- Backend (en cada módulo Maven): `mvn clean verify` · tests: `mvn test`
- Frontend (`frontend/`): `npm install` · `npm run dev` · verificación: `npm run build`

## Guardarraíles
**Siempre**
- Leer `.remember/PENDIENTES.md` al iniciar y actualizarlo al terminar una tarea.
- Trabajar en rama `feature/...` desde `develop`, commits pequeños y atómicos.
- Verificar si el archivo/clase ya existe antes de crearlo; editar solo lo necesario.
- Correr tests/build del módulo tocado antes de dar la tarea por terminada.
- Ante una pregunta, solo responder: no modificar código sin orden explícita.

**Preguntar antes**
- Nuevas entidades/tablas, endpoints entre servicios o cambios de flujo (rol `architect`, validar contra `docs/`).
- Cambios en DTOs de `backend/commons`, `docker-compose.yml`, Dockerfiles, `.env` o rutas del Gateway.
- Agregar dependencias nuevas o ante cualquier requisito ambiguo.

**Prohibido**
- Commits directos a `develop` o `main`.
- Que un microservicio acceda a la BD de otro (comunicación solo vía HTTP/Gateway).
- Crear backlogs/TODOs fuera de `.remember/PENDIENTES.md`.
- Commitear secretos o credenciales.
