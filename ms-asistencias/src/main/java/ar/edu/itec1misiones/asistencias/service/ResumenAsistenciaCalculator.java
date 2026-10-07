package ar.edu.itec1misiones.asistencias.service;

import ar.edu.itec1misiones.asistencias.dto.EstadoRegularidad;
import ar.edu.itec1misiones.asistencias.dto.ResumenAsistenciaResponse;

import java.util.List;

// Regla de regularidad por asistencia (spec 002), como funcion pura.
public final class ResumenAsistenciaCalculator {

    private static final int PORCENTAJE_MINIMO = 70;

    private ResumenAsistenciaCalculator() {
    }

    // estados: una marca por clase de la cursada. Las fechas sin marca no
    // llegan aca, asi que no cuentan en el total (RF-03).
    public static ResumenAsistenciaResponse resumir(Long cursadaId, List<String> estados) {
        int presentes = contar(estados, "PRESENTE");
        // TARDE es el valor que usaba una version vieja del frontend.
        int tardanzas = contar(estados, "TARDANZA") + contar(estados, "TARDE");
        int ausentes = contar(estados, "AUSENTE");
        int total = presentes + tardanzas + ausentes;

        if (total == 0) {
            return new ResumenAsistenciaResponse(cursadaId, 0, 0, 0, 0, null, EstadoRegularidad.SIN_REGISTROS);
        }

        // La tardanza cuenta como presente (RF-02).
        int asistidas = presentes + tardanzas;
        double porcentaje = asistidas * 100.0 / total;
        // Comparacion entera: 70 % exacto es regular sin errores de coma flotante (RF-06).
        boolean regular = asistidas * 100L >= (long) PORCENTAJE_MINIMO * total;

        return new ResumenAsistenciaResponse(cursadaId, presentes, tardanzas, ausentes, total, porcentaje,
                regular ? EstadoRegularidad.REGULAR : EstadoRegularidad.NO_REGULAR);
    }

    private static int contar(List<String> estados, String estado) {
        return (int) estados.stream().filter(estado::equals).count();
    }
}
