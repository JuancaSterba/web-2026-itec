# Agent Directives — MS Notas (Calificaciones)

@../AGENTS.md

## 📍 Contexto del Ecosistema
Este microservicio administra las calificaciones, evaluaciones y actas de forma transaccional y aislada. Si necesitas interactuar o verificar contratos:
- 🚪 **API Gateway:** `../api-gateway/` (Enrutador de `/api/v1/calificaciones/**` y `/api/v1/examenes/**`)
- 🧠 **Backend Core:** `../backend/` (El Core consume este MS vía `NotasClient` para regularidad y actas de examen)
- 🖥️ **Frontend:** `../frontend/` (Vistas de carga de notas y actas docentes)
- 📅 **MS Asistencias:** `../ms-asistencias/` (Microservicio complementario de asistencia)
- 📚 **Documentación Central:** `../docs/` (Diagramas de secuencia de notas, estados y reglas de evaluación)
- 📌 **Única Fuente de Verdad (Tareas):** `../.remember/PENDIENTES.md`
- ⚡ **Planes / Specs de Desarrollo:** `../.superpowers/`

## 🎯 Rol y Reglas Específicas de MS Notas
1. **Rol de Referencia:** Ver `../.agents/backend.md`.
2. **Aislamiento de Datos:** Este servicio **SOLO** debe persistir y consultar sobre su esquema `db_calificaciones`. Nunca realizar consultas JDBC/JPA directas a la base `backoffice_itec`.
3. **Escala de Calificación y Estados:** La nota mínima de aprobación y el cálculo de regularidad/promoción deben apegarse estrictamente a las especificaciones en `../docs/01.00-Reglas_de_Negocio.md` y `../docs/02.20-Diagrama_Estados.md`.
4. **Respuestas Estandarizadas:** Utilizar siempre `ApiResponse<T>` y `ErrorDto` provistos por `commons` (`ar.edu.itec1misiones.commons`).
