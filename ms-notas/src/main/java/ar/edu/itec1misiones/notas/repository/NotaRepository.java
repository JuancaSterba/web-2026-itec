package ar.edu.itec1misiones.notas.repository;

import ar.edu.itec1misiones.notas.model.Nota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotaRepository extends JpaRepository<Nota, Long> {

    // Nota no guarda comisionId (solo examenId): el filtro por comision se
    // resuelve indirectamente via ExamenController/examenId.
    @Query("SELECT n FROM Nota n WHERE (:examenId IS NULL OR n.examenId = :examenId)")
    List<Nota> buscarPorFiltros(@Param("examenId") Long examenId);
}
