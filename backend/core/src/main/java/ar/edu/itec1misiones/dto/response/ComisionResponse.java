package ar.edu.itec1misiones.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComisionResponse {
    private Long id;
    private String nombre;
    private Integer cupo;
    private boolean activa;
    private Long materiaId;
    private String materiaNombre;
    private Long cuatrimestreId;
    private Integer cuatrimestreAnio;
    private Integer cuatrimestreNumero;
    private Long profesorId;
    private String profesorNombre;
    private String profesorApellido;
    private String profesorTitulo;
}
