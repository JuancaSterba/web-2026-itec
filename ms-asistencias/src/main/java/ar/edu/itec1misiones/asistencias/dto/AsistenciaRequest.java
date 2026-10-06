package ar.edu.itec1misiones.asistencias.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AsistenciaRequest {

    @NotNull(message = "El ID de la cursada es obligatorio")
    private Long cursadaId;

    @NotNull(message = "El ID de la comisión es obligatorio")
    private Long comisionId;

    @NotNull(message = "La fecha es obligatoria")
    private LocalDate fecha;

    @NotBlank(message = "El estado es obligatorio")
    private String estado;
}
