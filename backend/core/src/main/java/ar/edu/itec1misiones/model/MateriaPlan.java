package ar.edu.itec1misiones.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

/**
 * Estructura curricular: pivot entre {@link PlanEstudio} y {@link Materia}.
 * Las correlativas se resuelven contra otras filas de esta misma tabla
 * (materia dictada en un plan concreto), no contra la materia del catálogo.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MateriaPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ToString.Exclude
    @JsonIgnore
    @ManyToOne
    private PlanEstudio planEstudio;

    @ManyToOne
    private Materia materia;

    private Integer cuatrimestreDictado;
    private Integer cargaHoraria;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ModalidadEvaluacion modalidadEvaluacion = ModalidadEvaluacion.FINAL;

    @ToString.Exclude
    @JsonIgnore
    @Builder.Default
    @ManyToMany
    @JoinTable(name = "correlatividades",
        joinColumns = @JoinColumn(name = "materia_plan_id"),
        inverseJoinColumns = @JoinColumn(name = "correlativa_id"))
    private List<MateriaPlan> correlativas = new ArrayList<>();
}
