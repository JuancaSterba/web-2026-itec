package ar.edu.itec1misiones.config;

import ar.edu.itec1misiones.model.*;
import ar.edu.itec1misiones.model.CondicionFinal;
import ar.edu.itec1misiones.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

@Slf4j
@Component
@Profile("local")
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final CarreraRepository carreraRepository;
    private final PlanEstudioRepository planEstudioRepository;
    private final MateriaRepository materiaRepository;
    private final MateriaPlanRepository materiaPlanRepository;
    private final AlumnoRepository alumnoRepository;
    private final ComisionRepository comisionRepository;
    private final CicloLectivoRepository cicloLectivoRepository;
    private final PeriodoAcademicoRepository periodoAcademicoRepository;
    private final InscripcionCarreraRepository inscripcionCarreraRepository;
    private final CursadaRepository cursadaRepository;
    private final CoreUserRepository userRepository;
    private final HorarioClaseRepository horarioClaseRepository;
    private final ModuloHorarioRepository moduloHorarioRepository;

    @Override
    public void run(String... args) {
        if (carreraRepository.count() > 0) {
            log.info("[Seeder] Base de datos ya inicializada, omitiendo seed.");
            return;
        }

        log.info("[Seeder] Inicializando datos de desarrollo...");

        // --- Catálogo de Materias ---
        Materia prog1 = materiaRepository.save(
                Materia.builder().nombre("Programación I").codigoInterno("PRG1").activa(true).build());
        Materia logica = materiaRepository.save(
                Materia.builder().nombre("Lógica y Algoritmos").codigoInterno("LOG").activa(true).build());
        Materia bd1 = materiaRepository.save(
                Materia.builder().nombre("Bases de Datos I").codigoInterno("BD1").activa(true).build());

        // --- Estructura Institucional ---
        Carrera carrera = carreraRepository.save(
                Carrera.builder()
                        .nombre("Tecnicatura Superior en Desarrollo de Software")
                        .resolucionMinisterial("123/2026")
                        .activa(true)
                        .build());

        PlanEstudio plan = planEstudioRepository.save(
                PlanEstudio.builder()
                        .cohorte("2026")
                        .carrera(carrera)
                        .fechaImplementacion(LocalDate.now())
                        .activo(true)
                        .build());

        // --- Malla Curricular ---
        // Prog I es PROMOCIONAL (para probar el camino "promedio >= 7 promociona sin
        // final"); el resto queda FINAL (default) para probar el camino "siempre va a
        // rendir final" y "final aprobado sube a APROBADA".
        MateriaPlan mpProg1 = materiaPlanRepository.save(
                MateriaPlan.builder()
                        .planEstudio(plan)
                        .materia(prog1)
                        .cuatrimestreDictado(1)
                        .cargaHoraria(6)
                        .modalidadEvaluacion(ModalidadEvaluacion.PROMOCIONAL)
                        .build());

        MateriaPlan mpLogica = materiaPlanRepository.save(
                MateriaPlan.builder()
                        .planEstudio(plan)
                        .materia(logica)
                        .cuatrimestreDictado(1)
                        .cargaHoraria(4)
                        .build());

        MateriaPlan mpBd1 = materiaPlanRepository.save(
                MateriaPlan.builder()
                        .planEstudio(plan)
                        .materia(bd1)
                        .cuatrimestreDictado(2)
                        .cargaHoraria(6)
                        .build());

        mpBd1.setCorrelativas(new java.util.ArrayList<>(List.of(mpProg1)));
        mpBd1 = materiaPlanRepository.save(mpBd1);

        // --- Gestión Temporal ---
        CicloLectivo ciclo2026 = cicloLectivoRepository.save(
                CicloLectivo.builder()
                        .anio(2026)
                        .fechaInicio(LocalDate.of(2026, 3, 1))
                        .fechaFin(LocalDate.of(2026, 12, 20))
                        .activo(true)
                        .build());

        PeriodoAcademico periodo1 = periodoAcademicoRepository.save(
                PeriodoAcademico.builder()
                        .nombre("Primer Cuatrimestre")
                        .cicloLectivo(ciclo2026)
                        .fechaInicio(LocalDate.of(2026, 3, 1))
                        .fechaFin(LocalDate.of(2026, 7, 10))
                        .build());

        periodoAcademicoRepository.save(
                PeriodoAcademico.builder()
                        .nombre("Segundo Cuatrimestre")
                        .cicloLectivo(ciclo2026)
                        .fechaInicio(LocalDate.of(2026, 8, 1))
                        .fechaFin(LocalDate.of(2026, 12, 20))
                        .build());

        // --- Oferta Académica ---
        Comision comisionProg1 = comisionRepository.save(
                Comision.builder()
                        .nombreComision("Comisión A - Prog I")
                        .cupoMaximo(30)
                        .periodoAcademico(periodo1)
                        .materiaPlan(mpProg1)
                        .activa(true)
                        .build());

        Comision comisionLogica = comisionRepository.save(
                Comision.builder()
                        .nombreComision("Comisión A - Lógica")
                        .cupoMaximo(30)
                        .periodoAcademico(periodo1)
                        .materiaPlan(mpLogica)
                        .activa(true)
                        .build());

        // --- Horarios de Clase ---
        // Usa el día de semana de "hoy" (no un valor fijo) para que las fechas que
        // siembran ms-notas/ms-asistencias (hoy, hoy-7d, hoy-14d... siempre el mismo
        // día de semana) coincidan con un día de clase real, sin importar qué día se
        // levante el entorno.
        DayOfWeek diaDeHoy = LocalDate.now().getDayOfWeek();

        ModuloHorario moduloManiana = new ModuloHorario();
        moduloManiana.setNumero(1);
        moduloManiana.setHoraInicio(LocalTime.of(8, 0));
        moduloManiana.setHoraFin(LocalTime.of(10, 0));
        moduloManiana = moduloHorarioRepository.save(moduloManiana);

        ModuloHorario moduloTarde = new ModuloHorario();
        moduloTarde.setNumero(2);
        moduloTarde.setHoraInicio(LocalTime.of(14, 0));
        moduloTarde.setHoraFin(LocalTime.of(16, 0));
        moduloTarde = moduloHorarioRepository.save(moduloTarde);

        HorarioClase horarioProg1 = new HorarioClase();
        horarioProg1.setDiaSemana(diaDeHoy);
        horarioProg1.setComision(comisionProg1);
        horarioProg1.setModulos(List.of(moduloManiana));
        horarioClaseRepository.save(horarioProg1);

        HorarioClase horarioLogica = new HorarioClase();
        horarioLogica.setDiaSemana(diaDeHoy);
        horarioLogica.setComision(comisionLogica);
        horarioLogica.setModulos(List.of(moduloTarde));
        horarioClaseRepository.save(horarioLogica);

        // --- Estudiantes ---
        Alumno juan = crearAlumno("Juan", "Pérez", "40111222", "juan.perez");
        Alumno ana = crearAlumno("Ana", "Gómez", "40222333", "ana.gomez");
        Alumno carlos = crearAlumno("Carlos", "Ruiz", "40333444", "carlos.ruiz");
        List<Alumno> alumnos = List.of(juan, ana, carlos);

        // --- Trazabilidad Académica ---
        for (Alumno alumno : alumnos) {
            inscripcionCarreraRepository.save(
                    InscripcionCarrera.builder()
                            .alumno(alumno)
                            .planEstudio(plan)
                            .fechaInscripcion(LocalDate.now())
                            .estado("REGULAR")
                            .build());

            cursadaRepository.save(
                    Cursada.builder()
                            .alumno(alumno)
                            .comision(comisionProg1)
                            .fechaInscripcion(LocalDate.now())
                            .condicionFinal(CondicionFinal.REGULAR)
                            .build());

            cursadaRepository.save(
                    Cursada.builder()
                            .alumno(alumno)
                            .comision(comisionLogica)
                            .fechaInscripcion(LocalDate.now())
                            .condicionFinal(CondicionFinal.LIBRE)
                            .build());
        }

        log.info("[Seeder] Datos de desarrollo insertados correctamente.");
    }

    private Alumno crearAlumno(String nombre, String apellido, String dni, String username) {
        User user = new User();
        user.setUsername(username);
        // Nota: {noop} indica al DelegatingPasswordEncoder que la contraseña
        // está en texto plano, sin costo de hashear en dev/tests descartables.
        user.setPassword("{noop}dev1234");
        user.setNombre(nombre);
        user.setApellido(apellido);
        user.setDni(dni);
        user.setEmail(username + "@itec.edu.ar");
        user.setTelefono("3764000000");
        user.setRoles(Set.of(Rol.ALUMNO));
        user.setLegajo("2026-" + dni);
        user = userRepository.save(user);

        Alumno alumno = new Alumno();
        alumno.setUser(user);
        alumno.setActivo(true);
        return alumnoRepository.save(alumno);
    }
}
