package ar.edu.itec1misiones.repository;

import ar.edu.itec1misiones.model.AlumnoInscripto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlumnoInscriptoRepository extends JpaRepository<AlumnoInscripto, Long> {
    boolean existsByAlumnoCarreraIdAndComisionId(Long alumnoCarreraId, Long comisionId);
    long countByComisionId(Long comisionId);

    // JOIN FETCH explicito (ver docs/deuda_tecnica.md #1): sin esto, Hibernate
    // trae la lista de inscripciones en una consulta y despues dispara una
    // consulta adicional por cada fila para resolver alumnoCarrera -> alumno
    // -> user y comision -> materia (N+1 a nivel SQL, no solo a nivel HTTP).
    // Con el JOIN FETCH, todo llega en un solo SELECT.
    @Query("""
            SELECT i FROM AlumnoInscripto i
            JOIN FETCH i.alumnoCarrera ac
            JOIN FETCH ac.alumno al
            JOIN FETCH al.user u
            JOIN FETCH i.comision c
            JOIN FETCH c.materia m
            """)
    List<AlumnoInscripto> findAllConDetalle();

    @Query("""
            SELECT i FROM AlumnoInscripto i
            JOIN FETCH i.alumnoCarrera ac
            JOIN FETCH ac.alumno al
            JOIN FETCH al.user u
            JOIN FETCH i.comision c
            JOIN FETCH c.materia m
            WHERE ac.id = :alumnoCarreraId
            """)
    List<AlumnoInscripto> findByAlumnoCarreraIdConDetalle(Long alumnoCarreraId);
}
