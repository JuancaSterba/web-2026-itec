package ar.edu.itec1misiones.service;

import ar.edu.itec1misiones.dto.request.AlumnoInscriptoRequest;
import ar.edu.itec1misiones.dto.response.AlumnoInscriptoResponse;
import ar.edu.itec1misiones.exception.*;
import ar.edu.itec1misiones.model.*;
import ar.edu.itec1misiones.repository.*;
import ar.edu.itec1misiones.service.impl.AlumnoInscriptoServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AlumnoInscriptoServiceImplTest {

    @Mock AlumnoInscriptoRepository inscriptoRepository;
    @Mock AlumnoCarreraRepository alumnoCarreraRepository;
    @Mock ComisionMateriaRepository comisionMateriaRepository;

    @InjectMocks AlumnoInscriptoServiceImpl service;

    private AlumnoInscriptoRequest buildRequest(Long alumnoCarreraId, Long comisionId) {
        AlumnoInscriptoRequest r = new AlumnoInscriptoRequest();
        r.setAlumnoCarreraId(alumnoCarreraId);
        r.setComisionMateriaId(comisionId);
        return r;
    }

    @Test
    void create_throwsAlumnoCarreraNotFoundException_whenNotFound() {
        when(alumnoCarreraRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create(buildRequest(1L, 2L)))
                .isInstanceOf(AlumnoCarreraNotFoundException.class);
    }

    @Test
    void create_throwsComisionNotFoundException_whenNotFound() {
        AlumnoCarrera ac = new AlumnoCarrera();
        when(alumnoCarreraRepository.findById(1L)).thenReturn(Optional.of(ac));
        when(comisionMateriaRepository.findById(2L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create(buildRequest(1L, 2L)))
                .isInstanceOf(ComisionNotFoundException.class);
    }

    @Test
    void create_throwsComisionInactivaException_whenInactiva() {
        AlumnoCarrera ac = new AlumnoCarrera();
        ComisionMateria cm = new ComisionMateria();
        cm.setActiva(false);
        cm.setCupo(30);
        when(alumnoCarreraRepository.findById(1L)).thenReturn(Optional.of(ac));
        when(comisionMateriaRepository.findById(2L)).thenReturn(Optional.of(cm));

        assertThatThrownBy(() -> service.create(buildRequest(1L, 2L)))
                .isInstanceOf(ComisionInactivaException.class);
    }

    @Test
    void create_throwsAlumnoYaInscriptoEnMateriaException_whenDuplicate() {
        AlumnoCarrera ac = new AlumnoCarrera();
        ComisionMateria cm = new ComisionMateria();
        cm.setActiva(true);
        cm.setCupo(30);
        when(alumnoCarreraRepository.findById(1L)).thenReturn(Optional.of(ac));
        when(comisionMateriaRepository.findById(2L)).thenReturn(Optional.of(cm));
        when(inscriptoRepository.existsByAlumnoCarreraIdAndComisionId(1L, 2L)).thenReturn(true);

        assertThatThrownBy(() -> service.create(buildRequest(1L, 2L)))
                .isInstanceOf(AlumnoYaInscriptoEnMateriaException.class);
    }

    @Test
    void create_throwsCupoComisionLlenoException_whenCupoAgotado() {
        AlumnoCarrera ac = new AlumnoCarrera();
        ComisionMateria cm = new ComisionMateria();
        cm.setId(2L);
        cm.setActiva(true);
        cm.setCupo(2);
        when(alumnoCarreraRepository.findById(1L)).thenReturn(Optional.of(ac));
        when(comisionMateriaRepository.findById(2L)).thenReturn(Optional.of(cm));
        when(inscriptoRepository.existsByAlumnoCarreraIdAndComisionId(1L, 2L)).thenReturn(false);
        when(inscriptoRepository.countByComisionId(2L)).thenReturn(2L);

        assertThatThrownBy(() -> service.create(buildRequest(1L, 2L)))
                .isInstanceOf(CupoComisionLlenoException.class);
    }

    @Test
    void create_persistsWithEstadoRegular() {
        AlumnoCarrera ac = new AlumnoCarrera();
        ac.setId(1L);

        User user = new User();
        user.setNombre("Juan");
        user.setApellido("Perez");
        Alumno alumno = new Alumno();
        alumno.setUser(user);
        ac.setAlumno(alumno);

        Materia materia = new Materia();
        materia.setNombre("Matemática I");

        ComisionMateria cm = new ComisionMateria();
        cm.setId(2L);
        cm.setNombre("A");
        cm.setActiva(true);
        cm.setCupo(30);
        cm.setMateria(materia);

        AlumnoInscripto saved = new AlumnoInscripto();
        saved.setId(10L);
        saved.setAlumnoCarrera(ac);
        saved.setComision(cm);
        saved.setEstado(EstadoCursada.REGULAR);

        when(alumnoCarreraRepository.findById(1L)).thenReturn(Optional.of(ac));
        when(comisionMateriaRepository.findById(2L)).thenReturn(Optional.of(cm));
        when(inscriptoRepository.existsByAlumnoCarreraIdAndComisionId(1L, 2L)).thenReturn(false);
        when(inscriptoRepository.countByComisionId(2L)).thenReturn(0L);
        when(inscriptoRepository.save(any(AlumnoInscripto.class))).thenReturn(saved);

        AlumnoInscriptoResponse response = service.create(buildRequest(1L, 2L));

        assertThat(response.getId()).isEqualTo(10L);
        assertThat(response.getEstado()).isEqualTo(EstadoCursada.REGULAR);
        assertThat(response.getAlumnoNombreCompleto()).isEqualTo("Juan Perez");

        verify(inscriptoRepository).save(argThat(i ->
                i.getEstado() == EstadoCursada.REGULAR &&
                i.getAlumnoCarrera() == ac &&
                i.getComision() == cm
        ));
    }
}
