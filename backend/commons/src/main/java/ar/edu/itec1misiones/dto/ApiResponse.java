package ar.edu.itec1misiones.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private Meta meta;

    @Builder.Default
    private List<T> data = new ArrayList<>();

    @Builder.Default
    private List<ErrorDto> errors = new ArrayList<>();
}