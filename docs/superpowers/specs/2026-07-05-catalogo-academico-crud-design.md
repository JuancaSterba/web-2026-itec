# Especificación de Diseño: CRUD de Catálogo Académico (Frontend)

## 1. Visión General
El backend del Core ya expone CRUD completo para Carrera, Plan de Estudio, Materia (con correlativas) y Cuatrimestre. El frontend solo tiene un placeholder vacío en `/dashboard/catalogo`. Esta feature construye la UI real de gestión (ABM) para esas 4 entidades, reemplazando el placeholder.

Fuera de alcance: Comisiones (ya tiene CRUD real en `/dashboard/comisiones`, no se toca).

## 2. Layout
`/dashboard/catalogo` pasa a ser una sola página con `Tabs` (mismo componente shadcn/radix ya usado en `ComisionDashboard`):
- Carreras
- Planes de Estudio
- Materias
- Cuatrimestres

Cada tab renderiza un view component independiente. No hay rutas nuevas — todo vive bajo la misma página, consistente con el link único "Carreras y Materias" del sidebar.

## 3. Componentes

Por cada entidad se replica el patrón ya usado en `frontend/components/comisiones/` (`ComisionesPage` + `ComisionFormDialog` + `EliminarComisionDialog`): buscador, tabla, botón "Nueva X", form dialog crear/editar, dialog de confirmación de baja.

- `frontend/components/catalogo/carreras-view.tsx` + `carrera-form-dialog.tsx` + `eliminar-carrera-dialog.tsx`
  Campos: nombre, descripción, resolución.
- `frontend/components/catalogo/planes-estudio-view.tsx` + `plan-estudio-form-dialog.tsx` + `eliminar-plan-dialog.tsx`
  Campos: validez, resolución, fechaInicio, fechaFin, dropdown Carrera (`carreraId`).
- `frontend/components/catalogo/materias-view.tsx` + `materia-form-dialog.tsx` + `eliminar-materia-dialog.tsx`
  Campos: nombre, cargaHoraria, año, cuatrimestre (1 o 2), dropdown Plan de Estudio (`planEstudioId`), checklist de correlativas.
- `frontend/components/catalogo/cuatrimestres-view.tsx` + `cuatrimestre-form-dialog.tsx` + `eliminar-cuatrimestre-dialog.tsx`
  Campos: año, número (1 o 2), fechaInicio, fechaFin, toggle "actual" (mismo patrón visual del toggle Activa/Inactiva de comisiones).

`catalogo-view.tsx` se reescribe para renderizar los 4 tabs con estos componentes.

## 4. Correlativas de Materia
El endpoint `POST /api/materias/{id}/correlativas` **reemplaza** la lista completa de correlativas (confirmado en `MateriaServiceImpl.asignarCorrelativas`: `materia.setCorrelativas(new ArrayList<>(correlativas))`). El backend valida que cada correlativa pertenezca al mismo Plan de Estudio que la materia.

En el form: al elegir/tener seleccionado un Plan de Estudio, se cargan las materias activas de ese plan (`GET /api/materias/plan/{planId}`) excluyendo la materia en edición, y se muestran como checklist. Al guardar:
1. Se crea/actualiza la materia con sus campos base (sin correlativas en el payload — `MateriaRequest` no las incluye).
2. Se llama `asignarCorrelativas(id, idsSeleccionados)` con la selección final completa del checklist (incluso si quedó vacía, para poder limpiar correlativas existentes).

No se usa el endpoint individual `DELETE /{id}/correlativas/{correlativaId}` — el reemplazo completo cubre alta y baja de correlativas en un solo paso.

## 5. Services (frontend)
- `frontend/lib/services/carreras.service.ts` (nuevo): `listarCarreras`, `crearCarrera`, `actualizarCarrera`, `desactivarCarrera`.
- `frontend/lib/services/planes-estudio.service.ts` (nuevo): `listarPlanesEstudio`, `crearPlanEstudio`, `actualizarPlanEstudio`, `desactivarPlanEstudio`.
- `frontend/lib/services/materias.service.ts` (extender, ya existe `listarMaterias`): agregar `crearMateria`, `actualizarMateria`, `desactivarMateria`, `listarMateriasPorPlan`, `asignarCorrelativas`.
- `frontend/lib/services/cuatrimestres.service.ts` (extender, ya existe `listarCuatrimestres`): agregar `crearCuatrimestre`, `actualizarCuatrimestre`, `eliminarCuatrimestre`.

Todos siguen el mismo wrapper `apiClient` y forma de retorno (`response.data[0]` para create/update) que `comisiones.service.ts`.

## 6. Data Flow entre entidades
- Plan de Estudio → dropdown flat de Carreras (todas las activas, sin cascada adicional).
- Materia → dropdown flat de Planes de Estudio.
- Correlativas de Materia → filtradas por el Plan de Estudio seleccionado en el mismo form (cascada real, ver sección 4).
- Cuatrimestre → sin dependencias, campos propios.

## 7. Manejo de errores
Sin cambios de infraestructura: mismo wrapper `apiClient` (`lib/api-client.ts`) y patrón `toast.error(err?.message || "fallback")` ya usado en Comisiones.

## 8. Baja lógica vs eliminación física
- Carrera, Plan de Estudio, Materia: `DELETE` del backend es baja lógica (`activa = false`). El dialog de confirmación dice "desactivar", igual que en Comisiones.
- Cuatrimestre: no tiene campo `activa` — el backend hace `DELETE` físico. El dialog de confirmación dice "eliminar" y advierte que no se puede deshacer.

## 9. Testing
No hay cambios de backend. Verificación: `npx tsc --noEmit` sin errores tras cada componente. Sin Playwright en este proyecto (desinstalado) — las pruebas de navegador las hace el usuario manualmente.

## 10. Fuera de alcance
- No se agrega esta vez un botón de "quitar correlativa individual" en otra pantalla (el endpoint existe en el backend pero no se consume — cubierto por el reemplazo completo del checklist).
- No se filtra Plan de Estudio por Carrera en su dropdown (queda flat, igual que Materia con Plan). Si el catálogo crece mucho, quedaría como mejora futura, no bloqueante ahora.
