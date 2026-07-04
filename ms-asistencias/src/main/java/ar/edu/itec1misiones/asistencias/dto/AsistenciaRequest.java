package ar.edu.itec1misiones.asistencias.dto;

import ar.edu.itec1misiones.asistencias.model.EstadoAsistencia;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AsistenciaRequest {

    @NotNull(message = "El ID del alumno es obligatorio")
    private Long alumnoId;

    @NotNull(message = "El ID de la comision es obligatorio")
    private Long comisionId;

    @NotNull(message = "La fecha es obligatoria")
    private LocalDate fecha;

    @NotNull(message = "El estado es obligatorio")
    private EstadoAsistencia estado;
}
