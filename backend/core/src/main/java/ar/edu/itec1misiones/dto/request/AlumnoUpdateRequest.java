package ar.edu.itec1misiones.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class AlumnoUpdateRequest {

    @NotBlank(message = "El legajo es obligatorio")
    private String legajo;

    private boolean activo;

    @Pattern(regexp = "^$|\\d{6,15}", message = "El teléfono secundario debe contener entre 6 y 15 números")
    private String telefonoSecundario;
}
