package ar.edu.itec1misiones.notas.repository;

import ar.edu.itec1misiones.notas.model.CalificacionParcial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CalificacionParcialRepository extends JpaRepository<CalificacionParcial, Long> {

    @Query("SELECT c FROM CalificacionParcial c WHERE (:cursadaId IS NULL OR c.cursadaId = :cursadaId)")
    List<CalificacionParcial> buscarPorFiltros(@Param("cursadaId") Long cursadaId);
}
