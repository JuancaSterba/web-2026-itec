package ar.edu.itec1misiones.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MateriaPlanRequest {

    @NotNull(message = "El ID del plan de estudio es obligatorio")
    private Long planEstudioId;

    @NotNull(message = "El ID de la materia es obligatorio")
    private Long materiaId;

    private Integer cuatrimestreDictado;

    private Integer cargaHoraria;
}
