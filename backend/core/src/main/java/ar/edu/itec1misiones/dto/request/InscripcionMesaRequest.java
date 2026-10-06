package ar.edu.itec1misiones.dto.request;

import ar.edu.itec1misiones.model.CondicionInscripcion;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InscripcionMesaRequest {

    @NotNull(message = "El ID del alumno es obligatorio")
    private Long alumnoId;

    @NotNull(message = "La condición de inscripción es obligatoria")
    private CondicionInscripcion condicionInscripcion;
}
