package ar.edu.itec1misiones.controller;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.request.MateriaRequest;
import ar.edu.itec1misiones.dto.response.MateriaResponse;
import ar.edu.itec1misiones.dto.response.MetaBuilderHelper;
import ar.edu.itec1misiones.service.MateriaService;
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
@RequestMapping("/api/materias")
@Tag(name = "Materias", description = "Gestión del catálogo maestro de materias")
public class MateriaController {

    private final MateriaService materiaService;

    public MateriaController(MateriaService materiaService) {
        this.materiaService = materiaService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Crear una nueva materia")
    public ResponseEntity<ApiResponse<MateriaResponse>> crear(
            @RequestBody @Valid MateriaRequest request,
            HttpServletRequest httpRequest) {

        MateriaResponse materia = materiaService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<MateriaResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(materia))
                        .build()
        );
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Listar todas las materias activas")
    public ResponseEntity<ApiResponse<MateriaResponse>> listar(HttpServletRequest httpRequest) {
        List<MateriaResponse> materias = materiaService.listarActivas();
        return ResponseEntity.ok(
                ApiResponse.<MateriaResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(materias)
                        .build()
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Obtener una materia por ID")
    public ResponseEntity<ApiResponse<MateriaResponse>> buscarPorId(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        MateriaResponse materia = materiaService.buscarPorId(id);
        return ResponseEntity.ok(
                ApiResponse.<MateriaResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(materia))
                        .build()
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Actualizar una materia existente")
    public ResponseEntity<ApiResponse<MateriaResponse>> actualizar(
            @PathVariable Long id,
            @RequestBody @Valid MateriaRequest request,
            HttpServletRequest httpRequest) {

        MateriaResponse materia = materiaService.actualizar(id, request);
        return ResponseEntity.ok(
                ApiResponse.<MateriaResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(materia))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Desactivar una materia (baja lógica)")
    public ResponseEntity<ApiResponse<String>> desactivar(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        materiaService.desactivar(id);
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of("Materia desactivada correctamente"))
                        .build()
        );
    }
}
