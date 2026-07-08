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
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO') or hasRole('PROFESOR')")
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
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO') or hasRole('PROFESOR')")
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

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Actualizar la condición final o nota de cierre de una cursada")
    public ResponseEntity<ApiResponse<CursadaResponse>> actualizar(
            @PathVariable Long id,
            @RequestBody @Valid CursadaRequest request,
            HttpServletRequest httpRequest) {

        CursadaResponse cursada = cursadaService.actualizar(id, request);
        return ResponseEntity.ok(
                ApiResponse.<CursadaResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(cursada))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Dar de baja una cursada (desinscribir al alumno de la comisión)")
    public ResponseEntity<ApiResponse<String>> eliminar(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        cursadaService.eliminar(id);
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of("Cursada eliminada correctamente"))
                        .build()
        );
    }
}
