package ar.edu.itec1misiones.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CursadaRequest {

    @NotNull(message = "El ID del alumno es obligatorio")
    private Long alumnoId;

    @NotNull(message = "El ID de la comisión es obligatorio")
    private Long comisionId;

    private LocalDate fechaInscripcion;

    private String condicionFinal;

    private Double notaCierre;
}
