# Deuda Técnica y Optimizaciones Pendientes

Este documento registra los hallazgos que requieren una mejora arquitectónica en el backend para optimizar el rendimiento y unificar los contratos de la API.

## 1. Problema N+1 en Inscripciones a Comisiones
- **Problema:** `AlumnoInscriptoResponse` devuelve `alumnoCarreraId` en lugar del `alumnoId` directo. El frontend se ve obligado a realizar peticiones en cascada (1 petición de listado + N peticiones de detalle) para poder renderizar una lista con nombres y apellidos.
- **Solución de Raíz:** Modificar el backend Core para que el endpoint de inscriptos devuelva un DTO aplanado que ya incluya `alumnoId`, `nombre` y `apellido`.

## 2. Estandarización de Contratos de Respuesta (API Wrapper)
- **Problema:** El Backend Core responde usando un envoltorio estándar (`{ meta, data, errors }`), pero los nuevos microservicios (`ms-asistencias`, `ms-notas`) devuelven JSON crudo. Esto obliga al frontend a tener múltiples métodos de parseo.
- **Solución de Raíz:** Extraer la clase `ApiResponse` del Core y colocarla en la librería compartida `backend/commons`. Luego, importar esta librería en todos los microservicios para que sus controladores envuelvan las respuestas bajo el mismo formato unificado.

## 3. Filtrado de Datos Server-Side
- **Problema:** `ms-asistencias` no posee parámetros de búsqueda (`?comisionId=X&fecha=Y`), obligando al frontend a descargar toda la tabla y filtrar en memoria.
- **Solución de Raíz:** Agregar `RequestParams` y soporte de `Specifications` o *Query Methods* en los controladores y repositorios de los microservicios transaccionales.
