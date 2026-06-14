package ar.edu.itec1misiones.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlumnoCarrera {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Alumno alumno;

    @ManyToOne
    private Carrera carrera;

    @ManyToOne
    private PlanEstudio planEstudio;

    private Integer anioIngreso;

    @OneToMany(mappedBy = "alumnoCarrera")
    private List<AlumnoInscripto> inscripciones;
}
