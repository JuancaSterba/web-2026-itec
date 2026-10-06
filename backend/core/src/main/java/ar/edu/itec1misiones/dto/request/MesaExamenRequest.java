package ar.edu.itec1misiones.dto.request;

import ar.edu.itec1misiones.model.TipoMesa;
import ar.edu.itec1misiones.model.TurnoExamen;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
public class MesaExamenRequest {

    @NotNull(message = "El ID de la materia del plan es obligatorio")
    private Long materiaPlanId;

    @NotNull(message = "El ID del ciclo lectivo es obligatorio")
    private Long cicloLectivoId;

    private TurnoExamen turno; // Nullable for ESPECIAL

    @NotNull(message = "El tipo de mesa es obligatorio")
    private TipoMesa tipo;

    @NotNull(message = "La fecha y hora de la mesa es obligatoria")
    private LocalDateTime fechaHora;

    // IDs de Users con rol PROFESOR designados como tribunal (puede quedar vacío al crear).
    private Set<Long> tribunalIds = new HashSet<>();
}
