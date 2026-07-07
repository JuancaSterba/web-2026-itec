package ar.edu.itec1misiones.asistencias.repository;

import ar.edu.itec1misiones.asistencias.model.Asistencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AsistenciaRepository extends JpaRepository<Asistencia, Long> {

    @Query("SELECT a FROM Asistencia a WHERE (:cursadaId IS NULL OR a.cursadaId = :cursadaId) AND (CAST(:fecha AS date) IS NULL OR a.fecha = :fecha)")
    List<Asistencia> buscarPorFiltros(@Param("cursadaId") Long cursadaId, @Param("fecha") LocalDate fecha);
}
