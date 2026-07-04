# Deuda Técnica y Optimizaciones Pendientes

Este documento registra los hallazgos que requieren una mejora arquitectónica en el backend para optimizar el rendimiento y unificar los contratos de la API.

## 1. Problema N+1 en Inscripciones a Comisiones — ✅ Resuelto
- **Problema:** `AlumnoInscriptoResponse` devuelve `alumnoCarreraId` en lugar del `alumnoId` directo. El frontend se ve obligado a realizar peticiones en cascada (1 petición de listado + N peticiones de detalle) para poder renderizar una lista con nombres y apellidos.
- **Solución aplicada:** `AlumnoInscriptoResponse` es ahora un DTO aplanado (`alumnoId`, `nombre`, `apellido`, `dni`, `legajo`). `AlumnoInscriptoRepository` agrega `findAllConDetalle()`/`findByAlumnoCarreraIdConDetalle()` con `@Query` + `JOIN FETCH` explícito, resolviendo también el N+1 a nivel SQL (antes Hibernate disparaba una consulta adicional por fila al navegar `alumnoCarrera → alumno → user` y `comision → materia`). El frontend (`roster.service.ts`) ya no pide `/inscripciones-carreras/{id}` por alumno — un solo `GET /api/inscripciones-materias` alcanza. Validado: log de Hibernate muestra un único `SELECT` con todos los `JOIN`, sin importar la cantidad de alumnos.

## 2. Estandarización de Contratos de Respuesta (API Wrapper)
- **Problema:** El Backend Core responde usando un envoltorio estándar (`{ meta, data, errors }`), pero los nuevos microservicios (`ms-asistencias`, `ms-notas`) devuelven JSON crudo. Esto obliga al frontend a tener múltiples métodos de parseo.
- **Solución de Raíz:** Extraer la clase `ApiResponse` del Core y colocarla en la librería compartida `backend/commons`. Luego, importar esta librería en todos los microservicios para que sus controladores envuelvan las respuestas bajo el mismo formato unificado.

## 3. Filtrado de Datos Server-Side
- **Problema:** `ms-asistencias` no posee parámetros de búsqueda (`?comisionId=X&fecha=Y`), obligando al frontend a descargar toda la tabla y filtrar en memoria.
- **Solución de Raíz:** Agregar `RequestParams` y soporte de `Specifications` o *Query Methods* en los controladores y repositorios de los microservicios transaccionales.
