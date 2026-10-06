package ar.edu.itec1misiones.notas.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CalificacionParcial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "El ID de la cursada es obligatorio")
    private Long cursadaId;

    @NotNull(message = "El ID de la comisión es obligatorio")
    private Long comisionId;

    @NotBlank(message = "La instancia es obligatoria")
    private String instancia;

    @NotNull(message = "La nota es obligatoria")
    private Double nota;

    @NotNull(message = "La fecha es obligatoria")
    private LocalDate fecha;
}
