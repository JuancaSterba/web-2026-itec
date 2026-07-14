package ar.edu.itec1misiones.model;

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

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Instancia de examen final independiente de la cursada (mesa o llamado).
 * El acta de la mesa es lo que asienta la aprobacion definitiva de la
 * materia; la cursada solo determina la condicion con la que el alumno
 * se inscribe (ver InscripcionMesa).
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MesaExamen {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private MateriaPlan materiaPlan;

    @ManyToOne
    private PeriodoAcademico periodoAcademico;

    private LocalDateTime fechaHora;

    @Enumerated(EnumType.STRING)
    private EstadoMesa estado;

    // Docentes designados como tribunal (Users con rol PROFESOR).
    @ManyToMany
    @JoinTable(name = "mesa_examen_tribunal",
            joinColumns = @JoinColumn(name = "mesa_examen_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    @Builder.Default
    private Set<User> tribunal = new HashSet<>();
}
