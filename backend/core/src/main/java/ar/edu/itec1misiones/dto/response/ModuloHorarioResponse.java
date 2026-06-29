package ar.edu.itec1misiones.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModuloHorarioResponse {
    private Long id;
    private int numero;
    private LocalTime horaInicio;
    private LocalTime horaFin;
}
