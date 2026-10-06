---
name: sdd
description: Reglas del flujo Spec-Driven Development (SDD) del proyecto. Usar al escribir o revisar especificaciones, planes o tareas en specs/, al redactar requisitos funcionales en notación EARS, o al ejecutar cualquier comando /sdd-*.
---

# SDD — Spec-Driven Development

## Flujo
```
constitution → spec → clarify → plan → tasks → implement → validate
                 ↑                                              │
                 └──────────────── change ──────────────────────┘
```
| Etapa | Comando | Artefacto | Responsable |
|---|---|---|---|
| Principios | `/sdd-constitution` | `docs/constitution.md` | planner |
| Especificación | `/sdd-spec` | `specs/NNN-nombre/spec.md` | planner |
| Clarificación | `/sdd-clarify` | `spec.md` actualizado | planner |
| Plan técnico | `/sdd-plan` | `specs/NNN-nombre/plan.md` | planner |
| Tareas | `/sdd-tasks` | `specs/NNN-nombre/tasks.md` | planner |
| Implementación | `/sdd-implement` | código + tests | implementer |
| Validación | `/sdd-validate` | tabla RF → estado | reviewer |
| Cambio de requisitos | `/sdd-change` | `spec.md` + impacto en plan/tasks | planner |

## Reglas del flujo
1. **Una etapa por vez.** No se pasa a la siguiente sin que el usuario apruebe el artefacto anterior.
2. **La spec manda.** Si el código o el plan contradicen la spec, se corrige el código o el plan. Si lo que hay que cambiar es el requisito, se usa `/sdd-change` **antes** de tocar código.
3. **Constitución primero.** Toda spec y todo plan se chequean contra `docs/constitution.md`. Las violaciones se citan por regla (`C2.4`) y se resuelven o se escalan al usuario; nunca se ignoran.
4. **Sin ambigüedades abiertas.** Mientras la spec tenga algún `[NECESITA ACLARACIÓN: …]`, no se planifica.
5. **Rama por spec.** Cada spec se implementa en `feature/NNN-nombre` desde `develop`, con un commit por tarea.
6. **Cierre.** Una spec se cierra cuando: todas las tareas están tildadas, `/sdd-validate` da todos los RF en ✅, los ítems resueltos se borraron de `docs/pendientes.md` y las decisiones o aprendizajes nuevos se registraron en `MEMORY.md`.

## Ubicación y nombres
- Carpeta: `specs/NNN-nombre-en-kebab/`. `NNN` es el siguiente número libre con 3 dígitos (`001`, `002`…); nunca se reutiliza.
- Archivos: `spec.md`, `plan.md`, `tasks.md`. Plantillas en `.claude/skills/sdd/templates/`.

## Qué va en cada artefacto
| | spec.md | plan.md | tasks.md |
|---|---|---|---|
| Responde | QUÉ y POR QUÉ | CÓMO | EN QUÉ ORDEN |
| Menciona archivos, clases, stack | **Nunca** | Sí | Sí |
| Unidad | historia de usuario + RF | decisión + archivo afectado | tarea < 30 min |

## Notación de requisitos (EARS en español)
Cada requisito funcional tiene un id `RF-01`, `RF-02`… estable (no se renumera; uno eliminado queda como `~~RF-03~~ (eliminado: motivo)`).

| Patrón | Plantilla | Ejemplo |
|---|---|---|
| Ubicuo | EL SISTEMA DEBE [respuesta]. | EL SISTEMA DEBE mostrar las notas en escala de 1 a 10. |
| Evento | CUANDO [evento], EL SISTEMA DEBE [respuesta]. | CUANDO un administrativo cierra un acta, EL SISTEMA DEBE impedir nuevas cargas de notas en esa mesa. |
| Estado | MIENTRAS [estado], EL SISTEMA DEBE [respuesta]. | MIENTRAS una mesa esté cerrada, EL SISTEMA DEBE mostrar sus notas en solo lectura. |
| Opcional | DONDE [condición de configuración], EL SISTEMA DEBE [respuesta]. | DONDE la materia sea promocional, EL SISTEMA DEBE calcular la condición con el promedio de parciales. |
| No deseado | SI [situación indeseada], ENTONCES EL SISTEMA DEBE [respuesta]. | SI el alumno ya está inscripto en la comisión, ENTONCES EL SISTEMA DEBE rechazar la inscripción e informar el motivo. |

Un RF es válido solo si:
- tiene **un único "DEBE"** (si hay dos, son dos RF);
- es **verificable**: se puede escribir un test o una prueba manual con resultado sí/no;
- no usa términos vagos ("rápido", "amigable", "adecuado", "etc.") sin cuantificarlos;
- nombra actores del dominio (alumno, profesor, administrativo, admin), no componentes técnicos.

## Marcadores
- `[NECESITA ACLARACIÓN: pregunta concreta]` — dentro de la spec, en el lugar exacto de la duda.
- `[IMPACTO: RF-xx]` — en plan o tasks, cuando `/sdd-change` invalidó esa parte.

## Tareas
- Formato: `- [ ] T01 [RF-01] Descripción imperativa — Hecho cuando: condición observable.`
- Cada tarea dura < 30 min, toca un solo módulo y deja el repo compilando.
- Orden: tests y modelo antes que servicios, servicios antes que controllers, backend antes que frontend.
- Toda tarea de código empieza con su test en rojo (excepto config o docs; se marca `[sin test: motivo]`).

## Contexto del proyecto a respetar siempre
- `AGENTS.md` (estructura, comandos y guardarraíles), `docs/constitution.md`, `docs/pendientes.md`, `MEMORY.md`.
- Dominio: `docs/01.00-Reglas_de_Negocio.md`, `docs/02.00-Modelo_Datos.md`, `docs/02.20-Diagrama_Estados.md`; índice en `docs/INDEX.md`.
