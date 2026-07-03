package ar.edu.itec1misiones.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AlumnoInscriptoRequest {

    @NotNull(message = "El ID del alumno-carrera es obligatorio")
    private Long alumnoCarreraId;

    @NotNull(message = "El ID de la comisión es obligatorio")
    private Long comisionMateriaId;
}
