package ar.edu.itec1misiones.repository;

import ar.edu.itec1misiones.model.PlanEstudio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlanEstudioRepository extends JpaRepository<PlanEstudio, Long> {
    List<PlanEstudio> findByActivoTrue();
    List<PlanEstudio> findByCarreraIdAndActivoTrue(Long carreraId);
}
