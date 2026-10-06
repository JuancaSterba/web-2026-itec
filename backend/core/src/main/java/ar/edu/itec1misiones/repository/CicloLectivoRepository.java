package ar.edu.itec1misiones.repository;

import ar.edu.itec1misiones.model.CicloLectivo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CicloLectivoRepository extends JpaRepository<CicloLectivo, Long> {
    List<CicloLectivo> findByActivoTrue();
}
