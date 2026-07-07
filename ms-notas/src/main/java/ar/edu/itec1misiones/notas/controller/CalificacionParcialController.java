package ar.edu.itec1misiones.notas.controller;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.response.MetaBuilderHelper;
import ar.edu.itec1misiones.notas.dto.CalificacionParcialRequest;
import ar.edu.itec1misiones.notas.model.CalificacionParcial;
import ar.edu.itec1misiones.notas.service.CalificacionParcialService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/calificaciones-parciales")
public class CalificacionParcialController {

    private final CalificacionParcialService calificacionParcialService;

    public CalificacionParcialController(CalificacionParcialService calificacionParcialService) {
        this.calificacionParcialService = calificacionParcialService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CalificacionParcial>> crear(
            @RequestBody @Valid CalificacionParcialRequest request,
            HttpServletRequest httpRequest) {

        CalificacionParcial calificacion = calificacionParcialService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<CalificacionParcial>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(calificacion))
                        .build()
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CalificacionParcial>> listar(
            @RequestParam(required = false) Long cursadaId,
            HttpServletRequest httpRequest) {
        List<CalificacionParcial> calificaciones = calificacionParcialService.listar(cursadaId);
        return ResponseEntity.ok(
                ApiResponse.<CalificacionParcial>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(calificaciones)
                        .build()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CalificacionParcial>> actualizar(
            @PathVariable Long id,
            @RequestBody @Valid CalificacionParcialRequest request,
            HttpServletRequest httpRequest) {

        CalificacionParcial actualizada = calificacionParcialService.actualizar(id, request);
        return ResponseEntity.ok(
                ApiResponse.<CalificacionParcial>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(actualizada))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> eliminar(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        calificacionParcialService.eliminar(id);
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of("Calificación parcial eliminada correctamente"))
                        .build()
        );
    }
}
