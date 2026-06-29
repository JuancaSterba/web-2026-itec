package ar.edu.itec1misiones.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlumnoResponse {
    private Long id;
    private String legajo;
    private boolean activo;
    private Long userId;
    private String username;
    private String nombre;
    private String apellido;
    private String dni;
    private String email;
    private String telefono;
}
