package ar.edu.itec1misiones.security.service.impl;

import org.springframework.security.core.userdetails.UserDetails;

import java.util.Map;

public interface JwtService {
    UserDetails validateTokenAndGetUser(String token);
    String generateToken(UserDetails user, Map<String, Object> extraClaims);
}
