package ar.edu.itec1misiones.repository;

import ar.edu.itec1misiones.model.PeriodoAcademico;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PeriodoAcademicoRepository extends JpaRepository<PeriodoAcademico, Long> {
    List<PeriodoAcademico> findByCicloLectivoId(Long cicloLectivoId);
}
