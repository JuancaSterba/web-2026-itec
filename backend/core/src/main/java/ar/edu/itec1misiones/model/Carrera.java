package ar.edu.itec1misiones.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Carrera {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String resolucionMinisterial;

    // Cupo de inscripcion de referencia (tipicamente el de 1er año). No es un
    // limite duro: es un dato informativo usado para generar el cupoMaximo de
    // las comisiones al ofertar automaticamente, y para metricas de ocupacion.
    // Un solo valor por carrera, editable año a año; no se duplica por materia.
    private Integer cupoActual;

    @Builder.Default
    private boolean activa = true;
}
