package ar.edu.itec1misiones.util;

import java.time.LocalDate;

/**
 * Formato AAAA-DNI (anio de alta + DNI). Se llama una unica vez, en el
 * primer alta de la persona -- el legajo es identidad de por vida y no
 * se recalcula aunque mas adelante se le agregue un rol en otro anio.
 */
public final class LegajoGenerator {

    private LegajoGenerator() {
    }

    public static String generar(String dni) {
        return LocalDate.now().getYear() + "-" + dni;
    }
}
