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

import java.time.LocalDate;

/**
 * Entidad puente entre Alumno y Comision. Referencia usada desde otros
 * microservicios (notas, asistencias) por su id.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cursada {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Alumno alumno;

    @ManyToOne
    private Comision comision;

    private LocalDate fechaInscripcion;
    private String condicionFinal;
    private Double notaCierre;
}
