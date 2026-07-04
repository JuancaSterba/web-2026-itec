package ar.edu.itec1misiones.notas.repository;

import ar.edu.itec1misiones.notas.model.Examen;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamenRepository extends JpaRepository<Examen, Long> {
}
