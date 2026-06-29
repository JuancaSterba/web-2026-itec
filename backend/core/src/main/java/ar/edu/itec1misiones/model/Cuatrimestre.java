package ar.edu.itec1misiones.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cuatrimestre {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer anio;
    private Integer numero;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private boolean actual = false;
}
