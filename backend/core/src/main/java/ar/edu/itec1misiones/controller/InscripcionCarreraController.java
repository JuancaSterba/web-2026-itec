package ar.edu.itec1misiones.controller;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.request.InscripcionCarreraRequest;
import ar.edu.itec1misiones.dto.response.InscripcionCarreraResponse;
import ar.edu.itec1misiones.dto.response.MetaBuilderHelper;
import ar.edu.itec1misiones.service.InscripcionCarreraService;
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
public class InscripcionCarreraController {

    private final InscripcionCarreraService inscripcionCarreraService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Inscribir un alumno a una carrera")
    public ResponseEntity<ApiResponse<InscripcionCarreraResponse>> guardar(
            @RequestBody @Valid InscripcionCarreraRequest request,
            HttpServletRequest httpRequest) {

        InscripcionCarreraResponse inscripcion = inscripcionCarreraService.guardar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<InscripcionCarreraResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(inscripcion))
                        .build()
        );
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Listar todas las inscripciones a carreras")
    public ResponseEntity<ApiResponse<InscripcionCarreraResponse>> buscarTodos(HttpServletRequest httpRequest) {
        List<InscripcionCarreraResponse> inscripciones = inscripcionCarreraService.buscarTodos();
        return ResponseEntity.ok(
                ApiResponse.<InscripcionCarreraResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(inscripciones)
                        .build()
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Obtener una inscripción a carrera por ID")
    public ResponseEntity<ApiResponse<InscripcionCarreraResponse>> buscarPorId(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        InscripcionCarreraResponse inscripcion = inscripcionCarreraService.buscarPorId(id);
        return ResponseEntity.ok(
                ApiResponse.<InscripcionCarreraResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(inscripcion))
                        .build()
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Actualizar una inscripción a carrera existente")
    public ResponseEntity<ApiResponse<InscripcionCarreraResponse>> actualizar(
            @PathVariable Long id,
            @RequestBody @Valid InscripcionCarreraRequest request,
            HttpServletRequest httpRequest) {

        InscripcionCarreraResponse inscripcion = inscripcionCarreraService.actualizar(id, request);
        return ResponseEntity.ok(
                ApiResponse.<InscripcionCarreraResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(inscripcion))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Dar de baja una inscripción a carrera")
    public ResponseEntity<ApiResponse<String>> darDeBaja(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        inscripcionCarreraService.darDeBaja(id);
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of("Inscripción dada de baja correctamente"))
                        .build()
        );
    }
}
