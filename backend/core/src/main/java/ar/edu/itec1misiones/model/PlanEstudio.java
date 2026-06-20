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

    private String validez;
    private String resolucion;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private boolean activo = true;

    @ManyToOne
    private Carrera carrera;

    @OneToMany(mappedBy = "planEstudio", cascade = CascadeType.ALL)
    private List<Materia> materias = new ArrayList<>();
}
