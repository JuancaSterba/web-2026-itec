---
description: Revisión tipo QA de una spec para detectar ambigüedades e inconsistencias, sin escribir código
argument-hint: "<NNN o ruta de la spec>"
---

Aplicá la skill `sdd`. Spec a clarificar: $ARGUMENTS (si está vacío, la spec más reciente de `specs/` con estado Borrador).

## Pasos
1. Leé la spec completa, `docs/constitution.md` y los docs de dominio que toca (`docs/01.00-Reglas_de_Negocio.md`, `docs/02.00-Modelo_Datos.md`, `docs/02.20-Diagrama_Estados.md`).
2. Detectá y listá, con id `Q-01…`:
   - RF con más de un "DEBE", términos vagos o no verificables;
   - contradicciones entre RF, o con los docs de dominio o la constitución;
   - casos límite sin RF (vacíos, duplicados, permisos, estados inválidos, fallas de otro servicio);
   - historias sin RF o RF sin historia;
   - cada `[NECESITA ACLARACIÓN]` existente.
3. Para cada `Q-xx`, proponé una respuesta por defecto y preguntá al usuario (máximo 5 por ronda, las más críticas primero).
4. Con las respuestas, actualizá la spec: reescribí los RF, agregá los que falten y quitá los marcadores resueltos. Si no quedan marcadores, cambiá el estado a **Clarificada**.
5. Informá: preguntas resueltas, pendientes y si la spec ya está lista para `/sdd-plan`.

## No hace
- No escribe código, plan ni tareas.
- No inventa reglas de negocio: si los docs no responden, pregunta.
