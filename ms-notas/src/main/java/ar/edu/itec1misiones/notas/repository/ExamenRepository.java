package ar.edu.itec1misiones.notas.repository;

import ar.edu.itec1misiones.notas.model.Examen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExamenRepository extends JpaRepository<Examen, Long> {

    @Query("SELECT e FROM Examen e WHERE (:comisionId IS NULL OR e.comisionId = :comisionId)")
    List<Examen> buscarPorFiltros(@Param("comisionId") Long comisionId);
}
