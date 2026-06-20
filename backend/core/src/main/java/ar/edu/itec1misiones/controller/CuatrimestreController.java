package ar.edu.itec1misiones.controller;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.request.CuatrimestreRequest;
import ar.edu.itec1misiones.dto.response.CuatrimestreResponse;
import ar.edu.itec1misiones.dto.response.MetaBuilderHelper;
import ar.edu.itec1misiones.service.CuatrimestreService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cuatrimestres")
public class CuatrimestreController {

    private final CuatrimestreService cuatrimestreService;

    public CuatrimestreController(CuatrimestreService cuatrimestreService) {
        this.cuatrimestreService = cuatrimestreService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
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
