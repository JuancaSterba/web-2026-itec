package ar.edu.itec1misiones.security.service;

import ar.edu.itec1misiones.dto.response.PersonaResumenResponse;
import ar.edu.itec1misiones.exception.RolYaAsignadoException;
import ar.edu.itec1misiones.model.Rol;
import ar.edu.itec1misiones.model.User;
import ar.edu.itec1misiones.security.repository.UserRepository;
import ar.edu.itec1misiones.service.UserLookupPort;
import ar.edu.itec1misiones.util.LegajoGenerator;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
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
    public Optional<PersonaResumenResponse> buscarPorDni(String dni) {
        return userRepository.findByDni(dni).map(user -> PersonaResumenResponse.builder()
                .nombre(user.getNombre())
                .apellido(user.getApellido())
                .email(user.getEmail())
                .telefono(user.getTelefono())
                .legajo(user.getLegajo())
                .roles(user.getRoles())
                .build());
    }

    @Override
    public User crearConCredencialesPorDni(String nombre, String apellido, String dni, String email,
                                            String telefono, String telefonoSecundario, Rol rol) {
        Optional<User> existente = userRepository.findByDni(dni);
        if (existente.isPresent()) {
            return adjuntarRol(existente.get(), rol);
        }

        List<String> errores = new ArrayList<>();
        if (userRepository.existsByUsername(dni)) {
            errores.add("Ya existe un usuario con username '" + dni + "'");
        }
        if (userRepository.existsByEmail(email)) {
            errores.add("El email '" + email + "' ya está en uso");
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
        user.setTelefonoSecundario(telefonoSecundario);
        user.setLegajo(LegajoGenerator.generar(dni));
        // ADMIN/ADMINISTRATIVO tienen login inmediato; Alumnos/Profesores no
        // tienen UI propia todavia y la cuenta se crea deshabilitada (ver
        // Reglas_de_Negocio.md).
        user.setEnabled(rol == Rol.ADMIN || rol == Rol.ADMINISTRATIVO);

        return userRepository.save(user);
    }

    private User adjuntarRol(User user, Rol rol) {
        if (user.getRoles().contains(rol)) {
            throw new RolYaAsignadoException(user.getDni(), rol);
        }

        Set<Rol> nuevosRoles = new HashSet<>(user.getRoles());
        nuevosRoles.add(rol);
        user.setRoles(nuevosRoles);

        // Si el rol nuevo requiere login inmediato, se habilita la cuenta
        // (nunca se deshabilita una cuenta que ya estaba habilitada).
        if (rol == Rol.ADMIN || rol == Rol.ADMINISTRATIVO) {
            user.setEnabled(true);
        }

        return userRepository.save(user);
    }

    @Override
    public void deshabilitar(Long userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setEnabled(false);
            userRepository.save(user);
        });
    }

    @Override
    public void actualizarDniSiCambio(User user, String nuevoDni) {
        if (nuevoDni == null || nuevoDni.equals(user.getDni())) {
            return;
        }
        if (userRepository.existsByDni(nuevoDni)) {
            throw new IllegalArgumentException("El DNI '" + nuevoDni + "' ya está en uso");
        }
        user.setDni(nuevoDni);
        user.setLegajo(LegajoGenerator.generar(nuevoDni));
    }
}
