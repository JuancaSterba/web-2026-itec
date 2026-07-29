# Task 1 Report: Backend - Excepciones y DTOs

## Implemented
- Created `MateriaYaAprobadaException` for handling 409 Conflict when a student already has passed the subject.
- Created `InscripcionMesaCerradaException` for handling 400 Bad Request when exam registration is closed (e.g. 48h deadline rule).
- Updated `CoreExceptionHandler` with `@ExceptionHandler` methods mapping:
  - `MateriaYaAprobadaException` -> HTTP 409 CONFLICT with error code `"MATERIA_YA_APROBADA"`
  - `InscripcionMesaCerradaException` -> HTTP 400 BAD_REQUEST with error code `"INSCRIPCION_MESA_CERRADA"`
- Verified `MesaExamenRequest` and `MesaExamenResponse` already contain required fields (`cicloLectivoId`, `turno`, `tipo`).
- Created unit tests in `CoreExceptionHandlerTest.java`.

## TDD Evidence

### RED Phase
- **Command:** `mvn test-compile -f backend/pom.xml -pl core`
- **Output:**
```
[ERROR] /C:/Users/sjcex/Documents/GitHub/itec/web-2026-itec/backend/core/src/test/java/ar/edu/itec1misiones/exception/CoreExceptionHandlerTest.java:[28,9] cannot find symbol
  symbol:   class MateriaYaAprobadaException
[ERROR] /C:/Users/sjcex/Documents/GitHub/itec/web-2026-itec/backend/core/src/test/java/ar/edu/itec1misiones/exception/CoreExceptionHandlerTest.java:[39,9] cannot find symbol
  symbol:   class InscripcionMesaCerradaException
```
- **Why expected:** The test referenced `MateriaYaAprobadaException` and `InscripcionMesaCerradaException` before they were created.

### GREEN Phase
- **Command:** `mvn test -f backend/pom.xml -pl core -Dtest=CoreExceptionHandlerTest`
- **Output:**
```
[INFO] Running ar.edu.itec1misiones.exception.CoreExceptionHandlerTest
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.046 s -- in ar.edu.itec1misiones.exception.CoreExceptionHandlerTest
[INFO] BUILD SUCCESS
```

### Full Suite Run
- **Command:** `mvn test -f backend/pom.xml -pl core`
- **Output:**
```
[INFO] Tests run: 23, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

## Files Changed
- `backend/core/src/main/java/ar/edu/itec1misiones/exception/MateriaYaAprobadaException.java` (New)
- `backend/core/src/main/java/ar/edu/itec1misiones/exception/InscripcionMesaCerradaException.java` (New)
- `backend/core/src/main/java/ar/edu/itec1misiones/exception/CoreExceptionHandler.java` (Modified)
- `backend/core/src/test/java/ar/edu/itec1misiones/exception/CoreExceptionHandlerTest.java` (New)
- `backend/core/src/test/java/ar/edu/itec1misiones/service/impl/CursadaServiceImplTest.java` (Modified - added missing `InscripcionMesaRepository` mock)

## Self-Review Findings
- **Completeness:** All required exceptions and exception handlers were implemented.
- **Quality:** Standard `ApiResponse` structure followed, consistent with existing `CoreExceptionHandler` design.
- **Discipline:** No unneeded files created.

## Issues or Concerns
None.
