package ar.edu.itec1misiones.service.impl;

import ar.edu.itec1misiones.client.NotasClient;
import ar.edu.itec1misiones.dto.request.InscripcionMesaRequest;
import ar.edu.itec1misiones.dto.request.MesaExamenRequest;
import ar.edu.itec1misiones.dto.request.MesaExamenUpdateRequest;
import ar.edu.itec1misiones.dto.response.CalificacionMesaResponse;
import ar.edu.itec1misiones.dto.response.InscripcionMesaResponse;
import ar.edu.itec1misiones.dto.response.MesaExamenResponse;
import ar.edu.itec1misiones.exception.AlumnoYaInscriptoEnMesaException;
import ar.edu.itec1misiones.exception.MateriaPlanNotFoundException;
import ar.edu.itec1misiones.exception.MesaExamenNotFoundException;
import ar.edu.itec1misiones.exception.CicloLectivoNotFoundException;
import ar.edu.itec1misiones.model.EstadoMesa;
import ar.edu.itec1misiones.model.InscripcionMesa;
import ar.edu.itec1misiones.model.MateriaPlan;
import ar.edu.itec1misiones.model.MesaExamen;
import ar.edu.itec1misiones.model.CicloLectivo;
import ar.edu.itec1misiones.model.Rol;
import ar.edu.itec1misiones.model.User;
import ar.edu.itec1misiones.repository.InscripcionMesaRepository;
import ar.edu.itec1misiones.repository.MateriaPlanRepository;
import ar.edu.itec1misiones.repository.MesaExamenRepository;
import ar.edu.itec1misiones.repository.CicloLectivoRepository;
import ar.edu.itec1misiones.service.MesaExamenService;
import ar.edu.itec1misiones.service.UserLookupPort;
import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class MesaExamenServiceImpl implements MesaExamenService {

    private final MesaExamenRepository mesaExamenRepository;
    private final InscripcionMesaRepository inscripcionMesaRepository;
    private final MateriaPlanRepository materiaPlanRepository;
    private final CicloLectivoRepository cicloLectivoRepository;
    private final UserLookupPort userLookupPort;
    private final NotasClient notasClient;

    @Override
    public MesaExamenResponse crear(MesaExamenRequest request) {
        MateriaPlan materiaPlan = materiaPlanRepository.findById(request.getMateriaPlanId())
                .orElseThrow(() -> new MateriaPlanNotFoundException(request.getMateriaPlanId()));
        CicloLectivo ciclo = cicloLectivoRepository.findById(request.getCicloLectivoId())
                .orElseThrow(() -> new CicloLectivoNotFoundException(request.getCicloLectivoId()));

        Set<User> tribunal = request.getTribunalIds().stream()
                .map(this::buscarProfesor)
                .collect(Collectors.toSet());

        MesaExamen mesa = MesaExamen.builder()
                .materiaPlan(materiaPlan)
                .cicloLectivo(ciclo)
                .turno(request.getTurno())
                .tipo(request.getTipo())
                .fechaHora(request.getFechaHora())
                .estado(EstadoMesa.PROGRAMADA)
                .tribunal(tribunal)
                .build();

        return toResponse(mesaExamenRepository.save(mesa));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MesaExamenResponse> buscarTodas() {
        return mesaExamenRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MesaExamenResponse> buscarPorTribunal(Long tribunalUserId) {
        return mesaExamenRepository.findByTribunalId(tribunalUserId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public MesaExamenResponse buscarPorId(Long id) {
        return toResponse(mesaExamenRepository.findById(id)
                .orElseThrow(() -> new MesaExamenNotFoundException(id)));
    }

    @Override
    public MesaExamenResponse actualizarTribunal(Long id, MesaExamenUpdateRequest request) {
        MesaExamen mesa = mesaExamenRepository.findById(id)
                .orElseThrow(() -> new MesaExamenNotFoundException(id));

        Set<User> tribunal = request.getTribunalIds().stream()
                .map(this::buscarProfesor)
                .collect(Collectors.toSet());

        mesa.setTribunal(tribunal);
        return toResponse(mesaExamenRepository.save(mesa));
    }

    @Override
    public InscripcionMesaResponse inscribirAlumno(Long mesaExamenId, InscripcionMesaRequest request) {
        MesaExamen mesa = mesaExamenRepository.findById(mesaExamenId)
                .orElseThrow(() -> new MesaExamenNotFoundException(mesaExamenId));

        User alumno = userLookupPort.findById(request.getAlumnoId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "No existe un usuario con id: " + request.getAlumnoId()));
        if (!alumno.getRoles().contains(Rol.ALUMNO)) {
            throw new IllegalArgumentException(
                    "El usuario con id " + request.getAlumnoId() + " no tiene rol ALUMNO");
        }

        if (inscripcionMesaRepository.existsByMesaExamenIdAndAlumnoId(mesaExamenId, alumno.getId())) {
            throw new AlumnoYaInscriptoEnMesaException(alumno.getId(), mesaExamenId);
        }

        InscripcionMesa inscripcion = InscripcionMesa.builder()
                .mesaExamen(mesa)
                .alumno(alumno)
                .condicionInscripcion(request.getCondicionInscripcion())
                .fechaInscripcion(LocalDateTime.now())
                .build();

        return toResponse(inscripcionMesaRepository.save(inscripcion));
    }

    @Override
    @Transactional(readOnly = true)
    public List<InscripcionMesaResponse> listarInscripciones(Long mesaExamenId) {
        if (!mesaExamenRepository.existsById(mesaExamenId)) {
            throw new MesaExamenNotFoundException(mesaExamenId);
        }
        return inscripcionMesaRepository.findByMesaExamenId(mesaExamenId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public MesaExamenResponse cerrarMesa(Long id) {
        MesaExamen mesa = mesaExamenRepository.findById(id)
                .orElseThrow(() -> new MesaExamenNotFoundException(id));
                
        if (mesa.getEstado() == EstadoMesa.CERRADA) {
            throw new IllegalArgumentException("La mesa ya se encuentra cerrada");
        }

        List<CalificacionMesaResponse> calificaciones = notasClient.obtenerPorMesa(id);
        List<InscripcionMesa> inscripciones = inscripcionMesaRepository.findByMesaExamenId(id);
        
        for (InscripcionMesa inscripcion : inscripciones) {
            CalificacionMesaResponse calif = calificaciones.stream()
                    .filter(c -> c.getAlumnoId().equals(inscripcion.getAlumno().getId()))
                    .findFirst()
                    .orElse(null);
                    
            if (calif != null && !calif.isAusente() && calif.getNota() != null) {
                inscripcion.setNotaDefinitiva(calif.getNota());
                inscripcion.setAprobado(calif.getNota().compareTo(new BigDecimal("4")) >= 0);
            } else {
                inscripcion.setNotaDefinitiva(null);
                inscripcion.setAprobado(false);
            }
        }
        
        inscripcionMesaRepository.saveAll(inscripciones);
        mesa.setEstado(EstadoMesa.CERRADA);
        return toResponse(mesaExamenRepository.save(mesa));
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generarActaPdf(Long id) {
        MesaExamen mesa = mesaExamenRepository.findById(id)
                .orElseThrow(() -> new MesaExamenNotFoundException(id));
        List<InscripcionMesa> inscripciones = inscripcionMesaRepository.findByMesaExamenId(id);
        List<CalificacionMesaResponse> calificaciones = notasClient.obtenerPorMesa(id);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD);
            Font headerFont = new Font(Font.HELVETICA, 12, Font.BOLD);
            Font normalFont = new Font(Font.HELVETICA, 10, Font.NORMAL);

            Paragraph title = new Paragraph("Acta de Examen", titleFont);
            title.setAlignment(Paragraph.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Materia: " + mesa.getMateriaPlan().getMateria().getNombre(), headerFont));
            document.add(new Paragraph("Fecha: " + mesa.getFechaHora().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")), normalFont));
            document.add(new Paragraph("Estado: " + mesa.getEstado(), normalFont));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{2f, 4f, 2f, 2f, 2f, 3f});

            String[] headers = {"DNI", "Alumno", "Nota", "Libro", "Folio", "Firma"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
                cell.setHorizontalAlignment(PdfPCell.ALIGN_CENTER);
                table.addCell(cell);
            }

            for (InscripcionMesa ins : inscripciones) {
                CalificacionMesaResponse calif = calificaciones.stream()
                        .filter(c -> c.getAlumnoId().equals(ins.getAlumno().getId()))
                        .findFirst()
                        .orElse(null);

                table.addCell(new Phrase(ins.getAlumno().getDni(), normalFont));
                table.addCell(new Phrase(ins.getAlumno().getApellido() + ", " + ins.getAlumno().getNombre(), normalFont));

                String notaStr = "";
                String libroStr = "";
                String folioStr = "";

                if (calif != null) {
                    if (calif.isAusente()) {
                        notaStr = "Ausente";
                    } else if (calif.getNota() != null) {
                        notaStr = calif.getNota().toString();
                    }
                    libroStr = calif.getLibro() != null ? calif.getLibro() : "";
                    folioStr = calif.getFolio() != null ? calif.getFolio() : "";
                }

                table.addCell(new Phrase(notaStr, normalFont));
                table.addCell(new Phrase(libroStr, normalFont));
                table.addCell(new Phrase(folioStr, normalFont));
                table.addCell(new Phrase(" ", normalFont)); // Firma
            }

            document.add(table);
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar el PDF del acta", e);
        }
    }

    private User buscarProfesor(Long userId) {
        User user = userLookupPort.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No existe un usuario con id: " + userId));
        if (!user.getRoles().contains(Rol.PROFESOR)) {
            throw new IllegalArgumentException(
                    "El usuario con id " + userId + " no tiene rol PROFESOR y no puede integrar el tribunal");
        }
        return user;
    }

    private MesaExamenResponse toResponse(MesaExamen mesa) {
        return MesaExamenResponse.builder()
                .id(mesa.getId())
                .materiaPlanId(mesa.getMateriaPlan().getId())
                .cicloLectivoId(mesa.getCicloLectivo().getId())
                .turno(mesa.getTurno())
                .tipo(mesa.getTipo())
                .fechaHora(mesa.getFechaHora())
                .estado(mesa.getEstado())
                .tribunalIds(mesa.getTribunal().stream().map(User::getId).sorted().toList())
                .build();
    }

    private InscripcionMesaResponse toResponse(InscripcionMesa inscripcion) {
        return InscripcionMesaResponse.builder()
                .id(inscripcion.getId())
                .mesaExamenId(inscripcion.getMesaExamen().getId())
                .alumnoId(inscripcion.getAlumno().getId())
                .condicionInscripcion(inscripcion.getCondicionInscripcion())
                .fechaInscripcion(inscripcion.getFechaInscripcion())
                .build();
    }
}
