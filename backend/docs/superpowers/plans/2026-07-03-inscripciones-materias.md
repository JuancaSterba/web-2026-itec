# Inscripciones a Materias (AlumnoInscripto) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar el CRUD completo de `AlumnoInscripto` — inscripción de un AlumnoCarrera a una ComisionMateria — con validación de cupo, estado activo y duplicados.

**Architecture:** Sigue el patrón existente del módulo `core`: excepción → DTO → repositorio → servicio (interfaz + impl) → controlador REST. La entidad `AlumnoInscripto` ya existe; solo se añaden queries custom al repositorio y se construye la capa de negocio sobre él.

**Tech Stack:** Java 17, Spring Boot 3, Spring Data JPA, Lombok, Jakarta Validation, Maven multi-módulo (módulo `core`).

## Global Constraints

- Paquete base: `ar.edu.itec1misiones`
- Módulo Maven: `core`
- Rama: `feature/inscripciones-materias`
- Commits atómicos por tarea
- `@RequiredArgsConstructor` en lugar de `@Autowired`
- `@Transactional(readOnly = true)` en métodos de lectura
- Respuestas envueltas en `ApiResponse<T>` con `MetaBuilderHelper.buildMeta(httpRequest)`

---

### Task 1: Excepciones

**Files:**
- Create: `core/src/main/java/ar/edu/itec1misiones/exception/AlumnoInscriptoNotFoundException.java`
- Create: `core/src/main/java/ar/edu/itec1misiones/exception/AlumnoYaInscriptoEnMateriaException.java`
- Create: `core/src/main/java/ar/edu/itec1misiones/exception/ComisionInactivaException.java`
- Create: `core/src/main/java/ar/edu/itec1misiones/exception/CupoComisionLlenoException.java`

**Interfaces:**
- Produces: 4 clases `RuntimeException` usadas en Task 4 (servicio) y Task 5 (handler)

- [ ] **Step 1: Crear AlumnoInscriptoNotFoundException**

```java
package ar.edu.itec1misiones.exception;

public class AlumnoInscriptoNotFoundException extends RuntimeException {
    public AlumnoInscriptoNotFoundException(Long id) {
        super("No se encontró la inscripción a materia con id " + id);
    }
}
```

- [ ] **Step 2: Crear AlumnoYaInscriptoEnMateriaException**

```java
package ar.edu.itec1misiones.exception;

public class AlumnoYaInscriptoEnMateriaException extends RuntimeException {
    public AlumnoYaInscriptoEnMateriaException(Long alumnoCarreraId, Long comisionId) {
        super("El alumnoCarrera con id " + alumnoCarreraId +
              " ya está inscripto en la comisión con id " + comisionId);
    }
}
```

- [ ] **Step 3: Crear ComisionInactivaException**

```java
package ar.edu.itec1misiones.exception;

public class ComisionInactivaException extends RuntimeException {
    public ComisionInactivaException(Long comisionId) {
        super("La comisión con id " + comisionId + " no está activa");
    }
}
```

- [ ] **Step 4: Crear CupoComisionLlenoException**

```java
package ar.edu.itec1misiones.exception;

public class CupoComisionLlenoException extends RuntimeException {
    public CupoComisionLlenoException(Long comisionId) {
        super("La comisión con id " + comisionId + " no tiene cupo disponible");
    }
}
```

- [ ] **Step 5: Commit**

```bash
git add core/src/main/java/ar/edu/itec1misiones/exception/AlumnoInscriptoNotFoundException.java \
        core/src/main/java/ar/edu/itec1misiones/exception/AlumnoYaInscriptoEnMateriaException.java \
        core/src/main/java/ar/edu/itec1misiones/exception/ComisionInactivaException.java \
        core/src/main/java/ar/edu/itec1misiones/exception/CupoComisionLlenoException.java
git commit -m "feat(core): agregar excepciones para AlumnoInscripto"
```

---

### Task 2: DTOs

**Files:**
- Create: `core/src/main/java/ar/edu/itec1misiones/dto/request/AlumnoInscriptoRequest.java`
- Create: `core/src/main/java/ar/edu/itec1misiones/dto/response/AlumnoInscriptoResponse.java`

**Interfaces:**
- Produces: `AlumnoInscriptoRequest` (usado en Task 3 servicio y Task 4 controlador), `AlumnoInscriptoResponse` (idem)

- [ ] **Step 1: Crear AlumnoInscriptoRequest**

```java
package ar.edu.itec1misiones.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AlumnoInscriptoRequest {

    @NotNull(message = "El ID del alumno-carrera es obligatorio")
    private Long alumnoCarreraId;

    @NotNull(message = "El ID de la comisión es obligatorio")
    private Long comisionMateriaId;
}
```

- [ ] **Step 2: Crear AlumnoInscriptoResponse**

```java
package ar.edu.itec1misiones.dto.response;

import ar.edu.itec1misiones.model.EstadoCursada;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlumnoInscriptoResponse {
    private Long id;
    private Long alumnoCarreraId;
    private String alumnoNombreCompleto;
    private Long comisionMateriaId;
    private String materiaNombre;
    private String comisionNombre;
    private EstadoCursada estado;
    private Double notaFinal;
}
```

- [ ] **Step 3: Commit**

```bash
git add core/src/main/java/ar/edu/itec1misiones/dto/request/AlumnoInscriptoRequest.java \
        core/src/main/java/ar/edu/itec1misiones/dto/response/AlumnoInscriptoResponse.java
git commit -m "feat(core): agregar DTOs request/response para AlumnoInscripto"
```

---

### Task 3: Repositorio — queries custom

**Files:**
- Modify: `core/src/main/java/ar/edu/itec1misiones/repository/AlumnoInscriptoRepository.java`

**Interfaces:**
- Produces:
  - `existsByAlumnoCarreraIdAndComisionId(Long, Long): boolean`
  - `countByComisionId(Long): long`
  - `findByAlumnoCarreraId(Long): List<AlumnoInscripto>`

- [ ] **Step 1: Reemplazar contenido del repositorio**

```java
package ar.edu.itec1misiones.repository;

import ar.edu.itec1misiones.model.AlumnoInscripto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlumnoInscriptoRepository extends JpaRepository<AlumnoInscripto, Long> {
    boolean existsByAlumnoCarreraIdAndComisionId(Long alumnoCarreraId, Long comisionId);
    long countByComisionId(Long comisionId);
    List<AlumnoInscripto> findByAlumnoCarreraId(Long alumnoCarreraId);
}
```

- [ ] **Step 2: Commit**

```bash
git add core/src/main/java/ar/edu/itec1misiones/repository/AlumnoInscriptoRepository.java
git commit -m "feat(core): agregar queries custom a AlumnoInscriptoRepository"
```

---

### Task 4: Servicio — interfaz, implementación y tests unitarios

**Files:**
- Create: `core/src/main/java/ar/edu/itec1misiones/service/AlumnoInscriptoService.java`
- Create: `core/src/main/java/ar/edu/itec1misiones/service/impl/AlumnoInscriptoServiceImpl.java`
- Create: `core/src/test/java/ar/edu/itec1misiones/service/AlumnoInscriptoServiceImplTest.java`

**Interfaces:**
- Consumes (de tasks anteriores):
  - `AlumnoInscriptoRepository.existsByAlumnoCarreraIdAndComisionId`
  - `AlumnoInscriptoRepository.countByComisionId`
  - `AlumnoInscriptoRepository.findByAlumnoCarreraId`
  - `AlumnoInscriptoRequest`, `AlumnoInscriptoResponse`
  - Las 4 excepciones de Task 1 + `AlumnoCarreraNotFoundException`, `ComisionNotFoundException`
- Produces:
  - `AlumnoInscriptoService.getAll(): List<AlumnoInscriptoResponse>`
  - `AlumnoInscriptoService.getById(Long): AlumnoInscriptoResponse`
  - `AlumnoInscriptoService.getByAlumnoCarreraId(Long): List<AlumnoInscriptoResponse>`
  - `AlumnoInscriptoService.create(AlumnoInscriptoRequest): AlumnoInscriptoResponse`
  - `AlumnoInscriptoService.delete(Long): void`

- [ ] **Step 1: Crear interfaz AlumnoInscriptoService**

```java
package ar.edu.itec1misiones.service;

import ar.edu.itec1misiones.dto.request.AlumnoInscriptoRequest;
import ar.edu.itec1misiones.dto.response.AlumnoInscriptoResponse;

import java.util.List;

public interface AlumnoInscriptoService {
    List<AlumnoInscriptoResponse> getAll();
    AlumnoInscriptoResponse getById(Long id);
    List<AlumnoInscriptoResponse> getByAlumnoCarreraId(Long alumnoCarreraId);
    AlumnoInscriptoResponse create(AlumnoInscriptoRequest request);
    void delete(Long id);
}
```

- [ ] **Step 2: Escribir los tests unitarios (fallan — la impl no existe aún)**

```java
package ar.edu.itec1misiones.service;

import ar.edu.itec1misiones.dto.request.AlumnoInscriptoRequest;
import ar.edu.itec1misiones.dto.response.AlumnoInscriptoResponse;
import ar.edu.itec1misiones.exception.*;
import ar.edu.itec1misiones.model.*;
import ar.edu.itec1misiones.repository.*;
import ar.edu.itec1misiones.service.impl.AlumnoInscriptoServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AlumnoInscriptoServiceImplTest {

    @Mock AlumnoInscriptoRepository inscriptoRepository;
    @Mock AlumnoCarreraRepository alumnoCarreraRepository;
    @Mock ComisionMateriaRepository comisionMateriaRepository;

    @InjectMocks AlumnoInscriptoServiceImpl service;

    private AlumnoInscriptoRequest buildRequest(Long alumnoCarreraId, Long comisionId) {
        AlumnoInscriptoRequest r = new AlumnoInscriptoRequest();
        r.setAlumnoCarreraId(alumnoCarreraId);
        r.setComisionMateriaId(comisionId);
        return r;
    }

    @Test
    void create_throwsAlumnoCarreraNotFoundException_whenNotFound() {
        when(alumnoCarreraRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create(buildRequest(1L, 2L)))
                .isInstanceOf(AlumnoCarreraNotFoundException.class);
    }

    @Test
    void create_throwsComisionNotFoundException_whenNotFound() {
        AlumnoCarrera ac = new AlumnoCarrera();
        when(alumnoCarreraRepository.findById(1L)).thenReturn(Optional.of(ac));
        when(comisionMateriaRepository.findById(2L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create(buildRequest(1L, 2L)))
                .isInstanceOf(ComisionNotFoundException.class);
    }

    @Test
    void create_throwsComisionInactivaException_whenInactiva() {
        AlumnoCarrera ac = new AlumnoCarrera();
        ComisionMateria cm = new ComisionMateria();
        cm.setActiva(false);
        cm.setCupo(30);
        when(alumnoCarreraRepository.findById(1L)).thenReturn(Optional.of(ac));
        when(comisionMateriaRepository.findById(2L)).thenReturn(Optional.of(cm));

        assertThatThrownBy(() -> service.create(buildRequest(1L, 2L)))
                .isInstanceOf(ComisionInactivaException.class);
    }

    @Test
    void create_throwsAlumnoYaInscriptoEnMateriaException_whenDuplicate() {
        AlumnoCarrera ac = new AlumnoCarrera();
        ComisionMateria cm = new ComisionMateria();
        cm.setActiva(true);
        cm.setCupo(30);
        when(alumnoCarreraRepository.findById(1L)).thenReturn(Optional.of(ac));
        when(comisionMateriaRepository.findById(2L)).thenReturn(Optional.of(cm));
        when(inscriptoRepository.existsByAlumnoCarreraIdAndComisionId(1L, 2L)).thenReturn(true);

        assertThatThrownBy(() -> service.create(buildRequest(1L, 2L)))
                .isInstanceOf(AlumnoYaInscriptoEnMateriaException.class);
    }

    @Test
    void create_throwsCupoComisionLlenoException_whenCupoAgotado() {
        AlumnoCarrera ac = new AlumnoCarrera();
        ComisionMateria cm = new ComisionMateria();
        cm.setId(2L);
        cm.setActiva(true);
        cm.setCupo(2);
        when(alumnoCarreraRepository.findById(1L)).thenReturn(Optional.of(ac));
        when(comisionMateriaRepository.findById(2L)).thenReturn(Optional.of(cm));
        when(inscriptoRepository.existsByAlumnoCarreraIdAndComisionId(1L, 2L)).thenReturn(false);
        when(inscriptoRepository.countByComisionId(2L)).thenReturn(2L);

        assertThatThrownBy(() -> service.create(buildRequest(1L, 2L)))
                .isInstanceOf(CupoComisionLlenoException.class);
    }

    @Test
    void create_persistsWithEstadoRegular() {
        // Arrange
        AlumnoCarrera ac = new AlumnoCarrera();
        ac.setId(1L);

        User user = new User();
        user.setNombre("Juan");
        user.setApellido("Perez");
        Alumno alumno = new Alumno();
        alumno.setUser(user);
        ac.setAlumno(alumno);

        Materia materia = new Materia();
        materia.setNombre("Matemática I");

        ComisionMateria cm = new ComisionMateria();
        cm.setId(2L);
        cm.setNombre("A");
        cm.setActiva(true);
        cm.setCupo(30);
        cm.setMateria(materia);

        AlumnoInscripto saved = new AlumnoInscripto();
        saved.setId(10L);
        saved.setAlumnoCarrera(ac);
        saved.setComision(cm);
        saved.setEstado(EstadoCursada.REGULAR);

        when(alumnoCarreraRepository.findById(1L)).thenReturn(Optional.of(ac));
        when(comisionMateriaRepository.findById(2L)).thenReturn(Optional.of(cm));
        when(inscriptoRepository.existsByAlumnoCarreraIdAndComisionId(1L, 2L)).thenReturn(false);
        when(inscriptoRepository.countByComisionId(2L)).thenReturn(0L);
        when(inscriptoRepository.save(any(AlumnoInscripto.class))).thenReturn(saved);

        // Act
        AlumnoInscriptoResponse response = service.create(buildRequest(1L, 2L));

        // Assert
        assertThat(response.getId()).isEqualTo(10L);
        assertThat(response.getEstado()).isEqualTo(EstadoCursada.REGULAR);
        assertThat(response.getAlumnoNombreCompleto()).isEqualTo("Juan Perez");

        verify(inscriptoRepository).save(argThat(i ->
                i.getEstado() == EstadoCursada.REGULAR &&
                i.getAlumnoCarrera() == ac &&
                i.getComision() == cm
        ));
    }
}
```

- [ ] **Step 3: Ejecutar tests — deben FALLAR (impl no existe)**

```bash
cd backend
mvn test -pl core -Dtest=AlumnoInscriptoServiceImplTest -am -q
```

Esperado: error de compilación o `ClassNotFoundException` sobre `AlumnoInscriptoServiceImpl`.

- [ ] **Step 4: Crear AlumnoInscriptoServiceImpl**

```java
package ar.edu.itec1misiones.service.impl;

import ar.edu.itec1misiones.dto.request.AlumnoInscriptoRequest;
import ar.edu.itec1misiones.dto.response.AlumnoInscriptoResponse;
import ar.edu.itec1misiones.exception.*;
import ar.edu.itec1misiones.model.*;
import ar.edu.itec1misiones.repository.*;
import ar.edu.itec1misiones.service.AlumnoInscriptoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class AlumnoInscriptoServiceImpl implements AlumnoInscriptoService {

    private final AlumnoInscriptoRepository alumnoInscriptoRepository;
    private final AlumnoCarreraRepository alumnoCarreraRepository;
    private final ComisionMateriaRepository comisionMateriaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AlumnoInscriptoResponse> getAll() {
        return alumnoInscriptoRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AlumnoInscriptoResponse getById(Long id) {
        return toResponse(alumnoInscriptoRepository.findById(id)
                .orElseThrow(() -> new AlumnoInscriptoNotFoundException(id)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AlumnoInscriptoResponse> getByAlumnoCarreraId(Long alumnoCarreraId) {
        if (!alumnoCarreraRepository.existsById(alumnoCarreraId)) {
            throw new AlumnoCarreraNotFoundException(alumnoCarreraId);
        }
        return alumnoInscriptoRepository.findByAlumnoCarreraId(alumnoCarreraId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public AlumnoInscriptoResponse create(AlumnoInscriptoRequest request) {
        AlumnoCarrera alumnoCarrera = alumnoCarreraRepository.findById(request.getAlumnoCarreraId())
                .orElseThrow(() -> new AlumnoCarreraNotFoundException(request.getAlumnoCarreraId()));

        ComisionMateria comision = comisionMateriaRepository.findById(request.getComisionMateriaId())
                .orElseThrow(() -> new ComisionNotFoundException(request.getComisionMateriaId()));

        if (!comision.isActiva()) {
            throw new ComisionInactivaException(comision.getId());
        }

        if (alumnoInscriptoRepository.existsByAlumnoCarreraIdAndComisionId(
                request.getAlumnoCarreraId(), request.getComisionMateriaId())) {
            throw new AlumnoYaInscriptoEnMateriaException(
                    request.getAlumnoCarreraId(), request.getComisionMateriaId());
        }

        long inscriptosActuales = alumnoInscriptoRepository.countByComisionId(comision.getId());
        if (inscriptosActuales >= comision.getCupo()) {
            throw new CupoComisionLlenoException(comision.getId());
        }

        AlumnoInscripto inscripcion = new AlumnoInscripto();
        inscripcion.setAlumnoCarrera(alumnoCarrera);
        inscripcion.setComision(comision);
        inscripcion.setEstado(EstadoCursada.REGULAR);

        return toResponse(alumnoInscriptoRepository.save(inscripcion));
    }

    @Override
    public void delete(Long id) {
        if (!alumnoInscriptoRepository.existsById(id)) {
            throw new AlumnoInscriptoNotFoundException(id);
        }
        alumnoInscriptoRepository.deleteById(id);
    }

    private AlumnoInscriptoResponse toResponse(AlumnoInscripto i) {
        AlumnoCarrera ac = i.getAlumnoCarrera();
        Alumno alumno = ac.getAlumno();
        String nombreCompleto = alumno.getUser().getNombre() + " " + alumno.getUser().getApellido();
        ComisionMateria cm = i.getComision();

        return AlumnoInscriptoResponse.builder()
                .id(i.getId())
                .alumnoCarreraId(ac.getId())
                .alumnoNombreCompleto(nombreCompleto)
                .comisionMateriaId(cm.getId())
                .materiaNombre(cm.getMateria().getNombre())
                .comisionNombre(cm.getNombre())
                .estado(i.getEstado())
                .notaFinal(i.getNotaFinal())
                .build();
    }
}
```

- [ ] **Step 5: Ejecutar tests — deben PASAR**

```bash
cd backend
mvn test -pl core -Dtest=AlumnoInscriptoServiceImplTest -am -q
```

Esperado: `BUILD SUCCESS`, 6 tests passed.

- [ ] **Step 6: Commit**

```bash
git add core/src/main/java/ar/edu/itec1misiones/service/AlumnoInscriptoService.java \
        core/src/main/java/ar/edu/itec1misiones/service/impl/AlumnoInscriptoServiceImpl.java \
        core/src/test/java/ar/edu/itec1misiones/service/AlumnoInscriptoServiceImplTest.java
git commit -m "feat(core): agregar AlumnoInscriptoService con logica de negocio y tests"
```

---

### Task 5: Controlador REST y handlers de excepción

**Files:**
- Create: `core/src/main/java/ar/edu/itec1misiones/controller/AlumnoInscriptoController.java`
- Modify: `core/src/main/java/ar/edu/itec1misiones/exception/CoreExceptionHandler.java`

**Interfaces:**
- Consumes:
  - `AlumnoInscriptoService` (todos sus métodos)
  - `AlumnoInscriptoNotFoundException`, `AlumnoYaInscriptoEnMateriaException`, `ComisionInactivaException`, `CupoComisionLlenoException`
  - `ApiResponse<T>`, `MetaBuilderHelper.buildMeta(HttpServletRequest)`

- [ ] **Step 1: Crear AlumnoInscriptoController**

```java
package ar.edu.itec1misiones.controller;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.request.AlumnoInscriptoRequest;
import ar.edu.itec1misiones.dto.response.AlumnoInscriptoResponse;
import ar.edu.itec1misiones.dto.response.MetaBuilderHelper;
import ar.edu.itec1misiones.service.AlumnoInscriptoService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inscripciones-materias")
@RequiredArgsConstructor
public class AlumnoInscriptoController {

    private final AlumnoInscriptoService alumnoInscriptoService;

    @GetMapping
    public ResponseEntity<ApiResponse<AlumnoInscriptoResponse>> getAll(HttpServletRequest httpRequest) {
        List<AlumnoInscriptoResponse> inscripciones = alumnoInscriptoService.getAll();
        return ResponseEntity.ok(
                ApiResponse.<AlumnoInscriptoResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(inscripciones)
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AlumnoInscriptoResponse>> getById(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        AlumnoInscriptoResponse inscripcion = alumnoInscriptoService.getById(id);
        return ResponseEntity.ok(
                ApiResponse.<AlumnoInscriptoResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(inscripcion))
                        .build()
        );
    }

    @GetMapping("/alumno-carrera/{alumnoCarreraId}")
    public ResponseEntity<ApiResponse<AlumnoInscriptoResponse>> getByAlumnoCarreraId(
            @PathVariable Long alumnoCarreraId,
            HttpServletRequest httpRequest) {

        List<AlumnoInscriptoResponse> inscripciones =
                alumnoInscriptoService.getByAlumnoCarreraId(alumnoCarreraId);
        return ResponseEntity.ok(
                ApiResponse.<AlumnoInscriptoResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(inscripciones)
                        .build()
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    public ResponseEntity<ApiResponse<AlumnoInscriptoResponse>> create(
            @RequestBody @Valid AlumnoInscriptoRequest request,
            HttpServletRequest httpRequest) {

        AlumnoInscriptoResponse inscripcion = alumnoInscriptoService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<AlumnoInscriptoResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(inscripcion))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    public ResponseEntity<ApiResponse<String>> delete(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        alumnoInscriptoService.delete(id);
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of("Inscripción a materia eliminada correctamente"))
                        .build()
        );
    }
}
```

- [ ] **Step 2: Agregar 4 handlers al final de CoreExceptionHandler (antes del cierre `}`)**

Agregar estos métodos a la clase existente `CoreExceptionHandler`:

```java
    @ExceptionHandler(AlumnoInscriptoNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleAlumnoInscriptoNotFound(
            AlumnoInscriptoNotFoundException ex,
            HttpServletRequest request) {

        ErrorDto error = new ErrorDto("ALUMNO_INSCRIPTO_NOT_FOUND", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(List.of(error))
                        .build()
        );
    }

    @ExceptionHandler(AlumnoYaInscriptoEnMateriaException.class)
    public ResponseEntity<ApiResponse<Object>> handleAlumnoYaInscriptoEnMateria(
            AlumnoYaInscriptoEnMateriaException ex,
            HttpServletRequest request) {

        ErrorDto error = new ErrorDto("ALUMNO_YA_INSCRIPTO_EN_MATERIA", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(List.of(error))
                        .build()
        );
    }

    @ExceptionHandler(ComisionInactivaException.class)
    public ResponseEntity<ApiResponse<Object>> handleComisionInactiva(
            ComisionInactivaException ex,
            HttpServletRequest request) {

        ErrorDto error = new ErrorDto("COMISION_INACTIVA", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(List.of(error))
                        .build()
        );
    }

    @ExceptionHandler(CupoComisionLlenoException.class)
    public ResponseEntity<ApiResponse<Object>> handleCupoComisionLleno(
            CupoComisionLlenoException ex,
            HttpServletRequest request) {

        ErrorDto error = new ErrorDto("CUPO_COMISION_LLENO", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(List.of(error))
                        .build()
        );
    }
```

- [ ] **Step 3: Compilar módulo core para verificar**

```bash
cd backend
mvn compile -pl core -am -q
```

Esperado: `BUILD SUCCESS` sin errores de compilación.

- [ ] **Step 4: Ejecutar todos los tests del módulo core**

```bash
cd backend
mvn test -pl core -am -q
```

Esperado: `BUILD SUCCESS`.

- [ ] **Step 5: Commit**

```bash
git add core/src/main/java/ar/edu/itec1misiones/controller/AlumnoInscriptoController.java \
        core/src/main/java/ar/edu/itec1misiones/exception/CoreExceptionHandler.java
git commit -m "feat(core): agregar Controlador REST y handlers para AlumnoInscripto"
```
