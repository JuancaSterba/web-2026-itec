package ar.edu.itec1misiones.repository;

import ar.edu.itec1misiones.model.MesaExamen;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MesaExamenRepository extends JpaRepository<MesaExamen, Long> {
    List<MesaExamen> findByMateriaPlanId(Long materiaPlanId);
}
