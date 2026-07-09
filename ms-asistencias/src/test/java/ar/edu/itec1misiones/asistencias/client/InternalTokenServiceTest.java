package ar.edu.itec1misiones.asistencias.client;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;

import java.security.Key;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class InternalTokenServiceTest {

    private static final String SECRET = "tu-clave-muy-segura-de-32-caracteres-o-mas-1234";

    @Test
    void generaUnJwtValidoConRolAdmin() {
        InternalTokenService service = new InternalTokenService(SECRET);

        String token = service.mintToken();

        Key key = Keys.hmacShaKeyFor(SECRET.getBytes());
        Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();

        assertEquals("internal-ms-asistencias", claims.getSubject());
        List<String> roles = claims.get("roles", List.class);
        assertTrue(roles.contains("ADMIN"));
    }
}
