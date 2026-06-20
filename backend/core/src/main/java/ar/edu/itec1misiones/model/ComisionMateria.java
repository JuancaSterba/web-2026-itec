package ar.edu.itec1misiones.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComisionMateria {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private Integer cupo;
    private boolean activa = true;

    @ManyToOne
    private Materia materia;

    @ManyToOne
    private Cuatrimestre cuatrimestre;

    @ManyToOne
    private Profesor profesor;

    @OneToMany(mappedBy = "comision")
    private List<HorarioClase> horarios;

    @OneToMany(mappedBy = "comision")
    private List<Examen> examenes;

    @OneToMany(mappedBy = "comision")
    private List<AlumnoInscripto> inscriptos;
}
