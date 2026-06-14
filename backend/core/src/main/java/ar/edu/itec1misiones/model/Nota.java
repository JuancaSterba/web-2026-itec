package ar.edu.itec1misiones.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Nota {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double valor;

    @ManyToOne
    @JoinColumn(name = "alumno_inscripto_id")
    private AlumnoInscripto inscripcion;

    @ManyToOne
    private Examen examen;
}
