package ar.edu.itec1misiones.service.impl;

import ar.edu.itec1misiones.dto.request.AlumnoRegistroDTO;
import ar.edu.itec1misiones.dto.request.AlumnoUpdateRequest;
import ar.edu.itec1misiones.dto.response.AlumnoResponse;
import ar.edu.itec1misiones.exception.AlumnoNotFoundException;
import ar.edu.itec1misiones.model.Alumno;
import ar.edu.itec1misiones.model.Rol;
import ar.edu.itec1misiones.model.User;
import ar.edu.itec1misiones.repository.AlumnoRepository;
import ar.edu.itec1misiones.service.AlumnoService;
import ar.edu.itec1misiones.service.UserLookupPort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AlumnoServiceImpl implements AlumnoService {

    private final AlumnoRepository alumnoRepository;
    private final UserLookupPort userLookupPort;

    public AlumnoServiceImpl(AlumnoRepository alumnoRepository, UserLookupPort userLookupPort) {
        this.alumnoRepository = alumnoRepository;
        this.userLookupPort = userLookupPort;
    }

    @Override
    public void crearAlumnoConUsuario(User user) {
        if (user.getDni() == null || user.getEmail() == null || user.getTelefono() == null) {
            throw new IllegalArgumentException("Faltan datos personales requeridos");
        }
        Alumno alumno = new Alumno();
        alumno.setUser(user);
        alumnoRepository.save(alumno);
    }

    @Override
    public AlumnoResponse crearConUsuario(AlumnoRegistroDTO dto) {
        if (alumnoRepository.existsByLegajo(dto.getLegajo())) {
            throw new IllegalArgumentException(
                    "El legajo '" + dto.getLegajo() + "' ya está en uso");
        }

        // Si esto falla (DNI/email/telefono duplicado), la transaccion completa
        // se revierte -- no queda un Usuario huerfano sin Alumno asociado.
        User user = userLookupPort.crearConCredencialesPorDni(
                dto.getNombre(), dto.getApellido(), dto.getDni(), dto.getEmail(), dto.getTelefono(), Rol.ALUMNO);

        Alumno alumno = new Alumno();
        alumno.setUser(user);
        alumno.setLegajo(dto.getLegajo());
        alumno.setActivo(true);

        return toResponse(alumnoRepository.save(alumno));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AlumnoResponse> listarActivos() {
        return alumnoRepository.findByActivoTrue().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AlumnoResponse buscarPorId(Long id) {
        return toResponse(alumnoRepository.findById(id)
                .orElseThrow(() -> new AlumnoNotFoundException(id)));
    }

    @Override
    @Transactional(readOnly = true)
    public AlumnoResponse buscarPorLegajo(String legajo) {
        return toResponse(alumnoRepository.findByLegajo(legajo)
                .orElseThrow(() -> new AlumnoNotFoundException("legajo", legajo)));
    }

    @Override
    @Transactional(readOnly = true)
    public AlumnoResponse buscarPorDni(String dni) {
        return toResponse(alumnoRepository.findByUserDni(dni)
                .orElseThrow(() -> new AlumnoNotFoundException("DNI", dni)));
    }

    @Override
    public AlumnoResponse actualizar(Long id, AlumnoUpdateRequest request) {
        Alumno alumno = alumnoRepository.findById(id)
                .orElseThrow(() -> new AlumnoNotFoundException(id));

        if (alumnoRepository.existsByLegajoAndIdNot(request.getLegajo(), id)) {
            throw new IllegalArgumentException(
                    "El legajo '" + request.getLegajo() + "' ya está en uso");
        }

        alumno.setLegajo(request.getLegajo());
        alumno.setActivo(request.isActivo());

        return toResponse(alumnoRepository.save(alumno));
    }

    @Override
    public void desactivar(Long id) {
        Alumno alumno = alumnoRepository.findById(id)
                .orElseThrow(() -> new AlumnoNotFoundException(id));
        alumno.setActivo(false);
        alumnoRepository.save(alumno);
    }

    private AlumnoResponse toResponse(Alumno alumno) {
        User user = alumno.getUser();
        return AlumnoResponse.builder()
                .id(alumno.getId())
                .legajo(alumno.getLegajo())
                .activo(alumno.isActivo())
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
