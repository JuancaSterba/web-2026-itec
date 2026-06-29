package ar.edu.itec1misiones.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Materia {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private Integer cargaHoraria;
    private Integer anio;
    private Integer cuatrimestre;
    private boolean activa = true;

    @ManyToOne
    private PlanEstudio planEstudio;

    @ManyToMany
    @JoinTable(name = "correlativas",
        joinColumns = @JoinColumn(name = "materia_id"),
        inverseJoinColumns = @JoinColumn(name = "correlativa_id"))
    private List<Materia> correlativas = new ArrayList<>();
}
