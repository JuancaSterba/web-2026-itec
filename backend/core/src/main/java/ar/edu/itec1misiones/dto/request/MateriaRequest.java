package ar.edu.itec1misiones.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MateriaRequest {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotNull(message = "La carga horaria es obligatoria")
    @Min(value = 1, message = "La carga horaria debe ser mayor a 0")
    private Integer cargaHoraria;

    @NotNull(message = "El año de cursada es obligatorio")
    @Min(value = 1, message = "El año debe ser mayor a 0")
    private Integer anio;

    @NotNull(message = "El cuatrimestre es obligatorio")
    @Min(value = 1, message = "El cuatrimestre debe ser 1 o 2")
    private Integer cuatrimestre;

    @NotNull(message = "El ID del plan de estudio es obligatorio")
    private Long planEstudioId;
}
