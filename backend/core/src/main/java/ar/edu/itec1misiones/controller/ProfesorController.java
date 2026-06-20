package ar.edu.itec1misiones.controller;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.request.ProfesorRequest;
import ar.edu.itec1misiones.dto.request.ProfesorUpdateRequest;
import ar.edu.itec1misiones.dto.response.MetaBuilderHelper;
import ar.edu.itec1misiones.dto.response.ProfesorResponse;
import ar.edu.itec1misiones.service.ProfesorService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profesores")
public class ProfesorController {

    private final ProfesorService profesorService;

    public ProfesorController(ProfesorService profesorService) {
        this.profesorService = profesorService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    public ResponseEntity<ApiResponse<ProfesorResponse>> crear(
            @RequestBody @Valid ProfesorRequest request,
            HttpServletRequest httpRequest) {

        ProfesorResponse profesor = profesorService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ProfesorResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(profesor))
                        .build()
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<ProfesorResponse>> listar(HttpServletRequest httpRequest) {
        List<ProfesorResponse> profesores = profesorService.listarActivos();
        return ResponseEntity.ok(
                ApiResponse.<ProfesorResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(profesores)
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProfesorResponse>> buscarPorId(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        ProfesorResponse profesor = profesorService.buscarPorId(id);
        return ResponseEntity.ok(
                ApiResponse.<ProfesorResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(profesor))
                        .build()
        );
    }

    @GetMapping("/dni/{dni}")
    public ResponseEntity<ApiResponse<ProfesorResponse>> buscarPorDni(
            @PathVariable String dni,
            HttpServletRequest httpRequest) {

        ProfesorResponse profesor = profesorService.buscarPorDni(dni);
        return ResponseEntity.ok(
                ApiResponse.<ProfesorResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(profesor))
                        .build()
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    public ResponseEntity<ApiResponse<ProfesorResponse>> actualizar(
            @PathVariable Long id,
            @RequestBody @Valid ProfesorUpdateRequest request,
            HttpServletRequest httpRequest) {

        ProfesorResponse profesor = profesorService.actualizar(id, request);
        return ResponseEntity.ok(
                ApiResponse.<ProfesorResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(profesor))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> desactivar(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        profesorService.desactivar(id);
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of("Profesor desactivado correctamente"))
                        .build()
        );
    }
}
