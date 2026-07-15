package ar.edu.itec1misiones.controller;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.request.InscripcionMesaRequest;
import ar.edu.itec1misiones.dto.request.MesaExamenRequest;
import ar.edu.itec1misiones.dto.response.InscripcionMesaResponse;
import ar.edu.itec1misiones.dto.response.MesaExamenResponse;
import ar.edu.itec1misiones.dto.response.MetaBuilderHelper;
import ar.edu.itec1misiones.service.MesaExamenService;
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
@RequestMapping("/api/mesas-examen")
@RequiredArgsConstructor
@Tag(name = "Mesas de Examen", description = "Gestión de mesas de examen final e inscripción de alumnos")
public class MesaExamenController {

    private final MesaExamenService mesaExamenService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Crear una mesa de examen con su tribunal")
    public ResponseEntity<ApiResponse<MesaExamenResponse>> crear(
            @RequestBody @Valid MesaExamenRequest request,
            HttpServletRequest httpRequest) {

        MesaExamenResponse mesa = mesaExamenService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<MesaExamenResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(mesa))
                        .build()
        );
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO') or hasRole('PROFESOR')")
    @Operation(summary = "Listar las mesas de examen, opcionalmente filtradas por integrante del tribunal")
    public ResponseEntity<ApiResponse<MesaExamenResponse>> buscarTodas(
            @RequestParam(required = false) Long tribunalUserId,
            HttpServletRequest httpRequest) {
        List<MesaExamenResponse> mesas = tribunalUserId != null
                ? mesaExamenService.buscarPorTribunal(tribunalUserId)
                : mesaExamenService.buscarTodas();
        return ResponseEntity.ok(
                ApiResponse.<MesaExamenResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(mesas)
                        .build()
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO') or hasRole('PROFESOR')")
    @Operation(summary = "Obtener una mesa de examen por ID")
    public ResponseEntity<ApiResponse<MesaExamenResponse>> buscarPorId(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        MesaExamenResponse mesa = mesaExamenService.buscarPorId(id);
        return ResponseEntity.ok(
                ApiResponse.<MesaExamenResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(mesa))
                        .build()
        );
    }

    @PostMapping("/{id}/inscripciones")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Inscribir un alumno a una mesa de examen")
    public ResponseEntity<ApiResponse<InscripcionMesaResponse>> inscribirAlumno(
            @PathVariable Long id,
            @RequestBody @Valid InscripcionMesaRequest request,
            HttpServletRequest httpRequest) {

        InscripcionMesaResponse inscripcion = mesaExamenService.inscribirAlumno(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<InscripcionMesaResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(inscripcion))
                        .build()
        );
    }

    @GetMapping("/{id}/inscripciones")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO') or hasRole('PROFESOR')")
    @Operation(summary = "Listar los alumnos inscriptos a una mesa de examen")
    public ResponseEntity<ApiResponse<InscripcionMesaResponse>> listarInscripciones(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        List<InscripcionMesaResponse> inscripciones = mesaExamenService.listarInscripciones(id);
        return ResponseEntity.ok(
                ApiResponse.<InscripcionMesaResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(inscripciones)
                        .build()
        );
    }
}
