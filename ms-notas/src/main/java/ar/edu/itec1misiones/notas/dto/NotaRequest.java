package ar.edu.itec1misiones.notas.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class NotaRequest {

    @NotNull(message = "El ID del examen es obligatorio")
    private Long examenId;

    @NotNull(message = "El ID del alumno es obligatorio")
    private Long alumnoId;

    @NotNull(message = "El valor de la nota es obligatorio")
    private BigDecimal valor;

    private String observaciones;
}
