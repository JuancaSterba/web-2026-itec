# Unificación de Actores (Legajo Único) + Adopción de Flyway — Design Spec

**Fecha:** 2026-07-05
**Origen:** `.remember/PENDIENTES.md` → "Sistema de migraciones de schema (Flyway/Liquibase)" y "Unificación de Actores y Multi-rol (Legajo Único)" (sección 🟠 Deuda Técnica y Reglas de Negocio)
**Rama:** por definir (nueva rama de feature)

Dos subsistemas acoplados (el schema V1 de Flyway debe reflejar ya el modelo unificado), un solo spec, un solo plan de implementación por decisión del usuario — el orden de tareas dentro del plan resuelve la dependencia (primero el modelo, recién al final se congela en Flyway).

## Contexto

Infraestructura relevante ya existente (confirmada por exploración de código, no por el enunciado original — el enunciado asumía que había que rediseñar desde cero, pero gran parte ya está construido):

- `User.java` (`backend/commons/.../model/User.java`): ya es la identidad única de la persona. Tiene `roles: Set<Rol>` — **multi-rol ya funciona** (confirmado en sesión anterior: usuario admin de seed con `ADMIN+PROFESOR`, selector de perfil probado en navegador).
- `Alumno.java` / `Profesor.java`: entidades satélite `@OneToOne` a `User`, solo con datos específicos del rol (`legajo` en Alumno, `titulo` en Profesor). Sin datos personales duplicados (nombre/apellido/dni/email/teléfono viven solo en `User`).
- `ADMIN`/`ADMINISTRATIVO`: sin entidad propia, son `User` + rol en el `Set<Rol>`, gestionados por `UserAdminServiceImpl`.
- `UserLookupPortImpl.crearConCredencialesPorDni(...)`: único punto de creación de `User` para altas de un paso (Alumno/Profesor). Hoy SIEMPRE crea un `User` nuevo — si el DNI ya existe, `existsByDni` tira error (no hay forma de "agregarle un rol" a una persona existente).
- `legajo` hoy vive solo en `Alumno` (`AlumnoServiceImpl.crearConUsuario()`, formato `AAAA-DNI` autogenerado). Profesor/Admin no tienen legajo.
- No hay Flyway/Liquibase. `ddl-auto: update` en los 3 perfiles (`dev` con H2 in-memory, `local`/`prod` con MySQL). Ya se detectó en vivo (PENDIENTES.md línea 9) que `ddl-auto: update` no puede dropear constraints viejas — quitar el `@UniqueConstraint` de `User.telefono` en código no lo saca de la tabla física ya creada.

## Decisiones confirmadas con el usuario

1. **Arquitectura de actores: se mantiene composición (`User` + roles + entidades satélite opcionales).** Se descartó separar en 3 entidades totalmente independientes (una por rol, cada una con sus propias credenciales) porque: (a) reintroduce duplicación de datos personales que el propio enunciado pedía evitar, y (b) complica el login — con username=DNI compartido entre 3 tablas independientes, `UserDetailsService` no puede resolver una fila única sin un selector de rol *antes* de emitir el JWT, perdiendo la ventaja actual de "loguearse una vez, cambiar de rol sin re-autenticar".
2. **Legajo universal:** vive en `User` (no en `Alumno`), se genera para **todos los roles** (incluido ADMIN/ADMINISTRATIVO), no solo académicos.
3. **Legajo inmutable:** se genera una única vez, en el primer alta de esa persona (cualquiera sea el rol), formato `AAAA-DNI` con el año de ESE alta. Si más adelante se le agrega un rol nuevo (incluso en otro año calendario), el legajo no se recalcula.
4. **Alta con persona existente — disparo:** auto-detección por DNI on-blur en el frontend (no una pantalla de búsqueda separada).
5. **Flyway — datos existentes:** no aplica, proyecto en fase de desarrollo, toda la infraestructura (dev incluido) es recreable desde cero.
6. **Flyway — motor de base de datos: se estandariza en MySQL único.** Se elimina el perfil `dev` (H2 in-memory) para no mantener 2 sets de migraciones con sintaxis distinta. Todo el desarrollo pasa a hacerse contra MySQL vía Docker (perfil `local`, que ya es el flujo real de trabajo de la sesión anterior).
7. **Orden de implementación:** primero el modelo unificado (legajo + alta-o-adjuntar-rol) corriendo sobre `ddl-auto: update` como hoy, verificado end-to-end; recién ahí se congela ese schema final en `V1__init.sql` y se corta a Flyway. Evita migrar dos veces.

## Parte A — Legajo universal en `User`

### Modelo
- `User.java`: agrega columna `legajo` (String, `@Column(unique = true)`).
- `Alumno.java`: elimina el campo `legajo` (y su columna/constraint asociada).

### Generación
- Se centraliza en `UserLookupPortImpl.crearConCredencialesPorDni(...)` (único punto de creación de `User` para altas de un paso) — hoy el cálculo `LocalDate.now().getYear() + "-" + dni` vive duplicado e inline en `AlumnoServiceImpl.crearConUsuario()`. Pasa a calcularse ahí y setear `user.setLegajo(...)` al crear.
- `UserAdminServiceImpl.crear(...)` (alta de ADMIN/ADMINISTRATIVO) también genera legajo de la misma forma — hoy ese flujo no pasa por `UserLookupPort`, así que se extrae la generación a un método compartido (candidato: método `default` en `UserLookupPort`, o un componente `LegajoGenerator` en `commons`) para no duplicar la fórmula en 2 lugares.
- `AlumnoResponse`/`ProfesorResponse`/`UsuarioAdminResponse`: exponen `legajo` (leído de `user.getLegajo()`, ya no de la entidad satélite).

### Validación de unicidad
- `legajo` es derivado de `dni` (mismo año de alta), y `dni` ya es único — en la práctica nunca puede haber colisión real de legajo salvo bug. No se agrega una validación de negocio nueva, solo el constraint de DB como red de seguridad.

## Parte B — Alta de rol nuevo sobre persona existente

### Backend
- Nuevo endpoint `GET /api/core/personas/buscar-por-dni/{dni}` (nuevo controller/servicio delgado, o método agregado a un servicio existente de lectura): devuelve `{nombre, apellido, email, telefono, legajo, roles: Rol[]}` si el DNI existe, 404 si no.
- `UserLookupPort.crearConCredencialesPorDni(...)` se renombra conceptualmente a `crearOAdjuntarRol(...)` (mismos parámetros de entrada): si `existsByDni(dni)` es true, en vez de tirar error de duplicado:
  - Recupera el `User` existente.
  - Si el `Set<Rol>` ya contiene ese rol, tira error de negocio ("la persona ya tiene el rol X").
  - Si no, agrega el rol al `Set<Rol>` existente (ya se resolvió en la sesión anterior el bug de mutabilidad de `Set` de Hibernate al reasignar roles — se reutiliza el mismo patrón `new HashSet<>(...)`) y devuelve el `User` (sin tocar nombre/apellido/email/teléfono/legajo, que son inmutables desde este flujo).
  - Ignora los parámetros de teléfono/teléfono secundario en el caso "adjuntar rol" (son datos de alta inicial, no se pisan).
- `AlumnoServiceImpl.crearConUsuario()` / `ProfesorServiceImpl.crearConUsuario()`: después de obtener el `User` (nuevo o existente), crean la fila satélite (`Alumno`/`Profesor`) SOLO si no existe ya una para ese `User` (hoy siempre se crea porque el `User` siempre era nuevo).
- `UserAdminServiceImpl.crear(...)`: mismo criterio — si el DNI ya existe, adjunta rol ADMIN/ADMINISTRATIVO al `User` existente en vez de fallar por DNI duplicado (no requiere fila satélite, solo el rol).

### Frontend
- Los 3 formularios de alta (`alumno-form-dialog.tsx`, `profesor-form-dialog.tsx`, el form de administradores) agregan un `onBlur` en el campo DNI que llama a `buscarPorDni`. Si la persona existe:
  - Muestra un banner "Persona existente: {nombre} {apellido} — Legajo {legajo}".
  - Oculta/deshabilita los campos nombre/apellido/email/teléfono (ya no aplican, son inmutables).
  - Deja visibles solo los campos propios del rol nuevo (ej. `título` para Profesor).
- Si el DNI no existe: comportamiento actual sin cambios (formulario completo).

## Parte C — Adopción de Flyway

### Dependencias y configuración
- Módulo `api`: agrega `org.flywaydb:flyway-core` + `org.flywaydb:flyway-mysql` (Spring Boot 3.2.5 trae Flyway 9.x, que separó el soporte de MySQL en artefacto aparte).
- `ddl-auto` pasa a `validate` en `application-local.yml` y `application-prod.yml` (ya no hay perfil `dev`/H2 — ver Parte D).
- Flyway corre automáticamente en el arranque de Spring Boot (auto-configuración estándar), antes de que Hibernate valide.

### `V1__init.sql`
- **No se escribe a mano desde cero** — se genera dumpeando el DDL real que Hibernate produce hoy (`spring.jpa.properties.jakarta.persistence.schema-generation.scripts.action=create` contra una MySQL limpia, con las entidades YA en su estado final de las Partes A y B), para no omitir ninguna tabla/FK/índice que Hibernate crea implícitamente (ej. `user_roles`, FKs de `Alumno.user_id`/`Profesor.user_id`).
- Sobre ese dump se revisan a mano los puntos ya resueltos en código pero no reflejados en la DB física de dev (según PENDIENTES.md línea 9): sin `UNIQUE` en `usuarios.telefono`, con `UNIQUE` en `usuarios.legajo`.
- Ubicación estándar: `backend/api/src/main/resources/db/migration/V1__init.sql`.

## Parte D — Estandarización en MySQL único

- Se elimina `backend/api/src/main/resources/application-dev.yml` y el perfil `dev`.
- `DatabaseSeeder.java` (`@Profile("dev")`, hoy corre solo contra H2): pasa a `@Profile("local")` para seguir sembrando datos de desarrollo, ahora contra MySQL vía Docker (mismo guard existente de "si ya hay datos, no siembra de nuevo").
- Se saca la dependencia `com.h2database:h2` del `pom.xml` de `api`.
- `application.yml`: el perfil activo por defecto (`${SPRING_PROFILES_ACTIVE:dev}`) pasa a `${SPRING_PROFILES_ACTIVE:local}`.
- Consecuencia documentada: correr el backend sin Docker (`mvn spring-boot:run`) ahora requiere una instancia MySQL accesible en `localhost:3306` (o las variables `SPRING_DATASOURCE_*` apuntando a otra) — ya no hay modo "cero dependencias externas" con H2 in-memory.

## Fuera de alcance

- Los microservicios `ms-asistencias`/`ms-notas` (bases de datos propias `db_asistencias`/`db_calificaciones`, fuera del módulo `core`/`api`) no se tocan — este spec cubre solo el schema de `backoffice_itec`.
- No se agrega ninguna pantalla nueva de "buscar persona por legajo/DNI" de uso general (fuera del auto-detect en los formularios de alta) — no fue pedido.
- No se migra el endpoint genérico `/auth/register` (`UserServiceImpl.register()`) al flujo de "adjuntar rol" — limitación ya documentada en el spec anterior (`2026-07-04-admin-context-y-bugs-design.md`), sigue sin tocarse.
- No se agrega ningún guard de página por rol en el frontend — sigue sin existir, consistente con el resto del sistema.
- Restricción de edición de perfiles por rol (Profesor no debería poder editar perfiles) y recálculo de legajo si cambia el DNI en edición — son ítems separados en `PENDIENTES.md`, no forman parte de este spec.
