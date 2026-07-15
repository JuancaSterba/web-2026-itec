package ar.edu.itec1misiones.notas.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CalificacionMesaRequest {

    @NotNull(message = "El ID de la mesa de examen es obligatorio")
    private Long mesaExamenId;

    @NotNull(message = "El ID del alumno es obligatorio")
    private Long alumnoId;

    // Nullable: el alumno puede figurar como ausente, sin nota.
    private Double nota;

    private Boolean ausente = false;

    private String libro;

    private String folio;
}
