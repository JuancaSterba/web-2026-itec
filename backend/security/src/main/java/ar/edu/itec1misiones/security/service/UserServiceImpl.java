package ar.edu.itec1misiones.security.service;

import ar.edu.itec1misiones.model.Rol;
import ar.edu.itec1misiones.model.User;
import ar.edu.itec1misiones.dto.request.RegisterUserRequest;
import ar.edu.itec1misiones.security.exception.MultiDataExistException;
import ar.edu.itec1misiones.security.exception.UserExistException;
import ar.edu.itec1misiones.security.repository.UserRepository;
import ar.edu.itec1misiones.security.service.impl.UserService;
import ar.edu.itec1misiones.service.AlumnoService;
import ar.edu.itec1misiones.service.ProfesorService;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AlumnoService alumnoService;
    private final ProfesorService profesorService;

    public UserServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           AlumnoService alumnoService,
                           ProfesorService profesorService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.alumnoService = alumnoService;
        this.profesorService = profesorService;
    }

    @Transactional
    public void register(RegisterUserRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new UserExistException("El nombre de usuario ya está en uso.");
        }
        validarUnicidadCampos(request);

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoles(request.getRoles());

        user.setNombre(request.getNombre());
        user.setApellido(request.getApellido());
        user.setDni(request.getDni());
        user.setEmail(request.getEmail());
        user.setTelefono(request.getTelefono());

        userRepository.save(user);

        for (Rol rol : request.getRoles()) {
            switch (rol) {
                case ALUMNO -> alumnoService.crearAlumnoConUsuario(user);
                case PROFESOR -> profesorService.crearProfesorConUsuario(user);
            }
        }
    }

    private void validarUnicidadCampos(RegisterUserRequest request) {
        List<String> errores = new ArrayList<>();

        if (userRepository.existsByUsername(request.getUsername())) {
            errores.add("El nombre de usuario ya está en uso.");
        }
        if (userRepository.existsByDni(request.getDni())) {
            errores.add("El DNI ya está en uso.");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            errores.add("El email ya está en uso.");
        }
        if (userRepository.existsByTelefono(request.getTelefono())) {
            errores.add("El teléfono ya está en uso.");
        }

        if (!errores.isEmpty()) {
            throw new MultiDataExistException(errores);
        }
    }
}
