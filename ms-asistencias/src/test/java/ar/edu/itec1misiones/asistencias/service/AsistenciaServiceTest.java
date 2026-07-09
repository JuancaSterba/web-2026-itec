package ar.edu.itec1misiones.asistencias.service;

import ar.edu.itec1misiones.asistencias.dto.AsistenciaRequest;
import ar.edu.itec1misiones.asistencias.model.Asistencia;
import ar.edu.itec1misiones.asistencias.repository.AsistenciaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AsistenciaServiceTest {

    @Mock
    private AsistenciaRepository repository;

    @InjectMocks
    private AsistenciaService service;

    @Test
    void creaAsistenciaConComisionId() {
        when(repository.save(any(Asistencia.class))).thenAnswer(inv -> inv.getArgument(0));

        AsistenciaRequest request = new AsistenciaRequest();
        request.setCursadaId(1L);
        request.setComisionId(9L);
        request.setFecha(LocalDate.now());
        request.setEstado("PRESENTE");

        Asistencia resultado = service.crear(request);

        assertEquals(9L, resultado.getComisionId());
    }
}
