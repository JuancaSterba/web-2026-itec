package ar.edu.itec1misiones.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfesorResponse {
    private Long id;
    private String titulo;
    private String telefonoContacto;
    private boolean activo;
    private Long userId;
    private String username;
    private String nombre;
    private String apellido;
    private String dni;
    private String email;
    private String telefono;
}
