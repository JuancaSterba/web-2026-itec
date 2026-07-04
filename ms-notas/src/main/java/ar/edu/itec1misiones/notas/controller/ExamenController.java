package ar.edu.itec1misiones.notas.controller;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.response.MetaBuilderHelper;
import ar.edu.itec1misiones.notas.dto.ExamenRequest;
import ar.edu.itec1misiones.notas.model.Examen;
import ar.edu.itec1misiones.notas.service.ExamenService;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/examenes")
public class ExamenController {

    private final ExamenService examenService;

    public ExamenController(ExamenService examenService) {
        this.examenService = examenService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Examen>> crear(
            @RequestBody @Valid ExamenRequest request,
            HttpServletRequest httpRequest) {

        Examen examen = examenService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<Examen>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(examen))
                        .build()
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Examen>> listar(HttpServletRequest httpRequest) {
        List<Examen> examenes = examenService.listar();
        return ResponseEntity.ok(
                ApiResponse.<Examen>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(examenes)
                        .build()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Examen>> actualizar(
            @PathVariable Long id,
            @RequestBody @Valid ExamenRequest request,
            HttpServletRequest httpRequest) {

        Examen actualizado = examenService.actualizar(id, request);
        return ResponseEntity.ok(
                ApiResponse.<Examen>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(actualizado))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> eliminar(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        examenService.eliminar(id);
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of("Examen eliminado correctamente"))
                        .build()
        );
    }
}
