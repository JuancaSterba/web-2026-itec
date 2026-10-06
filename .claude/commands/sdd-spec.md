---
description: Entrevista breve y redacción de la especificación funcional (specs/NNN-nombre/spec.md)
argument-hint: "<descripción de la funcionalidad>"
---

Aplicá la skill `sdd`. Funcionalidad pedida: $ARGUMENTS

## Pasos
1. Leé `docs/constitution.md`, `docs/pendientes.md`, `MEMORY.md` y los docs de dominio relevantes (`docs/INDEX.md`). Revisá `specs/` para no duplicar una spec existente y calcular el siguiente `NNN`.
2. **Entrevista:** hacé como máximo 5 preguntas, todas juntas, sobre actores, objetivo, reglas de negocio, casos límite y fuera de alcance. No preguntes lo que ya responden los docs.
3. Con las respuestas, creá `specs/NNN-nombre/spec.md` desde `.claude/skills/sdd/templates/spec.md`:
   - historias de usuario `HU-xx`;
   - requisitos `RF-xx` en EARS (un "DEBE" por RF, verificables);
   - casos límite, cada uno cubierto por un RF;
   - lo que no quedó claro, como `[NECESITA ACLARACIÓN: …]`.
4. Chequeá la spec contra la constitución y señalá cualquier conflicto.
5. Mostrá un resumen (cantidad de HU/RF, aclaraciones pendientes) y sugerí `/sdd-clarify` como siguiente paso.

## No hace
- No menciona archivos, clases, endpoints, tablas ni tecnologías en la spec.
- No escribe plan, tareas ni código.
