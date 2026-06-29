package ar.edu.itec1misiones.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CuatrimestreRequest {

    @NotNull(message = "El año es obligatorio")
    @Min(value = 2000, message = "El año debe ser 2000 o posterior")
    private Integer anio;

    @NotNull(message = "El número de cuatrimestre es obligatorio")
    @Min(value = 1, message = "El número debe ser 1 o 2")
    @Max(value = 2, message = "El número debe ser 1 o 2")
    private Integer numero;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate fechaInicio;

    @NotNull(message = "La fecha de fin es obligatoria")
    private LocalDate fechaFin;

    private boolean actual;
}
