# Agent Directives

## Token Efficiency & Behavior Guidelines
0. **ÚNICA FUENTE DE VERDAD (REGLA ESTRICTA):** Toda la gestión de proyecto, tareas pendientes, deudas técnicas y revisiones de UX se encuentran **ÚNICAMENTE en `.remember/PENDIENTES.md`**. Los agentes tienen estrictamente prohibido buscar, crear o mantener archivos de backlog, tareas o deudas dispersos en otras carpetas. Al iniciar, los agentes deben leer `.remember/PENDIENTES.md` y actualizarlo al completar una tarea.
1. **(REGLA ESTRICTA) Strict Read-Only Mode for Questions:** If the user asks a question, expect only an answer. DO NOT modify, create, or delete any code files. Code modifications are only allowed if the user provides an explicit command to take action (e.g., "implement this", "change the code", or "fix the bug").
2. **Be Concise (No Filler):** Provide brief and direct answers. Omit introductions, conclusions, or long explanations unless explicitly requested.
3. **Avoid Redundant Reads:** Do not re-list or re-read the directory structure repeatedly; derive it once (`ls`/glob) per session when needed.
4. **Granular Modifications:** Edit only the strictly necessary lines of code. Avoid rewriting entire files.
5. **Step-by-Step Approach:** For complex tasks, divide the work into small, verifiable steps. Make only one logical change at a time.
6. **Zero Assumptions:** If a requirement is ambiguous, stop and ask the user. Do not invent code or assume intent.
7. **Strict Git Flow (Feature Branches):** ALL new features, modifications, or stages MUST be developed in a new, separate branch (e.g., `feature/...`). Changes must be implemented in a granular way, making small, atomic commits. Once tested, the feature branch is merged into `develop` and then deleted. Direct commits to `develop` are forbidden.
8. **Flujo de Trabajo de Generación:** Para la ejecución y escritura de código delegada a un agente, el prompt debe requerir explícitamente que el agente *primero verifique si los archivos/clases ya existen* para no sobrescribirlos innecesariamente, y que *revise y valide su propio trabajo* (linting, consistencia) antes de dar el paso por finalizado.

## Agent Roles & Protocolo de Delegación (`/.agents`)
Role-based agent definitions live in `/.agents` (`architect.md`, `backend.md`, `frontend.md`, `reviewer.md`, `tester.md`, `devops.md`). Cuando una tarea requiera trabajo especializado, el agente debe adoptar o delegar el rol correspondiente:

1. 🏛️ **Decisiones Estructurales (`architect.md`):**
   - **Cuándo usar:** Si la tarea introduce nuevas tablas/entidades, nuevos endpoints entre microservicios, o cambios en flujos de datos.
   - **Acción obligatoria:** Validar consistencia contra `docs/` y actualizar los diagramas pertinentes antes de codificar.
2. 🧠 / 🖥️ **Implementación Especializada (`backend.md` / `frontend.md` / `devops.md`):**
   - **Backend (`backend.md`):** Para lógica Spring Boot, DTOs de `commons`, persistencia y clientes HTTP internos.
   - **Frontend (`frontend.md`):** Para páginas Next.js, componentes shadcn/ui, hooks y consumo del Gateway.
   - **DevOps (`devops.md`):** Para cambios en `docker-compose.yml`, Dockerfiles, variables `.env` y networking.
3. 🧪 **Fase de Verificación (`tester.md`):**
   - **Cuándo usar:** Al finalizar cualquier implementación de código o corrección de bugs.
   - **Acción obligatoria:** Ejecutar `mvn test` (en el módulo respectivo) o `npm test` y confirmar que no existan regresiones.
4. 🧐 **Fase de Auditoría (`reviewer.md`):**
   - **Cuándo usar:** Antes de mergear cualquier rama `feature/...` a `develop`.
   - **Acción obligatoria:** Revisar el diff en modo solo lectura, asegurando que no se rompa el aislamiento de bases de datos y que los tipos del Frontend coincidan con los DTOs del Backend.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
