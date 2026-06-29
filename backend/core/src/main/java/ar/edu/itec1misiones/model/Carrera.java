package ar.edu.itec1misiones.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Carrera {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String descripcion;
    private String resolucion;
    private boolean activa = true;

    @OneToMany(mappedBy = "carrera", cascade = CascadeType.ALL)
    private List<PlanEstudio> planes = new ArrayList<>();
}
