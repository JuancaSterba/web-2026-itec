package ar.edu.itec1misiones.repository;

import ar.edu.itec1misiones.model.MateriaPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MateriaPlanRepository extends JpaRepository<MateriaPlan, Long> {
    List<MateriaPlan> findByPlanEstudioId(Long planEstudioId);
    List<MateriaPlan> findByMateriaId(Long materiaId);
}
