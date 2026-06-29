package ar.edu.itec1misiones.controller;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.request.PlanEstudioRequest;
import ar.edu.itec1misiones.dto.response.MetaBuilderHelper;
import ar.edu.itec1misiones.dto.response.PlanEstudioResponse;
import ar.edu.itec1misiones.service.PlanEstudioService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/planes-estudio")
public class PlanEstudioController {

    private final PlanEstudioService planEstudioService;

    public PlanEstudioController(PlanEstudioService planEstudioService) {
        this.planEstudioService = planEstudioService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    public ResponseEntity<ApiResponse<PlanEstudioResponse>> crear(
            @RequestBody @Valid PlanEstudioRequest request,
            HttpServletRequest httpRequest) {

        PlanEstudioResponse plan = planEstudioService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<PlanEstudioResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(plan))
                        .build()
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PlanEstudioResponse>> listar(HttpServletRequest httpRequest) {
        List<PlanEstudioResponse> planes = planEstudioService.listarActivos();
        return ResponseEntity.ok(
                ApiResponse.<PlanEstudioResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(planes)
                        .build()
        );
    }

    @GetMapping("/carrera/{carreraId}")
    public ResponseEntity<ApiResponse<PlanEstudioResponse>> listarPorCarrera(
            @PathVariable Long carreraId,
            HttpServletRequest httpRequest) {

        List<PlanEstudioResponse> planes = planEstudioService.listarActivosPorCarrera(carreraId);
        return ResponseEntity.ok(
                ApiResponse.<PlanEstudioResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(planes)
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PlanEstudioResponse>> buscarPorId(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        PlanEstudioResponse plan = planEstudioService.buscarPorId(id);
        return ResponseEntity.ok(
                ApiResponse.<PlanEstudioResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(plan))
                        .build()
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    public ResponseEntity<ApiResponse<PlanEstudioResponse>> actualizar(
            @PathVariable Long id,
            @RequestBody @Valid PlanEstudioRequest request,
            HttpServletRequest httpRequest) {

        PlanEstudioResponse plan = planEstudioService.actualizar(id, request);
        return ResponseEntity.ok(
                ApiResponse.<PlanEstudioResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(plan))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> desactivar(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        planEstudioService.desactivar(id);
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of("Plan de estudio desactivado correctamente"))
                        .build()
        );
    }
}
