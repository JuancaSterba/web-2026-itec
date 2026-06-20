package ar.edu.itec1misiones.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PlanEstudioRequest {

    @NotBlank(message = "La validez es obligatoria")
    private String validez;

    private String resolucion;

    private LocalDate fechaInicio;

    private LocalDate fechaFin;

    @NotNull(message = "El ID de la carrera es obligatorio")
    private Long carreraId;
}
