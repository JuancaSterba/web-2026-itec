package ar.edu.itec1misiones.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.DayOfWeek;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HorarioClaseResponse {
    private Long id;
    private DayOfWeek diaSemana;
    private Long comisionId;
    private String materiaNombre;
    private List<ModuloHorarioResponse> modulos;
}
