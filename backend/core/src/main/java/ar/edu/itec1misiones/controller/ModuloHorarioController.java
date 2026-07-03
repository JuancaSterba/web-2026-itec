package ar.edu.itec1misiones.controller;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.request.ModuloHorarioRequest;
import ar.edu.itec1misiones.dto.response.MetaBuilderHelper;
import ar.edu.itec1misiones.dto.response.ModuloHorarioResponse;
import ar.edu.itec1misiones.service.ModuloHorarioService;
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
@RequestMapping("/api/modulos")
@RequiredArgsConstructor
@Tag(name = "Módulos Horarios", description = "Gestión de módulos horarios (franjas de tiempo para clases)")
public class ModuloHorarioController {

    private final ModuloHorarioService moduloHorarioService;

    @GetMapping
    @Operation(summary = "Listar todos los módulos horarios")
    public ResponseEntity<ApiResponse<ModuloHorarioResponse>> getAll(HttpServletRequest httpRequest) {
        List<ModuloHorarioResponse> modulos = moduloHorarioService.getAll();
        return ResponseEntity.ok(
                ApiResponse.<ModuloHorarioResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(modulos)
                        .build()
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un módulo horario por ID")
    public ResponseEntity<ApiResponse<ModuloHorarioResponse>> getById(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        ModuloHorarioResponse modulo = moduloHorarioService.getById(id);
        return ResponseEntity.ok(
                ApiResponse.<ModuloHorarioResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(modulo))
                        .build()
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Crear un nuevo módulo horario")
    public ResponseEntity<ApiResponse<ModuloHorarioResponse>> create(
            @RequestBody @Valid ModuloHorarioRequest request,
            HttpServletRequest httpRequest) {

        ModuloHorarioResponse modulo = moduloHorarioService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ModuloHorarioResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(modulo))
                        .build()
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Actualizar un módulo horario existente")
    public ResponseEntity<ApiResponse<ModuloHorarioResponse>> update(
            @PathVariable Long id,
            @RequestBody @Valid ModuloHorarioRequest request,
            HttpServletRequest httpRequest) {

        ModuloHorarioResponse modulo = moduloHorarioService.update(id, request);
        return ResponseEntity.ok(
                ApiResponse.<ModuloHorarioResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(modulo))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Eliminar un módulo horario")
    public ResponseEntity<ApiResponse<String>> delete(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        moduloHorarioService.delete(id);
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of("Módulo horario eliminado correctamente"))
                        .build()
        );
    }
}
