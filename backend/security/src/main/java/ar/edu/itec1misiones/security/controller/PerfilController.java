package ar.edu.itec1misiones.security.controller;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.response.MetaBuilderHelper;
import ar.edu.itec1misiones.security.dto.PerfilResponse;
import ar.edu.itec1misiones.security.service.PerfilService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/perfil")
@Tag(name = "Perfil", description = "Datos personales vigentes del usuario autenticado")
public class PerfilController {

    private final PerfilService perfilService;

    public PerfilController(PerfilService perfilService) {
        this.perfilService = perfilService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ADMINISTRATIVO', 'PROFESOR', 'ALUMNO')")
    @Operation(summary = "Obtener el perfil del usuario autenticado")
    public ResponseEntity<ApiResponse<PerfilResponse>> obtener(HttpServletRequest httpRequest) {
        return ResponseEntity.ok(
                ApiResponse.<PerfilResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(perfilService.obtener()))
                        .build()
        );
    }
}
