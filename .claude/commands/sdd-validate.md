---
description: Valida uno por uno los requisitos funcionales de una spec contra el código y los tests
argument-hint: "<NNN o ruta de la spec>"
---

Aplicá la skill `sdd`. Spec a validar: $ARGUMENTS

## Pasos
1. Leé `spec.md`, `plan.md` y `tasks.md`. Si quedan tareas sin tildar, listalas.
2. Corré los tests de los módulos tocados (`mvn test` por proyecto Maven, `npm run build` en `frontend/`).
3. Por cada RF, buscá la evidencia: el test que lo cubre (archivo y método) y su resultado, o la verificación manual/E2E (`docker compose up --build -d` + curl contra el Gateway) cuando no hay test posible.
4. Entregá una tabla:

   | RF | Requisito | Evidencia | Estado |
   |---|---|---|---|
   | RF-01 | … | `XServiceImplTest.deberia…` ✅ | ✅ Cumple |

   Estados: ✅ Cumple · ⚠️ Parcial · ❌ No cumple · ❓ Sin evidencia.
5. Revisá también la constitución sobre el diff de la rama (`git diff develop...HEAD`).
6. Si todo está en ✅: marcá la spec como **Implementada**, borrá de `docs/pendientes.md` los ítems que resuelve y proponé las entradas para `MEMORY.md`. Si no, listá qué falta como tareas nuevas.

## No hace
- No corrige código: reporta. Las correcciones vuelven por `/sdd-implement`.
