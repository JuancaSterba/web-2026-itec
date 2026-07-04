# Plan de Trabajo: Frontend (Next.js)

Este documento traza la hoja de ruta para la construcción del cliente web del Backoffice del ITEC. El objetivo es construir una interfaz altamente profesional, rápida, dinámica y con una estética visual premium (micro-animaciones, diseño limpio, tipografías modernas).

## Fase 1: Fundamentos y Diseño Core (Design System)
Antes de construir pantallas funcionales, debemos establecer una base estética impecable.
- [x] Limpieza del proyecto base (eliminar boilerplate de Next.js).
- [x] Definición de paleta de colores premium (soporte Dark Mode, colores acentuados) y tipografía moderna (ej. *Inter* u *Outfit*).
- [x] Configuración del cliente HTTP (Axios / Fetch) apuntando a la URL del API Gateway (`http://localhost:8080`).
- [x] Creación de Componentes UI Base (Atómicos):
  - Botones (con hover effects, loaders).
  - Inputs (con validaciones visuales).
  - Tarjetas (Cards) estilo *glassmorphism* o sombras suaves.

## Fase 2: Autenticación y Rutas Protegidas
Integración con el backend para garantizar el flujo de seguridad basado en JWT.
- [x] Pantalla de Login: Diseño espectacular para causar una gran primera impresión.
- [x] Lógica de Login: Consumir `POST /api/core/auth/login` vía el Gateway.
- [x] Manejo del Estado Global: Guardar el token JWT y los datos del usuario (Context API o Zustand).
- [x] Interceptores HTTP: Adjuntar automáticamente el `Bearer {token}` a cada petición subsecuente.
- [x] Middleware (Next.js): Proteger rutas de la app (ej. `/dashboard/**`) redirigiendo al login si no hay sesión.

> ✅ **Memo de Avance:** Login probado extremo a extremo contra el Gateway real (Docker): credenciales
> validas devuelven 200+JWT, credenciales invalidas devuelven 401 con mensaje mostrado via toast
> (sonner), rutas protegidas siguen gateadas por el middleware. Hallazgo y fix criticos en el camino:
> `.env.local` apuntaba a `:8082` (Core directo) en vez de `:8080` (Gateway) violando el criterio de
> aceptacion global; `use-auth.tsx` llamaba `/auth/login` en vez de `/api/core/auth/login`; el Gateway
> no tenia CORS configurado (bloqueaba el login en cualquier browser real pese a que curl no lo notaba,
> por no aplicar la politica de origen); y el interceptor 401 de `api-client.ts` forzaba redirect a
> `/login` ante CUALQUIER 401, incluidas credenciales invalidas durante el propio login.

## Fase 3: Layout y Estructura del Backoffice (Dashboard)
El cascarón donde vivirán todos los módulos.
- [x] Sidebar dinámico y colapsable (menú de navegación).
- [x] Navbar superior (perfil del usuario, botón de logout, breadcrumbs).
- [x] Pantalla de Inicio (Dashboard General) con tarjetas resumen y métricas vacías.

> ✅ **Memo de Avance:** Sidebar/Navbar/Dashboard ya existían como scaffolding pre-Fase-1 (colores
> hardcodeados bg-white/bg-gray-50, sin relación con el design system). Se restyleó todo con los
> tokens `--sidebar-*` (definidos en Fase 1 pero sin usar hasta ahora) y la paleta tierra
> colorada/selva. El Sidebar exporta la lista de navegación para que el Header arme el breadcrumb
> dinámico a partir del pathname, sin duplicar la data. KPIs y actividad reciente con datos mock
> (no hay backend de métricas todavía); el gráfico es un mock de barras CSS, no una librería de
> charts real. Probado contra el Gateway real en Docker con sesión autenticada (login → cookie →
> `/dashboard` 200, contenido de las 4 secciones confirmado en el HTML servido).

## Fase 4: Integración de Microservicios (Módulos de Negocio)
Desarrollo de las pantallas que consumirán nuestros microservicios específicos.
- [ ] **Módulo Core (Gestión Maestros)**:
  - [x] Listado de Alumnos (CRUD completo: crear, editar legajo/estado, eliminar).
  - [x] Listado de Profesores (CRUD completo: crear, editar título/teléfono/estado, eliminar).
  - [ ] Gestión de Comisiones.

> ✅ **Memo de Avance (Profesores + fix de seguridad):** `/dashboard/profesores` replica el mismo
> patrón que Alumnos, incluido el alta de un solo paso (`POST /api/core/profesores` crea Usuario+
> Profesor). Antes de construirlo se resolvieron los dos hallazgos de seguridad detectados en la
> validación de flujos: Alumnos/Profesores ya no pueden loguearse (`User.enabled=false` al
> crearse, chequeado explícitamente en `AuthServiceImpl.login()` porque ese método no pasa por
> `AuthenticationManager`) y los `GET` de los controladores maestros ahora exigen rol ADMIN/
> ADMINISTRATIVO (antes cualquier token válido leía todo).

> ✅ **Memo de Avance (Alumnos):** `/dashboard/alumnos` consume `/api/core/alumnos` vía el Gateway
> con el `api-client` existente. El formulario terminó siendo, después de dos vueltas, exactamente
> lo que pedía la consigna original: un solo paso con Nombre/Apellido/DNI/Email/Teléfono/Legajo.
> Lo que cambió fue **dónde** vive la orquestación — no en el frontend (llamando a `/auth/register`),
> sino en el propio `POST /api/core/alumnos`: por regla de negocio (`docs/Reglas_de_Negocio.md`,
> uso exclusivamente administrativo), el Core ahora crea el `Usuario` (username=DNI,
> contraseña=DNI encriptada, rol ALUMNO) y el `Alumno` en una sola transacción. El legajo sí se
> asigna en el alta (ya no queda `null`). `Switch` y `AlertDialog`
> están rotos en este proyecto (`@radix-ui/react-switch` y `@radix-ui/react-alert-dialog` no están
> instalados) — se resolvió con un toggle de dos `Button` y un `Dialog` de confirmación en su
> lugar. Se eliminó `/dashboard/students` (scaffold pre-Fase-1 con datos mock que ni siquiera
> coincidían con el modelo real, huérfano del Sidebar). Validado con curl replicando los shapes
> exactos de los diálogos contra el Gateway real, incluyendo el caso de error de negocio mostrado
> en el toast.
- [ ] **Módulo Asistencias (`ms-asistencias`)**:
  - Interfaz de "Toma de Lista" por comisión y fecha.
- [ ] **Módulo Calificaciones (`ms-notas`)**:
  - Interfaz para cargar exámenes y asignar notas a los alumnos de una comisión.

## Criterios de Aceptación Globales
1. **Aestética WOW:** Cero diseños básicos. Todo debe sentirse premium, vivo y responsivo.
2. **Comunicación Exclusiva vía Gateway:** El frontend NUNCA debe comunicarse directamente con los puertos 8081, 8083 u 8084. Todo pasa por el `8080`.
