package ar.edu.itec1misiones.repository;

import ar.edu.itec1misiones.model.InscripcionCarrera;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InscripcionCarreraRepository extends JpaRepository<InscripcionCarrera, Long> {
    boolean existsByAlumnoIdAndPlanEstudioId(Long alumnoId, Long planEstudioId);
    List<InscripcionCarrera> findByAlumnoId(Long alumnoId);
}
