package ar.edu.itec1misiones.security.controller;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.request.ActualizarAdministradorRequest;
import ar.edu.itec1misiones.dto.request.CrearAdministradorRequest;
import ar.edu.itec1misiones.dto.response.MetaBuilderHelper;
import ar.edu.itec1misiones.dto.response.UsuarioAdminResponse;
import ar.edu.itec1misiones.security.service.UserAdminService;
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
@RequestMapping("/api/administradores")
@Tag(name = "Administradores", description = "Alta, listado, edición y reset de contraseña de usuarios ADMIN/ADMINISTRATIVO")
public class AdminUsuarioController {

    private final UserAdminService userAdminService;

    public AdminUsuarioController(UserAdminService userAdminService) {
        this.userAdminService = userAdminService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Listar usuarios con rol ADMIN o ADMINISTRATIVO")
    public ResponseEntity<ApiResponse<UsuarioAdminResponse>> listar(HttpServletRequest httpRequest) {
        List<UsuarioAdminResponse> administradores = userAdminService.listar();
        return ResponseEntity.ok(
                ApiResponse.<UsuarioAdminResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(administradores)
                        .build()
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Crear un usuario ADMIN o ADMINISTRATIVO (username/password = DNI)")
    public ResponseEntity<ApiResponse<UsuarioAdminResponse>> crear(
            @RequestBody @Valid CrearAdministradorRequest request,
            HttpServletRequest httpRequest) {

        UsuarioAdminResponse administrador = userAdminService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<UsuarioAdminResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(administrador))
                        .build()
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Actualizar datos, rol o estado de un administrador")
    public ResponseEntity<ApiResponse<UsuarioAdminResponse>> actualizar(
            @PathVariable Long id,
            @RequestBody @Valid ActualizarAdministradorRequest request,
            HttpServletRequest httpRequest) {

        UsuarioAdminResponse administrador = userAdminService.actualizar(id, request);
        return ResponseEntity.ok(
                ApiResponse.<UsuarioAdminResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(administrador))
                        .build()
        );
    }

    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Resetear la contraseña de un administrador a su DNI")
    public ResponseEntity<ApiResponse<UsuarioAdminResponse>> resetPassword(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        UsuarioAdminResponse administrador = userAdminService.resetPassword(id);
        return ResponseEntity.ok(
                ApiResponse.<UsuarioAdminResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(administrador))
                        .build()
        );
    }
}
