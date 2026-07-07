package ar.edu.itec1misiones.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MateriaRequest {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    private String codigoInterno;

    private String descripcion;
}
