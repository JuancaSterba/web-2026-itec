package ar.edu.itec1misiones.repository;

import ar.edu.itec1misiones.model.InscripcionMesa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InscripcionMesaRepository extends JpaRepository<InscripcionMesa, Long> {
    List<InscripcionMesa> findByMesaExamenId(Long mesaExamenId);
    boolean existsByMesaExamenIdAndAlumnoId(Long mesaExamenId, Long alumnoId);
    boolean existsByAlumnoIdAndMesaExamenId(Long alumnoId, Long mesaExamenId);
    boolean existsByAlumnoIdAndMesaExamenMateriaPlanIdAndAprobadoTrue(Long alumnoId, Long materiaPlanId);
}
