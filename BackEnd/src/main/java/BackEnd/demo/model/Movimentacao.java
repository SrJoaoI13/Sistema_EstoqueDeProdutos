package BackEnd.demo.model;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Movimentacao {
    private Long id;
    private Integer codigoProduto;
    private String descricaoProduto;
    private String tipo;
    private String descricao;
    private Integer quantidade;
    private Integer estoqueAnterior;
    private Integer estoqueFinal;
    private LocalDateTime dataHora;
}
