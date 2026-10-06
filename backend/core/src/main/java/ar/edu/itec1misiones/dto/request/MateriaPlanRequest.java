package ar.edu.itec1misiones.dto.request;

import ar.edu.itec1misiones.model.ModalidadEvaluacion;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class MateriaPlanRequest {

    @NotNull(message = "El ID del plan de estudio es obligatorio")
    private Long planEstudioId;

    @NotNull(message = "El ID de la materia es obligatorio")
    private Long materiaId;

    private Integer cuatrimestreDictado;

    private Integer cargaHoraria;

    private List<Long> correlativaIds;

    @NotNull(message = "La modalidad de evaluación es obligatoria")
    private ModalidadEvaluacion modalidadEvaluacion;
}
