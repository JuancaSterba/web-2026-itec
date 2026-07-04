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
- [ ] Sidebar dinámico y colapsable (menú de navegación).
- [ ] Navbar superior (perfil del usuario, botón de logout, breadcrumbs).
- [ ] Pantalla de Inicio (Dashboard General) con tarjetas resumen y métricas vacías.

## Fase 4: Integración de Microservicios (Módulos de Negocio)
Desarrollo de las pantallas que consumirán nuestros microservicios específicos.
- [ ] **Módulo Core (Gestión Maestros)**: 
  - Listado de Alumnos y Profesores.
  - Gestión de Comisiones.
- [ ] **Módulo Asistencias (`ms-asistencias`)**:
  - Interfaz de "Toma de Lista" por comisión y fecha.
- [ ] **Módulo Calificaciones (`ms-notas`)**:
  - Interfaz para cargar exámenes y asignar notas a los alumnos de una comisión.

## Criterios de Aceptación Globales
1. **Aestética WOW:** Cero diseños básicos. Todo debe sentirse premium, vivo y responsivo.
2. **Comunicación Exclusiva vía Gateway:** El frontend NUNCA debe comunicarse directamente con los puertos 8081, 8083 u 8084. Todo pasa por el `8080`.
