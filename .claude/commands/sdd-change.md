---
description: Modifica requisitos en la especificación y marca su impacto antes de tocar código
argument-hint: "<NNN> <cambio pedido>"
---

Aplicá la skill `sdd`. Spec y cambio: $ARGUMENTS

## Pasos
1. Leé `spec.md`, `plan.md` y `tasks.md` de la spec.
2. Redactá el cambio en la spec:
   - RF modificado: reescribilo en EARS conservando su id;
   - RF nuevo: siguiente id libre;
   - RF eliminado: `~~RF-xx~~ (eliminado: motivo)`, nunca se renumera.
3. Agregá al final de la spec una sección `## Cambios` con fecha, RF afectados y motivo.
4. Analizá el impacto: marcá con `[IMPACTO: RF-xx]` las secciones de `plan.md` y las tareas de `tasks.md` afectadas (destildá las que ya estaban hechas y dejan de ser válidas).
5. Chequeá el cambio contra la constitución.
6. Mostrá el diff de la spec y la lista de impacto, y **esperá aprobación**. Después, el siguiente paso es actualizar el plan (`/sdd-plan`) y las tareas (`/sdd-tasks`).

## No hace
- No toca código ni tests.
