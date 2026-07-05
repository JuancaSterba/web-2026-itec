# Especificación de Diseño: Inscripción de Alumnos (Carrera → Comisión)

## 1. Visión General
El backend ya cubre por completo la inscripción de alumnos a Carreras (`AlumnoCarreraController`, `/api/inscripciones-carreras`) y a Comisiones de Materia (`AlumnoInscriptoController`, `/api/inscripciones-materias`), incluida la búsqueda de alumno por DNI (`GET /api/alumnos/dni/{dni}`). Nada de esto está conectado en el frontend: `comision-dashboard.tsx` tiene la cabecera hardcodeada y el tab de alumnos es un placeholder estático; `/dashboard/alumnos` no tiene acción de inscripción a carrera; `/dashboard/comisiones` no permite filtrar por carrera.

Esta feature conecta todo el flujo: dar de alta un alumno (ya existe) → inscribirlo en una Carrera (pantalla propia) → ubicar su Comisión (filtro por Carrera) → inscribirlo a esa Comisión buscándolo por DNI, dentro del dashboard real de esa Comisión.

Fuera de alcance: cambios de backend (no hacen falta, confirmado por exploración previa — ver sección 7).

## 2. Inscripción a Carrera (pantalla propia)
En `/dashboard/alumnos`, cada fila de la tabla de alumnos suma una acción "Inscribir en Carrera" que abre `inscribir-carrera-dialog.tsx` (nuevo). El dialog muestra:
- Lista de las carreras en las que el alumno ya está inscripto (`GET /api/inscripciones-carreras/alumno/{alumnoId}`), cada una con botón "Quitar" (`DELETE /api/inscripciones-carreras/{id}`).
- Form de alta: dropdown Carrera → dropdown Plan de Estudio (filtrado por esa carrera, usando `planes-estudio.service.ts` ya existente) → input Año de Ingreso (prellenado con el año actual) → botón "Inscribir" (`POST /api/inscripciones-carreras` con `alumnoId, carreraId, planEstudioId, anioIngreso`).

Es un acto administrativo independiente del cursado — un alumno se inscribe una vez por carrera, no por cuatrimestre.

## 3. Filtro por Carrera en Comisiones
En `/dashboard/comisiones`, se agrega un dropdown "Carrera" sobre la tabla existente. `ComisionResponse` no trae carrera directa (la cadena real es Comisión → Materia → Plan de Estudio → Carrera), así que se resuelve en el cliente: al cargar la página, además de `listarComisiones()` se cargan `listarMaterias()` y `listarPlanesEstudio()` (ambos servicios ya existen de la feature de Catálogo) y se arma un mapa `materiaId → { carreraId, carreraNombre }` cruzando `materia.planEstudioId` con `plan.carreraId`/`plan.carreraNombre`. Se agrega también una columna "Carrera" a la tabla, derivada del mismo mapa. El botón "Ver dashboard" que ya existe no cambia — sigue llevando al dashboard de esa comisión.

## 4. Dashboard de Comisión — de placeholder a datos reales
`comision-dashboard.tsx` hoy no recibe ni pide datos: la cabecera está hardcodeada (“Programación I”, “Juan Pérez”) y el tab “Alumnos Inscriptos” es un `<div>` fijo. Se agrega `obtenerComisionPorId(id)` a `comisiones.service.ts` (`GET /api/core/comisiones/{id}`, ya existe en el backend). La cabecera pasa a mostrar materia, cuatrimestre y profesor reales (todos ya vienen denormalizados en `ComisionResponse`: `materiaNombre`, `cuatrimestreAnio`, `cuatrimestreNumero`, `profesorNombre`, `profesorApellido`). Para mostrar la Carrera en la cabecera se resuelve la misma cadena Materia→Plan que en la sección 3 (una sola vez, para esta comisión puntual).

El tab “Alumnos Inscriptos” pasa a renderizar `roster-comision-view.tsx` (nuevo), que:
- Lista la nómina con `obtenerRosterComision(comisionId)` (ya existe en `roster.service.ts`, sin cambios — solo se conecta a la UI).
- Cada fila tiene botón "Quitar" → `eliminarInscripcionMateria(id)` (nueva función en `inscripciones.service.ts`, `DELETE /api/inscripciones-materias/{id}`).
- Botón "Inscribir alumno" abre `inscribir-alumno-dialog.tsx` (nuevo, ver sección 5).

## 5. Inscribir alumno por DNI (dentro de la Comisión)
`inscribir-alumno-dialog.tsx` recibe como props `comisionId` y la `carreraId` de esa comisión (ya resuelta por el dashboard, sección 4). Flujo:
1. Input DNI + botón "Buscar" → `buscarAlumnoPorDni(dni)` (nueva función en `alumnos.service.ts`, `GET /api/core/alumnos/dni/{dni}`, endpoint backend ya existe). Si no encuentra, error "No se encontró un alumno con ese DNI".
2. Si lo encuentra, se consulta `GET /api/inscripciones-carreras/alumno/{alumnoId}` y se busca una inscripción cuya `carreraId` coincida con la de esta comisión.
   - Si no hay ninguna: error explícito "Este alumno no está inscripto en [Carrera]. Inscribilo primero desde Alumnos." — no se auto-inscribe (decisión explícita: pantallas separadas, sección 2).
   - Si hay una: se toma su `id` como `alumnoCarreraId`.
3. `POST /api/inscripciones-materias` con `{ alumnoCarreraId, comisionMateriaId: comisionId }` (confirmado: `comisionMateriaId` del request es el mismo id que `Comision.id` en todo el resto del frontend — la entidad backend se llama `ComisionMateria` pero es la misma "Comisión" que ya maneja `comisiones.service.ts`).
4. Éxito → cierra el dialog, refresca la nómina.

## 6. Servicios (frontend) — resumen de cambios
- `alumnos.service.ts`: agregar `buscarAlumnoPorDni(dni: string): Promise<Alumno>`.
- `comisiones.service.ts`: agregar `obtenerComisionPorId(id: number): Promise<Comision>`.
- `inscripciones.service.ts` (hoy solo tiene `listarInscripciones`): agregar `crearInscripcionMateria(input: { alumnoCarreraId: number; comisionMateriaId: number }): Promise<InscripcionMateria>` y `eliminarInscripcionMateria(id: number): Promise<void>`.
- `inscripciones-carreras.service.ts` (nuevo): `listarInscripcionesCarreraPorAlumno(alumnoId): Promise<InscripcionCarrera[]>`, `crearInscripcionCarrera(input): Promise<InscripcionCarrera>`, `eliminarInscripcionCarrera(id): Promise<void>`.

Todos siguen el wrapper `apiClient` y la convención `/api/core/...` + `response.data[0]` para alta/baja ya usada en el resto del proyecto.

## 7. Por qué no hace falta tocar el backend
Se verificó explícitamente antes de diseñar: `AlumnoController` ya tiene `GET /dni/{dni}`; `AlumnoCarreraController` y `AlumnoInscriptoController` ya tienen CRUD completo; `comisionMateriaId` ya es el mismo id que usa el resto del sistema para "Comisión" (la entidad se llama `ComisionMateria` pero no hay dos ids distintos). El único costo es hacer 2-3 llamadas encadenadas desde el frontend en vez de un endpoint combinado — aceptable para el volumen de uso (alta manual, no un flujo masivo).

## 8. Manejo de errores
Mismo patrón ya establecido: `toast.error(err?.message || "fallback")`. Casos de negocio explícitos (alumno no encontrado por DNI, alumno no inscripto en la carrera) se muestran como texto de error dentro del dialog, no solo como toast, para que no se pierdan al reintentar.

## 9. Testing
Sin cambios de backend. Verificación: `npx tsc --noEmit` sin errores nuevos por task. Pruebas de navegador las hace el usuario manualmente (Playwright desinstalado de este proyecto).

## 10. Fuera de alcance
- No se agrega un endpoint backend combinado "inscribir por DNI + comisión". Si en el futuro el volumen de inscripciones masivas lo justifica, se puede revisar.
- No se cascadea ni se avisa especialmente si se da de baja una inscripción a Carrera mientras el alumno tiene inscripciones a Comisiones activas bajo esa carrera — se deja el comportamiento que ya tenga el backend, sin lógica extra en el frontend.
- No se toca `/dashboard/comisiones` más allá del filtro y la columna de Carrera (sección 3) — el resto del CRUD de Comisiones sigue igual.
