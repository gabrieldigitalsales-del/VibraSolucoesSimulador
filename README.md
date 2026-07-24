# Simulação personalizada - Vibra Soluções

Projeto em React/Vite para apresentar simulações ao cliente, editar valores ao vivo e exportar em PNG ou JPG.

## O que foi ajustado nesta versão

- Campo **Validade** com **placeholder dinâmico da data atual** ao abrir/editar.

- **Layout refeito** com fontes menores para evitar textos cortados.
- **Dados resetados** para começar do zero.
- Campo **Subtítulo** iniciando em branco, sem placeholder visual na simulação.
- Nova chave de armazenamento local para **não puxar dados antigos**.
- Botão **Limpar tudo** para apagar os dados salvos no navegador.
- Logo da **Vibra Soluções** integrada ao visual do projeto, com elementos gráficos inspirados na marca, em vez de apenas colada no layout.
- Mantidos os cálculos automáticos de:
  - percentual do lance embutido
  - percentual de recursos próprios
  - percentual total do lance
  - crédito liberado = crédito contratado - lance embutido
  - saldo após contemplação = parcela após contemplação × prazo restante

## Como rodar

```bash
npm install
npm run dev
```

Depois abra o link que aparecer no terminal.

## Exportar imagem

Use os botões:

- **Exportar PNG**
- **Exportar JPG**

## Publicar na Vercel

1. Suba a pasta no GitHub.
2. Na Vercel, clique em **Add New Project**.
3. Selecione o repositório.
4. Framework: **Vite**.
5. Build command: `npm run build`
6. Output directory: `dist`


## Aba do navegador

- Título da aba configurado como **Vibra Soluções**.
- Favicon da aba configurado com a **logo da Vibra Soluções**.


## Ajuste de visualização

- A prévia agora abre em escala visual de **90% dentro do próprio sistema**, para ficar confortável mesmo com o navegador em 100%.
- A exportação continua sendo feita sem reduzir a arte final.


## Correção da tela em 100%

- A prévia agora fica dentro de uma área proporcional reduzida, sem criar barra horizontal desnecessária.
- O navegador pode ficar em **100%**.
- A exportação continua saindo no tamanho original da arte.


## Ajuste de espaçamento

- Reduzido o espaço preto entre o painel de edição e a prévia.
- A prévia agora fica alinhada mais próxima do editor, sem ficar centralizada longe demais.


## Exportações por dispositivo

Foram adicionados três botões de exportação:

- **PC / Notebook:** imagem horizontal 1600 × 900 px.
- **Tablet:** imagem horizontal mais confortável 1366 × 1024 px.
- **Celular:** imagem vertical 1080 × 1920 px, ideal para WhatsApp e Story.

A prévia da tela continua compacta para edição, mas cada exportação usa um layout/tamanho próprio.


## Encaixe automático da prévia

Esta versão voltou para a base do layout aprovado e adicionou encaixe automático da prévia:

- A arte se adapta ao espaço disponível na tela.
- Não depende mais do zoom do Google Chrome.
- A exportação continua separada em PC/Notebook, Tablet e Celular.
- O layout aprovado foi preservado; o ajuste é apenas de visualização/encaixe.


## Mobile Master Luxo

A responsividade foi refeita a partir da base aprovada:

- Em celular, o editor vira uma tela limpa em coluna única.
- A prévia de desktop deixa de ser espremida no celular.
- O mobile agora mostra uma prévia própria, em formato de celular, com visual premium.
- A exportação para PC/Notebook, Tablet e Celular permanece intacta.
- O layout desktop aprovado foi preservado.


## Ajuste da exportação

Nesta versão, a exportação foi simplificada:

- Removidas as exportações separadas de **Tablet** e **Celular**.
- Mantida apenas a exportação principal no padrão **PC / Notebook**.
- O botão foi renomeado para **Exportar PNG**.


## Crédito liberado editável

Nesta versão, o campo **Crédito liberado** passou a ser editável no painel de valores.

- Novo campo: **Crédito liberado (R$)**.
- O valor digitado aparece na prévia e na exportação PNG.
- Os percentuais de lance continuam automáticos.

Observação: ao publicar na Vercel, o build será gerado novamente a partir do código atualizado.
