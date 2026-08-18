# Agent Directives — MS Asistencias

@../AGENTS.md

## 📍 Contexto del Ecosistema
Este microservicio maneja de forma transaccional y aislada el presentismo de las comisiones. Si necesitas interactuar o verificar contratos:
- 🚪 **API Gateway:** `../api-gateway/` (Enrutador que redirige `/api/v1/asistencias/**` a este servicio)
- 🧠 **Backend Core:** `../backend/` (Servicio al que consulta este MS para validar comisiones/horarios vía `HorarioClient`)
- 🖥️ **Frontend:** `../frontend/` (Vistas de toma de asistencia)
- 📊 **MS Notas:** `../ms-notas/` (Microservicio complementario de calificaciones)
- 📚 **Documentación Central:** `../docs/` (Diagramas de secuencia de asistencias y reglas de regularidad)
- 📌 **Única Fuente de Verdad (Tareas):** `../.remember/PENDIENTES.md`
- ⚡ **Planes / Specs de Desarrollo:** `../.superpowers/`

## 🎯 Rol y Reglas Específicas de MS Asistencias
1. **Rol de Referencia:** Ver `../.agents/backend.md`.
2. **Aislamiento de Datos:** Este servicio **SOLO** debe interactuar con su esquema `db_asistencias`. Nunca acceder directamente a la base `backoffice_itec`. Toda información externa se obtiene por API REST (`CORE_API_URL`).
3. **Regla de Negocio del 70%:** La condición de regularidad por asistencia requiere un mínimo del 70% de presentismo. Ver `../docs/01.00-Reglas_de_Negocio.md`.
4. **Respuestas Estandarizadas:** Utilizar siempre las clases `ApiResponse<T>` y `ErrorDto` provistas por el módulo `commons` (`ar.edu.itec1misiones.commons`).
