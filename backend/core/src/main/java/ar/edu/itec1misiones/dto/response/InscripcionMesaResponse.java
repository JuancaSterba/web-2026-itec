package ar.edu.itec1misiones.dto.response;

import ar.edu.itec1misiones.model.CondicionInscripcion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InscripcionMesaResponse {
    private Long id;
    private Long mesaExamenId;
    private Long alumnoId;
    private CondicionInscripcion condicionInscripcion;
    private LocalDateTime fechaInscripcion;
}
