package ar.edu.itec1misiones.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entidad puente entre Comision y Profesor (asignacion docente).
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComisionProfesor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Comision comision;

    @ManyToOne
    private Profesor profesor;

    private String rol;
}
