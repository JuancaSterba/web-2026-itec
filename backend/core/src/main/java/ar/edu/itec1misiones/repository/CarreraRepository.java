package ar.edu.itec1misiones.repository;

import ar.edu.itec1misiones.model.Carrera;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CarreraRepository extends JpaRepository<Carrera, Long> {
    List<Carrera> findByActivaTrue();
}
