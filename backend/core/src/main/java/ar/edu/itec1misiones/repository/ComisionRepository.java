package ar.edu.itec1misiones.repository;

import ar.edu.itec1misiones.model.Comision;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComisionRepository extends JpaRepository<Comision, Long> {
    List<Comision> findByActivaTrue();
    List<Comision> findByMateriaPlanIdAndActivaTrue(Long materiaPlanId);
    List<Comision> findByPeriodoAcademicoIdAndActivaTrue(Long periodoAcademicoId);
}
