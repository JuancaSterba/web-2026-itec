# Constitución del Proyecto — Backoffice Académico ITEC

Principios innegociables. Toda spec, plan y cambio de código debe cumplirlos; el `reviewer` los verifica antes de mergear a `develop`. Cambiar una regla requiere aprobación explícita del usuario y una entrada en `MEMORY.md` con la justificación.

## 1. Simplicidad del stack
- **C1.1** El stack es cerrado: Java 17 + Spring Boot 3.2.x + Maven; Next.js + React + TypeScript + Tailwind + shadcn/ui; MySQL + Docker Compose. Nada fuera de esta lista sin aprobación.
- **C1.2** No se agregan dependencias nuevas sin aprobación explícita y sin justificar por qué la librería existente no alcanza.
- **C1.3** No se crean servicios nuevos: los existentes son Gateway, Core, `ms-asistencias`, `ms-notas` y frontend.
- **C1.4** Comunicación entre servicios solo por HTTP REST; no se introducen colas ni brokers (ver deuda #22 en `pendientes.md`).
- **C1.5** Antes de crear una clase, componente o utilidad, se busca y reutiliza lo existente.

## 2. Separación de interfaz y lógica
- **C2.1** Backend en capas: `controller` → `service` → `repository`. Los controllers no tienen reglas de negocio ni acceden a repositorios.
- **C2.2** Las APIs exponen DTOs (`dto/` o `backend/commons`); nunca entidades JPA.
- **C2.3** Las reglas de negocio viven en el backend. El frontend puede validar para mejorar la UX, pero el servicio siempre revalida.
- **C2.4** Frontend: datos con Server Components y escrituras con Server Actions (`frontend/app/actions`), incluido el login. Sin fetch al backend desde componentes cliente.
- **C2.5** El frontend solo habla con el API Gateway; ningún servicio se consume directamente por su puerto.
- **C2.6** Los tipos del frontend (`frontend/types`, `frontend/lib/types.ts`) reflejan los DTOs del backend; si un DTO cambia, se actualizan en el mismo cambio.
- **C2.7** El contrato público es `/api/v1/<recurso>` (enunciado) y lo expone solo el Gateway, que quita el `/v1` al rutear. Los servicios no conocen el `/v1` y el frontend usa solo rutas `/api/v1`.

## 3. Política de pruebas
- **C3.1** Toda regla de negocio nueva o modificada en un `service` tiene un test unitario (JUnit 5 + Mockito).
- **C3.2** Todo bug corregido en backend suma un test que lo reproduce.
- **C3.3** No se mergea a `develop` con `mvn test` en rojo en los módulos tocados, ni con `npm run build` fallando en `frontend/`.
- **C3.4** Los tests son deterministas: sin depender del orden de un `Set`, la hora actual sin fijar ni datos de otra ejecución.
- **C3.5** Los cambios que cruzan servicios (Gateway, Core, MS) se verifican E2E con `docker compose up --build -d`.

## 4. Protección de datos
- **C4.1** Cada servicio accede solo a su BD (`backoffice_itec`, `db_asistencias`, `db_calificaciones`); los datos de otro se piden por HTTP.
- **C4.2** Ningún secreto se commitea: `.env` y `.env.local` se ignoran y solo se versionan `.env.example` con valores de ejemplo.
- **C4.3** Las contraseñas se guardan solo con hash (`PasswordEncoder`/BCrypt); nunca se loguean ni se devuelven en una respuesta.
- **C4.4** Todo endpoint nuevo valida el rol: Spring Security en el Core y `RoleGuard.exigirRol` en los MS. No hay endpoints anónimos fuera del login.
- **C4.5** La sesión vive en cookies `httpOnly` que solo escribe el servidor de Next (`itec-sesion` con el JWT, `itec-rol` con el rol activo) y se lee con `frontend/lib/auth-server.ts`. El navegador no guarda tokens, datos personales, roles ni el rol activo en `localStorage` ni `sessionStorage`.
- **C4.6** Las entradas se validan en el borde (`@Valid` + Bean Validation en los request DTOs) y los errores se devuelven sin stack traces.
- **C4.7** El schema solo cambia por migraciones de Flyway (`ddl-auto: validate`). Las migraciones ya aplicadas no se editan.
- **C4.8** Los datos personales (DNI, email, teléfono) solo se exponen a los roles que los necesitan.
- **C4.9** Los errores de autenticación no revelan si un usuario existe: usuario inexistente y contraseña incorrecta devuelven el mismo 401.
