package ar.edu.itec1misiones.controller;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.request.CarreraRequest;
import ar.edu.itec1misiones.dto.response.CarreraResponse;
import ar.edu.itec1misiones.dto.response.MetaBuilderHelper;
import ar.edu.itec1misiones.service.CarreraService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carreras")
public class CarreraController {

    private final CarreraService carreraService;

    public CarreraController(CarreraService carreraService) {
        this.carreraService = carreraService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    public ResponseEntity<ApiResponse<CarreraResponse>> crear(
            @RequestBody @Valid CarreraRequest request,
            HttpServletRequest httpRequest) {

        CarreraResponse carrera = carreraService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<CarreraResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(carrera))
                        .build()
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CarreraResponse>> listar(HttpServletRequest httpRequest) {
        List<CarreraResponse> carreras = carreraService.listarActivas();
        return ResponseEntity.ok(
                ApiResponse.<CarreraResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(carreras)
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CarreraResponse>> buscarPorId(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        CarreraResponse carrera = carreraService.buscarPorId(id);
        return ResponseEntity.ok(
                ApiResponse.<CarreraResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(carrera))
                        .build()
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    public ResponseEntity<ApiResponse<CarreraResponse>> actualizar(
            @PathVariable Long id,
            @RequestBody @Valid CarreraRequest request,
            HttpServletRequest httpRequest) {

        CarreraResponse carrera = carreraService.actualizar(id, request);
        return ResponseEntity.ok(
                ApiResponse.<CarreraResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(carrera))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> desactivar(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        carreraService.desactivar(id);
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of("Carrera desactivada correctamente"))
                        .build()
        );
    }
}
