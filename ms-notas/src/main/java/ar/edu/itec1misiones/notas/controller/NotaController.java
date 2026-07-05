package ar.edu.itec1misiones.notas.controller;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.response.MetaBuilderHelper;
import ar.edu.itec1misiones.notas.dto.NotaRequest;
import ar.edu.itec1misiones.notas.model.Nota;
import ar.edu.itec1misiones.notas.service.NotaService;
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
@RequestMapping("/api/notas")
public class NotaController {

    private final NotaService notaService;

    public NotaController(NotaService notaService) {
        this.notaService = notaService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Nota>> crear(
            @RequestBody @Valid NotaRequest request,
            HttpServletRequest httpRequest) {

        Nota nota = notaService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<Nota>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(nota))
                        .build()
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Nota>> listar(
            @RequestParam(required = false) Long examenId,
            HttpServletRequest httpRequest) {
        List<Nota> notas = notaService.listar(examenId);
        return ResponseEntity.ok(
                ApiResponse.<Nota>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(notas)
                        .build()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Nota>> actualizar(
            @PathVariable Long id,
            @RequestBody @Valid NotaRequest request,
            HttpServletRequest httpRequest) {

        Nota actualizada = notaService.actualizar(id, request);
        return ResponseEntity.ok(
                ApiResponse.<Nota>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(actualizada))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> eliminar(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        notaService.eliminar(id);
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of("Nota eliminada correctamente"))
                        .build()
        );
    }
}
