package ar.edu.itec1misiones.service;

import ar.edu.itec1misiones.client.AsistenciasClient;
import ar.edu.itec1misiones.client.NotasClient;
import ar.edu.itec1misiones.dto.response.CalificacionParcialDto;
import ar.edu.itec1misiones.dto.response.CondicionPreviewResponse;
import ar.edu.itec1misiones.dto.response.ResumenAsistenciaDto;
import ar.edu.itec1misiones.exception.CursadaNotFoundException;
import ar.edu.itec1misiones.model.CondicionFinal;
import ar.edu.itec1misiones.model.Cursada;
import ar.edu.itec1misiones.model.ModalidadEvaluacion;
import ar.edu.itec1misiones.repository.CursadaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CondicionCursadaService {

    private final CursadaRepository cursadaRepository;
    private final NotasClient notasClient;
    private final AsistenciasClient asistenciasClient;

    @Transactional(readOnly = true)
    public CondicionPreviewResponse calcular(Long cursadaId) {
        Cursada cursada = cursadaRepository.findById(cursadaId)
                .orElseThrow(() -> new CursadaNotFoundException(cursadaId));

        // La asistencia se evalua antes que los parciales: sin el 70 % el
        // alumno queda LIBRE cualquiera sea su promedio (spec 002, RF-09).
        ResumenAsistenciaDto asistencia = asistenciasClient.obtenerResumen(cursadaId);
        if (ResumenAsistenciaDto.SIN_REGISTROS.equals(asistencia.getEstado())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No hay asistencias registradas para este alumno en la comisión");
        }

        // ms-notas solo almacena parciales de cursada; los finales viven en
        // CalificacionMesa, atados a una MesaExamen.
        List<CalificacionParcialDto> parciales = notasClient.obtenerPorCursada(cursadaId);

        if (ResumenAsistenciaDto.NO_REGULAR.equals(asistencia.getEstado())) {
            Double promedio = parciales.size() == 3 ? promedioDe(parciales) : null;
            return CondicionPreviewResponse.builder()
                    .cursadaId(cursadaId)
                    .promedioParciales(promedio)
                    .condicionFinal(CondicionFinal.LIBRE)
                    .notaCierre(promedio)
                    .porcentajeAsistencia(asistencia.getPorcentaje())
                    .estadoAsistencia(asistencia.getEstado())
                    .motivoLibre(CondicionPreviewResponse.MOTIVO_ASISTENCIA)
                    .build();
        }

        if (parciales.size() != 3) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Faltan parciales: hay " + parciales.size() + " de 3 cargados");
        }

        double promedio = promedioDe(parciales);
        ModalidadEvaluacion modalidad = cursada.getComision().getMateriaPlan().getModalidadEvaluacion();

        // La cursada solo determina la condicion base; la aprobacion de la materia
        // se resuelve en las Mesas de Examen (instancias independientes).
        CondicionFinal condicion;

        if (promedio < 4) {
            condicion = CondicionFinal.LIBRE;
        } else if (promedio < 7) {
            condicion = CondicionFinal.REGULAR;
        } else if (modalidad == ModalidadEvaluacion.PROMOCIONAL) {
            condicion = CondicionFinal.PROMOCIONADA;
        } else {
            condicion = CondicionFinal.REGULAR;
        }

        return CondicionPreviewResponse.builder()
                .cursadaId(cursadaId)
                .promedioParciales(promedio)
                .condicionFinal(condicion)
                .notaCierre(promedio)
                .porcentajeAsistencia(asistencia.getPorcentaje())
                .estadoAsistencia(asistencia.getEstado())
                .motivoLibre(condicion == CondicionFinal.LIBRE ? CondicionPreviewResponse.MOTIVO_PROMEDIO : null)
                .build();
    }

    private double promedioDe(List<CalificacionParcialDto> parciales) {
        return parciales.stream().mapToDouble(CalificacionParcialDto::getNota).average().orElse(0);
    }

    @Transactional
    public CondicionPreviewResponse cerrar(Long cursadaId) {
        CondicionPreviewResponse preview = calcular(cursadaId);

        Cursada cursada = cursadaRepository.findById(cursadaId)
                .orElseThrow(() -> new CursadaNotFoundException(cursadaId));
        cursada.setCondicionFinal(preview.getCondicionFinal());
        cursada.setNotaCierre(preview.getNotaCierre());
        cursadaRepository.save(cursada);

        return preview;
    }
}
