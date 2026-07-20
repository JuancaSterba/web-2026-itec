package ar.edu.itec1misiones.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CalificacionMesaResponse {
    private Long id;
    private Long mesaExamenId;
    private Long alumnoId;
    private BigDecimal nota;
    private boolean ausente;
    private String libro;
    private String folio;
}
