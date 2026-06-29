package ar.edu.itec1misiones.repository;

import ar.edu.itec1misiones.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CoreUserRepository extends JpaRepository<User, Long> {
    boolean existsByUsername(String username);
}
