# MEMORY.md — Memoria de trabajo del proyecto

> Estado, decisiones y aprendizajes entre sesiones. Máx. ~50 líneas: condensar al agregar.
> Las tareas NO van acá: viven solo en `docs/pendientes.md`. Última actualización: 2026-10-06.

## Estado actual
- MVP funcional: ABM académicos, inscripciones, comisiones, horarios, asistencias, notas parciales, mesas de examen (turnos/llamados, regla de 48 h) y cierre de actas con PDF.
- Roles operativos: ADMIN, ADMINISTRATIVO, PROFESOR (vistas `mis-comisiones`, `mis-mesas`). ALUMNO sin portal propio.
- Deuda abierta principal: acoplamiento HTTP circular Core↔MS (#22), docs desactualizados (#31), revocar sesión al cerrar sesión (#41).
- Specs SDD implementadas: `001-sesion-segura` (2026-10-06, cierra #36).
- `main` al día con `develop` vía PR #4 (2026-10-06), tras verificar tests Java en verde y E2E en Docker. No hay CI.
- Diferidos por el usuario: cursos cortos, habilitación de carga de notas por ADMIN, seeder masivo, diagrama interactivo.

## Decisiones arquitectónicas
- **Dominio DDD** (Carrera → PlanEstudio → MateriaPlan → Comisión → Cursada; CicloLectivo → PeriodoAcademico independiente): el modelo viejo atado a carrera no soportaba planes ni ciclos compartidos. Fuente: `docs/02.00-Modelo_Datos.md`.
- **Contrato público `/api/v1/<recurso>`** (lo exige el enunciado, `docs/00.10`): el Gateway rutea por recurso (auth, asistencias, notas/calificaciones-parciales, resto → Core) y quita el `/v1`; los servicios y sus llamadas internas siguen en `/api/**`. El cliente no conoce qué servicio atiende cada recurso. Regla C2.7 de la constitución (aprobada 2026-10-06).
- **Login sin enumeración de usuarios** (C4.9, aprobada 2026-10-06): un 500 o un mensaje distinto para usuario inexistente revelaba qué usuarios existen.
- **JWT validado en el Gateway** (token offloading); los MS no tienen Spring Security propio y usan `RoleGuard.exigirRol` (`backend/commons`): un único punto de autenticación con autorización mínima por rol.
- **BD aislada por servicio** en una sola instancia MySQL: aislamiento lógico sin costo operativo extra.
- **Flyway + MySQL único** (`ddl-auto: validate`, sin H2): evitar divergencias entre el schema de dev y el de prod.
- **`User` como entidad única** con legajo `AAAA-DNI` autogenerado y multi-rol (`Set<Rol>`): una persona puede ser alumno/profesor/admin sin duplicar datos.
- **Frontend con Server Actions + RSC** (sin fetch desde el cliente): un patrón único y sin el bug 401 de inyección de JWT en CSR.
- **Sesión en cookies `httpOnly`** (spec 001): `itec-sesion` (JWT) e `itec-rol` (rol activo, validado contra el JWT) las escribe solo el servidor de Next. El login es una Server Action; `proxy.ts` y `fetchApi` (`lib/api-server.ts`) mandan a `/login?motivo=expirada` ante sesión vencida o 401. Reglas en `lib/sesion.ts`. Nada de la sesión en `localStorage`: un script malicioso en la página no puede robarla. C2.4 y C4.5 reescritas sin la excepción heredada de #36 (aprobado 2026-10-06).
- **Mesas desacopladas de la cursada** (ligadas a CicloLectivo + `TurnoExamen`/`TipoMesa`); el cálculo de cursada devuelve solo LIBRE/REGULAR/PROMOCIONADA: los finales tienen su propio ciclo de vida.
- **Horarios con `horaInicio`/`horaFin` libres** (se eliminó `ModuloHorario`): los módulos fijos no cubrían superposiciones reales.
- **SDD con Claude Code nativo** (`.claude/` en la raíz: 4 agentes, comandos `/sdd-*`, skill `sdd`; specs en `specs/NNN-nombre/`): una sola herramienta y la IA siempre corre desde la raíz, donde está el versionado; por eso no hay archivos de agentes en subcarpetas.
- **Acta cerrada = inmutable**: `ms-notas` consulta el estado de la mesa al Core antes de guardar notas.

## Aprendizajes / errores a evitar
- Server Actions siempre con `try/catch` + `toast.error`: una excepción no atrapada rompe todo el árbol de React. Pero `redirect()` lanza `NEXT_REDIRECT`: todo `catch` que envuelva una Server Action o `fetchApi` (servidor o cliente) llama primero a `unstable_rethrow(error)`, o un login correcto se muestra como error.
- El frontend usa React 18.2 (sin `useActionState`): formularios con Server Actions vía `useTransition`.
- Formatear fechas con `timeZone: "America/Argentina/Buenos_Aires"` (o pre-formatear en el server) para evitar hydration mismatch.
- `revalidatePath` con la ruta específica; el genérico no refresca listados anidados.
- Botones dentro de `<form>` en dialogs: `type="button"`/`preventDefault`, o envían el form.
- Validar duplicados en el servicio (409 con excepción propia), no confiar en constraints de BD (que dan 500 crudo).
- Al editar un usuario multi-rol, no pisar los roles que no se tocaron (bug ya ocurrido en administradores).
- No iterar `Set<Rol>` asumiendo un orden en tests.
- Usuarios creados desde la UI deben quedar `enabled=true` para todos los roles.
- Frontend sin `npm test`: verificar con `npm run build` (+ `tsc`). E2E real: `docker compose up --build -d` y curl contra el Gateway.
- Al agregar un campo a una entidad, revisar también `DatabaseSeeder` y los DTOs de `commons`.
- Al inyectar un client HTTP nuevo en un service, mockearlo en sus tests: sin CI, `ms-notas` quedó 3 meses en rojo por eso.
- Login: usuario inexistente y password incorrecta dan el mismo 401 (`BadCredentialsException`); una excepción sin handler propio cae en el genérico y devuelve 500.
- Cada iteración cierra revisando `MEMORY.md`, `AGENTS.md` y `docs/constitution.md`.
