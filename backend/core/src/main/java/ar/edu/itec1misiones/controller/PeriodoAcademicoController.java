package ar.edu.itec1misiones.controller;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.request.PeriodoAcademicoRequest;
import ar.edu.itec1misiones.dto.response.MetaBuilderHelper;
import ar.edu.itec1misiones.dto.response.PeriodoAcademicoResponse;
import ar.edu.itec1misiones.service.PeriodoAcademicoService;
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
@RequestMapping("/api/periodos-academicos")
@RequiredArgsConstructor
@Tag(name = "Periodos Académicos", description = "Gestión de periodos académicos dentro de un ciclo lectivo")
public class PeriodoAcademicoController {

    private final PeriodoAcademicoService periodoAcademicoService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Crear un nuevo periodo académico")
    public ResponseEntity<ApiResponse<PeriodoAcademicoResponse>> guardar(
            @RequestBody @Valid PeriodoAcademicoRequest request,
            HttpServletRequest httpRequest) {

        PeriodoAcademicoResponse periodo = periodoAcademicoService.guardar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<PeriodoAcademicoResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(periodo))
                        .build()
        );
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO') or hasRole('PROFESOR')")
    @Operation(summary = "Listar todos los periodos académicos")
    public ResponseEntity<ApiResponse<PeriodoAcademicoResponse>> buscarTodos(HttpServletRequest httpRequest) {
        List<PeriodoAcademicoResponse> periodos = periodoAcademicoService.buscarTodos();
        return ResponseEntity.ok(
                ApiResponse.<PeriodoAcademicoResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(periodos)
                        .build()
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO') or hasRole('PROFESOR')")
    @Operation(summary = "Obtener un periodo académico por ID")
    public ResponseEntity<ApiResponse<PeriodoAcademicoResponse>> buscarPorId(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        PeriodoAcademicoResponse periodo = periodoAcademicoService.buscarPorId(id);
        return ResponseEntity.ok(
                ApiResponse.<PeriodoAcademicoResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(periodo))
                        .build()
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Actualizar un periodo académico existente")
    public ResponseEntity<ApiResponse<PeriodoAcademicoResponse>> actualizar(
            @PathVariable Long id,
            @RequestBody @Valid PeriodoAcademicoRequest request,
            HttpServletRequest httpRequest) {

        PeriodoAcademicoResponse periodo = periodoAcademicoService.actualizar(id, request);
        return ResponseEntity.ok(
                ApiResponse.<PeriodoAcademicoResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(periodo))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Eliminar un periodo académico")
    public ResponseEntity<ApiResponse<String>> eliminar(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        periodoAcademicoService.eliminar(id);
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of("Periodo académico eliminado correctamente"))
                        .build()
        );
    }
}
