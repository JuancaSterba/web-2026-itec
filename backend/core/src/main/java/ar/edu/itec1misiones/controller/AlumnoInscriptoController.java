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
