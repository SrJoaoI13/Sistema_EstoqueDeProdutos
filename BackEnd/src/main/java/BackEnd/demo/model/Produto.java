package BackEnd.demo.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Produto {
    private Integer codigoProduto;
    private String descricaoProduto;
    private Integer estoque;
}
