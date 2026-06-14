package ar.edu.itec1misiones.security.config;

import ar.edu.itec1misiones.model.Profesor;
import ar.edu.itec1misiones.model.Rol;
import ar.edu.itec1misiones.model.User;
import ar.edu.itec1misiones.repository.ProfesorRepository;
import ar.edu.itec1misiones.security.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class AdminInitializer {

    private final UserRepository userRepository;
    private final ProfesorRepository profesorRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.username}")
    private String username;
    @Value("${admin.password}")
    private String password;
    @Value("${admin.nombre}")
    private String nombre;
    @Value("${admin.apellido}")
    private String apellido;
    @Value("${admin.dni}")
    private String dni;
    @Value("${admin.email}")
    private String email;
    @Value("${admin.telefono}")
    private String telefono;

    public AdminInitializer(UserRepository userRepository,
                            ProfesorRepository profesorRepository,
                            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.profesorRepository = profesorRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void init() {
        if (userRepository.findByUsername(username).isEmpty()) {
            // Crear usuario con todos los datos personales
            User user = new User();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(password));
            user.setNombre(nombre);
            user.setApellido(apellido);
            user.setDni(dni);
            user.setEmail(email);
            user.setTelefono(telefono);
            user.setRoles(Set.of(Rol.ADMIN, Rol.PROFESOR));
            userRepository.save(user);

            // Crear entidad Profesor si se requiere el comportamiento de "profesor"
            Profesor profesor = new Profesor();
            profesor.setUser(user);
            profesorRepository.save(profesor);
        }
    }
}
