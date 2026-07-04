package ar.edu.itec1misiones.dto.response;

import ar.edu.itec1misiones.model.EstadoCursada;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlumnoInscriptoResponse {
    private Long id;
    private Long alumnoCarreraId;
    // DTO aplanado (ver docs/deuda_tecnica.md #1): antes solo traia
    // alumnoCarreraId + un nombre completo armado, obligando al frontend a
    // pedir /inscripciones-carreras/{id} por cada fila para resolver el
    // alumnoId real. Ahora el JOIN FETCH del repository trae todo de una.
    private Long alumnoId;
    private String nombre;
    private String apellido;
    private String dni;
    private String legajo;
    private Long comisionMateriaId;
    private String materiaNombre;
    private String comisionNombre;
    private EstadoCursada estado;
    private Double notaFinal;
}
