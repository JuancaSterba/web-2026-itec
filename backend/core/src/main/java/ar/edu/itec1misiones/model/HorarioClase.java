package ar.edu.itec1misiones.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.DayOfWeek;
import java.util.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HorarioClase {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)

    private DayOfWeek diaSemana;

    @ManyToOne
    private ComisionMateria comision;

    @ManyToMany
    @JoinTable(
        name = "horario_modulos",
        joinColumns = @JoinColumn(name = "horario_id"),
        inverseJoinColumns = @JoinColumn(name = "modulo_id")
    )
    private List<ModuloHorario> modulos;
}
