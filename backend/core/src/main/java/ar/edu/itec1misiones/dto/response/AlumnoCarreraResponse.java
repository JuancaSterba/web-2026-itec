package ar.edu.itec1misiones.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlumnoCarreraResponse {
    private Long id;
    private Long alumnoId;
    private String alumnoNombreCompleto;
    private Long carreraId;
    private String carreraNombre;
    private Long planEstudioId;
    private String planEstudioResolucion;
    private Integer anioIngreso;
}
