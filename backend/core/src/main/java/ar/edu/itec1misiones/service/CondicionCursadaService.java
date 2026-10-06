package ar.edu.itec1misiones.service;

import ar.edu.itec1misiones.client.NotasClient;
import ar.edu.itec1misiones.dto.response.CalificacionParcialDto;
import ar.edu.itec1misiones.dto.response.CondicionPreviewResponse;
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

    @Transactional(readOnly = true)
    public CondicionPreviewResponse calcular(Long cursadaId) {
        Cursada cursada = cursadaRepository.findById(cursadaId)
                .orElseThrow(() -> new CursadaNotFoundException(cursadaId));

        // ms-notas solo almacena parciales de cursada; los finales viven en
        // CalificacionMesa, atados a una MesaExamen.
        List<CalificacionParcialDto> parciales = notasClient.obtenerPorCursada(cursadaId);

        if (parciales.size() != 3) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Faltan parciales: hay " + parciales.size() + " de 3 cargados");
        }

        double promedio = parciales.stream().mapToDouble(CalificacionParcialDto::getNota).average().orElse(0);
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
                .build();
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
