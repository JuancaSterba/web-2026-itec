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
public class InscripcionCarreraResponse {
    private Long id;
    private Long alumnoId;
    private Long planEstudioId;
    private LocalDate fechaInscripcion;
    private String estado;
}
