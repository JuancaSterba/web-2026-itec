package ar.edu.itec1misiones.notas.repository;

import ar.edu.itec1misiones.notas.model.CalificacionMesa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CalificacionMesaRepository extends JpaRepository<CalificacionMesa, Long> {
    List<CalificacionMesa> findByMesaExamenId(Long mesaExamenId);
    boolean existsByMesaExamenIdAndAlumnoId(Long mesaExamenId, Long alumnoId);
}
