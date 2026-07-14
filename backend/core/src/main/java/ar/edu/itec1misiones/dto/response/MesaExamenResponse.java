package ar.edu.itec1misiones.dto.response;

import ar.edu.itec1misiones.model.EstadoMesa;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MesaExamenResponse {
    private Long id;
    private Long materiaPlanId;
    private Long periodoAcademicoId;
    private LocalDateTime fechaHora;
    private EstadoMesa estado;
    private List<Long> tribunalIds;
}
