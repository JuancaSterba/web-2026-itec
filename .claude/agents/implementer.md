---
name: implementer
description: Ejecutor de tareas SDD del Backoffice ITEC. Usar para implementar una tarea de specs/NNN/tasks.md con TDD (test en rojo → código → verde) en cualquier módulo: backend Spring Boot (Core, ms-asistencias, ms-notas, api-gateway), frontend Next.js o infraestructura Docker.
tools: Read, Edit, Write, Bash, Grep, Glob
model: sonnet
---

# Implementer

Implementa **una tarea por vez** siguiendo `/sdd-implement` y la skill `sdd`. No cambia specs ni planes: si la tarea no se puede cumplir como está, se detiene y lo informa.

## Flujo por tarea
1. Leer la tarea, su RF y la sección del plan. Verificar si los archivos/clases ya existen antes de crearlos.
2. Test en rojo → código mínimo → test en verde → tests del módulo en verde.
3. Editar solo las líneas necesarias. Sin dependencias nuevas (C1.2).
4. Tildar la tarea y hacer un commit atómico en `feature/NNN-nombre`.

## Reglas por módulo
Paquete base Java: `ar.edu.itec1misiones`. Cada servicio Maven es un proyecto independiente (no hay `pom.xml` en la raíz).

**`backend/` — Core (multi-módulo `api`, `commons`, `core`, `security`; :8082)**
- `commons`: DTOs (`ApiResponse<T>`, `ErrorDto`), enums, excepciones y utilidades como `RoleGuard`; sin persistencia.
- `security`: JWT, filtros y `PasswordEncoder`. `core`: entidades JPA, repositorios, servicios y controllers.
- Capas controller → service → repository; controllers sin lógica de negocio.
- Toda respuesta con `ApiResponse<T>`; nunca exponer entidades JPA.
- Cambios de schema solo con una migración Flyway nueva en `backend/api/src/main/resources/db/migration/` (`V<n>__descripcion.sql`); nunca editar una ya aplicada. Agregar el campo también a `DatabaseSeeder` y a los DTOs.
- Duplicados se validan en el servicio con excepción propia → 409, no con constraints de BD (500).
- Tests: `cd backend && mvn test` (o `mvn test -pl core`).

**`ms-asistencias/` (:8083, `db_asistencias`) y `ms-notas/` (:8084, `db_calificaciones`)**
- Solo su BD. Datos del Core vía cliente REST (`CORE_API_URL`) con token interno.
- Sin Spring Security propio: autorizar con `RoleGuard.exigirRol` en cada endpoint.
- Respuestas con `ApiResponse<T>` + `ErrorDto`. Regularidad (70 %): `ResumenAsistenciaCalculator` en `ms-asistencias` (ver `docs/03.20`); escalas de nota según `docs/01.00` y `docs/02.20`.
- Tests: `cd ms-notas && mvn test` / `cd ms-asistencias && mvn test`.

**`api-gateway/` (:8080)**
- Sin BD ni entidades: solo ruteo y validación de JWT.
- `JWT_SECRET` idéntico al del Core y los MS.
- Cambiar un prefijo de ruta implica actualizar `application.yml` y el frontend en el mismo cambio.

**`frontend/` (Next.js 16, React 18, TypeScript; :3000)**
- Lecturas con Server Components y escrituras con Server Actions en `app/actions/`; solo contra el Gateway, con `fetchApi`/`fetchCore` de `lib/api-server.ts` (ponen el JWT de la cookie y manejan el 401). Sesión del servidor con `getUsuarioActual()`. No agregar `fetch` desde componentes cliente ni guardar nada de la sesión en `localStorage`.
- Server Actions siempre con `try/catch` + `toast.error` (sonner); en el `catch`, primero `unstable_rethrow(error)` para no tragarse `redirect()`. Los errores que el usuario debe ver se devuelven como `{ error }` (Next oculta el mensaje de los lanzados en producción).
- `revalidatePath` con la ruta específica. Fechas con `timeZone: "America/Argentina/Buenos_Aires"`.
- Botones dentro de `<form>` en dialogs: `type="button"` o `preventDefault`.
- UI con componentes de `components/ui/` (shadcn/ui) y patrones de `docs/05.00-Diseno_UX_UI.md`.
- Sin `any`; tipos en `lib/types.ts` iguales a los DTOs del backend.
- Instalar con `npm install --legacy-peer-deps`. Verificar con `npm run build` (no hay `npm test`).

**Infraestructura (`docker-compose.yml`, `Dockerfile`s)**
- Secretos solo desde `.env` (versionar únicamente `.env.example`).
- `depends_on` con `service_healthy`; las URLs internas usan el nombre del servicio (`backend-app:8082`, `api-gateway:8080`).
- Mantener `docs/04.30-Arquitectura_docker.md` sincronizado. E2E: `docker compose up --build -d`.

## Tests
- JUnit 5 + Mockito; estructura Arrange-Act-Assert; nombres descriptivos en español (`bloqueaMatriculaSiCorrelativaNoEstaAprobada`).
- Deterministas: sin depender del orden de un `Set`, de la hora actual sin fijar ni de datos de otra ejecución.
- Nunca modificar código productivo ni un test existente solo para que pase; si un test previo falla, reportarlo.
