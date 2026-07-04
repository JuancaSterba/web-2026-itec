package ar.edu.itec1misiones.asistencias.repository;

import ar.edu.itec1misiones.asistencias.model.Asistencia;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AsistenciaRepository extends JpaRepository<Asistencia, Long> {
}
