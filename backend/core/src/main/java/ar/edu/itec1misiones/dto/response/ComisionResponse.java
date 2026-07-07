package ar.edu.itec1misiones.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComisionResponse {
    private Long id;
    private String nombreComision;
    private Integer cupoMaximo;
    private boolean activa;
    private Long periodoAcademicoId;
    private Long materiaPlanId;
}
