package ar.edu.itec1misiones.repository;

import ar.edu.itec1misiones.model.ModuloHorario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ModuloHorarioRepository extends JpaRepository<ModuloHorario, Long> {
}
