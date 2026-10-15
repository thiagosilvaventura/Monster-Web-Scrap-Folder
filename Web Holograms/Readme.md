# 🌌 Holograma de Sites

Um script de injeção em JavaScript para o console do navegador que realiza a captura estrutural de páginas web e gera uma sobreposição visual estática com estética de holograma. O projeto extrai o DOM atual, serializa elementos renderizados e aplica filtros de CSS isolados sem interferir na usabilidade da página subjacente.


<img width="1899" height="940" alt="meli01" src="https://github.com/user-attachments/assets/a2b303fe-7d38-419c-bddb-294333125692" />

<img width="343" height="160" alt="image" src="https://github.com/user-attachments/assets/357c7ce1-875b-4aa3-9eac-e9bd3980f0ec" />



## ⚙️ Funcionalidades

| Recurso | Descrição |
| :--- | :--- |
| 🧬 **Clonagem Profunda (Deep Clone)** | Captura a árvore do DOM em tempo real, incluindo modificações de layout ocorridas após o carregamento da página. |
| 🖼️ **Serialização de Canvas** | Identifica elementos `<canvas>` (gráficos, tabelas renderizadas via WebGL/2D) e os converte para imagens estáticas em formato Base64. |
| 📝 **Retenção de Estados** | Extrai e aplica no clone os dados inseridos ativamente pelo usuário em campos `<input>`, `<textarea>` e `<select>`. |
| 🛡️ **Sanitização de Código** | Remove tags executáveis (`<script>`, `<iframe>`, `<noscript>`) do clone para evitar erros de console e bloqueios de segurança na aba de destino. |
| 🎨 **Filtro Óptico Isolado** | Aplica sobreposição visual (tons de ciano, transparência *screen* e *scanlines*) através de um `iframe` não-interativo. |

## 🚀 Como Utilizar

### Passo 1: Execução do Painel
1. Acesse a página web alvo.
2. Abra as Ferramentas do Desenvolvedor do seu navegador (`F12` ou `Ctrl+Shift+I` / `Cmd+Option+I`).
3. Acesse a aba **Console**.
4. Cole o código-fonte principal do script e pressione `Enter`. O painel de controle flutuante será renderizado na tela.

### Passo 2: Geração e Projeção
1. No painel flutuante, clique no botão **Copiar Estrutura e Dados (Reconstrução)**.
2. O script processará os dados e copiará automaticamente o código gerado para a sua área de transferência.
3. Acesse a aba de destino (podendo ser a mesma página ou uma URL diferente).
4. Abra o **Console** da aba de destino, cole o código gerado e pressione `Enter`.
5. A representação estática da página original será projetada sobre a tela atual.

## 🛠️ Arquitetura e Comportamento

O funcionamento da projeção baseia-se na injeção de um `iframe` sobreposto ocupando `100vw` e `100vh`. Para garantir a funcionalidade da ferramenta:

* **Isolamento de Eventos:** O elemento projetado possui a propriedade CSS `pointer-events: none;`. Isso garante que o usuário continue interagindo normalmente com a página real que está por baixo da projeção.
* **Resolução de Caminhos Relativos:** Durante a etapa de clonagem, o script injeta dinamicamente uma tag `<base>` contendo o domínio de origem. Isso previne a quebra de imagens e regras de CSS quando o holograma é renderizado em domínios de terceiros.

## ⚠️ Limitações Técnicas

* **CORS e Políticas de Segurança (CSP):** Imagens, fontes ou folhas de estilo protegidas por políticas restritivas de *Cross-Origin Resource Sharing* podem falhar ao carregar caso a projeção seja colada em um domínio diferente do original.
* **Closed Shadow DOM:** Elementos web customizados que utilizem o modo fechado (*closed*) do *Shadow DOM* não expõem sua estrutura interna para o método global de clonagem do `documentElement`.
* **Vídeos Nativos:** Tags `<video>` reproduzindo mídia não serializável aparecerão como blocos vazios na estrutura clonada.
