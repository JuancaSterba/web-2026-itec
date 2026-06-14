package ar.edu.itec1misiones.repository;

import ar.edu.itec1misiones.model.Nota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.*;

@Repository
public interface NotaRepository extends JpaRepository<Nota, Long> {
}
