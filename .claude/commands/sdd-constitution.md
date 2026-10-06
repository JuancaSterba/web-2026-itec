---
description: Genera o revisa la constitución del proyecto (docs/constitution.md) contra el código actual
argument-hint: "[revisar | regla o tema a agregar]"
---

Aplicá la skill `sdd`. Tarea: mantener `docs/constitution.md`. Argumento: $ARGUMENTS

## Pasos
1. Si `docs/constitution.md` no existe, crealo con 4 secciones: simplicidad del stack, separación de interfaz y lógica, política de pruebas y protección de datos. Reglas numeradas `Cx.y`, cortas y verificables.
2. Si existe y el argumento es `revisar` (o está vacío): por cada regla, buscá en el código evidencia de cumplimiento o violación (Grep/Read). Reportá una tabla `Regla | Estado (✅/⚠️/❌) | Evidencia archivo:línea`.
3. Si el argumento propone una regla nueva o un cambio: redactala, mostrá el diff propuesto y **esperá aprobación** antes de escribir.
4. Por cada violación real que no se vaya a corregir ya, proponé un ítem para `docs/pendientes.md` (siguiente número libre) y citalo en la regla como deuda.

## Reglas
- Una regla es válida solo si se puede verificar leyendo código, config o la salida de un comando.
- No se borra ni se debilita una regla sin aprobación explícita; registrar la justificación en `MEMORY.md`.
- No modifica código de la aplicación.
