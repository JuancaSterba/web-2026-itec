package ar.edu.itec1misiones.controller;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.request.CuatrimestreRequest;
import ar.edu.itec1misiones.dto.response.CuatrimestreResponse;
import ar.edu.itec1misiones.dto.response.MetaBuilderHelper;
import ar.edu.itec1misiones.service.CuatrimestreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cuatrimestres")
@Tag(name = "Cuatrimestres", description = "Gestión de períodos académicos cuatrimestrales")
public class CuatrimestreController {

    private final CuatrimestreService cuatrimestreService;

    public CuatrimestreController(CuatrimestreService cuatrimestreService) {
        this.cuatrimestreService = cuatrimestreService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Crear un nuevo cuatrimestre")
    public ResponseEntity<ApiResponse<CuatrimestreResponse>> crear(
            @RequestBody @Valid CuatrimestreRequest request,
            HttpServletRequest httpRequest) {

        CuatrimestreResponse cuatrimestre = cuatrimestreService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<CuatrimestreResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(cuatrimestre))
                        .build()
        );
    }

    @GetMapping
    @Operation(summary = "Listar todos los cuatrimestres")
    public ResponseEntity<ApiResponse<CuatrimestreResponse>> listar(HttpServletRequest httpRequest) {
        List<CuatrimestreResponse> cuatrimestres = cuatrimestreService.listarTodos();
        return ResponseEntity.ok(
                ApiResponse.<CuatrimestreResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(cuatrimestres)
                        .build()
        );
    }

    @GetMapping("/actual")
    @Operation(summary = "Obtener el cuatrimestre actualmente en curso")
    public ResponseEntity<ApiResponse<CuatrimestreResponse>> buscarActual(
            HttpServletRequest httpRequest) {

        CuatrimestreResponse cuatrimestre = cuatrimestreService.buscarActual();
        return ResponseEntity.ok(
                ApiResponse.<CuatrimestreResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(cuatrimestre))
                        .build()
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un cuatrimestre por ID")
    public ResponseEntity<ApiResponse<CuatrimestreResponse>> buscarPorId(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        CuatrimestreResponse cuatrimestre = cuatrimestreService.buscarPorId(id);
        return ResponseEntity.ok(
                ApiResponse.<CuatrimestreResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(cuatrimestre))
                        .build()
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Actualizar un cuatrimestre existente")
    public ResponseEntity<ApiResponse<CuatrimestreResponse>> actualizar(
            @PathVariable Long id,
            @RequestBody @Valid CuatrimestreRequest request,
            HttpServletRequest httpRequest) {

        CuatrimestreResponse cuatrimestre = cuatrimestreService.actualizar(id, request);
        return ResponseEntity.ok(
                ApiResponse.<CuatrimestreResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(cuatrimestre))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Eliminar un cuatrimestre")
    public ResponseEntity<ApiResponse<String>> eliminar(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        cuatrimestreService.eliminar(id);
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of("Cuatrimestre eliminado correctamente"))
                        .build()
        );
    }
}
