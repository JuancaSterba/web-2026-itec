package ar.edu.itec1misiones.repository;

import ar.edu.itec1misiones.model.Asistencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.*;

@Repository
public interface AsistenciaRepository extends JpaRepository<Asistencia, Long> {
}
