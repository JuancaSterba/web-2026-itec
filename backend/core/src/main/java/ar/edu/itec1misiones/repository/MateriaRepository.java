package ar.edu.itec1misiones.repository;

import ar.edu.itec1misiones.model.Materia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.*;

import java.util.List;

@Repository
public interface MateriaRepository extends JpaRepository<Materia, Long> {
    List<Materia> findByActivaTrue();
    List<Materia> findByPlanEstudioIdAndActivaTrue(Long planEstudioId);
}
