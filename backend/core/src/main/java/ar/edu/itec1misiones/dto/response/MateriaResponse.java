package ar.edu.itec1misiones.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MateriaResponse {
    private Long id;
    private String nombre;
    private Integer cargaHoraria;
    private Integer anio;
    private Integer cuatrimestre;
    private boolean activa;
    private Long planEstudioId;
    private String planEstudioValidez;
    private List<Long> correlativasIds;
}
