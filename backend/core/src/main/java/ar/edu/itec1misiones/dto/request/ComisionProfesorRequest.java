package ar.edu.itec1misiones.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ComisionProfesorRequest {

    @NotNull(message = "El ID de la comisión es obligatorio")
    private Long comisionId;

    @NotNull(message = "El ID del profesor es obligatorio")
    private Long profesorId;

    private String rol;
}
