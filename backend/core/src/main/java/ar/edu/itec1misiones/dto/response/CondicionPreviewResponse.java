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
    private Long cursadaId;
    private Double promedioParciales;
    private CondicionFinal condicionFinal;
    private Double notaCierre;
}
