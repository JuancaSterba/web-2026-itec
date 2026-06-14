package ar.edu.itec1misiones.repository;

import ar.edu.itec1misiones.model.Materia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.*;

@Repository
public interface MateriaRepository extends JpaRepository<Materia, Long> {
}
