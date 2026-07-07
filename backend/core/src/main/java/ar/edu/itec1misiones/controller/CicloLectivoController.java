package ar.edu.itec1misiones.controller;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.request.CicloLectivoRequest;
import ar.edu.itec1misiones.dto.response.CicloLectivoResponse;
import ar.edu.itec1misiones.dto.response.MetaBuilderHelper;
import ar.edu.itec1misiones.service.CicloLectivoService;
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
@RequestMapping("/api/ciclos-lectivos")
@RequiredArgsConstructor
@Tag(name = "Ciclos Lectivos", description = "Gestión de años lectivos")
public class CicloLectivoController {

    private final CicloLectivoService cicloLectivoService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Crear un nuevo ciclo lectivo")
    public ResponseEntity<ApiResponse<CicloLectivoResponse>> guardar(
            @RequestBody @Valid CicloLectivoRequest request,
            HttpServletRequest httpRequest) {

        CicloLectivoResponse ciclo = cicloLectivoService.guardar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<CicloLectivoResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(ciclo))
                        .build()
        );
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Listar todos los ciclos lectivos")
    public ResponseEntity<ApiResponse<CicloLectivoResponse>> buscarTodos(HttpServletRequest httpRequest) {
        List<CicloLectivoResponse> ciclos = cicloLectivoService.buscarTodos();
        return ResponseEntity.ok(
                ApiResponse.<CicloLectivoResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(ciclos)
                        .build()
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Obtener un ciclo lectivo por ID")
    public ResponseEntity<ApiResponse<CicloLectivoResponse>> buscarPorId(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        CicloLectivoResponse ciclo = cicloLectivoService.buscarPorId(id);
        return ResponseEntity.ok(
                ApiResponse.<CicloLectivoResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(ciclo))
                        .build()
        );
    }
}
