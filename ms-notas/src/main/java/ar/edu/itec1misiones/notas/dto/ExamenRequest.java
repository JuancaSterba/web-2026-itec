package ar.edu.itec1misiones.notas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ExamenRequest {

    @NotNull(message = "El ID de la comision es obligatorio")
    private Long comisionId;

    @NotBlank(message = "El nombre del examen es obligatorio")
    private String nombre;

    @NotNull(message = "La fecha es obligatoria")
    private LocalDate fecha;
}
