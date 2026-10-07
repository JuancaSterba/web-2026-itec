# 001 — Tareas: Sesión segura y perfil desde el servidor

- **Plan:** [`plan.md`](./plan.md)
- **Progreso:** 25/31

> El frontend no tiene test runner (agregar uno requiere aprobación, C1.2). Sus tareas se marcan `[sin test: sin test runner en frontend]` y se verifican con `npm run build` y con el E2E de la Fase 5. Los comandos Maven se corren con JDK 17.

## Fase 1 — Backend (`backend/security`)
- [x] T01 [RF-04] Escribir en `AuthServiceImplTest` el caso "usuario deshabilitado con contraseña correcta lanza `DisabledException` con el mensaje 'Usuario inactivo o sin permisos'" — Hecho cuando: el test existe y falla porque el mensaje actual es "La cuenta está deshabilitada".
- [x] T02 [RF-04] Agregar `MSG_USER_DISABLED` en `SecurityConstants` y usarla en `AuthServiceImpl.login` (después de T01) — Hecho cuando: T01 pasa y `mvn test` de `backend` está en verde.
- [x] T03 [RF-03, RF-21] Escribir en `AuthServiceImplTest` los casos "usuario deshabilitado con contraseña incorrecta lanza `BadCredentialsException`" y "usuario o contraseña vacíos lanzan `BadCredentialsException` con 'Credenciales inválidas'" — Hecho cuando: los tests pasan (son de regresión: el código actual ya cumple; si alguno falla, se corrige en esta misma tarea).
- [x] T04 [RF-11, RF-13, RF-14] Escribir `PerfilServiceImplTest`: devuelve los datos vigentes del usuario autenticado y lanza `PerfilNotFoundException` si el username del token no existe — Hecho cuando: el test existe y falla porque las clases no existen.
- [x] T05 [RF-11, RF-13, RF-14] Crear `PerfilResponse`, `PerfilService`, `PerfilServiceImpl` y `PerfilNotFoundException`; el servicio obtiene el username con `SecurityUtils.getUsername()` y busca con `UserRepository` (después de T04) — Hecho cuando: T04 pasa y `mvn test` de `backend` está en verde.
- [x] T06 [RF-11, RF-14] Crear `PerfilController` con `GET /api/perfil` (`hasAnyRole` de los 4 roles) y el handler 404 en `SecurityExceptionHandler` (después de T05) [sin test unitario: se verifica por curl en T07] — Hecho cuando: `mvn test` de `backend` está en verde.
- [x] T07 [RF-04, RF-11, RF-14, RF-21] Reconstruir el backend en Docker y verificar por el Gateway: `GET /api/v1/perfil` sin token → 401, con token → 200 con los 6 campos; login de usuario deshabilitado → 403 con el mensaje nuevo; login con `{}` → 401 (después de T06) — Hecho cuando: los cuatro curl dan el resultado esperado.

## Fase 2 — Frontend: base de sesión (`frontend/lib`, `frontend/app/actions`)
- [x] T08 [RF-16, RF-17, RF-18, RF-20, RF-24] Crear `lib/sesion.ts` con los nombres de cookie (`itec-sesion`, `itec-rol`), `decodificarJwt`, `sesionVencida(jwt, ahoraSeg)` y `decidirAcceso(ruta, jwt, rolActivo, ahoraSeg)` como funciones puras [sin test: sin test runner en frontend] — Hecho cuando: `npm run build` pasa.
- [x] T09 [RF-10, RF-12] Actualizar `lib/auth-server.ts`: `getUsuarioActual()` lee `itec-sesion` e `itec-rol` y devuelve `rolActivo`, `nombre` y `apellido` (después de T08) [sin test: sin test runner en frontend] — Hecho cuando: `npm run build` pasa.
- [x] T10 [RF-17, RF-25] Agregar `fetchApi(ruta, init)` en `lib/api-server.ts` (token de `itec-sesion`, redirect a `/login?motivo=expirada` ante 401) y hacer que `fetchGateway` use la cookie nueva y el mismo manejo de 401 (después de T08) [sin test: sin test runner en frontend] — Hecho cuando: `npm run build` pasa.
- [x] T11 [RF-01, RF-03, RF-04, RF-05, RF-06, RF-07] Crear `app/actions/auth-actions.ts` con `loginAction(estadoPrevio, formData)`: valida campos, llama al Gateway, mapea 401/403 a los mensajes de la spec, setea `itec-sesion` `httpOnly` con `Max-Age` hasta el `exp` y redirige según la cantidad de roles (después de T08) [sin test: sin test runner en frontend] — Hecho cuando: `npm run build` pasa.
- [x] T12 [RF-08, RF-09, RF-22] Agregar `seleccionarRolAction(rol)` en `auth-actions.ts`: rechaza un rol que no esté en el JWT sin tocar `itec-rol`; si es válido, setea `itec-rol` con el mismo vencimiento y redirige a `/dashboard` (después de T11) [sin test: sin test runner en frontend] — Hecho cuando: `npm run build` pasa.
- [x] T13 [RF-15, RF-23] Agregar `logoutAction()` en `auth-actions.ts`: borra `itec-sesion` e `itec-rol` y redirige a `/login` (después de T11) [sin test: sin test runner en frontend] — Hecho cuando: `npm run build` pasa.

## Fase 3 — Frontend: migrar Server Actions a `fetchApi`
Reemplazo mecánico de "leer `auth-token` + `fetch` con `Authorization`" por `fetchApi`. Donde haya `try/catch`, relanzar el redirect de Next (ver riesgo en el plan). Todas después de T10, todas `[sin test: sin test runner en frontend]`.
- [x] T14 [RF-17, RF-25] Migrar `administrador`, `alumno`, `asistencia`, `carrera` y `ciclo` — Hecho cuando: esos archivos no mencionan `auth-token` y `npm run build` pasa.
- [x] T15 [RF-17, RF-25] Migrar `comision`, `comision-profesor`, `cursada`, `horario` e `inscripcion-carrera` — Hecho cuando: esos archivos no mencionan `auth-token` y `npm run build` pasa.
- [x] T16 [RF-17, RF-25] Migrar `materia`, `materia-plan`, `mesa-examen`, `nota` y `notas-mesas` — Hecho cuando: esos archivos no mencionan `auth-token` y `npm run build` pasa.
- [x] T17 [RF-17, RF-25] Migrar `oferta-automatica`, `periodo`, `persona`, `plan`, `profesor` y `app/api/mesas-examen/[id]/acta-pdf/route.ts` — Hecho cuando: esos archivos no mencionan `auth-token` y `npm run build` pasa.

## Fase 4 — Frontend: navegación y pantallas
- [x] T18 [RF-16, RF-17, RF-18, RF-19, RF-20] Reescribir `proxy.ts` con `decidirAcceso`: borra la cookie legada `auth-token`, borra la sesión vencida y agrega `/perfil` al `matcher` (después de T08) [sin test: sin test runner en frontend] — Hecho cuando: `npm run build` pasa.
- [x] T19 [RF-16, RF-18] Usar `getUsuarioActual()` en `app/dashboard/layout.tsx` y `app/page.tsx` en lugar de leer `auth-token` (después de T09) [sin test: sin test runner en frontend] — Hecho cuando: `npm run build` pasa.
- [x] T20 [RF-02, RF-08, RF-10] Reescribir `hooks/use-auth.tsx`: el provider recibe la sesión por props; `logout` y `switchRole` llaman a `logoutAction` y `seleccionarRolAction`; sin `localStorage` ni token (después de T12, T13) [sin test: sin test runner en frontend] — Hecho cuando: `npm run build` pasa y el archivo no menciona `localStorage`.
- [x] T21 [RF-10, RF-19] En `app/layout.tsx`, leer la sesión con `getUsuarioActual()`, pasarla a `AuthProvider` y montar el nuevo `components/auth/limpiar-datos-legados.tsx`, que borra las claves de la versión anterior (después de T20) [sin test: sin test runner en frontend] — Hecho cuando: `npm run build` pasa.
- [x] T22 [RF-03, RF-04, RF-05, RF-17] Reescribir `app/login/page.tsx` con `useActionState(loginAction)` y el aviso "Tu sesión expiró, volvé a iniciar sesión" cuando llega `?motivo=expirada` (después de T11) [sin test: sin test runner en frontend] — Hecho cuando: `npm run build` pasa.
- [x] T23 [RF-07, RF-09, RF-22] Convertir `app/seleccionar-rol/page.tsx` en Server Component: roles desde la sesión y botones que llaman a `seleccionarRolAction`, mostrando su error (después de T12) [sin test: sin test runner en frontend] — Hecho cuando: `npm run build` pasa.
- [x] T24 [RF-11, RF-12, RF-13, RF-14] Crear `types/Perfil.ts` y convertir `app/perfil/page.tsx` en Server Component: datos de `GET /api/v1/perfil`, roles y rol activo de la sesión, y mensaje de error sin cerrar la sesión (después de T09, T10, T06) [sin test: sin test runner en frontend] — Hecho cuando: `npm run build` pasa.
- [x] T25 [RF-02] Eliminar `lib/api-client.ts` y las funciones sin uso de `lib/services/*.service.ts` que lo importan, conservando los tipos (después de T20, T22) [sin test: sin test runner en frontend] — Hecho cuando: `npm run build` pasa y `localStorage` solo aparece en `limpiar-datos-legados.tsx`.

## Fase 5 — Verificación E2E (Docker + navegador)
- [ ] T26 [RF-01, RF-02, RF-03, RF-04, RF-05, RF-06, RF-07, RF-08, RF-09, RF-10, RF-22, RF-24] Con `docker compose up --build -d`, verificar login, cookies `HttpOnly`, almacenamiento vacío, mensajes de error, elección y cambio de rol (recarga y otra pestaña), rol ajeno rechazado y roles fijos durante la sesión (después de T25) — Hecho cuando: cada RF listado tiene su resultado anotado como OK.
- [ ] T27 [RF-11, RF-12, RF-13, RF-14, RF-15, RF-16, RF-17, RF-18, RF-19, RF-20, RF-21, RF-23, RF-25] Verificar perfil (dato vigente, roles, error con el Core caído), logout, redirecciones sin sesión y con sesión, sesión vencida al navegar y al enviar un formulario, datos legados borrados y usuario multi-rol sin elegir rol (después de T26) — Hecho cuando: cada RF listado tiene su resultado anotado como OK.

## Fase 6 — Docs y cierre
- [ ] T28 Actualizar `docs/04.20-Diagrama_Arquitectura.md` y `docs/03.00-Diagrama_Secuencia.md`: login vía Server Action con cookie `httpOnly` y `GET /api/v1/perfil` [sin test: docs] — Hecho cuando: los diagramas muestran el flujo nuevo.
- [ ] T29 Validar todos los RF con `/sdd-validate` (después de T27) — Hecho cuando: los 25 RF están en ✅.
- [ ] T30 Borrar #36 de `docs/pendientes.md`, agregar el pendiente "Revocar la sesión en el servidor al cerrar sesión" y registrar en `MEMORY.md` la decisión de sesión con cookies `httpOnly` [sin test: docs] — Hecho cuando: pendientes y `MEMORY.md` reflejan el estado final y `AGENTS.md` fue revisado.
- [ ] T31 Proponer quitar de `docs/constitution.md` las excepciones heredadas de C2.4 y C4.5 y aplicarlo con aprobación del usuario [sin test: docs] — Hecho cuando: el usuario aprobó y la constitución ya no menciona `use-auth.tsx` ni la deuda #36.
