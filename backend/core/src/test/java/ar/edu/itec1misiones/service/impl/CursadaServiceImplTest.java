package ar.edu.itec1misiones.service.impl;

import ar.edu.itec1misiones.dto.request.CursadaRequest;
import ar.edu.itec1misiones.model.Alumno;
import ar.edu.itec1misiones.model.Comision;
import ar.edu.itec1misiones.model.CondicionFinal;
import ar.edu.itec1misiones.model.Cursada;
import ar.edu.itec1misiones.model.MateriaPlan;
import ar.edu.itec1misiones.repository.AlumnoRepository;
import ar.edu.itec1misiones.repository.ComisionRepository;
import ar.edu.itec1misiones.repository.CursadaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CursadaServiceImplTest {

    @Mock
    private CursadaRepository cursadaRepository;
    @Mock
    private AlumnoRepository alumnoRepository;
    @Mock
    private ComisionRepository comisionRepository;

    @InjectMocks
    private CursadaServiceImpl service;

    @Test
    void permiteMatricularSiCorrelativaEstaPromocionada() {
        MateriaPlan correlativa = MateriaPlan.builder().id(1L).build();
        MateriaPlan materiaPlanActual = MateriaPlan.builder().id(2L)
                .correlativas(List.of(correlativa)).build();
        Comision comisionCorrelativa = Comision.builder().id(100L).materiaPlan(correlativa).build();
        Comision comisionActual = Comision.builder().id(200L).materiaPlan(materiaPlanActual).build();
        Alumno alumno = Alumno.builder().id(5L).build();

        Cursada cursadaAprobada = Cursada.builder()
                .alumno(alumno).comision(comisionCorrelativa)
                .condicionFinal(CondicionFinal.PROMOCIONADA).build();

        when(alumnoRepository.findById(5L)).thenReturn(Optional.of(alumno));
        when(comisionRepository.findById(200L)).thenReturn(Optional.of(comisionActual));
        when(cursadaRepository.findByAlumnoId(5L)).thenReturn(List.of(cursadaAprobada));
        when(cursadaRepository.save(any(Cursada.class))).thenAnswer(inv -> inv.getArgument(0));

        CursadaRequest request = new CursadaRequest();
        request.setAlumnoId(5L);
        request.setComisionId(200L);
        request.setCondicionFinal(CondicionFinal.REGULAR);

        assertDoesNotThrow(() -> service.guardar(request));
    }

    @Test
    void bloqueaMatriculaSiCorrelativaNoEstaAprobada() {
        MateriaPlan correlativa = MateriaPlan.builder().id(1L).build();
        correlativa.setMateria(ar.edu.itec1misiones.model.Materia.builder().nombre("Álgebra").build());
        MateriaPlan materiaPlanActual = MateriaPlan.builder().id(2L)
                .correlativas(List.of(correlativa)).build();
        Comision comisionActual = Comision.builder().id(200L).materiaPlan(materiaPlanActual).build();
        Alumno alumno = Alumno.builder().id(5L).build();

        when(alumnoRepository.findById(5L)).thenReturn(Optional.of(alumno));
        when(comisionRepository.findById(200L)).thenReturn(Optional.of(comisionActual));
        when(cursadaRepository.findByAlumnoId(5L)).thenReturn(List.of());

        CursadaRequest request = new CursadaRequest();
        request.setAlumnoId(5L);
        request.setComisionId(200L);
        request.setCondicionFinal(CondicionFinal.REGULAR);

        assertThrows(IllegalArgumentException.class, () -> service.guardar(request));
    }
}
