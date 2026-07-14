package ar.edu.itec1misiones.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class CalificacionParcialDto {
    private Long id;
    private Long cursadaId;
    private Long comisionId;
    private String instancia;
    private Double nota;
    private LocalDate fecha;
}
