# Agent Directives — Frontend Web

@../AGENTS.md

## 📍 Contexto del Ecosistema
Este módulo es la aplicación cliente Next.js. Si necesitas interactuar o verificar contratos:
- 🚪 **API Gateway:** `../api-gateway/` (Punto único de conexión HTTP para todas las llamadas API)
- 🧠 **Backend Core:** `../backend/` (Contratos de datos maestros, auth y DTOs)
- 📅 **MS Asistencias:** `../ms-asistencias/` (Contratos de endpoints de asistencia)
- 📊 **MS Notas:** `../ms-notas/` (Contratos de endpoints de calificaciones y actas)
- 📚 **Documentación Central:** `../docs/` (Guías de UI/UX, arquitectura de navegación y specs)
- 📌 **Única Fuente de Verdad (Tareas):** `../.remember/PENDIENTES.md`
- ⚡ **Planes / Specs de Desarrollo:** `../.superpowers/`

## 🎯 Rol y Reglas Específicas del Frontend
1. **Rol de Referencia:** Ver `../.agents/frontend.md`.
2. **Peticiones HTTP vía Gateway:** Todas las llamadas al backend deben realizarse mediante `lib/api-client.ts` apuntando a `NEXT_PUBLIC_API_URL` (Gateway `8080`), nunca directo a microservicios.
3. **Consistencia Visual:** Usar componentes base de shadcn/ui ubicados en `components/ui/` y seguir los patrones de diseño detallados en `../docs/05.00-Diseno_UX_UI.md`.
4. **Validación de Formularios:** Utilizar React Hook Form + Zod para esquemas de validación antes de enviar datos al backend.
5. **Tipado Estricto:** Evitar el uso de `any` en TypeScript. Mantener las interfaces centralizadas en `lib/types.ts` o en types locales del componente.
