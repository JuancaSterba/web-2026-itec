package ar.edu.itec1misiones.repository;

import ar.edu.itec1misiones.model.AlumnoInscripto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlumnoInscriptoRepository extends JpaRepository<AlumnoInscripto, Long> {
    boolean existsByAlumnoCarreraIdAndComisionId(Long alumnoCarreraId, Long comisionId);
    long countByComisionId(Long comisionId);
    List<AlumnoInscripto> findByAlumnoCarreraId(Long alumnoCarreraId);
}
