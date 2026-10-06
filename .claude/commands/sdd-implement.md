---
description: Implementa la próxima tarea atómica de tasks.md con pruebas primero (rojo → verde)
argument-hint: "<NNN> [Txx]"
---

Aplicá la skill `sdd`. Spec y tarea: $ARGUMENTS (si no se indica tarea, la primera `- [ ]` cuyas dependencias estén cumplidas).

## Precondición
`tasks.md` aprobado. Estás en la rama `feature/NNN-nombre` (si no existe, creala desde `develop`). Working tree limpio.

## Pasos (una sola tarea)
1. Leé la tarea, su RF en `spec.md` y la sección correspondiente de `plan.md`.
2. Verificá si los archivos o clases ya existen antes de crearlos.
3. **Rojo:** escribí el test que expresa el "Hecho cuando" y corrélo; confirmá que falla por la razón esperada.
4. **Verde:** escribí el código mínimo para que pase, editando solo lo necesario y siguiendo las reglas por módulo del agente `implementer`.
5. Corré los tests del módulo (`mvn test` en el proyecto Maven tocado) o `npm run build` en `frontend/`. Nada en rojo.
6. Tildá la tarea en `tasks.md`, actualizá el progreso y hacé un commit atómico: `feat(<módulo>): Txx <descripción> (RF-yy)`.
7. Informá: tarea hecha, test agregado, resultado de los tests, siguiente tarea.

## No hace
- No implementa más de una tarea por invocación.
- No cambia la spec ni el plan: si la tarea no se puede cumplir como está escrita, se detiene y sugiere `/sdd-change` o actualizar el plan.
- No modifica un test existente para que pase; si un test previo falla, lo reporta.
