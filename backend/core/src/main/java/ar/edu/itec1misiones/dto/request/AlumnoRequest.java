package ar.edu.itec1misiones.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AlumnoRequest {

    @NotNull(message = "El ID de usuario es obligatorio")
    private Long userId;

    @NotBlank(message = "El legajo es obligatorio")
    private String legajo;
}
