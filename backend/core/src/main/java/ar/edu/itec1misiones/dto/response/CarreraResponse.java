package ar.edu.itec1misiones.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CarreraResponse {
    private Long id;
    private String nombre;
    private String descripcion;
    private String resolucion;
    private boolean activa;
}
