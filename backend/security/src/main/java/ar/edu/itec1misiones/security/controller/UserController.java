package ar.edu.itec1misiones.security.controller;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.request.RegisterUserRequest;
import ar.edu.itec1misiones.dto.response.MetaBuilderHelper;
import ar.edu.itec1misiones.model.Rol;
import ar.edu.itec1misiones.security.constants.SecurityConstants;
import ar.edu.itec1misiones.security.service.UserServiceImpl;
import ar.edu.itec1misiones.security.util.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping(SecurityConstants.AUTH_BASE_PATH)
public class UserController {

    private final UserServiceImpl userServiceImpl;

    public UserController(UserServiceImpl userServiceImpl) {
        this.userServiceImpl = userServiceImpl;
    }

    @PostMapping(SecurityConstants.REGISTER_PATH)
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    public ResponseEntity<ApiResponse<String>> register(
            @RequestBody @Valid RegisterUserRequest request,
            HttpServletRequest httpRequest) {

        String username = SecurityUtils.getUsername();

        for (Rol rolSolicitado : request.getRoles()) {
            boolean puedeCrear = switch (rolSolicitado) {
                case ADMIN, ADMINISTRATIVO -> SecurityUtils.tieneRol("ADMIN");
                case PROFESOR, ALUMNO -> SecurityUtils.tieneRol("ADMIN") || SecurityUtils.tieneRol("ADMINISTRATIVO");
                default -> false;
            };

            log.info("Registro solicitado: rol '{}', ejecutado por usuario '{}', con roles: {}",
                    rolSolicitado, username, SecurityUtils.getAuthentication().getAuthorities());

            if (!puedeCrear) {
                throw new AccessDeniedException(SecurityConstants.MSG_ACCESS_DENIED + rolSolicitado);
            }
        }

        userServiceImpl.register(request);

        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(SecurityConstants.MSG_USER_REGISTER_SUCCESSFUL))
                        .build()
        );
    }
}
