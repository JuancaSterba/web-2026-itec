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
            calificacionParcialRepository.save(new CalificacionParcial(
                    null, cursadaId, "Primer Parcial", notaAleatoria(random), LocalDate.now().minusDays(30)));
            calificacionParcialRepository.save(new CalificacionParcial(
                    null, cursadaId, "Segundo Parcial", notaAleatoria(random), LocalDate.now().minusDays(10)));
        }

        log.info("[Seeder] Datos de desarrollo insertados correctamente.");
    }

    private Double notaAleatoria(Random random) {
        return (double) (random.nextInt(5) + 6);
    }
}
