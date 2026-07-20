package ar.edu.itec1misiones.service.impl;

import ar.edu.itec1misiones.dto.request.InscripcionMesaRequest;
import ar.edu.itec1misiones.dto.request.MesaExamenRequest;
import ar.edu.itec1misiones.dto.request.MesaExamenUpdateRequest;
import ar.edu.itec1misiones.dto.response.InscripcionMesaResponse;
import ar.edu.itec1misiones.dto.response.MesaExamenResponse;
import ar.edu.itec1misiones.exception.AlumnoYaInscriptoEnMesaException;
import ar.edu.itec1misiones.model.CondicionInscripcion;
import ar.edu.itec1misiones.model.EstadoMesa;
import ar.edu.itec1misiones.model.InscripcionMesa;
import ar.edu.itec1misiones.model.MateriaPlan;
import ar.edu.itec1misiones.model.MesaExamen;
import ar.edu.itec1misiones.model.CicloLectivo;
import ar.edu.itec1misiones.model.Rol;
import ar.edu.itec1misiones.model.User;
import ar.edu.itec1misiones.repository.InscripcionMesaRepository;
import ar.edu.itec1misiones.repository.MateriaPlanRepository;
import ar.edu.itec1misiones.repository.MesaExamenRepository;
import ar.edu.itec1misiones.repository.CicloLectivoRepository;
import ar.edu.itec1misiones.service.UserLookupPort;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MesaExamenServiceImplTest {

    @Mock
    private MesaExamenRepository mesaExamenRepository;
    @Mock
    private InscripcionMesaRepository inscripcionMesaRepository;
    @Mock
    private MateriaPlanRepository materiaPlanRepository;
    @Mock
    private CicloLectivoRepository cicloLectivoRepository;
    @Mock
    private UserLookupPort userLookupPort;

    @InjectMocks
    private MesaExamenServiceImpl service;

    private User userConRol(Long id, Rol rol) {
        User user = new User();
        user.setId(id);
        user.getRoles().add(rol);
        return user;
    }

    private MesaExamenRequest requestMesa(Set<Long> tribunalIds) {
        MesaExamenRequest request = new MesaExamenRequest();
        request.setMateriaPlanId(1L);
        request.setCicloLectivoId(2L);
        request.setTipo(ar.edu.itec1misiones.model.TipoMesa.ESPECIAL);
        request.setFechaHora(LocalDateTime.of(2026, 11, 20, 18, 0));
        request.setTribunalIds(tribunalIds);
        return request;
    }

    @Test
    void crearMesaQuedaProgramadaConSuTribunal() {
        when(materiaPlanRepository.findById(1L))
                .thenReturn(Optional.of(MateriaPlan.builder().id(1L).build()));
        when(cicloLectivoRepository.findById(2L))
                .thenReturn(Optional.of(CicloLectivo.builder().id(2L).build()));
        when(userLookupPort.findById(10L))
                .thenReturn(Optional.of(userConRol(10L, Rol.PROFESOR)));
        when(mesaExamenRepository.save(any(MesaExamen.class))).thenAnswer(inv -> {
            MesaExamen mesa = inv.getArgument(0);
            mesa.setId(50L);
            return mesa;
        });

        MesaExamenResponse resultado = service.crear(requestMesa(Set.of(10L)));

        assertEquals(50L, resultado.getId());
        assertEquals(EstadoMesa.PROGRAMADA, resultado.getEstado());
        assertEquals(1L, resultado.getMateriaPlanId());
        assertEquals(2L, resultado.getCicloLectivoId());
        assertEquals(ar.edu.itec1misiones.model.TipoMesa.ESPECIAL, resultado.getTipo());
        assertEquals(java.util.List.of(10L), resultado.getTribunalIds());
    }

    @Test
    void crearMesaRechazaTribunalSinRolProfesor() {
        when(materiaPlanRepository.findById(1L))
                .thenReturn(Optional.of(MateriaPlan.builder().id(1L).build()));
        when(cicloLectivoRepository.findById(2L))
                .thenReturn(Optional.of(CicloLectivo.builder().id(2L).build()));
        when(userLookupPort.findById(10L))
                .thenReturn(Optional.of(userConRol(10L, Rol.ALUMNO)));

        assertThrows(IllegalArgumentException.class, () -> service.crear(requestMesa(Set.of(10L))));
        verify(mesaExamenRepository, never()).save(any());
    }

    @Test
    void buscarPorTribunalDevuelveSoloLasMesasDelProfesor() {
        MesaExamen mesa = MesaExamen.builder()
                .id(50L)
                .materiaPlan(MateriaPlan.builder().id(1L).build())
                .cicloLectivo(CicloLectivo.builder().id(2L).build())
                .estado(EstadoMesa.PROGRAMADA)
                .build();
        when(mesaExamenRepository.findByTribunalId(10L)).thenReturn(java.util.List.of(mesa));

        var resultado = service.buscarPorTribunal(10L);

        assertEquals(1, resultado.size());
        assertEquals(50L, resultado.get(0).getId());
    }

    @Test
    void actualizarTribunalModificaLosDocentesYGuardaLaMesa() {
        MesaExamen mesa = MesaExamen.builder()
                .id(50L)
                .materiaPlan(MateriaPlan.builder().id(1L).build())
                .cicloLectivo(CicloLectivo.builder().id(2L).build())
                .estado(EstadoMesa.PROGRAMADA)
                .tribunal(Set.of())
                .build();
        
        when(mesaExamenRepository.findById(50L)).thenReturn(Optional.of(mesa));
        when(userLookupPort.findById(20L)).thenReturn(Optional.of(userConRol(20L, Rol.PROFESOR)));
        when(mesaExamenRepository.save(any(MesaExamen.class))).thenAnswer(inv -> inv.getArgument(0));

        MesaExamenUpdateRequest request = new MesaExamenUpdateRequest();
        request.setTribunalIds(java.util.List.of(20L));

        MesaExamenResponse resultado = service.actualizarTribunal(50L, request);

        assertEquals(java.util.List.of(20L), resultado.getTribunalIds());
        verify(mesaExamenRepository).save(mesa);
    }

    @Test
    void inscribirAlumnoPersisteLaInscripcion() {
        MesaExamen mesa = MesaExamen.builder().id(50L).estado(EstadoMesa.PROGRAMADA).build();
        when(mesaExamenRepository.findById(50L)).thenReturn(Optional.of(mesa));
        when(userLookupPort.findById(30L))
                .thenReturn(Optional.of(userConRol(30L, Rol.ALUMNO)));
        when(inscripcionMesaRepository.existsByMesaExamenIdAndAlumnoId(50L, 30L)).thenReturn(false);
        when(inscripcionMesaRepository.save(any(InscripcionMesa.class))).thenAnswer(inv -> {
            InscripcionMesa inscripcion = inv.getArgument(0);
            inscripcion.setId(7L);
            return inscripcion;
        });

        InscripcionMesaRequest request = new InscripcionMesaRequest();
        request.setAlumnoId(30L);
        request.setCondicionInscripcion(CondicionInscripcion.LIBRE);

        InscripcionMesaResponse resultado = service.inscribirAlumno(50L, request);

        assertEquals(7L, resultado.getId());
        assertEquals(50L, resultado.getMesaExamenId());
        assertEquals(30L, resultado.getAlumnoId());
        assertEquals(CondicionInscripcion.LIBRE, resultado.getCondicionInscripcion());
        assertNotNull(resultado.getFechaInscripcion());
    }

    @Test
    void inscribirAlumnoDuplicadoLanzaConflicto() {
        MesaExamen mesa = MesaExamen.builder().id(50L).estado(EstadoMesa.PROGRAMADA).build();
        when(mesaExamenRepository.findById(50L)).thenReturn(Optional.of(mesa));
        when(userLookupPort.findById(30L))
                .thenReturn(Optional.of(userConRol(30L, Rol.ALUMNO)));
        when(inscripcionMesaRepository.existsByMesaExamenIdAndAlumnoId(50L, 30L)).thenReturn(true);

        InscripcionMesaRequest request = new InscripcionMesaRequest();
        request.setAlumnoId(30L);
        request.setCondicionInscripcion(CondicionInscripcion.REGULAR);

        assertThrows(AlumnoYaInscriptoEnMesaException.class, () -> service.inscribirAlumno(50L, request));
        verify(inscripcionMesaRepository, never()).save(any());
    }
}
