package ar.edu.itec1misiones.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProfesorRequest {

    @NotNull(message = "El ID de usuario es obligatorio")
    private Long userId;

    @NotBlank(message = "El título es obligatorio")
    private String titulo;

    @NotBlank(message = "El teléfono de contacto es obligatorio")
    private String telefonoContacto;
}
