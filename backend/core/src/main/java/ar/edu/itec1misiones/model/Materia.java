package ar.edu.itec1misiones.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Catálogo maestro de materias. No conoce planes de estudio, años ni
 * correlativas: esa relación vive en {@link MateriaPlan}.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Materia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String codigoInterno;
    private String descripcion;

    @Builder.Default
    private boolean activa = true;
}
