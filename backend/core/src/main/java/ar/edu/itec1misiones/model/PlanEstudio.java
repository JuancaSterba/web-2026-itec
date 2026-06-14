package ar.edu.itec1misiones.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlanEstudio {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;

    @ManyToOne
    private Carrera carrera;

    @OneToMany(mappedBy = "planEstudio", cascade = CascadeType.ALL)
    private List<Materia> materias = new ArrayList<>();
}
