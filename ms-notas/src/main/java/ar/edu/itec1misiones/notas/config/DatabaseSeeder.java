package ar.edu.itec1misiones.notas.config;

import ar.edu.itec1misiones.notas.model.CalificacionParcial;
import ar.edu.itec1misiones.notas.repository.CalificacionParcialRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Random;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private static final long CURSADAS_SEMBRADAS = 6;

    private final CalificacionParcialRepository calificacionParcialRepository;

    @Override
    public void run(String... args) {
        if (calificacionParcialRepository.count() > 0) {
            log.info("[Seeder] Base de datos ya inicializada, omitiendo seed.");
            return;
        }

        log.info("[Seeder] Inicializando datos de desarrollo...");

        Random random = new Random();
        for (long cursadaId = 1; cursadaId <= CURSADAS_SEMBRADAS; cursadaId++) {
            // El seeder de Core crea 2 cursadas por alumno en orden: primero
            // comisionProg1 (id 1), después comisionLogica (id 2) -> cursadaId impar
            // va a la comisión 1, par va a la comisión 2.
            long comisionId = cursadaId % 2 == 1 ? 1L : 2L;

            // minusWeeks(N) siempre cae en el mismo día de semana que "hoy", que es
            // justo el día de clase que siembra el DatabaseSeeder de Core -> las 3
            // fechas quedan válidas contra HorarioClase sin importar qué día se
            // levante el entorno.
            calificacionParcialRepository.save(new CalificacionParcial(
                    null, cursadaId, comisionId, "Primer Parcial", notaAleatoria(random),
                    LocalDate.now().minusWeeks(4)));
            calificacionParcialRepository.save(new CalificacionParcial(
                    null, cursadaId, comisionId, "Segundo Parcial", notaAleatoria(random),
                    LocalDate.now().minusWeeks(2)));
            calificacionParcialRepository.save(new CalificacionParcial(
                    null, cursadaId, comisionId, "Tercer Parcial", notaAleatoria(random),
                    LocalDate.now()));
        }

        log.info("[Seeder] Datos de desarrollo insertados correctamente.");
    }

    private Double notaAleatoria(Random random) {
        return (double) (random.nextInt(7) + 4);
    }
}
