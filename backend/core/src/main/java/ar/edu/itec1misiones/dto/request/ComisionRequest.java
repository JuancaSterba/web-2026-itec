package ar.edu.itec1misiones.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ComisionRequest {

    @NotBlank(message = "El nombre de la comisión es obligatorio")
    private String nombreComision;

    @NotNull(message = "El cupo máximo es obligatorio")
    @Min(value = 1, message = "El cupo máximo debe ser mayor a 0")
    private Integer cupoMaximo;

    @NotNull(message = "El ID del periodo académico es obligatorio")
    private Long periodoAcademicoId;

    @NotNull(message = "El ID de la materia de plan es obligatorio")
    private Long materiaPlanId;
}
