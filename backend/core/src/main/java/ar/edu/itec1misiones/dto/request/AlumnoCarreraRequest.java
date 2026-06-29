package ar.edu.itec1misiones.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AlumnoCarreraRequest {

    @NotNull(message = "El ID del alumno es obligatorio")
    private Long alumnoId;

    @NotNull(message = "El ID de la carrera es obligatorio")
    private Long carreraId;

    @NotNull(message = "El ID del plan de estudio es obligatorio")
    private Long planEstudioId;

    @NotNull(message = "El año de ingreso es obligatorio")
    private Integer anioIngreso;
}
