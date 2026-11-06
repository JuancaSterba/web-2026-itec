# Guía de estudio — Backoffice Académico ITEC 2026

> Material para entender el proyecto de punta a punta: qué resuelve, cómo está armado, por qué se tomaron las decisiones y dónde mirar en el código. Al final hay preguntas de autoevaluación.
> Fuentes: el código del repo, `docs/`, `docs/constitution.md` y `MEMORY.md` (noviembre 2026).

---

## 1. Qué es el sistema (en una frase)

Un **backoffice web** para que el personal del ITEC N°1 (Misiones) gestione la vida académica: carreras, planes de estudio, materias, alumnos, profesores, inscripciones, comisiones, horarios, **asistencias**, **notas**, **mesas de examen** y **actas en PDF**.

Usuarios operativos:

| Rol | Qué hace |
|---|---|
| `ADMIN` | Todo, incluida la gestión de administradores. |
| `ADMINISTRATIVO` | ABM académicos, inscripciones, mesas, cierres. |
| `PROFESOR` | Sus comisiones (`mis-comisiones`): asistencia y notas; sus mesas (`mis-mesas`). |
| `ALUMNO` | Existe como rol, pero **todavía no tiene portal propio**. |

Una misma persona puede tener **varios roles** (por ejemplo, profesor y alumno). Al loguearse elige con qué rol trabaja (`/seleccionar-rol`).

---

## 2. Arquitectura general

```
                 Navegador
                     │  (solo HTML/RSC; nunca llama al backend)
                     ▼
        ┌──────────────────────────┐
        │  Frontend Next.js :3000  │  Server Components (lectura)
        │                          │  Server Actions (escritura)
        └────────────┬─────────────┘
                     │  HTTP + Authorization: Bearer <JWT>
                     ▼
        ┌──────────────────────────┐
        │   API Gateway  :8080     │  valida el JWT, rutea /api/v1/**
        └──┬──────────┬─────────┬──┘
           │          │         │      (quita el "/v1" al rutear)
           ▼          ▼         ▼
     ┌─────────┐ ┌──────────┐ ┌─────────┐
     │  Core   │ │   MS     │ │   MS    │
     │  :8082  │ │Asistencia│ │  Notas  │
     │         │ │  :8083   │ │  :8084  │
     └────┬────┘ └────┬─────┘ └────┬────┘
          ▼           ▼            ▼
   backoffice_itec db_asistencias db_calificaciones   ← una instancia MySQL, 3 bases
```

### Los 5 servicios

| Servicio | Carpeta | Responsabilidad | Base |
|---|---|---|---|
| **API Gateway** | `api-gateway/` | Puerta única. Valida el JWT y decide a qué servicio va cada pedido. | — |
| **Core** | `backend/` | Identidad y login, datos maestros, inscripciones, cursadas, mesas, actas PDF. | `backoffice_itec` |
| **ms-asistencias** | `ms-asistencias/` | Presentismo diario y cálculo de regularidad (70 %). | `db_asistencias` |
| **ms-notas** | `ms-notas/` | Notas parciales y notas de mesas de examen. | `db_calificaciones` |
| **Frontend** | `frontend/` | Interfaz web. | — |

Todo se levanta con `docker compose up --build -d` desde la raíz (el `docker-compose.yml` raíz incluye `backend/docker-compose.yml`, que trae MySQL y el Core).

### Ideas clave para recordar
1. **Una sola puerta de entrada:** el frontend solo conoce el Gateway (C2.5).
2. **Contrato público `/api/v1/<recurso>`:** el cliente no sabe qué servicio atiende cada recurso. Internamente los servicios escuchan en `/api/**` (C2.7).
3. **Base de datos por servicio:** ningún servicio lee la base de otro; si necesita datos, los pide por HTTP (C4.1).
4. **Solo HTTP REST entre servicios:** no hay colas ni brokers (C1.4).

---

## 3. El API Gateway

Archivo central: `api-gateway/src/main/resources/application.yml`.

**Tabla de ruteo** (el orden importa: las específicas van antes que la genérica):

| Ruta pública | Va a | Reescribe a | ¿Pide JWT? |
|---|---|---|---|
| `/api/v1/auth/**` | Core | `/auth/**` | No (es el login) |
| `/api/v1/asistencias/**` | ms-asistencias | `/api/asistencias/**` | Sí |
| `/api/v1/calificaciones-parciales/**`, `/api/v1/notas/**` | ms-notas | `/api/...` | Sí |
| `/api/v1/**` (todo lo demás) | Core | `/api/**` | Sí |

**Filtro `JwtAuth`** (`JwtAuthGatewayFilterFactory.java`):
- Exige `Authorization: Bearer <token>`; si falta o es inválido → **401**.
- Si es válido, agrega headers para los servicios de atrás: `X-User-Id`, `X-User-Roles`, `X-User-Email`.

Esto se llama **token offloading**: el token se valida **una sola vez**, en el borde.

> El Gateway y el Core deben compartir el **mismo `JWT_SECRET`**: el Core firma el token y el Gateway lo verifica.

---

## 4. El Core (`backend/`)

Es un proyecto Maven **multi-módulo**:

| Módulo | Contenido |
|---|---|
| `api` | La aplicación Spring Boot (arranque, configuración, CORS, OpenAPI) y las migraciones Flyway (`db/migration/V1__init.sql`). |
| `commons` | Código compartido: DTOs comunes (`ApiResponse`, `ErrorDto`), `User`, `Rol`, `LegajoGenerator`, **`RoleGuard`**. Lo usan también los MS. |
| `core` | El dominio académico: `model`, `repository`, `service`, `controller`, `client` (llamadas a los MS). |
| `security` | Spring Security, login, emisión de JWT, ABM de usuarios y perfil. |

### Arquitectura en capas (C2.1)
`controller` → `service` → `repository`. Los controllers no tienen lógica de negocio ni tocan repositorios. Las APIs devuelven **DTOs**, nunca entidades JPA (C2.2).

### Desacople core ↔ security con *puertos*
`core` no depende directamente del repositorio de usuarios de `security`; usa interfaces:
- `UserLookupPort` — buscar usuario, buscar por DNI, crear usuario con credenciales por DNI, deshabilitar, actualizar DNI/email.
- `UsuarioCallback` — cuando `security` crea un usuario, avisa a `core` para crear la entidad académica (Alumno/Profesor).

Es el patrón **puertos y adaptadores** (arquitectura hexagonal) aplicado a pequeña escala.

### Schema: la regla y la realidad
- **La regla (C4.7):** el schema del Core solo cambia por migraciones Flyway, con `ddl-auto: validate`. Nada de H2: dev y prod usan MySQL. Las migraciones ya aplicadas **no se editan**.
- **La realidad hoy:** el perfil `local` (el que usa Docker) tiene Flyway deshabilitado y `ddl-auto: update`, y `V1__init.sql` todavía tiene el schema viejo. Arreglarlo es el pendiente **#45**.
- Los MS (`ms-asistencias`, `ms-notas`) arrancan con `DB_DDL_AUTO=update` para que Hibernate cree sus tablas.

---

## 5. Modelo de dominio (DDD)

Detalle completo en `docs/02.00-Modelo_Datos.md`. La jerarquía que hay que saber de memoria:

```
Carrera ─< PlanEstudio ─< MateriaPlan >─ Materia (catálogo maestro)
                              │
CicloLectivo ─< PeriodoAcademico
                              │
                    Comision (MateriaPlan + PeriodoAcademico)
                     ├─< ComisionProfesor >─ Profesor
                     ├─< HorarioClase (día, horaInicio, horaFin)
                     └─< Cursada >─ Alumno         (alumno inscripto en una comisión)
                              ├── Asistencia  (en ms-asistencias, solo cursada_id)
                              └── CalificacionParcial (en ms-notas, solo cursada_id)

MesaExamen (MateriaPlan + CicloLectivo + TurnoExamen + TipoMesa)
     └─< InscripcionMesa >─ Alumno   ──  CalificacionMesa (en ms-notas)
```

Conceptos importantes:
- **`Materia` es un catálogo**: "Inglés" existe una vez. `MateriaPlan` la ubica dentro de un plan (cuatrimestre, carga horaria, **modalidad** `PROMOCIONAL` o `FINAL`, correlativas).
- **`CicloLectivo` y `PeriodoAcademico` son independientes de la carrera**: un mismo cuatrimestre sirve para todas las carreras.
- **`Comision`** = el dictado real de una `MateriaPlan` en un `PeriodoAcademico` (ej. "Com. A", con cupo).
- **`Cursada`** = un alumno en una comisión. Guarda `condicionFinal` (`LIBRE`, `REGULAR`, `PROMOCIONADA`, `APROBADA`) y `notaCierre`.
- **Mesas desacopladas de la cursada**: un final no cuelga de una cursada; tiene su propio ciclo de vida (`PROGRAMADA` → `CERRADA`).
- **Sin FK entre bases**: `Asistencia` y `CalificacionParcial` guardan `cursada_id` como número, sin clave foránea real (está en otra base).

### Identidad unificada: `User`
- `Alumno` y `Profesor` **no** guardan nombre/DNI: apuntan a un `User`, que es la entidad única de identidad.
- `User` tiene `Set<Rol>` (multi-rol) y un **legajo** autogenerado con formato `AAAA-DNI`.
- Al crear un alumno/profesor desde la UI, el Core crea el `User` en la misma transacción con **username = DNI** y **password = BCrypt(DNI)** (`docs/01.00-Reglas_de_Negocio.md`).
- **`enabled`:** PROFESOR, ADMIN y ADMINISTRATIVO nacen habilitados. El ALUMNO nace con `enabled=false` porque todavía no tiene portal propio. Si a un alumno existente se le agrega un rol con login, la cuenta se habilita (`UserLookupPortImpl`).

---

## 6. Reglas de negocio (lo que más se pregunta)

### 6.1 Inscripción a una comisión (`CursadaServiceImpl.guardar`)
1. El alumno y la comisión deben existir.
2. **Correlativas**: cada correlativa de la `MateriaPlan` debe estar aprobada, ya sea en cursada (`PROMOCIONADA`/`APROBADA`) o en un final aprobado. Si faltan, error con la lista.
3. No puede estar inscripto dos veces en la misma comisión → **409** (`AlumnoYaInscriptoEnComisionException`).

### 6.2 Regularidad por asistencia (spec 002, `ResumenAsistenciaCalculator`)
- Se cuentan solo las fechas **con marca** (presente, tardanza o ausente).
- **La tardanza cuenta como presente.**
- Regular si `asistidas × 100 ≥ 70 × total` — comparación **entera**, para que el 70 % exacto no falle por coma flotante.
- Sin ninguna marca → estado `SIN_REGISTROS`.
- Lo calcula el **dueño de los datos** (ms-asistencias) y lo expone en `GET /api/asistencias/resumen?cursadaIds=`.

### 6.3 Cierre de cursada (`CondicionCursadaService`, en el Core)
Orden del cálculo:
1. Pide el resumen de asistencia a ms-asistencias.
   - `SIN_REGISTROS` → **400**.
   - `NO_REGULAR` → **LIBRE por asistencia**, sin importar el promedio.
2. Pide los parciales a ms-notas. Tienen que ser **exactamente 3**, si no → **400** (ms-notas además rechaza cargar un cuarto parcial).
3. Con el promedio:

| Promedio | Modalidad `PROMOCIONAL` | Modalidad `FINAL` |
|---|---|---|
| < 4 | LIBRE | LIBRE |
| 4 a 6,99 | REGULAR | REGULAR |
| ≥ 7 | **PROMOCIONADA** | REGULAR |

- Hay **previsualizar** (`calcular`) y **cerrar** (`cerrar`). Cerrar guarda `condicionFinal` y `notaCierre`.
- Una cursada ya cerrada **no se recalcula** → **409**.
- Si ms-asistencias está caído → **503**.
- La cursada nunca da `APROBADA`: eso lo resuelven las mesas.

### 6.4 Mesas de examen (`MesaExamenServiceImpl`)
Inscripción a mesa:
1. El usuario debe tener rol `ALUMNO`.
2. **Regla de 48 h**: la inscripción cierra 48 horas antes del examen.
3. No duplicar inscripción en la misma mesa.
4. No inscribir si ya aprobó la materia (en otro final o por cursada promocionada/aprobada).

Cierre de mesa:
- Toma las notas de ms-notas; nota ≥ 4 y no ausente → `aprobado = true`.
- La mesa pasa a `CERRADA`. **Acta cerrada = inmutable**: ms-notas consulta el estado de la mesa al Core antes de guardar una nota.
- El acta se genera en **PDF** con OpenPDF (`generarActaPdf`).

Tipos de mesa: `ORDINARIA_1ER_LLAMADO`, `ORDINARIA_2DO_LLAMADO`, `ESPECIAL`. Condición de inscripción: `REGULAR`, `LIBRE`, `PROMOCION`.

### 6.5 Diagrama de estados del alumno en una materia
```
Inscripto → Cursando ─┬→ Promocionada (fin)
                      ├→ Regular ─┬→ Aprobada (final ≥ 4)
                      │           ├→ Regular (desaprueba, conserva)
                      │           └→ Libre (vence regularidad)
                      └→ Libre ───┬→ Aprobada (final libre)
                                  └→ Inscripto (recursa)
```
Ver `docs/02.20-Diagrama_Estados.md`.

---

## 7. Comunicación entre servicios

| Quién llama | A quién | Para qué |
|---|---|---|
| Core | ms-notas | Parciales de una cursada; notas de una mesa (cierre y PDF). |
| Core | ms-asistencias | Resumen de asistencia (previsualizar/cerrar cursada). |
| ms-asistencias | Core | Validar que la fecha de la asistencia coincide con un `HorarioClase` de la comisión. |
| ms-notas | Core | Consultar si la mesa está cerrada antes de guardar una nota. |

Cómo se autentican:
- **MS → Core:** `InternalTokenService` **firma un JWT propio de 60 segundos** con rol `ADMIN` y el mismo secreto compartido.
- **Core → MS:** sin JWT; manda directamente el header `X-User-Roles: ADMIN`, en el que los MS confían igual que con el Gateway.

**Deuda #22:** esto genera un acoplamiento **circular y sincrónico** (Core depende de los MS y los MS del Core). Si uno cae, el cierre de cursada falla. Se evaluará desacoplar (eventos, réplicas locales, orquestador), pero hoy la constitución prohíbe colas (C1.4).

---

## 8. Seguridad

### 8.1 Autenticación
- Login en el Core (`AuthController`) → devuelve un JWT con `roles` y `datos_personales`, válido 24 h.
- Contraseñas solo con hash BCrypt (C4.3).
- **Sin enumeración de usuarios** (C4.9): usuario inexistente y contraseña incorrecta devuelven el **mismo 401**.

### 8.2 Autorización (C4.4)
- **Core**: Spring Security (`SecurityConfig`, `@PreAuthorize("hasRole(...)")`).
- **MS**: no tienen Spring Security. Usan `RoleGuard.exigirRol(request, Rol.X)`, que lee el header `X-User-Roles` que puso el Gateway → **403** si no tiene el rol.

### 8.3 Sesión en el frontend (spec 001)
- El JWT vive en la cookie **`itec-sesion`** y el rol activo en **`itec-rol`**, ambas **`httpOnly`**: JavaScript del navegador no puede leerlas. Nada en `localStorage` (C4.5).
- Solo el servidor de Next escribe esas cookies (el login es una Server Action).
- `frontend/proxy.ts` + `lib/sesion.ts` (funciones puras) deciden el acceso:
  - sin sesión → `/login`
  - sesión vencida → `/login?motivo=expirada` y borra cookies
  - con sesión en `/` o `/login` → `/dashboard`
  - multi-rol sin rol elegido → `/seleccionar-rol`
- El JWT se decodifica **sin verificar firma** en el frontend: solo sirve para redirecciones y UI. La autorización real la hacen Gateway y Core.

### 8.4 Pendientes de seguridad conocidos
- **#41**: al cerrar sesión se borran las cookies, pero el JWT sigue válido hasta vencer.
- **#42**: "un profesor solo ve sus comisiones" se controla en el frontend; los MS solo exigen el rol PROFESOR.

---

## 9. Frontend (`frontend/`)

Stack: Next.js 16 (App Router), React 18.2, TypeScript, Tailwind, shadcn/ui.

**Patrón único (C2.4):**
- **Lectura** → Server Components que llaman `fetchCore` / `fetchGateway` (`lib/api-server.ts`).
- **Escritura** → Server Actions en `app/actions/*-actions.ts`.
- **Nunca** fetch al backend desde componentes cliente.

`fetchApi` toma el JWT de la cookie, lo manda como `Bearer` al Gateway y, ante un **401**, redirige a `/login?motivo=expirada`.

Pantallas principales (`app/dashboard/`):
`carreras` (→ planes), `materias`, `ciclos` (→ carreras → períodos → comisiones), `comisiones/[id]`, `alumnos`, `profesores`, `administradores`, `mesas-examen`, `mis-comisiones`, `mis-mesas`, `reportes/asistencia`.

**Trampas aprendidas (ver `MEMORY.md`):**
- `redirect()` lanza una excepción (`NEXT_REDIRECT`): en todo `catch` llamar primero a `unstable_rethrow(error)`.
- Errores para el usuario: **devolver `{ error }`**, no lanzarlos (Next oculta el mensaje en producción).
- React 18.2 no tiene `useActionState` → formularios con `useTransition`.
- Fechas con `timeZone: "America/Argentina/Buenos_Aires"` para evitar *hydration mismatch*.
- Botones dentro de `<form>` en diálogos: `type="button"`, o envían el form.

---

## 10. Calidad y forma de trabajo

### Tests (C3)
- Backend: JUnit 5 + Mockito; toda regla de negocio nueva lleva test, todo bug corregido suma un test que lo reproduce.
- Tests deterministas: no depender del orden de un `Set` ni de la hora actual.
- Frontend: no hay `npm test`; se verifica con `npm run build`.
- **No hay CI**: antes de un PR a `main`, correr `mvn test` en los 4 módulos Java y un E2E en Docker.

### Git
`main` (estable) ← `develop` (integración) ← ramas `feature/`, `fix/`, `docs/`, `chore/`. Prohibido commitear directo a `develop` o `main`.

### Spec-Driven Development (SDD)
Cada funcionalidad nueva sigue este flujo con Claude Code (desde la raíz):

```
/sdd-spec → /sdd-clarify → /sdd-plan → /sdd-tasks → /sdd-implement → /sdd-validate
```

- Artefactos en `specs/NNN-nombre/` (`spec.md`, `plan.md`, `tasks.md`).
- Requisitos en notación **EARS** (ej. "Cuando …, el sistema deberá …").
- Agentes en `.claude/agents/`: `coordinator`, `planner`, `implementer`, `reviewer`.
- Specs hechas: **001-sesion-segura** (cookies httpOnly) y **002-regularidad-asistencia** (regla del 70 %).

### Documentos de gobierno
| Archivo | Para qué |
|---|---|
| `docs/constitution.md` | Principios innegociables (C1 stack, C2 capas, C3 tests, C4 datos). |
| `docs/pendientes.md` | Única fuente de tareas abiertas. |
| `MEMORY.md` | Estado, decisiones y aprendizajes. |
| `AGENTS.md` | Instrucciones para agentes de IA. |

---

## 11. Decisiones de arquitectura y su "por qué"

| Decisión | Por qué |
|---|---|
| Microservicios + Gateway | Lo pide el enunciado; aísla asistencias y notas. |
| JWT validado en el Gateway | Un único punto de autenticación; los MS quedan simples. |
| Una instancia MySQL con 3 bases | Aislamiento lógico sin costo operativo extra. |
| Flyway + MySQL, sin H2 (regla; ver #45) | Que dev y prod tengan el mismo schema. |
| `User` único y multi-rol | Una persona no se duplica por ser alumno y profesor. |
| Modelo DDD (planes, ciclos) | El modelo viejo, atado a la carrera, no soportaba planes ni ciclos compartidos. |
| Server Actions + RSC | Un único patrón y sin el bug de inyección del JWT en el cliente. |
| Cookies `httpOnly` | Un script malicioso no puede robar la sesión. |
| Login sin enumeración | No revelar qué usuarios existen. |
| Horarios con hora libre | Los módulos fijos no cubrían los horarios reales. |
| La regularidad la calcula ms-asistencias | El dueño de los datos calcula; el resto consume. |

---

## 12. Mapa rápido: "¿dónde está…?"

| Busco… | Archivo |
|---|---|
| Ruteo del Gateway | `api-gateway/src/main/resources/application.yml` |
| Validación del JWT | `api-gateway/.../filter/JwtAuthGatewayFilterFactory.java` |
| Chequeo de rol en los MS | `backend/commons/.../util/RoleGuard.java` |
| Cálculo de condición de cursada | `backend/core/.../service/CondicionCursadaService.java` |
| Correlativas al inscribir | `backend/core/.../service/impl/CursadaServiceImpl.java` |
| Mesas, regla 48 h, acta PDF | `backend/core/.../service/impl/MesaExamenServiceImpl.java` |
| Regla del 70 % | `ms-asistencias/.../service/ResumenAsistenciaCalculator.java` |
| Token interno entre servicios | `ms-notas/.../client/InternalTokenService.java` (y su par en asistencias) |
| Login y JWT | `backend/security/.../controller/AuthController.java`, `JwtServiceImpl.java` |
| Migraciones | `backend/api/src/main/resources/db/migration/` |
| Reglas de sesión del frontend | `frontend/lib/sesion.ts`, `frontend/proxy.ts` |
| Fetch al Gateway | `frontend/lib/api-server.ts` |
| Server Actions | `frontend/app/actions/` |

---

## 13. Recorrido de un pedido completo (para explicarlo en voz alta)

**"El administrativo cierra la cursada de un alumno"**

1. En `dashboard/comisiones/[id]` toca "Cerrar cursada" → se ejecuta una **Server Action** en el servidor de Next.
2. La Server Action llama `fetchApi("/api/v1/cursadas/{id}/cerrar", …)`, que agrega el JWT de la cookie `itec-sesion`.
3. El **Gateway** valida el JWT, agrega `X-User-Roles`, reescribe a `/api/cursadas/...` y lo manda al **Core**.
4. Spring Security del Core verifica el rol.
5. `CondicionCursadaService.cerrar`:
   - si ya está cerrada → 409;
   - pide el resumen a **ms-asistencias** → si < 70 %, LIBRE;
   - pide los 3 parciales a **ms-notas** → promedio + modalidad → condición;
   - guarda `condicionFinal` y `notaCierre`.
6. La respuesta vuelve por el Gateway; la Server Action hace `revalidatePath` de la ruta y la UI muestra un toast.

---

## 14. Autoevaluación

1. ¿Por qué el frontend nunca llama al Core por el puerto 8082?
2. ¿Qué hace el Gateway con `/api/v1/asistencias/hoy`? ¿A qué servicio y con qué ruta llega?
3. ¿Cómo sabe ms-notas qué rol tiene el usuario si no tiene Spring Security?
4. Un alumno tuvo 7 presentes, 2 tardanzas y 3 ausentes, y promedio 8 en una materia PROMOCIONAL. ¿Cuál es su condición? *(9/12 = 75 % → regular por asistencia; promedio ≥ 7 y promocional → PROMOCIONADA)*
5. El mismo caso, pero con 5 presentes, 1 tardanza y 4 ausentes. *(6/10 = 60 % → LIBRE por asistencia)*
6. ¿Y con 7 asistidas sobre 10? *(70 % exacto → regular; por eso la comparación es entera)*
7. ¿Por qué `Asistencia` no tiene una FK a `Cursada`?
8. ¿Qué pasa si se intenta inscribir a un alumno a una mesa 30 horas antes del examen?
9. ¿Por qué la sesión está en cookies `httpOnly` y no en `localStorage`?
10. ¿Qué devuelve el login si el usuario no existe? ¿Y si la contraseña es incorrecta? ¿Por qué?
11. ¿Qué es la deuda #22 y por qué no se resuelve agregando RabbitMQ sin más?
12. ¿Cuál es la diferencia entre `Materia` y `MateriaPlan`?
13. ¿Por qué en un `catch` de una Server Action hay que llamar a `unstable_rethrow`?
14. ¿Qué pasos sigue una funcionalidad nueva en el flujo SDD y dónde quedan sus artefactos?
15. ¿Qué garantiza que un acta cerrada no se modifique?

---

## 15. Para profundizar

Orden sugerido de lectura en `docs/` (ver `docs/INDEX.md`):
1. `00.00-Enunciado.md` y `00.10-Enunciado_Requerimientos.md` — qué se pidió.
2. `constitution.md` — las reglas del juego.
3. `02.00-Modelo_Datos.md` y `02.20-Diagrama_Estados.md` — el dominio.
4. `03.10`, `03.20`, `03.30` — secuencias de inscripción, asistencia y notas.
5. `04.20-Diagrama_Arquitectura.md` y `04.30-Arquitectura_docker.md` — despliegue.
6. `specs/001-sesion-segura/` y `specs/002-regularidad-asistencia/` — dos ejemplos completos de SDD.

> `docs/` se revisó contra el código el 2026-11-06 (pendiente #31). Lo único que sigue sin coincidir es el schema de Flyway (pendiente **#45**). Ante la duda, el código manda.
