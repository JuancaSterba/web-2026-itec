package ar.edu.itec1misiones.service.impl;

import ar.edu.itec1misiones.dto.request.ProfesorRequest;
import ar.edu.itec1misiones.dto.request.ProfesorUpdateRequest;
import ar.edu.itec1misiones.dto.response.ProfesorResponse;
import ar.edu.itec1misiones.exception.ProfesorNotFoundException;
import ar.edu.itec1misiones.model.Profesor;
import ar.edu.itec1misiones.model.Rol;
import ar.edu.itec1misiones.model.User;
import ar.edu.itec1misiones.repository.ProfesorRepository;
import ar.edu.itec1misiones.service.ProfesorService;
import ar.edu.itec1misiones.service.UserLookupPort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ProfesorServiceImpl implements ProfesorService {

    private final ProfesorRepository profesorRepository;
    private final UserLookupPort userLookupPort;

    public ProfesorServiceImpl(ProfesorRepository profesorRepository, UserLookupPort userLookupPort) {
        this.profesorRepository = profesorRepository;
        this.userLookupPort = userLookupPort;
    }

    @Override
    public void crearProfesorConUsuario(User user) {
        if (user.getDni() == null || user.getEmail() == null || user.getTelefono() == null) {
            throw new IllegalArgumentException("Faltan datos personales requeridos");
        }
        Profesor profesor = new Profesor();
        profesor.setUser(user);
        profesorRepository.save(profesor);
    }

    @Override
    public ProfesorResponse crear(ProfesorRequest request) {
        User user = userLookupPort.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Usuario no encontrado con id: " + request.getUserId()));

        if (!user.getRoles().contains(Rol.PROFESOR)) {
            throw new IllegalArgumentException("El usuario no tiene el rol PROFESOR");
        }
        if (profesorRepository.findByUserId(request.getUserId()).isPresent()) {
            throw new IllegalArgumentException("El usuario ya tiene un perfil de profesor asociado");
        }

        Profesor profesor = new Profesor();
        profesor.setUser(user);
        profesor.setTitulo(request.getTitulo());
        profesor.setTelefonoContacto(request.getTelefonoContacto());
        profesor.setActivo(true);

        return toResponse(profesorRepository.save(profesor));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProfesorResponse> listarActivos() {
        return profesorRepository.findByActivoTrue().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProfesorResponse buscarPorId(Long id) {
        return toResponse(profesorRepository.findById(id)
                .orElseThrow(() -> new ProfesorNotFoundException(id)));
    }

    @Override
    @Transactional(readOnly = true)
    public ProfesorResponse buscarPorDni(String dni) {
        return toResponse(profesorRepository.findByUserDni(dni)
                .orElseThrow(() -> new ProfesorNotFoundException("DNI", dni)));
    }

    @Override
    public ProfesorResponse actualizar(Long id, ProfesorUpdateRequest request) {
        Profesor profesor = profesorRepository.findById(id)
                .orElseThrow(() -> new ProfesorNotFoundException(id));

        profesor.setTitulo(request.getTitulo());
        profesor.setTelefonoContacto(request.getTelefonoContacto());
        profesor.setActivo(request.isActivo());

        return toResponse(profesorRepository.save(profesor));
    }

    @Override
    public void desactivar(Long id) {
        Profesor profesor = profesorRepository.findById(id)
                .orElseThrow(() -> new ProfesorNotFoundException(id));
        profesor.setActivo(false);
        profesorRepository.save(profesor);
    }

    private ProfesorResponse toResponse(Profesor profesor) {
        User user = profesor.getUser();
        return ProfesorResponse.builder()
                .id(profesor.getId())
                .titulo(profesor.getTitulo())
                .telefonoContacto(profesor.getTelefonoContacto())
                .activo(profesor.isActivo())
                .userId(user.getId())
                .username(user.getUsername())
                .nombre(user.getNombre())
                .apellido(user.getApellido())
                .dni(user.getDni())
                .email(user.getEmail())
                .telefono(user.getTelefono())
                .build();
    }
}
