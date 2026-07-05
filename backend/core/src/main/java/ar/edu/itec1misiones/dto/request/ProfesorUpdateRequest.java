package ar.edu.itec1misiones.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProfesorUpdateRequest {

    @NotBlank(message = "El título es obligatorio")
    private String titulo;

    @NotBlank(message = "El teléfono secundario es obligatorio")
    private String telefonoSecundario;

    private boolean activo;
}
