package ar.edu.itec1misiones.service.impl;

import ar.edu.itec1misiones.dto.request.MateriaPlanRequest;
import ar.edu.itec1misiones.dto.response.MateriaPlanResponse;
import ar.edu.itec1misiones.model.Materia;
import ar.edu.itec1misiones.model.MateriaPlan;
import ar.edu.itec1misiones.model.ModalidadEvaluacion;
import ar.edu.itec1misiones.model.PlanEstudio;
import ar.edu.itec1misiones.repository.MateriaPlanRepository;
import ar.edu.itec1misiones.repository.MateriaRepository;
import ar.edu.itec1misiones.repository.PlanEstudioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MateriaPlanServiceImplTest {

    @Mock
    private MateriaPlanRepository materiaPlanRepository;
    @Mock
    private PlanEstudioRepository planEstudioRepository;
    @Mock
    private MateriaRepository materiaRepository;

    @InjectMocks
    private MateriaPlanServiceImpl service;

    @Test
    void guardarPersisteModalidadEvaluacion() {
        PlanEstudio plan = PlanEstudio.builder().id(1L).build();
        Materia materia = Materia.builder().id(2L).nombre("Álgebra").build();

        when(planEstudioRepository.findById(1L)).thenReturn(Optional.of(plan));
        when(materiaRepository.findById(2L)).thenReturn(Optional.of(materia));
        when(materiaPlanRepository.save(any(MateriaPlan.class))).thenAnswer(inv -> {
            MateriaPlan mp = inv.getArgument(0);
            mp.setId(10L);
            return mp;
        });

        MateriaPlanRequest request = new MateriaPlanRequest();
        request.setPlanEstudioId(1L);
        request.setMateriaId(2L);
        request.setModalidadEvaluacion(ModalidadEvaluacion.PROMOCIONAL);

        MateriaPlanResponse response = service.guardar(request);

        assertEquals(ModalidadEvaluacion.PROMOCIONAL, response.getModalidadEvaluacion());
    }
}
