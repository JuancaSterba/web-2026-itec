package ar.edu.itec1misiones.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Espejo de ResumenAsistenciaResponse de ms-asistencias (GET /api/asistencias/resumen).
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ResumenAsistenciaDto {
    public static final String REGULAR = "REGULAR";
    public static final String NO_REGULAR = "NO_REGULAR";
    public static final String SIN_REGISTROS = "SIN_REGISTROS";

    private Long cursadaId;
    private int presentes;
    private int tardanzas;
    private int ausentes;
    private int totalClases;
    private Double porcentaje;
    private String estado;
}
