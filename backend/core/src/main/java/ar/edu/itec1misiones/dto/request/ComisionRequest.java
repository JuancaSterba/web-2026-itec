package ar.edu.itec1misiones.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ComisionRequest {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotNull(message = "El cupo es obligatorio")
    @Min(value = 1, message = "El cupo debe ser mayor a 0")
    private Integer cupo;

    @NotNull(message = "El ID de la materia es obligatorio")
    private Long materiaId;

    @NotNull(message = "El ID del cuatrimestre es obligatorio")
    private Long cuatrimestreId;

    @NotNull(message = "El ID del profesor es obligatorio")
    private Long profesorId;

    private boolean activa = true;
}
