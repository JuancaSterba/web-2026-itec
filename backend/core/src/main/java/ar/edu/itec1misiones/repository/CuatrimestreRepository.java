package ar.edu.itec1misiones.repository;

import ar.edu.itec1misiones.model.Cuatrimestre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.*;

import java.util.Optional;

@Repository
public interface CuatrimestreRepository extends JpaRepository<Cuatrimestre, Long> {
    Optional<Cuatrimestre> findByActualTrue();
    boolean existsByAnioAndNumero(Integer anio, Integer numero);
    boolean existsByAnioAndNumeroAndIdNot(Integer anio, Integer numero, Long id);
}
