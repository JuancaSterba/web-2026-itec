package ar.edu.itec1misiones.controller;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.request.MateriaPlanRequest;
import ar.edu.itec1misiones.dto.response.MateriaPlanResponse;
import ar.edu.itec1misiones.dto.response.MetaBuilderHelper;
import ar.edu.itec1misiones.service.MateriaPlanService;
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
@RequestMapping("/api/materias-plan")
@RequiredArgsConstructor
@Tag(name = "Estructura Curricular", description = "Gestión de materias dictadas dentro de un plan de estudio")
public class MateriaPlanController {

    private final MateriaPlanService materiaPlanService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Agregar una materia a un plan de estudio")
    public ResponseEntity<ApiResponse<MateriaPlanResponse>> guardar(
            @RequestBody @Valid MateriaPlanRequest request,
            HttpServletRequest httpRequest) {

        MateriaPlanResponse materiaPlan = materiaPlanService.guardar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<MateriaPlanResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(materiaPlan))
                        .build()
        );
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Listar toda la estructura curricular")
    public ResponseEntity<ApiResponse<MateriaPlanResponse>> buscarTodos(HttpServletRequest httpRequest) {
        List<MateriaPlanResponse> materiasPlan = materiaPlanService.buscarTodos();
        return ResponseEntity.ok(
                ApiResponse.<MateriaPlanResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(materiasPlan)
                        .build()
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Obtener una materia de plan por ID")
    public ResponseEntity<ApiResponse<MateriaPlanResponse>> buscarPorId(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        MateriaPlanResponse materiaPlan = materiaPlanService.buscarPorId(id);
        return ResponseEntity.ok(
                ApiResponse.<MateriaPlanResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(materiaPlan))
                        .build()
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Actualizar una materia de plan existente")
    public ResponseEntity<ApiResponse<MateriaPlanResponse>> actualizar(
            @PathVariable Long id,
            @RequestBody @Valid MateriaPlanRequest request,
            HttpServletRequest httpRequest) {

        MateriaPlanResponse materiaPlan = materiaPlanService.actualizar(id, request);
        return ResponseEntity.ok(
                ApiResponse.<MateriaPlanResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(materiaPlan))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Quitar una materia del plan de estudio")
    public ResponseEntity<ApiResponse<String>> eliminar(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        materiaPlanService.eliminar(id);
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of("Materia de plan eliminada correctamente"))
                        .build()
        );
    }
}
