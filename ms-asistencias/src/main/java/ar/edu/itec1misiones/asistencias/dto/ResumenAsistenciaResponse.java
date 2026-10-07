package ar.edu.itec1misiones.asistencias.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResumenAsistenciaResponse {
    private Long cursadaId;
    private int presentes;
    private int tardanzas;
    private int ausentes;
    private int totalClases;
    // null cuando no hay clases con marca (SIN_REGISTROS).
    private Double porcentaje;
    private EstadoRegularidad estado;
}
