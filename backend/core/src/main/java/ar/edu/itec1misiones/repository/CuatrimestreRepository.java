package ar.edu.itec1misiones.repository;

import ar.edu.itec1misiones.model.Cuatrimestre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.*;

@Repository
public interface CuatrimestreRepository extends JpaRepository<Cuatrimestre, Long> {
}
