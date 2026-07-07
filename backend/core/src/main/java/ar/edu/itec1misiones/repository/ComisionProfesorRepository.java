package ar.edu.itec1misiones.repository;

import ar.edu.itec1misiones.model.ComisionProfesor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComisionProfesorRepository extends JpaRepository<ComisionProfesor, Long> {
    boolean existsByComisionIdAndProfesorId(Long comisionId, Long profesorId);
}
