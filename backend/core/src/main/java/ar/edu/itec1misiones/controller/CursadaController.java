package ar.edu.itec1misiones.controller;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.request.CursadaRequest;
import ar.edu.itec1misiones.dto.response.CursadaResponse;
import ar.edu.itec1misiones.dto.response.MetaBuilderHelper;
import ar.edu.itec1misiones.service.CursadaService;
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
@RequestMapping("/api/cursadas")
@RequiredArgsConstructor
@Tag(name = "Cursadas", description = "Gestión de la inscripción de alumnos a comisiones")
public class CursadaController {

    private final CursadaService cursadaService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Inscribir un alumno a una comisión")
    public ResponseEntity<ApiResponse<CursadaResponse>> guardar(
            @RequestBody @Valid CursadaRequest request,
            HttpServletRequest httpRequest) {

        CursadaResponse cursada = cursadaService.guardar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<CursadaResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(cursada))
                        .build()
        );
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Listar todas las cursadas")
    public ResponseEntity<ApiResponse<CursadaResponse>> buscarTodos(HttpServletRequest httpRequest) {
        List<CursadaResponse> cursadas = cursadaService.buscarTodos();
        return ResponseEntity.ok(
                ApiResponse.<CursadaResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(cursadas)
                        .build()
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Obtener una cursada por ID")
    public ResponseEntity<ApiResponse<CursadaResponse>> buscarPorId(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        CursadaResponse cursada = cursadaService.buscarPorId(id);
        return ResponseEntity.ok(
                ApiResponse.<CursadaResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(cursada))
                        .build()
        );
    }
}
