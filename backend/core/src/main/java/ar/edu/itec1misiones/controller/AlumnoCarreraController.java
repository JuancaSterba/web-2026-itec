package ar.edu.itec1misiones.controller;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.request.AlumnoCarreraRequest;
import ar.edu.itec1misiones.dto.response.AlumnoCarreraResponse;
import ar.edu.itec1misiones.dto.response.MetaBuilderHelper;
import ar.edu.itec1misiones.service.AlumnoCarreraService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inscripciones-carreras")
@RequiredArgsConstructor
@Tag(name = "Inscripciones a Carreras", description = "Gestión de inscripciones de alumnos a carreras y planes de estudio")
public class AlumnoCarreraController {

    private final AlumnoCarreraService alumnoCarreraService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Listar todas las inscripciones a carreras")
    public ResponseEntity<ApiResponse<AlumnoCarreraResponse>> getAll(HttpServletRequest httpRequest) {
        List<AlumnoCarreraResponse> inscripciones = alumnoCarreraService.getAll();
        return ResponseEntity.ok(
                ApiResponse.<AlumnoCarreraResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(inscripciones)
                        .build()
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Obtener una inscripción a carrera por ID")
    public ResponseEntity<ApiResponse<AlumnoCarreraResponse>> getById(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        AlumnoCarreraResponse inscripcion = alumnoCarreraService.getById(id);
        return ResponseEntity.ok(
                ApiResponse.<AlumnoCarreraResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(inscripcion))
                        .build()
        );
    }

    @GetMapping("/alumno/{alumnoId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Listar inscripciones a carreras de un alumno")
    public ResponseEntity<ApiResponse<AlumnoCarreraResponse>> getByAlumnoId(
            @PathVariable Long alumnoId,
            HttpServletRequest httpRequest) {

        List<AlumnoCarreraResponse> inscripciones = alumnoCarreraService.getByAlumnoId(alumnoId);
        return ResponseEntity.ok(
                ApiResponse.<AlumnoCarreraResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(inscripciones)
                        .build()
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Inscribir un alumno a una carrera")
    public ResponseEntity<ApiResponse<AlumnoCarreraResponse>> create(
            @RequestBody @Valid AlumnoCarreraRequest request,
            HttpServletRequest httpRequest) {

        AlumnoCarreraResponse inscripcion = alumnoCarreraService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<AlumnoCarreraResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(inscripcion))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Eliminar una inscripción a carrera")
    public ResponseEntity<ApiResponse<String>> delete(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        alumnoCarreraService.delete(id);
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of("Inscripción a carrera eliminada correctamente"))
                        .build()
        );
    }
}
