package ar.edu.itec1misiones.repository;

import ar.edu.itec1misiones.model.Alumno;
import ar.edu.itec1misiones.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.*;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlumnoRepository extends JpaRepository<Alumno, Long> {
    Optional<Alumno> findByUser(User user);
    Optional<Alumno> findByUserId(Long userId);
    Optional<Alumno> findByLegajo(String legajo);
    Optional<Alumno> findByUserDni(String dni);
    List<Alumno> findByActivoTrue();
    boolean existsByLegajo(String legajo);
    boolean existsByLegajoAndIdNot(String legajo, Long id);
}
