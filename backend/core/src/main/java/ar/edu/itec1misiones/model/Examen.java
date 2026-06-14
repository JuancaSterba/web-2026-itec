package ar.edu.itec1misiones.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Examen {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate fecha;

    @Enumerated(EnumType.STRING)
    private TipoEvaluacion tipo;

    private String descripcion;

    @ManyToOne
    private ComisionMateria comision;

    @OneToMany(mappedBy = "examen")
    private List<Nota> notas;
}
