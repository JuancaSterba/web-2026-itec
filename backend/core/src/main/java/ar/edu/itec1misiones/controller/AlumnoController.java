package ar.edu.itec1misiones.controller;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.request.AlumnoRegistroDTO;
import ar.edu.itec1misiones.dto.request.AlumnoUpdateRequest;
import ar.edu.itec1misiones.dto.response.AlumnoResponse;
import ar.edu.itec1misiones.dto.response.MetaBuilderHelper;
import ar.edu.itec1misiones.service.AlumnoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alumnos")
@Tag(name = "Alumnos", description = "Gestión de alumnos y búsqueda por legajo o DNI")
public class AlumnoController {

    private final AlumnoService alumnoService;

    public AlumnoController(AlumnoService alumnoService) {
        this.alumnoService = alumnoService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Crear un nuevo alumno (alta de un solo paso: crea el Usuario y el Alumno)")
    public ResponseEntity<ApiResponse<AlumnoResponse>> crear(
            @RequestBody @Valid AlumnoRegistroDTO request,
            HttpServletRequest httpRequest) {

        AlumnoResponse alumno = alumnoService.crearConUsuario(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<AlumnoResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(alumno))
                        .build()
        );
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Listar todos los alumnos activos")
    public ResponseEntity<ApiResponse<AlumnoResponse>> listar(HttpServletRequest httpRequest) {
        List<AlumnoResponse> alumnos = alumnoService.listarActivos();
        return ResponseEntity.ok(
                ApiResponse.<AlumnoResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(alumnos)
                        .build()
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Obtener un alumno por ID")
    public ResponseEntity<ApiResponse<AlumnoResponse>> buscarPorId(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        AlumnoResponse alumno = alumnoService.buscarPorId(id);
        return ResponseEntity.ok(
                ApiResponse.<AlumnoResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(alumno))
                        .build()
        );
    }

    @GetMapping("/legajo/{legajo}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Buscar alumno por número de legajo")
    public ResponseEntity<ApiResponse<AlumnoResponse>> buscarPorLegajo(
            @PathVariable String legajo,
            HttpServletRequest httpRequest) {

        AlumnoResponse alumno = alumnoService.buscarPorLegajo(legajo);
        return ResponseEntity.ok(
                ApiResponse.<AlumnoResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(alumno))
                        .build()
        );
    }

    @GetMapping("/dni/{dni}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Buscar alumno por DNI")
    public ResponseEntity<ApiResponse<AlumnoResponse>> buscarPorDni(
            @PathVariable String dni,
            HttpServletRequest httpRequest) {

        AlumnoResponse alumno = alumnoService.buscarPorDni(dni);
        return ResponseEntity.ok(
                ApiResponse.<AlumnoResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(alumno))
                        .build()
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Actualizar datos de un alumno")
    public ResponseEntity<ApiResponse<AlumnoResponse>> actualizar(
            @PathVariable Long id,
            @RequestBody @Valid AlumnoUpdateRequest request,
            HttpServletRequest httpRequest) {

        AlumnoResponse alumno = alumnoService.actualizar(id, request);
        return ResponseEntity.ok(
                ApiResponse.<AlumnoResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(alumno))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Desactivar un alumno (baja lógica)")
    public ResponseEntity<ApiResponse<String>> desactivar(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        alumnoService.desactivar(id);
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of("Alumno desactivado correctamente"))
                        .build()
        );
    }
}
