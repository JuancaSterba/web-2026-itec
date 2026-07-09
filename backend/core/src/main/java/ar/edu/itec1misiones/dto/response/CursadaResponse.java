package ar.edu.itec1misiones.dto.response;

import ar.edu.itec1misiones.model.CondicionFinal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CursadaResponse {
    private Long id;
    private Long alumnoId;
    private Long comisionId;
    private LocalDate fechaInscripcion;
    private CondicionFinal condicionFinal;
    private Double notaCierre;
}
