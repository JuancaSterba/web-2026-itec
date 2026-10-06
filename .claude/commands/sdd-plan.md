---
description: Crea el plan técnico de arquitectura (specs/NNN-nombre/plan.md) a partir de una spec clarificada
argument-hint: "<NNN o ruta de la spec>"
---

Aplicá la skill `sdd`. Spec a planificar: $ARGUMENTS

## Precondición
La spec existe, no tiene `[NECESITA ACLARACIÓN]` y el usuario la aprobó. Si no se cumple, detenete e indicá `/sdd-clarify`.

## Pasos
1. Leé la spec, `docs/constitution.md`, `MEMORY.md` (decisiones y aprendizajes) y `AGENTS.md`.
2. Explorá el código de los módulos involucrados: buscá entidades, servicios, DTOs, server actions y componentes existentes para **reutilizar** antes de proponer algo nuevo (C1.5).
3. Creá `specs/NNN-nombre/plan.md` desde `.claude/skills/sdd/templates/plan.md`:
   - tabla de archivos afectados con módulo, cambio y RF;
   - modelo de datos y migración Flyway si cambia el schema;
   - contratos de API (ruta por el Gateway, DTOs, códigos de error);
   - lógica como funciones puras y pseudocódigo;
   - decisiones con alternativa descartada y justificación;
   - chequeo de constitución regla por regla;
   - estrategia de pruebas: al menos un test por RF.
4. Si el plan agrega entidades, endpoints entre servicios o cambia flujos, indicá qué diagramas de `docs/` hay que actualizar (se agregan como tareas).
5. Mostrá el resumen y esperá aprobación. Siguiente paso: `/sdd-tasks`.

## No hace
- No escribe ni modifica código.
- No agrega dependencias ni servicios sin marcarlo como decisión que requiere aprobación (C1.2, C1.3).
