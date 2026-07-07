package ar.edu.itec1misiones.controller;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.request.ComisionProfesorRequest;
import ar.edu.itec1misiones.dto.response.ComisionProfesorResponse;
import ar.edu.itec1misiones.dto.response.MetaBuilderHelper;
import ar.edu.itec1misiones.service.ComisionProfesorService;
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
@RequestMapping("/api/comisiones-profesores")
@RequiredArgsConstructor
@Tag(name = "Comisiones-Profesores", description = "Gestión de la asignación de profesores a comisiones")
public class ComisionProfesorController {

    private final ComisionProfesorService comisionProfesorService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Asignar un profesor a una comisión")
    public ResponseEntity<ApiResponse<ComisionProfesorResponse>> guardar(
            @RequestBody @Valid ComisionProfesorRequest request,
            HttpServletRequest httpRequest) {

        ComisionProfesorResponse comisionProfesor = comisionProfesorService.guardar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ComisionProfesorResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(comisionProfesor))
                        .build()
        );
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Listar todas las asignaciones docentes")
    public ResponseEntity<ApiResponse<ComisionProfesorResponse>> buscarTodos(HttpServletRequest httpRequest) {
        List<ComisionProfesorResponse> comisionesProfesores = comisionProfesorService.buscarTodos();
        return ResponseEntity.ok(
                ApiResponse.<ComisionProfesorResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(comisionesProfesores)
                        .build()
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Obtener una asignación docente por ID")
    public ResponseEntity<ApiResponse<ComisionProfesorResponse>> buscarPorId(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        ComisionProfesorResponse comisionProfesor = comisionProfesorService.buscarPorId(id);
        return ResponseEntity.ok(
                ApiResponse.<ComisionProfesorResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(comisionProfesor))
                        .build()
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Actualizar una asignación docente existente")
    public ResponseEntity<ApiResponse<ComisionProfesorResponse>> actualizar(
            @PathVariable Long id,
            @RequestBody @Valid ComisionProfesorRequest request,
            HttpServletRequest httpRequest) {

        ComisionProfesorResponse comisionProfesor = comisionProfesorService.actualizar(id, request);
        return ResponseEntity.ok(
                ApiResponse.<ComisionProfesorResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(comisionProfesor))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Quitar la asignación de un profesor a una comisión")
    public ResponseEntity<ApiResponse<String>> eliminar(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        comisionProfesorService.eliminar(id);
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of("Asignación docente eliminada correctamente"))
                        .build()
        );
    }
}
