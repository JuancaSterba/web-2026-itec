package ar.edu.itec1misiones.security.service.impl;

import org.springframework.security.core.userdetails.UserDetails;

public interface AuthService {
    String login(String username, String password);

    UserDetails validateToken(String token);
}
