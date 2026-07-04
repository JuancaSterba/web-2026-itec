package ar.edu.itec1misiones.controller;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.request.ComisionRequest;
import ar.edu.itec1misiones.dto.response.ComisionResponse;
import ar.edu.itec1misiones.dto.response.MetaBuilderHelper;
import ar.edu.itec1misiones.service.ComisionService;
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
@RequestMapping("/api/comisiones")
@Tag(name = "Comisiones", description = "Gestión de comisiones de materias por cuatrimestre y profesor")
public class ComisionController {

    private final ComisionService comisionService;

    public ComisionController(ComisionService comisionService) {
        this.comisionService = comisionService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Crear una nueva comisión")
    public ResponseEntity<ApiResponse<ComisionResponse>> crear(
            @RequestBody @Valid ComisionRequest request,
            HttpServletRequest httpRequest) {

        ComisionResponse comision = comisionService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ComisionResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(comision))
                        .build()
        );
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Listar todas las comisiones activas")
    public ResponseEntity<ApiResponse<ComisionResponse>> listar(HttpServletRequest httpRequest) {
        List<ComisionResponse> comisiones = comisionService.listarActivas();
        return ResponseEntity.ok(
                ApiResponse.<ComisionResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(comisiones)
                        .build()
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Obtener una comisión por ID")
    public ResponseEntity<ApiResponse<ComisionResponse>> buscarPorId(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        ComisionResponse comision = comisionService.buscarPorId(id);
        return ResponseEntity.ok(
                ApiResponse.<ComisionResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(comision))
                        .build()
        );
    }

    @GetMapping("/materia/{materiaId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Listar comisiones activas de una materia")
    public ResponseEntity<ApiResponse<ComisionResponse>> listarPorMateria(
            @PathVariable Long materiaId,
            HttpServletRequest httpRequest) {

        List<ComisionResponse> comisiones = comisionService.listarPorMateria(materiaId);
        return ResponseEntity.ok(
                ApiResponse.<ComisionResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(comisiones)
                        .build()
        );
    }

    @GetMapping("/cuatrimestre/{cuatrimestreId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Listar comisiones activas de un cuatrimestre")
    public ResponseEntity<ApiResponse<ComisionResponse>> listarPorCuatrimestre(
            @PathVariable Long cuatrimestreId,
            HttpServletRequest httpRequest) {

        List<ComisionResponse> comisiones = comisionService.listarPorCuatrimestre(cuatrimestreId);
        return ResponseEntity.ok(
                ApiResponse.<ComisionResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(comisiones)
                        .build()
        );
    }

    @GetMapping("/profesor/{profesorId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Listar comisiones activas de un profesor")
    public ResponseEntity<ApiResponse<ComisionResponse>> listarPorProfesor(
            @PathVariable Long profesorId,
            HttpServletRequest httpRequest) {

        List<ComisionResponse> comisiones = comisionService.listarPorProfesor(profesorId);
        return ResponseEntity.ok(
                ApiResponse.<ComisionResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(comisiones)
                        .build()
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Actualizar una comisión existente")
    public ResponseEntity<ApiResponse<ComisionResponse>> actualizar(
            @PathVariable Long id,
            @RequestBody @Valid ComisionRequest request,
            HttpServletRequest httpRequest) {

        ComisionResponse comision = comisionService.actualizar(id, request);
        return ResponseEntity.ok(
                ApiResponse.<ComisionResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(comision))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Desactivar una comisión (baja lógica)")
    public ResponseEntity<ApiResponse<String>> desactivar(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        comisionService.desactivar(id);
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of("Comisión desactivada correctamente"))
                        .build()
        );
    }
}
