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
        // Si esto falla (DNI/email duplicado), la transaccion completa
        // se revierte -- no queda un Usuario huerfano sin Alumno asociado.
        // Si el DNI ya existe (persona con otro rol), userLookupPort le
        // adjunta el rol ALUMNO en vez de crear un Usuario nuevo.
        User user = userLookupPort.crearConCredencialesPorDni(
                dto.getNombre(), dto.getApellido(), dto.getDni(), dto.getEmail(),
                dto.getTelefono(), dto.getTelefonoSecundario(), Rol.ALUMNO);

        Alumno alumno = new Alumno();
        alumno.setUser(user);
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
        return toResponse(alumnoRepository.findByUserLegajo(legajo)
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

        User user = alumno.getUser();
        userLookupPort.actualizarDniSiCambio(user, request.getDni());
        userLookupPort.actualizarEmailSiCambio(user, request.getEmail());
        user.setNombre(request.getNombre());
        user.setApellido(request.getApellido());
        user.setTelefonoSecundario(request.getTelefonoSecundario());
        alumno.setActivo(request.isActivo());

        return toResponse(alumnoRepository.save(alumno));
    }

    @Override
    public void desactivar(Long id) {
        Alumno alumno = alumnoRepository.findById(id)
                .orElseThrow(() -> new AlumnoNotFoundException(id));
        alumno.setActivo(false);
        alumnoRepository.save(alumno);
        // La baja tambien revoca el acceso, por si esta cuenta llegara a
        // estar habilitada (ver docs/Reglas_de_Negocio.md).
        userLookupPort.deshabilitar(alumno.getUser().getId());
    }

    private AlumnoResponse toResponse(Alumno alumno) {
        User user = alumno.getUser();
        return AlumnoResponse.builder()
                .id(alumno.getId())
                .legajo(user.getLegajo())
                .activo(alumno.isActivo())
                .userId(user.getId())
                .username(user.getUsername())
                .nombre(user.getNombre())
                .apellido(user.getApellido())
                .dni(user.getDni())
                .email(user.getEmail())
                .telefono(user.getTelefono())
                .telefonoSecundario(user.getTelefonoSecundario())
                .build();
    }
}
