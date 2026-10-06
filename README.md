# 🎓 Backoffice Académico ITEC - Sistema de Gestión 2026

Sistema de gestión académica del Instituto Tecnológico N°1 (ITEC) de Misiones: carreras, planes de estudio, materias, alumnos, profesores, inscripciones, comisiones, horarios, asistencias, notas, mesas de examen y actas. Está construido como **microservicios orquestados con Docker** con un cliente web en Next.js.

## 🏛️ Arquitectura

Cada servicio tiene su propia base de datos (aislamiento lógico) y se comunica con los demás solo por HTTP. Toda petición del cliente entra por el API Gateway, que valida el JWT una sola vez (token offloading).

| Servicio | Carpeta | Puerto | Responsabilidad |
|---|---|---|---|
| API Gateway | [`api-gateway/`](./api-gateway) | 8080 | Ruteo `/api/v1/**` y validación de JWT. Sin base de datos. |
| Backend Core | [`backend/`](./backend) | 8082 | Identidad (Spring Security), datos maestros, inscripciones, mesas de examen y actas en PDF. BD `backoffice_itec`. |
| MS Asistencias | [`ms-asistencias/`](./ms-asistencias) | 8083 | Presentismo diario por comisión. BD `db_asistencias`. |
| MS Calificaciones | [`ms-notas/`](./ms-notas) | 8084 | Notas parciales y de mesas de examen. BD `db_calificaciones`. |
| Frontend | [`frontend/`](./frontend) | 3000 | Cliente web (Server Components + Server Actions) que consume el Gateway. |
| MySQL | — | 3306 | Una instancia con las 3 bases. |

**Stack:** Java 17 · Spring Boot 3.2.5 · Spring Cloud Gateway · Maven · Flyway · Next.js 16 · React 18 · TypeScript · Tailwind · shadcn/ui · MySQL 8 · Docker Compose.

## 🚀 Cómo empezar

1. Crear los archivos de entorno a partir de los ejemplos: `backend/.env` desde `backend/.env.example` y `frontend/.env.local` desde `frontend/.env.example`.
2. Levantar todo el ecosistema desde la raíz (el `docker-compose.yml` incluye `backend/docker-compose.yml` con MySQL y el Core):

```bash
docker compose up --build -d
```

3. Abrir `http://localhost:3000`. La API se consume siempre por el Gateway en `http://localhost:8080`.

### Desarrollo y tests
- **Backend** (cada proyecto Maven es independiente): `mvn test` dentro de `backend/`, `ms-asistencias/`, `ms-notas/` o `api-gateway/`.
- **Frontend** (`frontend/`): `npm install --legacy-peer-deps` · `npm run dev` · verificación: `npm run build`.

## 📂 Estructura del repositorio

```
api-gateway/  backend/  ms-asistencias/  ms-notas/  frontend/   servicios (cada uno con su README)
docs/         documentación funcional y técnica (índice: docs/INDEX.md)
specs/        especificaciones SDD por funcionalidad (specs/NNN-nombre/)
.claude/      agentes, comandos /sdd-* y skill sdd para Claude Code
AGENTS.md     punto de entrada para agentes de IA (stack, comandos, guardarraíles)
MEMORY.md     estado del proyecto, decisiones y aprendizajes
```

## 📚 Documentación

- [`docs/INDEX.md`](./docs/INDEX.md) — orden de lectura: enunciado, reglas de negocio, modelo de datos, diagramas de secuencia, arquitectura y UX.
- [`docs/constitution.md`](./docs/constitution.md) — principios innegociables que deben cumplir el código y las specs.
- [`docs/pendientes.md`](./docs/pendientes.md) — tareas abiertas y deuda técnica.

## 🤖 Desarrollo con IA (Spec-Driven Development)

Las funcionalidades nuevas siguen el flujo SDD con Claude Code, siempre desde la raíz del repo:

`/sdd-spec` → `/sdd-clarify` → `/sdd-plan` → `/sdd-tasks` → `/sdd-implement` → `/sdd-validate` (y `/sdd-change` para modificar requisitos)

Las reglas del flujo y la notación de requisitos (EARS) están en `.claude/skills/sdd/SKILL.md`.

## 🌿 Flujo de Git

`main` (estable) ← `develop` (integración) ← `feature/...` (una rama por cambio, commits atómicos, merge sin fast-forward). No se commitea directo a `develop` ni a `main`.

---
*Desarrollado con ♥ para el ITEC N°1 Misiones.*
