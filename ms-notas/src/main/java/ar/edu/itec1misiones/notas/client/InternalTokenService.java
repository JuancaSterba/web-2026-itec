package ar.edu.itec1misiones.notas.client;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * Mintea un JWT de corta duracion (60s) para que este microservicio pueda
 * llamar a endpoints protegidos de Core (ej. GET /api/horarios/comision/{id}).
 * Firmado con el mismo JWT_SECRET que ya comparten api-gateway/backend-app.
 */
@Service
public class InternalTokenService {

    private final Key key;

    public InternalTokenService(@Value("${jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String mintToken() {
        return Jwts.builder()
                .setClaims(Map.of("roles", List.of("ADMIN")))
                .setSubject("internal-ms-notas")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
}
