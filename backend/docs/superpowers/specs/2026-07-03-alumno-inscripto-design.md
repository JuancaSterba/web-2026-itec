# Design: Inscripciones a Materias (AlumnoInscripto)

## Context

Module: Core (Spring Boot monolith)  
Branch: `feature/inscripciones-materias`  
Date: 2026-07-03

## Existing State

| File | Status |
|---|---|
| `model/AlumnoInscripto.java` | Complete |
| `repository/AlumnoInscriptoRepository.java` | Exists, needs 2 custom queries |
| `exception/AlumnoYaInscriptoException.java` | Exists (used by AlumnoCarrera, not reused here) |

## What to Build

### New Files

- `exception/AlumnoInscriptoNotFoundException.java`
- `exception/AlumnoYaInscriptoEnMateriaException.java`
- `exception/ComisionInactivaException.java`
- `exception/CupoComisionLlenoException.java`
- `dto/request/AlumnoInscriptoRequest.java`
- `dto/response/AlumnoInscriptoResponse.java`
- `service/AlumnoInscriptoService.java`
- `service/impl/AlumnoInscriptoServiceImpl.java`
- `controller/AlumnoInscriptoController.java`

### Modified Files

- `repository/AlumnoInscriptoRepository.java` — add `existsByAlumnoCarreraIdAndComisionId`, `countByComisionId`
- `exception/CoreExceptionHandler.java` — add 4 handlers

## REST API

| Method | Path | Auth |
|---|---|---|
| GET | `/api/inscripciones-materias` | public |
| GET | `/api/inscripciones-materias/{id}` | public |
| GET | `/api/inscripciones-materias/alumno-carrera/{alumnoCarreraId}` | public |
| POST | `/api/inscripciones-materias` | ADMIN / ADMINISTRATIVO |
| DELETE | `/api/inscripciones-materias/{id}` | ADMIN / ADMINISTRATIVO |

## DTOs

**Request:** `alumnoCarreraId` (Long, @NotNull), `comisionMateriaId` (Long, @NotNull)

**Response:** `id`, `alumnoCarreraId`, `alumnoNombreCompleto`, `comisionMateriaId`, `materiaNombre`, `comisionNombre`, `estado` (EstadoCursada), `notaFinal`

## Business Rules (create)

1. `AlumnoCarrera` exists → `AlumnoCarreraNotFoundException`
2. `ComisionMateria` exists → `ComisionNotFoundException`
3. `comision.activa == true` → `ComisionInactivaException` (HTTP 400)
4. No duplicate: `existsByAlumnoCarreraIdAndComisionId` → `AlumnoYaInscriptoEnMateriaException` (HTTP 409)
5. Cupo: `countByComisionId < comision.cupo` → `CupoComisionLlenoException` (HTTP 409)
6. Persist with `estado = REGULAR`

## Cupo Validation Strategy

Option A (chosen): derived Spring Data query `countByComisionId(Long comisionId)`.  
Avoids loading the full inscriptos list. Consistent with existing repo patterns.
