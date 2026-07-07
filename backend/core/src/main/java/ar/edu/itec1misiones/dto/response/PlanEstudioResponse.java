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
    private String cohorte;
    private String resolucion;
    private LocalDate fechaImplementacion;
    private boolean activo;
    private Long carreraId;
    private String carreraNombre;
}
