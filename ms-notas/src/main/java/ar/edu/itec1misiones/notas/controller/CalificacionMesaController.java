package ar.edu.itec1misiones.notas.controller;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.response.MetaBuilderHelper;
import ar.edu.itec1misiones.model.Rol;
import ar.edu.itec1misiones.notas.dto.CalificacionMesaRequest;
import ar.edu.itec1misiones.notas.model.CalificacionMesa;
import ar.edu.itec1misiones.notas.service.CalificacionMesaService;
import ar.edu.itec1misiones.util.RoleGuard;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
@RequestMapping("/api/notas/mesas")
public class CalificacionMesaController {

    private final CalificacionMesaService calificacionMesaService;

    public CalificacionMesaController(CalificacionMesaService calificacionMesaService) {
        this.calificacionMesaService = calificacionMesaService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CalificacionMesa>> crear(
            @RequestBody @Valid CalificacionMesaRequest request,
            HttpServletRequest httpRequest) {

        RoleGuard.exigirRol(httpRequest, Rol.ADMIN, Rol.ADMINISTRATIVO, Rol.PROFESOR);
        CalificacionMesa calificacion = calificacionMesaService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<CalificacionMesa>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(calificacion))
                        .build()
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CalificacionMesa>> listar(
            @RequestParam Long mesaExamenId,
            HttpServletRequest httpRequest) {

        RoleGuard.exigirRol(httpRequest, Rol.ADMIN, Rol.ADMINISTRATIVO, Rol.PROFESOR);
        List<CalificacionMesa> calificaciones = calificacionMesaService.listarPorMesa(mesaExamenId);
        return ResponseEntity.ok(
                ApiResponse.<CalificacionMesa>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(calificaciones)
                        .build()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CalificacionMesa>> actualizar(
            @PathVariable Long id,
            @RequestBody @Valid CalificacionMesaRequest request,
            HttpServletRequest httpRequest) {

        RoleGuard.exigirRol(httpRequest, Rol.ADMIN, Rol.ADMINISTRATIVO, Rol.PROFESOR);
        CalificacionMesa actualizada = calificacionMesaService.actualizar(id, request);
        return ResponseEntity.ok(
                ApiResponse.<CalificacionMesa>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(actualizada))
                        .build()
        );
    }
}
