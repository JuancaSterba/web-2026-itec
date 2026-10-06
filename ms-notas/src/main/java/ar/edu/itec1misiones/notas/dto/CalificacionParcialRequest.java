package ar.edu.itec1misiones.notas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CalificacionParcialRequest {

    @NotNull(message = "El ID de la cursada es obligatorio")
    private Long cursadaId;

    @NotNull(message = "El ID de la comisión es obligatorio")
    private Long comisionId;

    @NotBlank(message = "La instancia es obligatoria")
    private String instancia;

    @NotNull(message = "La nota es obligatoria")
    private Double nota;

    @NotNull(message = "La fecha es obligatoria")
    private LocalDate fecha;
}
