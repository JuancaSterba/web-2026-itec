package ar.edu.itec1misiones.security.service;

import ar.edu.itec1misiones.model.Rol;
import ar.edu.itec1misiones.model.User;
import ar.edu.itec1misiones.security.repository.UserRepository;
import ar.edu.itec1misiones.service.UserLookupPort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class UserLookupPortImpl implements UserLookupPort {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserLookupPortImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public User crearConCredencialesPorDni(String nombre, String apellido, String dni, String email, String telefono, Rol rol) {
        List<String> errores = new ArrayList<>();
        if (userRepository.existsByUsername(dni)) {
            errores.add("Ya existe un usuario con username '" + dni + "'");
        }
        if (userRepository.existsByDni(dni)) {
            errores.add("El DNI '" + dni + "' ya está en uso");
        }
        if (userRepository.existsByEmail(email)) {
            errores.add("El email '" + email + "' ya está en uso");
        }
        if (userRepository.existsByTelefono(telefono)) {
            errores.add("El teléfono '" + telefono + "' ya está en uso");
        }
        if (!errores.isEmpty()) {
            throw new IllegalArgumentException(String.join(". ", errores));
        }

        User user = new User();
        user.setUsername(dni);
        user.setPassword(passwordEncoder.encode(dni));
        user.setRoles(Set.of(rol));
        user.setNombre(nombre);
        user.setApellido(apellido);
        user.setDni(dni);
        user.setEmail(email);
        user.setTelefono(telefono);
        // Alumnos/Profesores no tienen UI propia todavia: la cuenta se crea
        // deshabilitada para que no puedan loguearse (ver Reglas_de_Negocio.md).
        user.setEnabled(false);

        return userRepository.save(user);
    }

    @Override
    public void deshabilitar(Long userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setEnabled(false);
            userRepository.save(user);
        });
    }
}
