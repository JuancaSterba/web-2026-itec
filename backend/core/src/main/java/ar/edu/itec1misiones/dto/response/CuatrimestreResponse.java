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
public class CuatrimestreResponse {
    private Long id;
    private Integer anio;
    private Integer numero;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private boolean actual;
}
