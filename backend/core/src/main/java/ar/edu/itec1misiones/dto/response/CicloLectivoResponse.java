package ar.edu.itec1misiones.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CicloLectivoResponse {
    private Long id;
    private Integer anio;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private boolean activo;
}
