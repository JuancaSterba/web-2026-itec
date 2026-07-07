package ar.edu.itec1misiones.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MateriaPlanResponse {
    private Long id;
    private Long planEstudioId;
    private Long materiaId;
    private String materiaNombre;
    private Integer cuatrimestreDictado;
    private Integer cargaHoraria;
}
