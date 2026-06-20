package ar.edu.itec1misiones.repository;

import ar.edu.itec1misiones.model.Profesor;
import ar.edu.itec1misiones.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.*;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProfesorRepository extends JpaRepository<Profesor, Long> {
    Optional<Profesor> findByUser(User user);
    Optional<Profesor> findByUserId(Long userId);
    Optional<Profesor> findByUserDni(String dni);
    List<Profesor> findByActivoTrue();
}
