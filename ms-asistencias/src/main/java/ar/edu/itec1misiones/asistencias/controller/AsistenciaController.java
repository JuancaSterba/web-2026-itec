package ar.edu.itec1misiones.asistencias.controller;

import ar.edu.itec1misiones.asistencias.dto.AsistenciaRequest;
import ar.edu.itec1misiones.asistencias.model.Asistencia;
import ar.edu.itec1misiones.asistencias.service.AsistenciaService;
import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.response.MetaBuilderHelper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
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

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/asistencias")
public class AsistenciaController {

    private final AsistenciaService asistenciaService;

    public AsistenciaController(AsistenciaService asistenciaService) {
        this.asistenciaService = asistenciaService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Asistencia>> crear(
            @RequestBody @Valid AsistenciaRequest request,
            HttpServletRequest httpRequest) {

        Asistencia asistencia = asistenciaService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<Asistencia>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(asistencia))
                        .build()
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Asistencia>> listar(
            @RequestParam(required = false) Long cursadaId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            HttpServletRequest httpRequest) {
        List<Asistencia> asistencias = asistenciaService.listar(cursadaId, fecha);
        return ResponseEntity.ok(
                ApiResponse.<Asistencia>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(asistencias)
                        .build()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Asistencia>> actualizar(
            @PathVariable Long id,
            @RequestBody @Valid AsistenciaRequest request,
            HttpServletRequest httpRequest) {

        Asistencia actualizada = asistenciaService.actualizar(id, request);
        return ResponseEntity.ok(
                ApiResponse.<Asistencia>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(actualizada))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> eliminar(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        asistenciaService.eliminar(id);
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of("Asistencia eliminada correctamente"))
                        .build()
        );
    }
}
