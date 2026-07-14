package ar.edu.itec1misiones.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
public class MesaExamenRequest {

    @NotNull(message = "El ID de la materia del plan es obligatorio")
    private Long materiaPlanId;

    @NotNull(message = "El ID del período académico es obligatorio")
    private Long periodoAcademicoId;

    @NotNull(message = "La fecha y hora de la mesa es obligatoria")
    private LocalDateTime fechaHora;

    // IDs de Users con rol PROFESOR designados como tribunal (puede quedar vacío al crear).
    private Set<Long> tribunalIds = new HashSet<>();
}
