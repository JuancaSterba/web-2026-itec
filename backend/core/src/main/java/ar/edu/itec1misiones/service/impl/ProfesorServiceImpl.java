package ar.edu.itec1misiones.service.impl;

import ar.edu.itec1misiones.dto.request.ProfesorRegistroDTO;
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
    public ProfesorResponse crearConUsuario(ProfesorRegistroDTO dto) {
        // Si esto falla (DNI/email duplicado), la transaccion completa
        // se revierte -- no queda un Usuario huerfano sin Profesor asociado.
        User user = userLookupPort.crearConCredencialesPorDni(
                dto.getNombre(), dto.getApellido(), dto.getDni(), dto.getEmail(),
                dto.getTelefono(), dto.getTelefonoSecundario(), Rol.PROFESOR);

        Profesor profesor = new Profesor();
        profesor.setUser(user);
        profesor.setTitulo(dto.getTitulo());
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
        profesor.getUser().setTelefonoSecundario(request.getTelefonoSecundario());
        profesor.setActivo(request.isActivo());

        return toResponse(profesorRepository.save(profesor));
    }

    @Override
    public void desactivar(Long id) {
        Profesor profesor = profesorRepository.findById(id)
                .orElseThrow(() -> new ProfesorNotFoundException(id));
        profesor.setActivo(false);
        profesorRepository.save(profesor);
        // La baja tambien revoca el acceso, por si esta cuenta llegara a
        // estar habilitada (ver docs/Reglas_de_Negocio.md).
        userLookupPort.deshabilitar(profesor.getUser().getId());
    }

    private ProfesorResponse toResponse(Profesor profesor) {
        User user = profesor.getUser();
        return ProfesorResponse.builder()
                .id(profesor.getId())
                .titulo(profesor.getTitulo())
                .telefonoSecundario(user.getTelefonoSecundario())
                .activo(profesor.isActivo())
                .userId(user.getId())
                .username(user.getUsername())
                .legajo(user.getLegajo())
                .nombre(user.getNombre())
                .apellido(user.getApellido())
                .dni(user.getDni())
                .email(user.getEmail())
                .telefono(user.getTelefono())
                .build();
    }
}
