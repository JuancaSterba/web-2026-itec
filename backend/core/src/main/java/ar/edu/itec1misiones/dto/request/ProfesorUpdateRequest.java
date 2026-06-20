package ar.edu.itec1misiones.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProfesorUpdateRequest {

    @NotBlank(message = "El título es obligatorio")
    private String titulo;

    @NotBlank(message = "El teléfono de contacto es obligatorio")
    private String telefonoContacto;

    private boolean activo;
}
