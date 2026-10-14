package BackEnd.demo.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MovimentacaoRequest {
    @NotNull(message = "O código do produto é obrigatório")
    private Integer codigoProduto;

    @NotBlank(message = "O tipo da movimentação é obrigatório")
    private String tipo;

    @NotBlank(message = "A descrição é obrigatória")
    private String descricao;

    @NotNull(message = "A quantidade é obrigatória")
    @Min(value = 1, message = "A quantidade deve ser maior que zero")
    private Integer quantidade;
}
