package ar.edu.itec1misiones.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CicloLectivoRequest {

    @NotNull(message = "El año es obligatorio")
    private Integer anio;

    private LocalDate fechaInicio;

    private LocalDate fechaFin;
}
