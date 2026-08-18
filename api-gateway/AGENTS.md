# Agent Directives — API Gateway

@../AGENTS.md

## 📍 Contexto del Ecosistema
Este módulo es el proxy inverso y enrutador perimetral de la solución ITEC 2026. Si necesitas interactuar o verificar contratos:
- 🧠 **Backend Core:** `../backend/` (Genera tokens JWT y maneja entidades maestras)
- 🖥️ **Frontend:** `../frontend/` (Cliente principal consumidor de este Gateway)
- 📅 **MS Asistencias:** `../ms-asistencias/` (Enrutado en `/api/v1/asistencias/**`)
- 📊 **MS Notas:** `../ms-notas/` (Enrutado en `/api/v1/calificaciones/**` y `/api/v1/examenes/**`)
- 📚 **Documentación Central:** `../docs/` (Specs, DER, diagramas de arquitectura)
- 📌 **Única Fuente de Verdad (Tareas):** `../.remember/PENDIENTES.md`
- ⚡ **Planes / Specs de Desarrollo:** `../.superpowers/`

## 🎯 Rol y Reglas Específicas del Gateway
1. **Rol de Referencia:** Ver `../.agents/backend.md` o `../.agents/architect.md`.
2. **Sin Acceso a Base de Datos:** Este servicio **NUNCA** debe conectarse directamente a MySQL ni persistir entidades. Solo realiza ruteo y validación criptográfica de JWTs.
3. **Sincronización de Secretos:** La variable `JWT_SECRET` debe ser idéntica a la configurada en `backend/` para no invalidar sesiones legítimas.
4. **Respeto a Contratos de Rutas:** Cualquier cambio en prefijos de URL debe reflejarse en los filtros de ruta de `application.yml` y coordinarse con el `frontend`.
