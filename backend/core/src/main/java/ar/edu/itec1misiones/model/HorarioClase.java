package ar.edu.itec1misiones.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.DayOfWeek;
import java.time.LocalTime;
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

    private LocalTime horaInicio;

    private LocalTime horaFin;
    @ManyToOne
    private Comision comision;
}
