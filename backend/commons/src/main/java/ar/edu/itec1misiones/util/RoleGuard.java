package ar.edu.itec1misiones.util;

import ar.edu.itec1misiones.model.Rol;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Chequeo de rol para microservicios que no tienen spring-security propio
 * (ms-notas, ms-asistencias): confían en el header X-User-Roles que inyecta
 * el filtro JwtAuth del Gateway (JWT ya validado ahí). Ver .remember/PENDIENTES.md #7.
 */
public final class RoleGuard {

    private static final String HEADER = "X-User-Roles";

    private RoleGuard() {
    }

    public static void exigirRol(HttpServletRequest request, Rol... rolesPermitidos) {
        String header = request.getHeader(HEADER);
        Set<String> rolesUsuario = header == null || header.isBlank()
                ? Set.of()
                : Arrays.stream(header.split(","))
                        .map(String::trim)
                        .collect(Collectors.toSet());

        boolean autorizado = Arrays.stream(rolesPermitidos)
                .map(Enum::name)
                .anyMatch(rolesUsuario::contains);

        if (!autorizado) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tenés el rol requerido para esta operación");
        }
    }
}
