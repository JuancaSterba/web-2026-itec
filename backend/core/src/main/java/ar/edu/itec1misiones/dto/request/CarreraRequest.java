package ar.edu.itec1misiones.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CarreraRequest {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    private String descripcion;

    private String resolucion;
}
