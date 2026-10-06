---
description: Desglosa el plan en tareas pequeñas y verificables (specs/NNN-nombre/tasks.md)
argument-hint: "<NNN o ruta de la spec>"
---

Aplicá la skill `sdd`. Spec: $ARGUMENTS

## Precondición
`plan.md` existe y el usuario lo aprobó. Si no, detenete e indicá `/sdd-plan`.

## Pasos
1. Leé `spec.md` y `plan.md`.
2. Creá `specs/NNN-nombre/tasks.md` desde `.claude/skills/sdd/templates/tasks.md`:
   - formato `- [ ] Txx [RF-yy] Acción imperativa — Hecho cuando: condición observable.`;
   - cada tarea dura menos de 30 minutos, toca un solo módulo y deja el repo compilando;
   - cada tarea de código tiene antes su tarea de test en rojo (o `[sin test: motivo]` si es config o docs);
   - orden: migración/modelo → servicio → controller/Gateway → server action/tipos → UI → docs → cierre;
   - indicá dependencias cuando una tarea requiere otra (`(después de T03)`).
3. Verificá la cobertura: cada RF tiene al menos una tarea y un test. Listá cualquier RF sin cobertura.
4. Agregá las tareas de cierre: `/sdd-validate`, `docs/pendientes.md`, `MEMORY.md` y diagramas de `docs/` si el plan lo pide.
5. Mostrá el total de tareas por fase y esperá aprobación. Siguiente paso: `/sdd-implement`.

## No hace
- No escribe código.
- No agrega trabajo que no esté en el plan; si falta algo, lo señala para actualizar el plan.
