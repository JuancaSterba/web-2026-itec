package ar.edu.itec1misiones.dto.request;

import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class AlumnoUpdateRequest {

    private boolean activo;

    @Pattern(regexp = "^$|\\d{6,15}", message = "El teléfono secundario debe contener entre 6 y 15 números")
    private String telefonoSecundario;
}
