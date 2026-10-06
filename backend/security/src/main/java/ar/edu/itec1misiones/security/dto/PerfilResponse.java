package ar.edu.itec1misiones.security.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PerfilResponse {
    private String username;
    private String nombre;
    private String apellido;
    private String dni;
    private String email;
    private String telefono;
}
