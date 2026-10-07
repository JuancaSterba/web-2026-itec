package ar.edu.itec1misiones.dto.response;

import ar.edu.itec1misiones.model.CondicionFinal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CondicionPreviewResponse {
    public static final String MOTIVO_ASISTENCIA = "ASISTENCIA";
    public static final String MOTIVO_PROMEDIO = "PROMEDIO";

    private Long cursadaId;
    // null si queda LIBRE por asistencia sin los 3 parciales cargados.
    private Double promedioParciales;
    private CondicionFinal condicionFinal;
    private Double notaCierre;
    private Double porcentajeAsistencia;
    private String estadoAsistencia;
    // Por que quedo LIBRE: ASISTENCIA o PROMEDIO; null si no quedo LIBRE (RF-23).
    private String motivoLibre;
}
