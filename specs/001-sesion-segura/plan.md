# 001 — Plan técnico: Sesión segura y perfil desde el servidor

- **Spec:** [`spec.md`](./spec.md)
- **Estado:** Aprobado (2026-10-06, incluye el endpoint `GET /api/v1/perfil`)

## Resumen
El login pasa a ser una Server Action: el servidor de Next llama al Gateway, guarda el JWT en una cookie `httpOnly` (`itec-sesion`) y redirige según los roles. El rol activo se guarda en otra cookie `httpOnly` (`itec-rol`), que solo escribe una Server Action que valida el rol contra el JWT. El layout raíz (Server Component) lee la sesión y se la pasa a un provider cliente sin tokens ni datos en `localStorage`; `useAuth()` conserva su forma para no tocar sus 5 consumidores. El `proxy` valida presencia y vencimiento de la sesión en cada navegación, y un helper único de fetch para Server Actions convierte un 401 del Gateway en redirect al login con aviso. El perfil se vuelve Server Component y consulta un endpoint nuevo del Core, `GET /api/v1/perfil`.

## Chequeo de constitución
| Regla | Cumple | Nota |
|---|---|---|
| C1.1 Stack cerrado | ✅ | Next.js Server Actions/cookies y Spring Security existentes. |
| C1.2 Sin dependencias nuevas | ✅ | Se reutiliza `jwt-decode` (ya instalada). No se quita `react-use` (fuera de alcance). |
| C1.3 Sin servicios nuevos | ✅ | |
| C1.4 Solo HTTP REST entre servicios | ✅ | No hay llamadas nuevas entre servicios. |
| C1.5 Reutilizar | ✅ | `getUsuarioActual`, `fetchGateway`, `SecurityUtils.getUsername`, `UserRepository`, forma de `useAuth()`. |
| C2.1 Capas | ✅ | `PerfilController` → `PerfilService` → `UserRepository`. |
| C2.2 DTOs, no entidades | ✅ | `PerfilResponse` nuevo en `backend/security` (no en `commons`). |
| C2.3 Revalidación en backend | ✅ | RF-21: el Core rechaza credenciales vacías con 401. |
| C2.4 Server Actions, sin fetch desde cliente | ✅ | Elimina la excepción heredada del login. Al cerrar la spec, quitarla del texto de la constitución (con aprobación). |
| C2.5 Frontend solo habla con el Gateway | ✅ | La Server Action de login llama a `/api/v1/auth/login` en el Gateway. |
| C2.6 Tipos reflejan DTOs | ✅ | Tipo `Perfil` en el frontend = `PerfilResponse`. |
| C3.1 / C3.2 Tests de servicio y de bug | ✅ | Ver estrategia de pruebas. |
| C3.3 Build y tests en verde | ✅ | `mvn test` en `backend` y `npm run build` en `frontend`. |
| C3.4 Tests deterministas | ✅ | El vencimiento se calcula con `ahora` inyectado. |
| C3.5 E2E si cruza servicios | ✅ | Toca frontend + Core: E2E en Docker. |
| C4.3 Contraseñas | ✅ | El perfil no expone la contraseña. |
| C4.4 Endpoint nuevo valida rol | ✅ | `GET /api/perfil` con `hasAnyRole` de los 4 roles; sin endpoint anónimo nuevo. |
| C4.5 JWT del lado del servidor | ✅ | Elimina la excepción heredada. Al cerrar la spec, quitarla del texto (con aprobación). |
| C4.6 Errores sin stack traces | ✅ | Mensajes fijos en el login y en el perfil. |
| C4.8 Datos personales por rol | ✅ | El perfil solo devuelve los datos del usuario autenticado (RF-13). |
| C4.9 Login sin enumeración | ✅ | RF-03/RF-04: el chequeo de habilitado sigue después de la contraseña. |

## Archivos afectados
| Módulo | Archivo | Cambio | RF |
|---|---|---|---|
| backend/security | `security/service/AuthServiceImpl.java` | Mensaje de cuenta deshabilitada → "Usuario inactivo o sin permisos" (constante en `SecurityConstants`). | RF-04 |
| backend/security | `security/constants/SecurityConstants.java` | Constante `MSG_USER_DISABLED`. | RF-04 |
| backend/security | `security/dto/PerfilResponse.java` | **Nuevo** DTO: `username`, `nombre`, `apellido`, `dni`, `email`, `telefono`. | RF-11 |
| backend/security | `security/service/PerfilService.java` (+ `impl/PerfilServiceImpl.java`) | **Nuevo**: busca el usuario autenticado por username y arma `PerfilResponse`; 404 si no existe. | RF-11, RF-13 |
| backend/security | `security/controller/PerfilController.java` | **Nuevo** `GET /api/perfil`. | RF-11, RF-13 |
| backend/security | `security/exception/PerfilNotFoundException.java` + handler en `SecurityExceptionHandler` | 404 con mensaje fijo. | RF-14 |
| frontend | `lib/sesion.ts` | **Nuevo**: nombres de cookies, decodificación del JWT, `sesionVencida`, `decidirAcceso` (funciones puras). | RF-16, RF-17, RF-18, RF-20, RF-24 |
| frontend | `lib/auth-server.ts` | `getUsuarioActual()` lee `itec-sesion` y `itec-rol`; agrega `rolActivo`, `nombre`, `apellido`. | RF-10, RF-12 |
| frontend | `lib/api-server.ts` | `fetchGateway` usa la cookie nueva; ante 401 redirige al login con aviso. Nuevo `fetchApi` para Server Actions. | RF-17, RF-25 |
| frontend | `app/actions/auth-actions.ts` | **Nuevo**: `loginAction`, `seleccionarRolAction`, `logoutAction`. | RF-01, RF-03…RF-09, RF-15, RF-22, RF-23 |
| frontend | `app/actions/*-actions.ts` (20 archivos) + `app/api/mesas-examen/[id]/acta-pdf/route.ts` | Reemplazar lectura de `auth-token` + `fetch` por `fetchApi`. | RF-17, RF-25 |
| frontend | `proxy.ts` | Validar vencimiento, borrar sesión vencida o legada, exigir rol activo, agregar `/perfil` al `matcher`. | RF-16, RF-17, RF-18, RF-19, RF-20 |
| frontend | `hooks/use-auth.tsx` | Provider recibe la sesión por props desde el layout; `login` desaparece; `logout` y `switchRole` llaman a las Server Actions. Sin `localStorage`, sin token. | RF-02, RF-08, RF-10 |
| frontend | `app/layout.tsx` | Lee la sesión con `getUsuarioActual()` y la pasa a `AuthProvider`; monta `LimpiarDatosLegados`. | RF-10, RF-19 |
| frontend | `components/auth/limpiar-datos-legados.tsx` | **Nuevo**: borra las claves de `localStorage` de la versión anterior. | RF-19 |
| frontend | `app/login/page.tsx` | Formulario con `useActionState(loginAction)`; muestra el aviso de sesión vencida (`?motivo=expirada`). | RF-03, RF-04, RF-05, RF-17 |
| frontend | `app/seleccionar-rol/page.tsx` | Server Component: roles desde la sesión; botones llaman a `seleccionarRolAction`. | RF-07, RF-09, RF-22 |
| frontend | `app/perfil/page.tsx` | Server Component: datos de `GET /api/v1/perfil`; roles y rol activo de la sesión; error sin cerrar sesión. | RF-11…RF-14 |
| frontend | `app/dashboard/layout.tsx`, `app/page.tsx` | Usar `getUsuarioActual()` en lugar de leer `auth-token`. | RF-16, RF-18 |
| frontend | `lib/api-client.ts` | **Eliminar** (solo lo usaba el login). Quitar las funciones sin uso de `lib/services/*.service.ts` que lo importan, conservando los tipos. | RF-02 |
| frontend | `types/Perfil.ts` | **Nuevo** tipo espejo de `PerfilResponse`. | RF-11 |
| docs | `04.20-Diagrama_Arquitectura.md`, `03.00-Diagrama_Secuencia.md` | Login vía Server Action y cookie `httpOnly`; endpoint `GET /api/v1/perfil`. | — |
| docs | `pendientes.md`, `constitution.md`, `MEMORY.md` | Cerrar #36, pendiente nuevo "revocar sesión al cerrar sesión", quitar excepciones de C2.4/C4.5, decisión de sesión. | — |

## Diseño
### Modelo de datos / migraciones
Sin cambios de schema. El rol activo vive en una cookie, no en la BD.

### Contratos (API)
**`POST /api/v1/auth/login`** (existente, Gateway → Core `/auth/login`)
- Request: `{ username, password }`.
- 200 → `ApiResponse<LoginResponse>` con `token`.
- 401 → "Credenciales inválidas": usuario inexistente, contraseña incorrecta o campos vacíos (RF-03, RF-21).
- 403 → "Usuario inactivo o sin permisos": usuario deshabilitado con contraseña correcta (RF-04).

**`GET /api/v1/perfil`** (nuevo, Gateway `core-api` → Core `/api/perfil`; no cambia la config del Gateway)
- Auth: JWT obligatorio; `@PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIVO','PROFESOR','ALUMNO')")`.
- 200 → `ApiResponse<PerfilResponse>`: `{ username, nombre, apellido, dni, email, telefono }`.
- 401 → sin JWT o vencido (Gateway).
- 404 → el usuario del token ya no existe.

**Cookies** (las escribe solo el servidor de Next)
| Cookie | Contenido | Atributos |
|---|---|---|
| `itec-sesion` | JWT | `httpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age` = segundos hasta el `exp` del JWT |
| `itec-rol` | Rol activo | Mismos atributos y vencimiento que `itec-sesion` |

### Lógica (funciones puras y pseudocódigo)
```text
// lib/sesion.ts
sesionVencida(jwt, ahoraSeg):
  payload = decodificar(jwt)          // sin verificar firma: la verifica el Gateway
  si payload es inválido o no tiene exp → true
  devolver payload.exp <= ahoraSeg

decidirAcceso(ruta, jwt, rolActivo, ahoraSeg):
  esLogin = ruta == "/login"
  esEleccion = ruta == "/seleccionar-rol"
  si jwt es nulo:
    devolver esLogin ? PASAR : IR_A("/login")                          // RF-16
  si sesionVencida(jwt, ahoraSeg):
    devolver BORRAR_SESION + IR_A("/login?motivo=expirada")           // RF-17
  roles = decodificar(jwt).roles                                      // RF-24: fijos desde el login
  rolValido = rolActivo != nulo y rolActivo ∈ roles
  si esLogin: devolver IR_A(rolValido ? "/dashboard" : "/seleccionar-rol")   // RF-18
  si no rolValido y no esEleccion: devolver IR_A("/seleccionar-rol")        // RF-20
  devolver PASAR

// proxy.ts
si existe cookie legada "auth-token": borrarla + IR_A("/login")      // RF-19
aplicar decidirAcceso(...)

// app/actions/auth-actions.ts
loginAction(estadoPrevio, formData):
  usuario, clave = formData
  si alguno vacío → devolver { error: "Usuario y contraseña son obligatorios" }   // RF-05
  resp = POST Gateway /api/v1/auth/login
  si resp 401 → devolver { error: "Credenciales inválidas" }                     // RF-03
  si resp 403 → devolver { error: "Usuario inactivo o sin permisos" }             // RF-04
  si no ok → devolver { error: "No se pudo iniciar sesión" }
  jwt = resp.data[0].token
  setear itec-sesion (httpOnly)                                                   // RF-01
  roles = decodificar(jwt).roles
  si roles.length == 1: setear itec-rol = roles[0]; redirect("/dashboard")       // RF-06
  si no: borrar itec-rol; redirect("/seleccionar-rol")                            // RF-07

seleccionarRolAction(rol):
  jwt = cookie itec-sesion; si falta o vencida → redirect("/login?motivo=expirada")
  si rol ∉ decodificar(jwt).roles → devolver { error: "Rol no asignado" }   // RF-09; itec-rol no cambia (RF-22)
  setear itec-rol = rol (vence con la sesión)                               // RF-08
  revalidatePath("/", "layout"); redirect("/dashboard")

logoutAction():
  borrar itec-sesion e itec-rol                                             // RF-15
  redirect("/login")                                                        // RF-23

// lib/api-server.ts
fetchApi(ruta, init):
  jwt = cookie itec-sesion
  resp = fetch(Gateway + ruta, init + Authorization)
  si resp.status == 401 → redirect("/login?motivo=expirada")   // RF-17; el backend no guardó nada (RF-25)
  devolver resp
```

## Decisiones
| Decisión | Alternativa descartada | Justificación |
|---|---|---|
| Rol activo en cookie `httpOnly` escrita solo por una Server Action que lo valida contra el JWT. | Tabla de sesiones o columna en el Core. | Cumple RF-08 (lo controla el servidor y la página no lo puede leer ni escribir) sin cambiar el schema. RF-08 pide recordarlo solo durante la sesión. |
| Renombrar la cookie a `itec-sesion` y borrar la legada `auth-token`. | Mantener `auth-token` y agregar una cookie marcadora. | La cookie vieja no es `httpOnly` y desde el servidor no se puede saber con qué atributos se creó. Con el nombre nuevo, toda sesión anterior se descarta una vez (RF-19) y el costo es nulo: los 28 archivos que leen la cookie se tocan igual. |
| Endpoint `GET /api/perfil` en `backend/security` con DTO propio. | Reutilizar `UsuarioAdminResponse` (de `commons`) o `GET /api/administradores/{id}`. | El de administradores exige ADMIN y no sirve para profesores. El DTO de `commons` expone `id`, `enabled` y `legajo`, que el perfil no necesita, y cambiar `commons` requiere aprobación. `security` ya tiene `UserRepository` y `SecurityUtils`. **Requiere tu aprobación (endpoint nuevo, AGENTS.md).** |
| Vencimiento validado en el `proxy` y, para Server Actions, en el helper `fetchApi` ante un 401. | Solo en el `proxy`. | El `proxy` cubre la navegación. Una Server Action puede enviarse con el token ya vencido; el 401 del Gateway asegura que no se guarde nada (RF-25) y el helper hace el redirect con aviso (RF-17). |
| Mantener la forma de `useAuth()` (`user`, `logout`, `switchRole`) pero alimentarlo desde el servidor. | Pasar la sesión por props a cada componente. | El header, el sidebar, `RequireRole` y el diálogo de administradores no cambian (C1.5). |
| Sin test runner en el frontend; la lógica de acceso queda en funciones puras verificadas por E2E. | Agregar Vitest. | Agregar una dependencia requiere aprobación (C1.2) y `MEMORY.md` fija `npm run build` + E2E como verificación del frontend. |
| Cookies sin `Secure`. | `Secure` condicionado a HTTPS o por variable de entorno. | El proyecto corre solo en local por HTTP (proyecto escolar, sin despliegue). |

## Estrategia de pruebas
| RF | Tipo | Test |
|---|---|---|
| RF-01 | E2E (navegador) | Tras el login, `document.cookie` no muestra `itec-sesion`; DevTools la marca `HttpOnly`. |
| RF-02 | E2E (navegador) | Tras login, cambio de rol y perfil, `localStorage` y `sessionStorage` están vacíos. |
| RF-03 | Unitario + E2E | `AuthServiceImplTest` (existente: usuario inexistente / contraseña incorrecta); nuevo caso: usuario deshabilitado con contraseña incorrecta → `BadCredentialsException`. E2E: mensaje en pantalla. |
| RF-04 | Unitario + E2E | `AuthServiceImplTest.login_usuarioDeshabilitadoConPasswordCorrecta_lanzaDisabledConMensajeDelEnunciado`; curl → 403 con el mensaje. |
| RF-05 | E2E | Enviar el formulario vacío: mensaje de campo obligatorio, sin request al Gateway. |
| RF-06, RF-07 | E2E | Login con usuario de un rol → `/dashboard`; con dos roles → `/seleccionar-rol`. |
| RF-08 | E2E | Elegir rol, recargar y abrir otra pestaña: el rol se mantiene. |
| RF-09, RF-22 | E2E | Invocar `seleccionarRolAction` con un rol ajeno (formulario manipulado): error y rol activo sin cambios. |
| RF-10 | E2E | El sidebar muestra los ítems del rol activo. |
| RF-11 | Unitario + E2E | `PerfilServiceImplTest.obtener_devuelveDatosVigentesDelUsuarioAutenticado`; E2E: un admin cambia el email y el perfil lo muestra al recargar. |
| RF-12 | E2E | El perfil lista los roles y marca el activo. |
| RF-13 | Unitario | `PerfilServiceImplTest` usa solo el username autenticado (sin parámetro de usuario en el endpoint). |
| RF-14 | Unitario + E2E | `PerfilServiceImplTest.obtener_usuarioInexistente_lanzaPerfilNotFound`; E2E: con el Core caído, el perfil muestra error y la sesión sigue. |
| RF-15, RF-23 | E2E | Cerrar sesión: cookies borradas y redirect a `/login`. |
| RF-16 | E2E (curl) | `GET /dashboard` y `/perfil` sin cookie → 307 a `/login`. |
| RF-17 | E2E | Cookie con JWT vencido → redirect a `/login?motivo=expirada` con el aviso. |
| RF-18 | E2E (curl) | `GET /login` con sesión válida → redirect a `/dashboard`. |
| RF-19 | E2E (navegador) | Cargar claves viejas en `localStorage` y la cookie `auth-token`; al abrir la app se borran. |
| RF-20 | E2E | Usuario con dos roles sin elegir: `/dashboard` redirige a `/seleccionar-rol`. |
| RF-21 | Unitario + E2E | `AuthServiceImplTest.login_camposVacios_lanzaCredencialesInvalidas`; curl con `{}` → 401. |
| RF-24 | E2E | Quitar un rol a un usuario con sesión abierta: sigue viéndolo hasta el próximo login. |
| RF-25 | E2E | Con la sesión vencida, enviar un formulario: el dato no aparece en el listado tras volver a entrar. |

## Riesgos
- **Next.js y redirects en Server Actions:** `redirect()` dentro de `fetchApi` lanza una excepción especial; las actions con `try/catch` (patrón de `MEMORY.md`) deben relanzarla. Mitigación: `fetchApi` usa `redirect` antes del `try` del llamador, o se documenta `unstable_rethrow` en el helper.
- **Volumen del cambio en `app/actions/`:** 20 archivos con un reemplazo mecánico; se hace en tareas por grupos con `npm run build` después de cada una.
- **El JWT se decodifica sin verificar la firma en Next:** solo se usa para decidir redirecciones y la UI; toda autorización real la hace el Gateway/Core con la firma.
