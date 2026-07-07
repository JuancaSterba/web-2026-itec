package ar.edu.itec1misiones.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class InscripcionCarreraRequest {

    @NotNull(message = "El ID del alumno es obligatorio")
    private Long alumnoId;

    @NotNull(message = "El ID del plan de estudio es obligatorio")
    private Long planEstudioId;

    private LocalDate fechaInscripcion;

    private String estado;
}
