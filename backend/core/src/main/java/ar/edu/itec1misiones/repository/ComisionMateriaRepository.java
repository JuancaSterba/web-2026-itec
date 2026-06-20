package ar.edu.itec1misiones.repository;

import ar.edu.itec1misiones.model.ComisionMateria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.*;

import java.util.List;

@Repository
public interface ComisionMateriaRepository extends JpaRepository<ComisionMateria, Long> {
    List<ComisionMateria> findByActivaTrue();
    List<ComisionMateria> findByMateriaIdAndActivaTrue(Long materiaId);
    List<ComisionMateria> findByCuatrimestreIdAndActivaTrue(Long cuatrimestreId);
    List<ComisionMateria> findByProfesorIdAndActivaTrue(Long profesorId);
}
