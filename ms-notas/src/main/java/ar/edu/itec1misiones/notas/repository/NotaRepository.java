package ar.edu.itec1misiones.notas.repository;

import ar.edu.itec1misiones.notas.model.Nota;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotaRepository extends JpaRepository<Nota, Long> {
}
