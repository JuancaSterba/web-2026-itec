package ar.edu.itec1misiones.dto.response;

import ar.edu.itec1misiones.model.EstadoCursada;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlumnoInscriptoResponse {
    private Long id;
    private Long alumnoCarreraId;
    private String alumnoNombreCompleto;
    private Long comisionMateriaId;
    private String materiaNombre;
    private String comisionNombre;
    private EstadoCursada estado;
    private Double notaFinal;
}
