package ar.edu.itec1misiones.security.repository;

import ar.edu.itec1misiones.model.Rol;
import ar.edu.itec1misiones.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByDni(String dni);
    boolean existsByEmail(String email);

    @Query("SELECT DISTINCT u FROM User u JOIN u.roles r WHERE r IN :roles")
    List<User> findByRolesIn(@Param("roles") Collection<Rol> roles);
}
