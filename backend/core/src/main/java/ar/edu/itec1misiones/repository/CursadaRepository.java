package ar.edu.itec1misiones.repository;

import ar.edu.itec1misiones.model.Cursada;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CursadaRepository extends JpaRepository<Cursada, Long> {
    boolean existsByAlumnoIdAndComisionId(Long alumnoId, Long comisionId);
    long countByComisionId(Long comisionId);
    List<Cursada> findByAlumnoId(Long alumnoId);
}
