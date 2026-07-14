package ar.edu.itec1misiones.service.impl;

import ar.edu.itec1misiones.dto.request.InscripcionMesaRequest;
import ar.edu.itec1misiones.dto.request.MesaExamenRequest;
import ar.edu.itec1misiones.dto.response.InscripcionMesaResponse;
import ar.edu.itec1misiones.dto.response.MesaExamenResponse;
import ar.edu.itec1misiones.exception.AlumnoYaInscriptoEnMesaException;
import ar.edu.itec1misiones.exception.MateriaPlanNotFoundException;
import ar.edu.itec1misiones.exception.MesaExamenNotFoundException;
import ar.edu.itec1misiones.exception.PeriodoAcademicoNotFoundException;
import ar.edu.itec1misiones.model.EstadoMesa;
import ar.edu.itec1misiones.model.InscripcionMesa;
import ar.edu.itec1misiones.model.MateriaPlan;
import ar.edu.itec1misiones.model.MesaExamen;
import ar.edu.itec1misiones.model.PeriodoAcademico;
import ar.edu.itec1misiones.model.Rol;
import ar.edu.itec1misiones.model.User;
import ar.edu.itec1misiones.repository.InscripcionMesaRepository;
import ar.edu.itec1misiones.repository.MateriaPlanRepository;
import ar.edu.itec1misiones.repository.MesaExamenRepository;
import ar.edu.itec1misiones.repository.PeriodoAcademicoRepository;
import ar.edu.itec1misiones.service.MesaExamenService;
import ar.edu.itec1misiones.service.UserLookupPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class MesaExamenServiceImpl implements MesaExamenService {

    private final MesaExamenRepository mesaExamenRepository;
    private final InscripcionMesaRepository inscripcionMesaRepository;
    private final MateriaPlanRepository materiaPlanRepository;
    private final PeriodoAcademicoRepository periodoAcademicoRepository;
    private final UserLookupPort userLookupPort;

    @Override
    public MesaExamenResponse crear(MesaExamenRequest request) {
        MateriaPlan materiaPlan = materiaPlanRepository.findById(request.getMateriaPlanId())
                .orElseThrow(() -> new MateriaPlanNotFoundException(request.getMateriaPlanId()));
        PeriodoAcademico periodo = periodoAcademicoRepository.findById(request.getPeriodoAcademicoId())
                .orElseThrow(() -> new PeriodoAcademicoNotFoundException(request.getPeriodoAcademicoId()));

        Set<User> tribunal = request.getTribunalIds().stream()
                .map(this::buscarProfesor)
                .collect(Collectors.toSet());

        MesaExamen mesa = MesaExamen.builder()
                .materiaPlan(materiaPlan)
                .periodoAcademico(periodo)
                .fechaHora(request.getFechaHora())
                .estado(EstadoMesa.PROGRAMADA)
                .tribunal(tribunal)
                .build();

        return toResponse(mesaExamenRepository.save(mesa));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MesaExamenResponse> buscarTodas() {
        return mesaExamenRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public MesaExamenResponse buscarPorId(Long id) {
        return toResponse(mesaExamenRepository.findById(id)
                .orElseThrow(() -> new MesaExamenNotFoundException(id)));
    }

    @Override
    public InscripcionMesaResponse inscribirAlumno(Long mesaExamenId, InscripcionMesaRequest request) {
        MesaExamen mesa = mesaExamenRepository.findById(mesaExamenId)
                .orElseThrow(() -> new MesaExamenNotFoundException(mesaExamenId));

        User alumno = userLookupPort.findById(request.getAlumnoId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "No existe un usuario con id: " + request.getAlumnoId()));
        if (!alumno.getRoles().contains(Rol.ALUMNO)) {
            throw new IllegalArgumentException(
                    "El usuario con id " + request.getAlumnoId() + " no tiene rol ALUMNO");
        }

        if (inscripcionMesaRepository.existsByMesaExamenIdAndAlumnoId(mesaExamenId, alumno.getId())) {
            throw new AlumnoYaInscriptoEnMesaException(alumno.getId(), mesaExamenId);
        }

        InscripcionMesa inscripcion = InscripcionMesa.builder()
                .mesaExamen(mesa)
                .alumno(alumno)
                .condicionInscripcion(request.getCondicionInscripcion())
                .fechaInscripcion(LocalDateTime.now())
                .build();

        return toResponse(inscripcionMesaRepository.save(inscripcion));
    }

    @Override
    @Transactional(readOnly = true)
    public List<InscripcionMesaResponse> listarInscripciones(Long mesaExamenId) {
        if (!mesaExamenRepository.existsById(mesaExamenId)) {
            throw new MesaExamenNotFoundException(mesaExamenId);
        }
        return inscripcionMesaRepository.findByMesaExamenId(mesaExamenId).stream()
                .map(this::toResponse)
                .toList();
    }

    private User buscarProfesor(Long userId) {
        User user = userLookupPort.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No existe un usuario con id: " + userId));
        if (!user.getRoles().contains(Rol.PROFESOR)) {
            throw new IllegalArgumentException(
                    "El usuario con id " + userId + " no tiene rol PROFESOR y no puede integrar el tribunal");
        }
        return user;
    }

    private MesaExamenResponse toResponse(MesaExamen mesa) {
        return MesaExamenResponse.builder()
                .id(mesa.getId())
                .materiaPlanId(mesa.getMateriaPlan().getId())
                .periodoAcademicoId(mesa.getPeriodoAcademico().getId())
                .fechaHora(mesa.getFechaHora())
                .estado(mesa.getEstado())
                .tribunalIds(mesa.getTribunal().stream().map(User::getId).sorted().toList())
                .build();
    }

    private InscripcionMesaResponse toResponse(InscripcionMesa inscripcion) {
        return InscripcionMesaResponse.builder()
                .id(inscripcion.getId())
                .mesaExamenId(inscripcion.getMesaExamen().getId())
                .alumnoId(inscripcion.getAlumno().getId())
                .condicionInscripcion(inscripcion.getCondicionInscripcion())
                .fechaInscripcion(inscripcion.getFechaInscripcion())
                .build();
    }
}
