package ar.edu.itec1misiones.gateway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;

/**
 * Parsea y valida los JWT emitidos por backend/security (JwtServiceImpl),
 * usando la misma clave y algoritmo (HS256) para que un token generado
 * por el Core sea valido aqui.
 */
@Component
public class JwtValidatorService {

    private final Key key;

    public JwtValidatorService(@Value("${jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    public Claims validar(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
