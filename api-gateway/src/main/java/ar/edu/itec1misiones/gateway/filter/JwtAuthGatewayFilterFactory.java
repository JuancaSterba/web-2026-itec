package ar.edu.itec1misiones.gateway.filter;

import ar.edu.itec1misiones.gateway.security.JwtValidatorService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

/**
 * Filtro de ruta ("JwtAuth" en application.yml) que valida el JWT emitido por
 * el Core antes de proxear la request. Si es valido, inyecta los claims como
 * headers (X-User-Id, X-User-Roles, X-User-Email) para que los microservicios
 * rio abajo sepan quien hace la peticion sin tener que revalidar el token.
 */
@Component
public class JwtAuthGatewayFilterFactory extends AbstractGatewayFilterFactory<JwtAuthGatewayFilterFactory.Config> {

    private final JwtValidatorService jwtValidatorService;

    public JwtAuthGatewayFilterFactory(JwtValidatorService jwtValidatorService) {
        super(Config.class);
        this.jwtValidatorService = jwtValidatorService;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return unauthorized(exchange, "Falta el header Authorization con formato 'Bearer <token>'");
            }

            String token = authHeader.substring(7);

            try {
                Claims claims = jwtValidatorService.validar(token);

                String username = claims.getSubject();
                List<String> roles = claims.get("roles", List.class);
                String email = extraerEmail(claims);

                ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                        .header("X-User-Id", username == null ? "" : username)
                        .header("X-User-Roles", roles == null ? "" : String.join(",", roles))
                        .header("X-User-Email", email == null ? "" : email)
                        .build();

                return chain.filter(exchange.mutate().request(mutatedRequest).build());
            } catch (JwtException | IllegalArgumentException e) {
                return unauthorized(exchange, "Token invalido o expirado");
            }
        };
    }

    private String extraerEmail(Claims claims) {
        Map<String, Object> datosPersonales = claims.get("datos_personales", Map.class);
        return datosPersonales != null ? String.valueOf(datosPersonales.get("email")) : null;
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange, String mensaje) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String body = String.format("{\"error\":\"UNAUTHORIZED\",\"message\":\"%s\"}", mensaje);
        DataBuffer buffer = response.bufferFactory().wrap(body.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buffer));
    }

    public static class Config {
    }
}
