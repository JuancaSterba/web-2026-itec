package ar.edu.itec1misiones.repository;

import ar.edu.itec1misiones.model.AlumnoCarrera;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlumnoCarreraRepository extends JpaRepository<AlumnoCarrera, Long> {
    boolean existsByAlumnoIdAndCarreraId(Long alumnoId, Long carreraId);
    List<AlumnoCarrera> findByAlumnoId(Long alumnoId);
}
