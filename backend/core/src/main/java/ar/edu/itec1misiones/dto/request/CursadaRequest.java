package ar.edu.itec1misiones.dto.request;

import ar.edu.itec1misiones.model.CondicionFinal;
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

    private CondicionFinal condicionFinal;

    private Double notaCierre;
}
