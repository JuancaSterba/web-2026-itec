package ar.edu.itec1misiones.repository;

import ar.edu.itec1misiones.model.HorarioClase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.*;

@Repository
public interface HorarioClaseRepository extends JpaRepository<HorarioClase, Long> {
}
