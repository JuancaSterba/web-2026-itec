package ar.edu.itec1misiones.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlanEstudioResponse {
    private Long id;
    private String validez;
    private String resolucion;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private boolean activo;
    private Long carreraId;
    private String carreraNombre;
}
