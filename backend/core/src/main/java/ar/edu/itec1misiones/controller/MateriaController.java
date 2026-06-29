package ar.edu.itec1misiones.controller;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.request.MateriaRequest;
import ar.edu.itec1misiones.dto.response.MateriaResponse;
import ar.edu.itec1misiones.dto.response.MetaBuilderHelper;
import ar.edu.itec1misiones.service.MateriaService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/materias")
public class MateriaController {

    private final MateriaService materiaService;

    public MateriaController(MateriaService materiaService) {
        this.materiaService = materiaService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    public ResponseEntity<ApiResponse<MateriaResponse>> crear(
            @RequestBody @Valid MateriaRequest request,
            HttpServletRequest httpRequest) {

        MateriaResponse materia = materiaService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<MateriaResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(materia))
                        .build()
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<MateriaResponse>> listar(HttpServletRequest httpRequest) {
        List<MateriaResponse> materias = materiaService.listarActivas();
        return ResponseEntity.ok(
                ApiResponse.<MateriaResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(materias)
                        .build()
        );
    }

    @GetMapping("/plan/{planId}")
    public ResponseEntity<ApiResponse<MateriaResponse>> listarPorPlan(
            @PathVariable Long planId,
            HttpServletRequest httpRequest) {

        List<MateriaResponse> materias = materiaService.listarActivasPorPlan(planId);
        return ResponseEntity.ok(
                ApiResponse.<MateriaResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(materias)
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MateriaResponse>> buscarPorId(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        MateriaResponse materia = materiaService.buscarPorId(id);
        return ResponseEntity.ok(
                ApiResponse.<MateriaResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(materia))
                        .build()
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    public ResponseEntity<ApiResponse<MateriaResponse>> actualizar(
            @PathVariable Long id,
            @RequestBody @Valid MateriaRequest request,
            HttpServletRequest httpRequest) {

        MateriaResponse materia = materiaService.actualizar(id, request);
        return ResponseEntity.ok(
                ApiResponse.<MateriaResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(materia))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> desactivar(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        materiaService.desactivar(id);
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of("Materia desactivada correctamente"))
                        .build()
        );
    }

    @PostMapping("/{id}/correlativas")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    public ResponseEntity<ApiResponse<MateriaResponse>> asignarCorrelativas(
            @PathVariable Long id,
            @RequestBody List<Long> correlativasIds,
            HttpServletRequest httpRequest) {

        MateriaResponse materia = materiaService.asignarCorrelativas(id, correlativasIds);
        return ResponseEntity.ok(
                ApiResponse.<MateriaResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(materia))
                        .build()
        );
    }

    @DeleteMapping("/{id}/correlativas/{correlativaId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    public ResponseEntity<ApiResponse<MateriaResponse>> eliminarCorrelativa(
            @PathVariable Long id,
            @PathVariable Long correlativaId,
            HttpServletRequest httpRequest) {

        MateriaResponse materia = materiaService.eliminarCorrelativa(id, correlativaId);
        return ResponseEntity.ok(
                ApiResponse.<MateriaResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(materia))
                        .build()
        );
    }
}
