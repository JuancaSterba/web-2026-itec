package ar.edu.itec1misiones.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Asistencia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate fecha;

    private boolean presente;

    @ManyToOne
    @JoinColumn(name = "alumno_inscripto_id")
    private AlumnoInscripto inscripcion;

    @ManyToOne
    private HorarioClase horario;
}
