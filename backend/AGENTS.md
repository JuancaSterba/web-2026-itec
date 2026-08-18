# Agent Directives — Backend Core

@../AGENTS.md

## 📍 Contexto del Ecosistema
Este módulo es el núcleo central (Core) de datos maestros y autenticación. Si necesitas interactuar o verificar contratos:
- 🚪 **API Gateway:** `../api-gateway/` (Enrutador perimetral de `/api/v1/**`)
- 🖥️ **Frontend:** `../frontend/` (Cliente Next.js que consume las APIs expuestas)
- 📅 **MS Asistencias:** `../ms-asistencias/` (Microservicio independiente para presentismo)
- 📊 **MS Notas:** `../ms-notas/` (Microservicio independiente para evaluaciones y notas)
- 📚 **Documentación Central:** `../docs/` (DER, diagramas de clases, secuencias y reglas de negocio)
- 📌 **Única Fuente de Verdad (Tareas):** `../.remember/PENDIENTES.md`
- ⚡ **Planes / Specs de Desarrollo:** `../.superpowers/`

## 🎯 Rol y Reglas Específicas del Backend
1. **Rol de Referencia:** Ver `../.agents/backend.md`.
2. **Aislamiento de Módulos:** Mantén la separación de responsabilidades entre `commons/` (DTOs y Enums puros sin persistencia), `security/` (JWT filters y seguridad) y `core/` (servicios y JPA).
3. **Contratos DTO y ApiResponse:** Todos los endpoints deben responder respetando la envoltura estandarizada `ApiResponse<T>` de `commons`.
4. **Flyway / Migraciones:** Cualquier cambio estructural en la base de datos debe acompañarse de su script de migración SQL correspondiente en `core/src/main/resources/db/migration/`.
5. **No inventar reglas:** Consulta siempre `../docs/01.00-Reglas_de_Negocio.md` y `../docs/02.00-Modelo_Datos.md` antes de implementar nuevas validaciones.
