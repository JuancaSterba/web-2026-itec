package ar.edu.itec1misiones.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AlumnoUpdateRequest {

    @NotBlank(message = "El legajo es obligatorio")
    private String legajo;

    private boolean activo;
}
