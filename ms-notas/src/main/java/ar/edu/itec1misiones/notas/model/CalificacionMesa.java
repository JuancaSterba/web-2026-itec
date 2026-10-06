package ar.edu.itec1misiones.notas.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Nota de un alumno en una MesaExamen del Core (acta de examen final).
 * A diferencia de CalificacionParcial, no se ata a una comisión/cursada:
 * la mesa es una instancia independiente. La nota puede ser null si el
 * alumno figura como ausente. Libro y folio son opcionales, para el
 * volcado a actas físicas.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CalificacionMesa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "El ID de la mesa de examen es obligatorio")
    private Long mesaExamenId;

    @NotNull(message = "El ID del alumno es obligatorio")
    private Long alumnoId;

    private Double nota;

    @Column(nullable = false)
    private Boolean ausente = false;

    private String libro;

    private String folio;
}
