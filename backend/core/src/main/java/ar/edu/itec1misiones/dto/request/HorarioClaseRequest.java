package ar.edu.itec1misiones.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.DayOfWeek;
import java.util.List;

@Data
public class HorarioClaseRequest {

    @NotNull(message = "El día de la semana es obligatorio")
    private DayOfWeek diaSemana;

    @NotNull(message = "El ID de la comisión es obligatorio")
    private Long comisionId;

    @NotNull(message = "Los módulos son obligatorios")
    private List<Long> modulosIds;
}
