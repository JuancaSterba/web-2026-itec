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
public class CursadaResponse {
    private Long id;
    private Long alumnoId;
    private Long comisionId;
    private LocalDate fechaInscripcion;
    private String condicionFinal;
    private Double notaCierre;
}
