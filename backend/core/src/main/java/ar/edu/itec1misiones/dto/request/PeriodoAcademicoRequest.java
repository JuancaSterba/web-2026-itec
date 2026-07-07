package ar.edu.itec1misiones.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PeriodoAcademicoRequest {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    private LocalDate fechaInicio;

    private LocalDate fechaFin;

    @NotNull(message = "El ID del ciclo lectivo es obligatorio")
    private Long cicloLectivoId;
}
