package ar.edu.itec1misiones.controller;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.request.HorarioClaseRequest;
import ar.edu.itec1misiones.dto.response.HorarioClaseResponse;
import ar.edu.itec1misiones.dto.response.MetaBuilderHelper;
import ar.edu.itec1misiones.service.HorarioClaseService;
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
@RequestMapping("/api/horarios")
@RequiredArgsConstructor
@Tag(name = "Horarios de Clase", description = "Gestión de horarios de clase por comisión y módulo horario")
public class HorarioClaseController {

    private final HorarioClaseService horarioClaseService;

    @GetMapping
    @Operation(summary = "Listar todos los horarios de clase")
    public ResponseEntity<ApiResponse<HorarioClaseResponse>> getAll(HttpServletRequest httpRequest) {
        List<HorarioClaseResponse> horarios = horarioClaseService.getAll();
        return ResponseEntity.ok(
                ApiResponse.<HorarioClaseResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(horarios)
                        .build()
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un horario de clase por ID")
    public ResponseEntity<ApiResponse<HorarioClaseResponse>> getById(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        HorarioClaseResponse horario = horarioClaseService.getById(id);
        return ResponseEntity.ok(
                ApiResponse.<HorarioClaseResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(horario))
                        .build()
        );
    }

    @GetMapping("/comision/{comisionId}")
    @Operation(summary = "Listar horarios de clase de una comisión")
    public ResponseEntity<ApiResponse<HorarioClaseResponse>> getByComisionId(
            @PathVariable Long comisionId,
            HttpServletRequest httpRequest) {

        List<HorarioClaseResponse> horarios = horarioClaseService.getByComisionId(comisionId);
        return ResponseEntity.ok(
                ApiResponse.<HorarioClaseResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(horarios)
                        .build()
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Crear un nuevo horario de clase")
    public ResponseEntity<ApiResponse<HorarioClaseResponse>> create(
            @RequestBody @Valid HorarioClaseRequest request,
            HttpServletRequest httpRequest) {

        HorarioClaseResponse horario = horarioClaseService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<HorarioClaseResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(horario))
                        .build()
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Actualizar un horario de clase existente")
    public ResponseEntity<ApiResponse<HorarioClaseResponse>> update(
            @PathVariable Long id,
            @RequestBody @Valid HorarioClaseRequest request,
            HttpServletRequest httpRequest) {

        HorarioClaseResponse horario = horarioClaseService.update(id, request);
        return ResponseEntity.ok(
                ApiResponse.<HorarioClaseResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(horario))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Eliminar un horario de clase")
    public ResponseEntity<ApiResponse<String>> delete(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        horarioClaseService.delete(id);
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of("Horario de clase eliminado correctamente"))
                        .build()
        );
    }
}
