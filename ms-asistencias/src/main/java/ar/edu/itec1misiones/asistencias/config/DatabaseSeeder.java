package ar.edu.itec1misiones.asistencias.config;

import ar.edu.itec1misiones.asistencias.model.Asistencia;
import ar.edu.itec1misiones.asistencias.repository.AsistenciaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private static final long CURSADAS_SEMBRADAS = 6;
    private static final long[] DIAS_ATRAS = {7, 14, 21};

    private final AsistenciaRepository asistenciaRepository;

    @Override
    public void run(String... args) {
        if (asistenciaRepository.count() > 0) {
            log.info("[Seeder] Base de datos ya inicializada, omitiendo seed.");
            return;
        }

        log.info("[Seeder] Inicializando datos de desarrollo...");

        for (long cursadaId = 1; cursadaId <= CURSADAS_SEMBRADAS; cursadaId++) {
            // Mismo criterio que ms-notas: el seeder de Core crea cursadaId impar en
            // comisionProg1 (id 1) y par en comisionLogica (id 2).
            long comisionId = cursadaId % 2 == 1 ? 1L : 2L;
            for (int indiceFecha = 0; indiceFecha < DIAS_ATRAS.length; indiceFecha++) {
                // DIAS_ATRAS son multiplos de 7 -> mismo dia de semana que "hoy",
                // que es el dia de clase que siembra el DatabaseSeeder de Core.
                LocalDate fecha = LocalDate.now().minusDays(DIAS_ATRAS[indiceFecha]);
                String estado = estadoPara(cursadaId, indiceFecha);
                asistenciaRepository.save(new Asistencia(null, cursadaId, comisionId, fecha, estado));
            }
        }

        log.info("[Seeder] Datos de desarrollo insertados correctamente.");
    }

    // Mayoria PRESENTE, con AUSENTE/TARDANZA salpicados de forma determinista.
    private String estadoPara(long cursadaId, int indiceFecha) {
        long combinado = (cursadaId + indiceFecha) % 5;
        if (combinado == 0) return "AUSENTE";
        if (combinado == 1) return "TARDANZA";
        return "PRESENTE";
    }
}
