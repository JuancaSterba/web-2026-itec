package ar.edu.itec1misiones.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.math.BigDecimal;

/**
 * Inscripcion de un alumno a una MesaExamen, con la condicion academica
 * con la que se presenta a rendir (REGULAR, LIBRE o PROMOCION).
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InscripcionMesa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private MesaExamen mesaExamen;

    @ManyToOne
    private User alumno;

    @Enumerated(EnumType.STRING)
    private CondicionInscripcion condicionInscripcion;

    private LocalDateTime fechaInscripcion;

    private BigDecimal notaDefinitiva;

    @Builder.Default
    private boolean aprobado = false;
}
