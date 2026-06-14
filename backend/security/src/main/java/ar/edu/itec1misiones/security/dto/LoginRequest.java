package ar.edu.itec1misiones.security.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
}
