package ar.edu.itec1misiones.repository;

import ar.edu.itec1misiones.model.ComisionMateria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.*;

@Repository
public interface ComisionMateriaRepository extends JpaRepository<ComisionMateria, Long> {
}
