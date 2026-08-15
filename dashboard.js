import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  setDoc,
  onSnapshot,
  query,
  limit,
  writeBatch
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

/* =========================================================
   DADOS DA SESSÃO
========================================================= */

const nomeUsuario = sessionStorage.getItem("nomeUsuario");
const tipoUsuario = sessionStorage.getItem("tipoUsuario");
const usuarioId = sessionStorage.getItem("usuarioId");

if (!nomeUsuario || !tipoUsuario || !usuarioId) {
  window.location.href = "index.html";
}

/* =========================================================
   FUNÇÃO AUXILIAR PARA ELEMENTOS
========================================================= */

function selecionarPrimeiro(...seletores) {
  for (const seletor of seletores) {
    const elemento = document.querySelector(seletor);

    if (elemento) {
      return elemento;
    }
  }

  return null;
}

/* =========================================================
   ELEMENTOS PRINCIPAIS
========================================================= */

const menu = document.querySelector("#menu");
const boasVindas = document.querySelector("#boas-vindas");

const escolherBarbeiro = document.querySelector(
  "#escolher-barbeiro"
);

const selectBarbeiro = document.querySelector(
  "#select-barbeiro"
);

const telaDashboard = document.querySelector(
  "#tela-dashboard"
);

const telaBarbeiros = document.querySelector(
  "#tela-barbeiros"
);

const telaClientes = document.querySelector(
  "#tela-clientes"
);

const telaProdutosServicos = document.querySelector(
  "#tela-produtos-servicos"
);

const telaConfiguracoes = document.querySelector(
  "#tela-configuracoes"
);

const telaRelatorio = document.querySelector(
  "#tela-relatorio"
);

const telaPlanos = document.querySelector(
  "#tela-planos"
);

/* =========================================================
   AGENDA
========================================================= */

const textoAgenda = document.querySelector(
  "#texto-agenda"
);

const agenda = document.querySelector(
  "#agenda"
);

const agendaScroll = document.querySelector(
  "#agenda-scroll"
);

const listaProximosAgendamentos =
  document.querySelector(
    "#lista-proximos-agendamentos"
  );

const quantidadeProximosAgendamentos =
  document.querySelector(
    "#quantidade-proximos-agendamentos"
  );

const botaoDiminuirZoom = document.querySelector(
  "#diminuir-zoom"
);

const botaoAumentarZoom = document.querySelector(
  "#aumentar-zoom"
);

/* =========================================================
   NOVO AGENDAMENTO
========================================================= */

const modalNovo = document.querySelector(
  "#modal-novo"
);

const formAgendamento = document.querySelector(
  "#form-agendamento"
);

const dataAgendamento = document.querySelector(
  "#data-agendamento"
);

const horaAgendamento = document.querySelector(
  "#hora-agendamento"
);

const pesquisaClienteAgendamento =
  document.querySelector(
    "#pesquisa-cliente-agendamento"
  );

const listaClientesAgendamento =
  document.querySelector(
    "#lista-clientes-agendamento"
  );

const informacaoHorario = document.querySelector(
  "#informacao-horario"
);

/* =========================================================
   DETALHES DO AGENDAMENTO
========================================================= */

const modalDetalhes = document.querySelector(
  "#modal-detalhes"
);

const detalheCliente = document.querySelector(
  "#detalhe-cliente"
);

const detalheData = document.querySelector(
  "#detalhe-data"
);

const detalheHora = document.querySelector(
  "#detalhe-hora"
);

const botaoConcluirAgendamento =
  document.querySelector(
    "#concluir-agendamento"
  );

const botaoNaoRealizadoAgendamento =
  document.querySelector(
    "#nao-realizado-agendamento"
  );

const botaoCancelarAgendamento =
  document.querySelector(
    "#cancelar-agendamento"
  );

/* =========================================================
   CONCLUSÃO DO ATENDIMENTO
========================================================= */

const modalConcluirAtendimento =
  document.querySelector(
    "#modal-concluir-atendimento"
  );

const formConcluirAtendimento =
  document.querySelector(
    "#form-concluir-atendimento"
  );

const conclusaoCliente = document.querySelector(
  "#conclusao-cliente"
);

const conclusaoBarbeiro = document.querySelector(
  "#conclusao-barbeiro"
);

const conclusaoDataHora = document.querySelector(
  "#conclusao-data-hora"
);

const servicoAtendimento = document.querySelector(
  "#servico-atendimento"
);

const produtoAtendimento = document.querySelector(
  "#produto-atendimento"
);

const valorServicoAtendimento =
  document.querySelector(
    "#valor-servico-atendimento"
  );

const valorProdutoAtendimento =
  document.querySelector(
    "#valor-produto-atendimento"
  );

const valorTotalAtendimento =
  document.querySelector(
    "#valor-total-atendimento"
  );

const formaPagamentoAtendimento =
  document.querySelector(
    "#forma-pagamento-atendimento"
  );

const mensagemConclusaoAtendimento =
  document.querySelector(
    "#mensagem-conclusao-atendimento"
  );

/* =========================================================
   DESCONTO DO ATENDIMENTO
========================================================= */

function garantirCamposDesconto() {
  let teveDesconto = document.querySelector(
    "#teve-desconto-atendimento"
  );

  let areaDesconto = document.querySelector(
    "#area-desconto-atendimento"
  );

  let valorDesconto = document.querySelector(
    "#valor-desconto-atendimento"
  );

  let valorFinal = document.querySelector(
    "#valor-final-atendimento"
  );

  /*
    Caso os campos ainda não existam no HTML,
    o próprio JavaScript cria.
  */
  if (!teveDesconto && formaPagamentoAtendimento) {
    const bloco = document.createElement("div");

    bloco.className = "bloco-desconto-atendimento";

    bloco.innerHTML = `
      <label for="teve-desconto-atendimento">
        Houve desconto?
      </label>

      <select id="teve-desconto-atendimento">
        <option value="nao" selected>
          Não
        </option>

        <option value="sim">
          Sim
        </option>
      </select>

      <div
        id="area-desconto-atendimento"
        class="escondida"
      >
        <label for="valor-desconto-atendimento">
          Valor do desconto
        </label>

        <input
          id="valor-desconto-atendimento"
          type="text"
          inputmode="decimal"
          placeholder="R$ 0,00"
          autocomplete="off"
        />
      </div>

      <div class="total-final-atendimento">
        <span>
          Valor final a receber
        </span>

        <strong id="valor-final-atendimento">
          R$ 0,00
        </strong>
      </div>
    `;

    const totalAtendimento =
      document.querySelector(
        ".total-atendimento"
      );

    if (totalAtendimento) {
      totalAtendimento.insertAdjacentElement(
        "afterend",
        bloco
      );
    }

    teveDesconto = document.querySelector(
      "#teve-desconto-atendimento"
    );

    areaDesconto = document.querySelector(
      "#area-desconto-atendimento"
    );

    valorDesconto = document.querySelector(
      "#valor-desconto-atendimento"
    );

    valorFinal = document.querySelector(
      "#valor-final-atendimento"
    );
  }

  return {
    teveDesconto,
    areaDesconto,
    valorDesconto,
    valorFinal
  };
}

const camposDesconto =
  garantirCamposDesconto();

const teveDescontoAtendimento =
  camposDesconto.teveDesconto;

const areaDescontoAtendimento =
  camposDesconto.areaDesconto;

const valorDescontoAtendimento =
  camposDesconto.valorDesconto;

const valorFinalAtendimento =
  camposDesconto.valorFinal;

/* =========================================================
   BARBEIROS
========================================================= */

const botaoMostrarCadastroBarbeiro =
  document.querySelector(
    "#botao-mostrar-cadastro-barbeiro"
  );

const formCadastroBarbeiro =
  document.querySelector(
    "#form-cadastro-barbeiro"
  );

const nomeNovoBarbeiro =
  document.querySelector(
    "#nome-novo-barbeiro"
  );

const senhaNovoBarbeiro =
  document.querySelector(
    "#senha-novo-barbeiro"
  );

const confirmarSenhaNovoBarbeiro =
  document.querySelector(
    "#confirmar-senha-novo-barbeiro"
  );

const pesquisaBarbeiro =
  document.querySelector(
    "#pesquisa-barbeiro"
  );

const mensagemBarbeiro =
  document.querySelector(
    "#mensagem-barbeiro"
  );

const listaGerenciarBarbeiros =
  document.querySelector(
    "#lista-gerenciar-barbeiros"
  );

/* =========================================================
   CLIENTES
========================================================= */

const botaoMostrarCadastroCliente =
  document.querySelector(
    "#botao-mostrar-cadastro-cliente"
  );

const formCadastroCliente =
  document.querySelector(
    "#form-cadastro-cliente"
  );

const nomeNovoCliente =
  document.querySelector(
    "#nome-novo-cliente"
  );

const celularNovoCliente =
  document.querySelector(
    "#celular-novo-cliente"
  );

const pesquisaCliente =
  document.querySelector(
    "#pesquisa-cliente"
  );

const mensagemCliente =
  document.querySelector(
    "#mensagem-cliente"
  );

const listaGerenciarClientes =
  document.querySelector(
    "#lista-gerenciar-clientes"
  );

/* =========================================================
   PRODUTOS
========================================================= */

const botaoMostrarCadastroProduto =
  document.querySelector(
    "#botao-mostrar-cadastro-produto"
  );

const formCadastroProduto =
  document.querySelector(
    "#form-cadastro-produto"
  );

const nomeNovoProduto =
  document.querySelector(
    "#nome-novo-produto"
  );

const valorNovoProduto =
  document.querySelector(
    "#valor-novo-produto"
  );

const pesquisaProduto =
  document.querySelector(
    "#pesquisa-produto"
  );

const mensagemProduto =
  document.querySelector(
    "#mensagem-produto"
  );

const listaProdutos =
  document.querySelector(
    "#lista-produtos"
  );

/* =========================================================
   SERVIÇOS
========================================================= */

const botaoMostrarCadastroServico =
  document.querySelector(
    "#botao-mostrar-cadastro-servico"
  );

const formCadastroServico =
  document.querySelector(
    "#form-cadastro-servico"
  );

const nomeNovoServico =
  document.querySelector(
    "#nome-novo-servico"
  );

const valorNovoServico =
  document.querySelector(
    "#valor-novo-servico"
  );

const pesquisaServico =
  document.querySelector(
    "#pesquisa-servico"
  );

const mensagemServico =
  document.querySelector(
    "#mensagem-servico"
  );

const listaServicos =
  document.querySelector(
    "#lista-servicos"
  );

/* =========================================================
   EDITAR CATÁLOGO
========================================================= */

const modalEditarCatalogo =
  document.querySelector(
    "#modal-editar-catalogo"
  );

const tituloEditarCatalogo =
  document.querySelector(
    "#titulo-editar-catalogo"
  );

const formEditarCatalogo =
  document.querySelector(
    "#form-editar-catalogo"
  );

const idEditarCatalogo =
  document.querySelector(
    "#id-editar-catalogo"
  );

const tipoEditarCatalogo =
  document.querySelector(
    "#tipo-editar-catalogo"
  );

const nomeEditarCatalogo =
  document.querySelector(
    "#nome-editar-catalogo"
  );

const valorEditarCatalogo =
  document.querySelector(
    "#valor-editar-catalogo"
  );

const mensagemEditarCatalogo =
  document.querySelector(
    "#mensagem-editar-catalogo"
  );

/* =========================================================
   RELATÓRIO DE DESEMPENHO
========================================================= */

const filtroRelatorioBarbeiro =
  document.querySelector(
    "#filtro-relatorio-barbeiro"
  );

const botaoMesAnterior =
  document.querySelector(
    "#mes-anterior"
  );

const botaoProximoMes =
  document.querySelector(
    "#proximo-mes"
  );

const tituloCalendario =
  document.querySelector(
    "#titulo-calendario"
  );

const calendarioRelatorio =
  document.querySelector(
    "#calendario-relatorio"
  );

const filtroSegundoGrafico =
  document.querySelector(
    "#filtro-segundo-grafico"
  );

const tituloSegundoGrafico =
  document.querySelector(
    "#titulo-segundo-grafico"
  );

/* =========================================================
   ABAS DOS RELATÓRIOS
========================================================= */

const abaRelatorioDesempenho =
  document.querySelector(
    "#aba-relatorio-desempenho"
  );

const abaRelatorioFinanceiro =
  document.querySelector(
    "#aba-relatorio-financeiro"
  );

const abaRelatorioHistorico =
  selecionarPrimeiro(
    "#aba-relatorio-historico",
    "#aba-historico"
  );

const conteudoRelatorioDesempenho =
  document.querySelector(
    "#conteudo-relatorio-desempenho"
  );

const conteudoRelatorioFinanceiro =
  document.querySelector(
    "#conteudo-relatorio-financeiro"
  );

const conteudoRelatorioHistorico =
  selecionarPrimeiro(
    "#conteudo-relatorio-historico",
    "#conteudo-historico"
  );

/* =========================================================
   FINANCEIRO
========================================================= */

const periodoRelatorioFinanceiro =
  document.querySelector(
    "#periodo-relatorio-financeiro"
  );

const filtroFinanceiroBarbeiro =
  document.querySelector(
    "#filtro-financeiro-barbeiro"
  );

const tituloPeriodoFinanceiro =
  document.querySelector(
    "#titulo-periodo-financeiro"
  );

const botaoPeriodoFinanceiroAnterior =
  document.querySelector(
    "#periodo-financeiro-anterior"
  );

const botaoPeriodoFinanceiroProximo =
  document.querySelector(
    "#periodo-financeiro-proximo"
  );

const tituloGraficoFinanceiro =
  document.querySelector(
    "#titulo-grafico-financeiro"
  );

const totalGraficoFinanceiro =
  document.querySelector(
    "#total-grafico-financeiro"
  );

const rankingFinanceiroBarbeiros =
  document.querySelector(
    "#ranking-financeiro-barbeiros"
  );

const rankingFinanceiroServicos =
  document.querySelector(
    "#ranking-financeiro-servicos"
  );

const rankingFinanceiroProdutos =
  document.querySelector(
    "#ranking-financeiro-produtos"
  );

/* =========================================================
   GERAR PDF DO HISTÓRICO FINANCEIRO
========================================================= */

const botaoGerarPdfHistorico =
  document.querySelector(
    "#gerar-pdf-historico"
  );

async function gerarPdfHistorico() {
  if (!usuarioPodeVisualizarFinanceiro()) {
    return;
  }

  if (
    !window.jspdf ||
    !window.jspdf.jsPDF
  ) {
    alert(
      "Não foi possível carregar o gerador de PDF."
    );

    return;
  }

  const botao = botaoGerarPdfHistorico;

  if (botao) {
    botao.disabled = true;
    botao.textContent =
      "Gerando PDF...";
  }

  try {
    const periodo =
      obterPeriodoHistorico();

    const barbeiroSelecionado =
      filtroHistoricoBarbeiro?.value ||
      "todos";

    const tipoSelecionado =
      filtroHistoricoTipo?.value ||
      "todos";

    /* =========================================
       BUSCAR DADOS
    ========================================= */

    const [
      respostaAgendamentos,
      respostaMovimentacoes
    ] = await Promise.all([
      getDocs(
        collection(
          db,
          "agendamentos"
        )
      ),

      getDocs(
        collection(
          db,
          "movimentacoesFinanceiras"
        )
      )
    ]);

    /* =========================================
       ENTRADAS
    ========================================= */

    const entradas =
      respostaAgendamentos.docs
        .map(
          (documento) => ({
            id: documento.id,
            ...documento.data()
          })
        )
        .filter(
          (agendamento) =>
            agendamento.status ===
            "concluido"
        )
        .map(
          transformarAtendimentoEmEntrada
        );

    const entradasPlanos = respostaMovimentacoes.docs
      .map((documento) => ({
        id: documento.id,
        ...documento.data()
      }))
      .filter((movimentacao) =>
        movimentacao.tipo === "entrada" &&
        movimentacao.origem === "plano"
      )
      .map((movimentacao) => ({
        ...movimentacao,
        barbeiro: movimentacao.barbeiro || "",
        prioridadeHistorico: 1
      }));

    /* =========================================
       SAÍDAS
    ========================================= */

    const saidas =
      respostaMovimentacoes.docs
        .map(
          (documento) => ({
            id: documento.id,
            origem:
              "manual",
            ...documento.data()
          })
        )
        .filter(
          (movimentacao) =>
            movimentacao.tipo ===
            "saida"
        );

    const todasMovimentacoes = [
      ...entradas,
      ...entradasPlanos,
      ...saidas
    ];

    /* =========================================
       FILTRAR PELO PERÍODO E BARBEIRO
    ========================================= */

    const movimentacoesPeriodo =
      todasMovimentacoes.filter(
        (movimentacao) => {
          const dentroPeriodo =
            movimentacao.data >=
              periodo.inicioTexto &&
            movimentacao.data <=
              periodo.fimTexto;

          const barbeiroCorreto =
            barbeiroSelecionado ===
              "todos" ||
            movimentacao.barbeiro ===
              barbeiroSelecionado;

          return (
            dentroPeriodo &&
            barbeiroCorreto
          );
        }
      );

    /* =========================================
       FILTRO ENTRADA / SAÍDA
    ========================================= */

    const movimentacoes =
      movimentacoesPeriodo
        .filter(
          (movimentacao) => {
            return (
              tipoSelecionado ===
                "todos" ||
              tipoSelecionado ===
                "todas" ||
              movimentacao.tipo ===
                tipoSelecionado
            );
          }
        )
        .sort(
          (a, b) => {
            const diferencaData =
              criarDataHora(
                b.data,
                b.hora ||
                  "00:00"
              ) -
              criarDataHora(
                a.data,
                a.hora ||
                  "00:00"
              );

            if (
              diferencaData !== 0
            ) {
              return diferencaData;
            }

            return (
              (
                Number(
                  b.prioridadeHistorico
                ) || 0
              ) -
              (
                Number(
                  a.prioridadeHistorico
                ) || 0
              )
            );
          }
        );

    /* =========================================
       TOTAIS DO PERÍODO
    ========================================= */

    const totalEntradas =
      movimentacoesPeriodo
        .filter(
          (movimentacao) =>
            movimentacao.tipo ===
            "entrada"
        )
        .reduce(
          (
            total,
            movimentacao
          ) =>
            total +
            (
              Number(
                movimentacao.valor
              ) || 0
            ),
          0
        );

    const totalSaidas =
      movimentacoesPeriodo
        .filter(
          (movimentacao) =>
            movimentacao.tipo ===
            "saida"
        )
        .reduce(
          (
            total,
            movimentacao
          ) =>
            total +
            (
              Number(
                movimentacao.valor
              ) || 0
            ),
          0
        );

    const saldo =
      totalEntradas -
      totalSaidas;

    /* =========================================
       CRIAR PDF
    ========================================= */

    const { jsPDF } =
      window.jspdf;

    const pdf =
      new jsPDF({
        orientation:
          "landscape",

        unit:
          "mm",

        format:
          "a4"
      });

    const larguraPagina =
      pdf.internal.pageSize.getWidth();

    /* =========================================
       CABEÇALHO
    ========================================= */

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(
      20
    );

    pdf.text(
      "TRADIÇÃO BARBEARIA",
      14,
      17
    );

    pdf.setFontSize(
      13
    );

    pdf.text(
      "Relatório de Movimentações Financeiras",
      14,
      25
    );

    pdf.setDrawColor(
      190,
      150,
      50
    );

    pdf.setLineWidth(
      0.8
    );

    pdf.line(
      14,
      30,
      larguraPagina - 14,
      30
    );

    /* =========================================
       INFORMAÇÕES DO FILTRO
    ========================================= */

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(
      10
    );

    const barbeiroTexto =
      barbeiroSelecionado ===
      "todos"
        ? "Barbearia inteira"
        : barbeiroSelecionado;

    let tipoTexto =
      "Entradas e saídas";

    if (
      tipoSelecionado ===
      "entrada"
    ) {
      tipoTexto =
        "Somente entradas";
    }

    if (
      tipoSelecionado ===
      "saida"
    ) {
      tipoTexto =
        "Somente saídas";
    }

    pdf.text(
      `Período: ${periodo.titulo}`,
      14,
      38
    );

    pdf.text(
      `Barbeiro: ${barbeiroTexto}`,
      14,
      44
    );

    pdf.text(
      `Filtro: ${tipoTexto}`,
      14,
      50
    );

    /* =========================================
       RESUMO FINANCEIRO
    ========================================= */

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(
      11
    );

    pdf.text(
      "RESUMO FINANCEIRO",
      14,
      60
    );

    pdf.setFontSize(
      10
    );

    pdf.text(
      `Entradas: ${formatarValorEmReal(totalEntradas)}`,
      14,
      68
    );

    pdf.text(
      `Saídas: ${formatarValorEmReal(totalSaidas)}`,
      80,
      68
    );

    pdf.text(
      `Saldo: ${formatarValorEmReal(saldo)}`,
      145,
      68
    );

    /* =========================================
       MONTAR LINHAS
    ========================================= */

    const linhas =
      movimentacoes.map(
        (movimentacao) => {
          const dataFormatada =
            dataPorTexto(
              movimentacao.data
            ).toLocaleDateString(
              "pt-BR"
            );

          const hora =
            movimentacao.hora ||
            "00:00";

          const descricao =
            movimentacao.descricao ||
            (
              movimentacao.tipo ===
              "entrada"
                ? "Atendimento"
                : "Saída"
            );

          const barbeiro =
            movimentacao.barbeiro ||
            "Barbearia";

          const pagamento =
            movimentacao.formaPagamento ||
            "—";

          const valor =
            Number(
              movimentacao.valor
            ) || 0;

          const tipo =
            movimentacao.tipo ===
            "saida"
              ? "Saída"
              : "Entrada";

          const valorFormatado =
            movimentacao.tipo ===
            "saida"
              ? `- ${formatarValorEmReal(valor)}`
              : `+ ${formatarValorEmReal(valor)}`;

          return [
            dataFormatada,
            hora,
            descricao,
            barbeiro,
            pagamento,
            valorFormatado,
            tipo
          ];
        }
      );

    /* =========================================
       TABELA
    ========================================= */

    if (
      typeof pdf.autoTable !==
      "function"
    ) {
      throw new Error(
        "Plugin AutoTable não carregado."
      );
    }

    pdf.autoTable({
      startY:
        76,

      head: [[
        "Data",
        "Hora",
        "Movimentação",
        "Barbeiro",
        "Pagamento",
        "Valor",
        "Tipo"
      ]],

      body:
        linhas,

      theme:
        "grid",

      styles: {
        font:
          "helvetica",

        fontSize:
          8,

        cellPadding:
          2.5,

        valign:
          "middle"
      },

      headStyles: {
        fillColor: [
          32,
          32,
          32
        ],

        textColor: [
          255,
          255,
          255
        ],

        fontStyle:
          "bold"
      },

      columnStyles: {
        0: {
          cellWidth: 25
        },

        1: {
          cellWidth: 18
        },

        2: {
          cellWidth: 70
        },

        3: {
          cellWidth: 35
        },

        4: {
          cellWidth: 28
        },

        5: {
          cellWidth: 32
        },

        6: {
          cellWidth: 25
        }
      },

      didParseCell(
        dados
      ) {
        if (
          dados.section !==
          "body"
        ) {
          return;
        }

        const tipo =
          dados.row.raw[6];

        if (
          dados.column.index ===
          5 ||
          dados.column.index ===
          6
        ) {
          if (
            tipo ===
            "Entrada"
          ) {
            dados.cell.styles.textColor = [
              20,
              130,
              70
            ];
          } else {
            dados.cell.styles.textColor = [
              190,
              50,
              50
            ];
          }

          dados.cell.styles.fontStyle =
            "bold";
        }
      },

      didDrawPage(
        dados
      ) {
        const numeroPagina =
          pdf.internal.getNumberOfPages();

        pdf.setFontSize(
          8
        );

        pdf.setTextColor(
          100
        );

        pdf.text(
          `Página ${numeroPagina}`,
          larguraPagina - 30,
          pdf.internal.pageSize.getHeight() - 8
        );
      }
    });

    /* =========================================
       NOME DO ARQUIVO
    ========================================= */

    const dataArquivo =
      new Date()
        .toLocaleDateString(
          "pt-BR"
        )
        .replace(
          /\//g,
          "-"
        );

    pdf.save(
      `historico-financeiro-${dataArquivo}.pdf`
    );
  } catch (erro) {
    console.log(
      "Erro ao gerar PDF do histórico:",
      erro
    );

    alert(
      "Não foi possível gerar o PDF do histórico."
    );
  } finally {
    if (botao) {
      botao.disabled =
        false;

      botao.textContent =
        "Gerar PDF";
    }
  }
}

/* =========================================================
   BOTÃO GERAR PDF
========================================================= */

if (
  botaoGerarPdfHistorico
) {
  botaoGerarPdfHistorico.addEventListener(
    "click",
    gerarPdfHistorico
  );
}

/* =========================================================
   HISTÓRICO FINANCEIRO
========================================================= */

const periodoRelatorioHistorico =
  selecionarPrimeiro(
    "#periodo-relatorio-historico",
    "#periodo-historico"
  );

const filtroHistoricoBarbeiro =
  selecionarPrimeiro(
    "#filtro-historico-barbeiro",
    "#historico-filtro-barbeiro"
  );

const filtroHistoricoTipo =
  selecionarPrimeiro(
    "#filtro-historico-tipo",
    "#filtro-historico-movimentacao",
    "#historico-filtro-tipo"
  );

const botaoPeriodoHistoricoAnterior =
  selecionarPrimeiro(
    "#periodo-historico-anterior",
    "#historico-anterior"
  );

const botaoPeriodoHistoricoProximo =
  selecionarPrimeiro(
    "#periodo-historico-proximo",
    "#historico-proximo"
  );

const tituloPeriodoHistorico =
  selecionarPrimeiro(
    "#titulo-periodo-historico",
    "#historico-titulo-periodo"
  );

const historicoTotalEntradas =
  selecionarPrimeiro(
    "#historico-total-entradas",
    "#total-entradas-historico"
  );

const historicoTotalSaidas =
  selecionarPrimeiro(
    "#historico-total-saidas",
    "#total-saidas-historico"
  );

const historicoSaldo =
  selecionarPrimeiro(
    "#historico-saldo",
    "#saldo-historico"
  );

const listaHistoricoFinanceiro =
  selecionarPrimeiro(
    "#lista-historico-financeiro",
    "#lista-historico"
  );

/* =========================================================
   REGISTRAR SAÍDA
========================================================= */

const botaoRegistrarSaida =
  selecionarPrimeiro(
    "#botao-registrar-saida",
    "#registrar-saida"
  );

const modalRegistrarSaida =
  selecionarPrimeiro(
    "#modal-registrar-saida",
    "#modal-saida"
  );

const formRegistrarSaida =
  selecionarPrimeiro(
    "#form-registrar-saida",
    "#form-saida"
  );

const descricaoSaida =
  selecionarPrimeiro(
    "#descricao-saida",
    "#saida-descricao"
  );

const valorSaida =
  selecionarPrimeiro(
    "#valor-saida",
    "#saida-valor"
  );

const barbeiroSaida =
  selecionarPrimeiro(
    "#barbeiro-saida",
    "#saida-barbeiro"
  );

const dataSaida =
  selecionarPrimeiro(
    "#data-saida",
    "#saida-data"
  );

const horaSaida =
  selecionarPrimeiro(
    "#hora-saida",
    "#saida-hora"
  );

const mensagemSaida =
  selecionarPrimeiro(
    "#mensagem-saida",
    "#saida-mensagem"
  );

/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const configuracaoSenha =
  document.querySelector(
    "#configuracao-senha"
  );

const descricaoConfiguracaoSenha =
  document.querySelector(
    "#descricao-configuracao-senha"
  );

const formAlterarSenha =
  document.querySelector(
    "#form-alterar-senha"
  );

const usuarioAlterarSenha =
  document.querySelector(
    "#usuario-alterar-senha"
  );

const novaSenha =
  document.querySelector(
    "#nova-senha"
  );

const confirmarNovaSenha =
  document.querySelector(
    "#confirmar-nova-senha"
  );

const mensagemSenha =
  document.querySelector(
    "#mensagem-senha"
  );

const mensagemTema =
  document.querySelector(
    "#mensagem-tema"
  );

const configuracaoApagarDados = document.querySelector(
  "#configuracao-apagar-dados"
);
const confirmacaoApagarDados = document.querySelector(
  "#confirmacao-apagar-dados"
);
const botaoApagarDados = document.querySelector(
  "#botao-apagar-dados"
);
const senhaAdministradorApagarDados = document.querySelector(
  "#senha-administrador-apagar-dados"
);
const mensagemApagarDados = document.querySelector(
  "#mensagem-apagar-dados"
);

const opcoesTema =
  document.querySelectorAll(
    'input[name="tema"]'
  );

const configuracaoGeral = doc(
  db,
  "configuracoes",
  "geral"
);

const historicoQuantidadeEntradas =
  document.querySelector(
    "#historico-quantidade-entradas"
  );

const historicoQuantidadeSaidas =
  document.querySelector(
    "#historico-quantidade-saidas"
  );

const quantidadeMovimentacoesHistorico =
  document.querySelector(
    "#quantidade-movimentacoes-historico"
  );

/* =========================================================
   PLANOS
========================================================= */

const botaoMostrarCadastroPlano = document.querySelector(
  "#botao-mostrar-cadastro-plano"
);
const formCadastroPlano = document.querySelector(
  "#form-cadastro-plano"
);
const planoIdEdicao = document.querySelector(
  "#plano-id-edicao"
);
const nomeNovoPlano = document.querySelector(
  "#nome-novo-plano"
);
const valorNovoPlano = document.querySelector(
  "#valor-novo-plano"
);
const servicoNovoPlano = document.querySelector(
  "#servico-novo-plano"
);
const usosNovoPlano = document.querySelector(
  "#usos-novo-plano"
);
const cancelarEdicaoPlano = document.querySelector(
  "#cancelar-edicao-plano"
);
const pesquisaPlano = document.querySelector(
  "#pesquisa-plano"
);
const mensagemPlano = document.querySelector(
  "#mensagem-plano"
);
const listaPlanos = document.querySelector(
  "#lista-planos"
);

const modalClientesPlano = document.querySelector(
  "#modal-clientes-plano"
);
const tituloClientesPlano = document.querySelector(
  "#titulo-clientes-plano"
);
const resumoClientesPlano = document.querySelector(
  "#resumo-clientes-plano"
);
const mensagemClientesPlano = document.querySelector(
  "#mensagem-clientes-plano"
);
const listaClientesDisponiveisPlano = document.querySelector(
  "#lista-clientes-disponiveis-plano"
);
const formVinculoClientePlano = document.querySelector("#form-vinculo-cliente-plano");
const clienteIdVinculoPlano = document.querySelector("#cliente-id-vinculo-plano");
const nomeClienteVinculoPlano = document.querySelector("#nome-cliente-vinculo-plano");
const pagamentoVinculoPlano = document.querySelector("#pagamento-vinculo-plano");
const valorVinculoPlano = document.querySelector("#valor-vinculo-plano");
const campoDataInicioCicloPlano = document.querySelector("#campo-data-inicio-ciclo-plano");
const dataInicioCicloPlano = document.querySelector("#data-inicio-ciclo-plano");
const cancelarVinculoClientePlano = document.querySelector("#cancelar-vinculo-cliente-plano");

const modalVerificarPlano = document.querySelector(
  "#modal-verificar-plano"
);
const tituloVerificarPlano = document.querySelector(
  "#titulo-verificar-plano"
);
const conteudoVerificarPlano = document.querySelector(
  "#conteudo-verificar-plano"
);
const mensagemVerificarPlano = document.querySelector(
  "#mensagem-verificar-plano"
);
const botoesVerificarPlano = document.querySelector(
  "#botoes-verificar-plano"
);

const modalExtrasPlano = document.querySelector(
  "#modal-extras-plano"
);
const textoExtrasPlano = document.querySelector(
  "#texto-extras-plano"
);
const botaoPlanoSemExtras = document.querySelector(
  "#plano-sem-extras"
);
const botaoPlanoComExtras = document.querySelector(
  "#plano-com-extras"
);
const mensagemExtrasPlano = document.querySelector(
  "#mensagem-extras-plano"
);

const tituloConclusaoAtendimento = document.querySelector(
  "#titulo-conclusao-atendimento"
);
const descricaoConclusaoAtendimento = document.querySelector(
  "#descricao-conclusao-atendimento"
);
const labelServicoAtendimento = document.querySelector(
  "#label-servico-atendimento"
);

/* =========================================================
   SAIR
========================================================= */

const modalSair =
  document.querySelector(
    "#modal-sair"
  );

const botaoConfirmarSair =
  document.querySelector(
    "#confirmar-sair"
  );

/* =========================================================
   VARIÁVEIS
========================================================= */

let graficoStatus = null;
let graficoFinanceiro = null;

let mesRelatorio = new Date();

let dataFinanceiro = new Date();
let dataHistorico = new Date();

let barbeiroAtual = "";

let barbeiros = [];
let clientes = [];
let produtos = [];
let servicos = [];
let agendamentos = [];
let dias = [];
let planos = [];
let usosPlanos = [];

let planoSelecionadoParaClientes = null;
let planoAtendimentoSelecionado = null;
let atendimentoPeloPlano = false;
let atendimentoPlanoComExtras = false;

let agendamentoSelecionado = null;
let clienteSelecionado = null;

let zoomAgenda = 1;

const ZOOM_MINIMO = 0.7;
const ZOOM_MAXIMO = 1.6;
const PASSO_ZOOM = 0.15;

/* =========================================================
   PERMISSÕES
========================================================= */

function usuarioPodeVisualizarTodasAgendas() {
  return (
    tipoUsuario === "administrador" ||
    tipoUsuario === "recepcionista"
  );
}

function usuarioPodeGerenciarBarbeiros() {
  return tipoUsuario === "administrador";
}

function usuarioPodeGerenciarCatalogo() {
  return (
    tipoUsuario === "administrador" ||
    tipoUsuario === "recepcionista"
  );
}

function usuarioPodeGerenciarPlanos() {
  return (
    tipoUsuario === "administrador" ||
    tipoUsuario === "recepcionista"
  );
}

function usuarioPodeVisualizarRelatorioGeral() {
  return (
    tipoUsuario === "administrador" ||
    tipoUsuario === "recepcionista"
  );
}

function usuarioPodeVisualizarFinanceiro() {
  return tipoUsuario === "administrador";
}

/* =========================================================
   DINHEIRO
========================================================= */

function formatarValorEmReal(valor) {
  const numero = Number(valor) || 0;

  return numero.toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
    }
  );
}

function converterValorParaNumero(valor) {
  if (typeof valor === "number") {
    return valor;
  }

  let texto = String(valor)
    .trim()
    .replace("R$", "")
    .replace(/\s/g, "");

  if (texto.includes(",")) {
    texto = texto
      .replace(/\./g, "")
      .replace(",", ".");
  }

  const numero = Number(texto);

  return Number.isFinite(numero)
    ? numero
    : 0;
}

function formatarCampoValor(campo) {
  if (!campo) {
    return;
  }

  const numeros =
    campo.value.replace(/\D/g, "");

  if (numeros === "") {
    campo.value = "";
    return;
  }

  const valor =
    Number(numeros) / 100;

  campo.value =
    formatarValorEmReal(valor);
}

/* =========================================================
   DATAS E HORÁRIOS
========================================================= */

function criarHorarios() {
  const listaHorarios = [];

  let minutos = 8 * 60;

  const ultimoHorario =
    20 * 60 + 30;

  while (minutos <= ultimoHorario) {
    const hora = String(
      Math.floor(minutos / 60)
    ).padStart(2, "0");

    const minuto = String(
      minutos % 60
    ).padStart(2, "0");

    listaHorarios.push(
      `${hora}:${minuto}`
    );

    minutos += 30;
  }

  return listaHorarios;
}

const horarios = criarHorarios();

function formatarDataParaSalvar(data) {
  const ano = data.getFullYear();

  const mes = String(
    data.getMonth() + 1
  ).padStart(2, "0");

  const dia = String(
    data.getDate()
  ).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function formatarDataParaMostrar(data) {
  return data.toLocaleDateString(
    "pt-BR",
    {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }
  );
}

function dataPorTexto(dataTexto) {
  const partes =
    dataTexto.split("-");

  return new Date(
    Number(partes[0]),
    Number(partes[1]) - 1,
    Number(partes[2])
  );
}

function criarPrimeirosDias() {
  const hoje = new Date();

  hoje.setHours(
    0,
    0,
    0,
    0
  );

  dias = [];

  for (
    let numero = 0;
    numero < 21;
    numero++
  ) {
    const novoDia =
      new Date(hoje);

    novoDia.setDate(
      hoje.getDate() + numero
    );

    dias.push(novoDia);
  }
}

function adicionarMaisDias() {
  const ultimoDia =
    dias[dias.length - 1];

  for (
    let numero = 1;
    numero <= 14;
    numero++
  ) {
    const novoDia =
      new Date(ultimoDia);

    novoDia.setDate(
      ultimoDia.getDate() +
        numero
    );

    dias.push(novoDia);
  }
}

function obterInicioDaSemana(data) {
  const inicio =
    new Date(data);

  const diaSemana =
    inicio.getDay();

  const diferenca =
    diaSemana === 0
      ? -6
      : 1 - diaSemana;

  inicio.setDate(
    inicio.getDate() +
      diferenca
  );

  inicio.setHours(
    0,
    0,
    0,
    0
  );

  return inicio;
}

function obterFimDaSemana(data) {
  const fim =
    obterInicioDaSemana(data);

  fim.setDate(
    fim.getDate() + 6
  );

  fim.setHours(
    23,
    59,
    59,
    999
  );

  return fim;
}

function criarDataHora(
  dataTexto,
  horaTexto = "00:00"
) {
  return new Date(
    `${dataTexto}T${horaTexto}:00`
  );
}

/* =========================================================
   TELAS
========================================================= */

function esconderTodasAsTelas() {
  telaDashboard?.classList.add(
    "escondida"
  );

  telaBarbeiros?.classList.add(
    "escondida"
  );

  telaClientes?.classList.add(
    "escondida"
  );

  telaProdutosServicos?.classList.add(
    "escondida"
  );

  telaPlanos?.classList.add(
    "escondida"
  );

  telaRelatorio?.classList.add(
    "escondida"
  );

  telaConfiguracoes?.classList.add(
    "escondida"
  );
}

function marcarBotaoAtivo(
  nomeDoBotao
) {
  document
    .querySelectorAll(
      ".botao-menu"
    )
    .forEach((botao) => {
      botao.classList.toggle(
        "ativo",
        botao.textContent ===
          nomeDoBotao
      );
    });
}

function abrirTelaDashboard() {
  esconderTodasAsTelas();

  telaDashboard.classList.remove(
    "escondida"
  );

  marcarBotaoAtivo(
    "Dashboard"
  );
}

async function abrirTelaBarbeiros() {
  esconderTodasAsTelas();

  telaBarbeiros.classList.remove(
    "escondida"
  );

  marcarBotaoAtivo(
    "Barbeiros"
  );

  formCadastroBarbeiro.classList.add(
    "escondida"
  );

  mensagemBarbeiro.textContent = "";
  pesquisaBarbeiro.value = "";

  botaoMostrarCadastroBarbeiro.style.display =
    usuarioPodeGerenciarBarbeiros()
      ? ""
      : "none";

  await carregarBarbeiros();

  mostrarListaDeBarbeiros();
}

async function abrirTelaClientes() {
  esconderTodasAsTelas();

  telaClientes.classList.remove(
    "escondida"
  );

  marcarBotaoAtivo(
    "Clientes cadastrados"
  );

  formCadastroCliente.classList.add(
    "escondida"
  );

  mensagemCliente.textContent = "";
  pesquisaCliente.value = "";

  await carregarClientes();

  mostrarListaDeClientes();
}

async function abrirTelaProdutosServicos() {
  esconderTodasAsTelas();

  telaProdutosServicos.classList.remove(
    "escondida"
  );

  marcarBotaoAtivo(
    "Produtos e Serviços"
  );

  formCadastroProduto.classList.add(
    "escondida"
  );

  formCadastroServico.classList.add(
    "escondida"
  );

  pesquisaProduto.value = "";
  pesquisaServico.value = "";

  mensagemProduto.textContent = "";
  mensagemServico.textContent = "";

  const podeGerenciar =
    usuarioPodeGerenciarCatalogo();

  botaoMostrarCadastroProduto.style.display =
    podeGerenciar
      ? ""
      : "none";

  botaoMostrarCadastroServico.style.display =
    podeGerenciar
      ? ""
      : "none";

  await Promise.all([
    carregarProdutos(),
    carregarServicos()
  ]);

  mostrarListaDeProdutos();
  mostrarListaDeServicos();
}

/* =========================================================
   PLANOS - TELA E DADOS
========================================================= */

function chaveMes(dataTexto = "") {
  const data = dataTexto
    ? dataPorTexto(dataTexto)
    : new Date();

  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");

  return `${ano}-${mes}`;
}

function vinculosDoPlano(plano) {
  return Array.isArray(plano?.clientesPlano) ? plano.clientesPlano : [];
}

function vinculoDoCliente(plano, clienteId) {
  const vinculo = vinculosDoPlano(plano).find(
    (item) => item.clienteId === clienteId && item.ativo !== false
  );
  if (vinculo) return vinculo;

  const clientesIds = Array.isArray(plano?.clientesIds) ? plano.clientesIds : [];
  if (!clientesIds.includes(clienteId)) return null;

  const dataBase = plano?.dataCadastro ? new Date(plano.dataCadastro) : new Date();
  return {
    clienteId,
    ativo: true,
    legado: true,
    valorPlano: Number(plano?.valor) || 0,
    formaPagamento: "Não informado",
    inicioCiclo: formatarDataParaSalvar(dataBase)
  };
}

function adicionarMesComDiaBase(dataInicial, quantidade) {
  const ano = dataInicial.getFullYear();
  const mes = dataInicial.getMonth() + quantidade;
  const dia = dataInicial.getDate();
  const ultimoDia = new Date(ano, mes + 1, 0).getDate();
  return new Date(ano, mes, Math.min(dia, ultimoDia));
}

function cicloIndividualDoCliente(plano, clienteId, dataReferenciaTexto = "") {
  const vinculo = vinculoDoCliente(plano, clienteId);
  if (!vinculo?.inicioCiclo) return null;

  const inicioBase = dataPorTexto(vinculo.inicioCiclo);
  const referencia = dataReferenciaTexto ? dataPorTexto(dataReferenciaTexto) : new Date();
  referencia.setHours(0, 0, 0, 0);
  inicioBase.setHours(0, 0, 0, 0);
  if (referencia < inicioBase) return null;

  let meses = (referencia.getFullYear() - inicioBase.getFullYear()) * 12
    + referencia.getMonth() - inicioBase.getMonth();
  let inicio = adicionarMesComDiaBase(inicioBase, meses);
  if (inicio > referencia) {
    meses -= 1;
    inicio = adicionarMesComDiaBase(inicioBase, meses);
  }

  const proximoInicio = adicionarMesComDiaBase(inicioBase, meses + 1);
  const fim = new Date(proximoInicio);
  fim.setDate(fim.getDate() - 1);
  const inicioTexto = formatarDataParaSalvar(inicio);

  return {
    inicio: inicioTexto,
    fim: formatarDataParaSalvar(fim),
    chave: inicioTexto,
    vinculo
  };
}

function cicloDoClienteEstaPago(ciclo) {
  if (!ciclo) return false;

  const vinculo = ciclo.vinculo;
  const ciclosPagos = Array.isArray(vinculo?.ciclosPagos)
    ? vinculo.ciclosPagos
    : [];

  if (ciclosPagos.includes(ciclo.chave)) return true;

  const pagamentoInicialRegistrado =
    Number(vinculo?.valorPlano) > 0 &&
    Boolean(vinculo?.formaPagamento) &&
    vinculo.formaPagamento !== "Não informado";

  return pagamentoInicialRegistrado && ciclo.chave === vinculo.inicioCiclo;
}

async function carregarPlanos() {
  const resposta = await getDocs(
    collection(db, "planos")
  );

  planos = resposta.docs
    .map((documento) => ({
      id: documento.id,
      ...documento.data()
    }))
    .sort((a, b) =>
      String(a.nome || "").localeCompare(
        String(b.nome || ""),
        "pt-BR"
      )
    );
}

async function carregarUsosPlanos() {
  const resposta = await getDocs(
    collection(db, "usosPlanos")
  );

  usosPlanos = resposta.docs.map(
    (documento) => ({
      id: documento.id,
      ...documento.data()
    })
  );
}

function usosDoClienteNoPlano(planoId, clienteId, ciclo = chaveMes()) {
  return usosPlanos.filter((uso) =>
    uso.planoId === planoId &&
    uso.clienteId === clienteId &&
    uso.ciclo === ciclo &&
    uso.cancelado !== true
  ).length;
}

function usosDoClienteNoCicloIndividual(plano, clienteId, dataReferenciaTexto = "") {
  const ciclo = cicloIndividualDoCliente(plano, clienteId, dataReferenciaTexto);
  if (!ciclo) return 0;

  return usosPlanos.filter((uso) =>
    uso.planoId === plano.id &&
    uso.clienteId === clienteId &&
    uso.cancelado !== true &&
    (uso.cicloInicio === ciclo.inicio ||
      (!uso.cicloInicio && uso.data >= ciclo.inicio && uso.data <= ciclo.fim))
  ).length;
}

function preencherServicosDoPlano(servicoSelecionado = "") {
  servicoNovoPlano.innerHTML = `
    <option value="">Selecione o serviço</option>
  `;

  servicos.forEach((servico) => {
    const opcao = document.createElement("option");
    opcao.value = servico.id;
    opcao.textContent = servico.nome;
    opcao.selected = servico.id === servicoSelecionado;
    servicoNovoPlano.appendChild(opcao);
  });
}

function limparFormularioPlano() {
  planoIdEdicao.value = "";
  formCadastroPlano.reset();
  preencherServicosDoPlano();
  mensagemPlano.textContent = "";
}

function mostrarListaDePlanos() {
  const pesquisa = (pesquisaPlano?.value || "")
    .trim()
    .toLowerCase();

  const filtrados = planos.filter((plano) =>
    String(plano.nome || "").toLowerCase().includes(pesquisa) ||
    String(plano.servicoNome || "").toLowerCase().includes(pesquisa)
  );

  listaPlanos.innerHTML = "";

  if (filtrados.length === 0) {
    listaPlanos.innerHTML = `
      <p class="lista-vazia">Nenhum plano encontrado.</p>
    `;
    return;
  }

  filtrados.forEach((plano) => {
    const clientesIdsLegados = Array.isArray(plano.clientesIds)
      ? plano.clientesIds
      : [];
    const clientesIds = [...new Set([
      ...clientesIdsLegados,
      ...vinculosDoPlano(plano)
        .filter((vinculo) => vinculo.ativo !== false)
        .map((vinculo) => vinculo.clienteId)
    ])];

    const clientesVinculados = clientes
      .filter((cliente) => clientesIds.includes(cliente.id))
      .sort((a, b) =>
        String(a.nome || "").localeCompare(
          String(b.nome || ""),
          "pt-BR"
        )
      );

    const limite = Number(plano.usosMensais) || 0;
    const cartao = document.createElement("article");
    cartao.className = "cartao-plano";

    cartao.innerHTML = `
      <div class="cartao-plano-topo">
        <div>
          <h4></h4>
          <small>Plano mensal</small>
        </div>
        <span class="valor-plano"></span>
      </div>

      <div class="dados-plano">
        <span><strong>Serviço:</strong> <span class="plano-servico"></span></span>
        <span><strong>Limite por mês:</strong> <span class="plano-limite"></span></span>
      </div>

      <div class="clientes-resumo-plano"></div>
      <div class="janela-clientes-card-plano"></div>
      <div class="acoes-plano"></div>
    `;

    cartao.querySelector("h4").textContent = plano.nome || "Plano";
    cartao.querySelector(".valor-plano").textContent =
      formatarValorEmReal(plano.valor);
    cartao.querySelector(".plano-servico").textContent =
      plano.servicoNome || "Serviço não definido";
    cartao.querySelector(".plano-limite").textContent =
      `${limite} uso(s)`;
    cartao.querySelector(".clientes-resumo-plano").textContent =
      `Clientes do plano (${clientesVinculados.length})`;

    const janelaClientes = cartao.querySelector(
      ".janela-clientes-card-plano"
    );

    if (clientesVinculados.length === 0) {
      janelaClientes.innerHTML = `
        <div class="cliente-card-plano vazio">
          Nenhum cliente adicionado.
        </div>
      `;
    } else {
      clientesVinculados.forEach((cliente) => {
        const ciclo = cicloIndividualDoCliente(plano, cliente.id);
        const usos = usosDoClienteNoCicloIndividual(plano, cliente.id);
        const cicloPago = cicloDoClienteEstaPago(ciclo);

        const itemCliente = document.createElement("div");
        itemCliente.className = "cliente-card-plano";
        if (cicloPago) itemCliente.classList.add("pago");
        else if (ciclo) itemCliente.classList.add("pendente");

        const informacoesCliente = document.createElement("div");
        informacoesCliente.className = "informacoes-cliente-plano";

        const nomeCliente = document.createElement("strong");
        nomeCliente.textContent = cliente.nome;
        nomeCliente.title = cliente.nome;

        const statusPagamento = document.createElement("span");
        statusPagamento.className = "status-pagamento-plano";
        if (cicloPago) {
          statusPagamento.classList.add("pago");
          statusPagamento.textContent = "Plano pago";
        } else if (ciclo) {
          statusPagamento.classList.add("pendente");
          statusPagamento.textContent = "Plano não pago";
        } else {
          statusPagamento.classList.add("futuro");
          statusPagamento.textContent = "Plano ainda não iniciado";
        }

        informacoesCliente.append(nomeCliente, statusPagamento);

        const contador = document.createElement("span");
        contador.className = "contador-usos-plano";
        contador.textContent = `${usos}/${limite}`;
        contador.title = ciclo
          ? `Ciclo: ${ciclo.inicio.split("-").reverse().join("/")} a ${ciclo.fim.split("-").reverse().join("/")} — ${cicloPago ? "pago" : "pagamento pendente"}`
          : "O ciclo deste cliente ainda não começou";

        itemCliente.append(informacoesCliente, contador);

        if (usuarioPodeGerenciarPlanos()) {
          const botaoRemoverCliente = document.createElement("button");
          botaoRemoverCliente.type = "button";
          botaoRemoverCliente.className = "remover-cliente-plano";
          botaoRemoverCliente.textContent = "Apagar";
          botaoRemoverCliente.title = `Remover ${cliente.nome} deste plano`;
          botaoRemoverCliente.addEventListener("click", async () => {
            if (!confirm(`Remover "${cliente.nome}" do plano "${plano.nome}"?`)) {
              return;
            }

            const clientesIdsAtualizados = clientesIds.filter(
              (clienteId) => clienteId !== cliente.id
            );
            const vinculosAtualizados = vinculosDoPlano(plano).filter(
              (vinculo) => vinculo.clienteId !== cliente.id
            );

            try {
              await updateDoc(doc(db, "planos", plano.id), {
                clientesIds: clientesIdsAtualizados,
                clientesPlano: vinculosAtualizados,
                atualizadoEm: Date.now()
              });
              await carregarPlanos();
              mostrarListaDePlanos();
            } catch (erro) {
              console.log("Erro ao remover cliente do plano:", erro);
              mensagemPlano.textContent = "Não foi possível remover o cliente do plano.";
            }
          });
          itemCliente.appendChild(botaoRemoverCliente);
        }

        janelaClientes.appendChild(itemCliente);
      });
    }

    const acoes = cartao.querySelector(".acoes-plano");

    const botaoAdicionarCliente = document.createElement("button");
    botaoAdicionarCliente.type = "button";
    botaoAdicionarCliente.className = "botao-principal";
    botaoAdicionarCliente.textContent = "Adicionar cliente";
    botaoAdicionarCliente.addEventListener("click", () =>
      abrirClientesDoPlano(plano)
    );
    acoes.appendChild(botaoAdicionarCliente);

    if (usuarioPodeGerenciarPlanos()) {
      const botaoEditar = document.createElement("button");
      botaoEditar.type = "button";
      botaoEditar.className = "botao-secundario";
      botaoEditar.textContent = "Editar";
      botaoEditar.addEventListener("click", () => {
        planoIdEdicao.value = plano.id;
        nomeNovoPlano.value = plano.nome || "";
        valorNovoPlano.value = formatarValorEmReal(plano.valor || 0);
        usosNovoPlano.value = Number(plano.usosMensais) || 1;
        preencherServicosDoPlano(plano.servicoId || "");
        formCadastroPlano.classList.remove("escondida");
        formCadastroPlano.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      acoes.appendChild(botaoEditar);

      const botaoExcluir = document.createElement("button");
      botaoExcluir.type = "button";
      botaoExcluir.className = "botao-perigo";
      botaoExcluir.textContent = "Excluir";
      botaoExcluir.addEventListener("click", async () => {
        if (!confirm(`Excluir o plano "${plano.nome}"? O histórico de usos será mantido.`)) {
          return;
        }

        try {
          await deleteDoc(doc(db, "planos", plano.id));
          await carregarPlanos();
          mostrarListaDePlanos();
        } catch (erro) {
          console.log("Erro ao excluir plano:", erro);
          mensagemPlano.textContent = "Não foi possível excluir o plano.";
        }
      });
      acoes.appendChild(botaoExcluir);
    }

    listaPlanos.appendChild(cartao);
  });
}

async function abrirTelaPlanos() {
  esconderTodasAsTelas();
  telaPlanos.classList.remove("escondida");
  marcarBotaoAtivo("Planos");

  mensagemPlano.textContent = "";
  pesquisaPlano.value = "";
  formCadastroPlano.classList.add("escondida");

  const podeGerenciar = usuarioPodeGerenciarPlanos();
  botaoMostrarCadastroPlano.style.display = podeGerenciar ? "" : "none";

  try {
    await Promise.all([
      carregarPlanos(),
      carregarClientes(),
      carregarServicos(),
      carregarUsosPlanos()
    ]);

    preencherServicosDoPlano();
    mostrarListaDePlanos();
  } catch (erro) {
    console.log("Erro ao carregar planos:", erro);
    mensagemPlano.textContent = "Não foi possível carregar os planos.";
  }
}

async function abrirClientesDoPlano(plano) {
  planoSelecionadoParaClientes = plano;
  mensagemClientesPlano.textContent = "";
  tituloClientesPlano.textContent = "Adicionar cliente";
  resumoClientesPlano.textContent =
    `${plano.nome || "Plano"} • ${plano.servicoNome || "Serviço"} • ${Number(plano.usosMensais) || 0} uso(s) por mês`;
  formVinculoClientePlano?.classList.add("escondida");
  listaClientesDisponiveisPlano?.classList.remove("escondida");
  formVinculoClientePlano?.reset();

  try {
    await carregarClientes();
  } catch (erro) {
    console.log("Erro ao carregar clientes:", erro);
    mensagemClientesPlano.textContent =
      "Não foi possível carregar os clientes.";
  }

  mostrarClientesDisponiveisParaPlano();
  modalClientesPlano.classList.remove("escondido");
}

function mostrarClientesDisponiveisParaPlano() {
  if (!planoSelecionadoParaClientes || !listaClientesDisponiveisPlano) {
    return;
  }

  const clientesIdsLegados = Array.isArray(
    planoSelecionadoParaClientes.clientesIds
  )
    ? planoSelecionadoParaClientes.clientesIds
    : [];
  const clientesIds = [...new Set([
    ...clientesIdsLegados,
    ...vinculosDoPlano(planoSelecionadoParaClientes)
      .filter((vinculo) => vinculo.ativo !== false)
      .map((vinculo) => vinculo.clienteId)
  ])];

  const disponiveis = clientes
    .filter((cliente) => !clientesIds.includes(cliente.id))
    .sort((a, b) =>
      String(a.nome || "").localeCompare(
        String(b.nome || ""),
        "pt-BR"
      )
    );

  listaClientesDisponiveisPlano.innerHTML = "";

  if (disponiveis.length === 0) {
    listaClientesDisponiveisPlano.innerHTML = `
      <p class="lista-vazia">
        Todos os clientes cadastrados já estão neste plano.
      </p>
    `;
    return;
  }

  disponiveis.forEach((cliente) => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "cliente-disponivel-plano";

    const nome = document.createElement("strong");
    nome.textContent = cliente.nome;

    const acao = document.createElement("span");
    acao.textContent = "Adicionar";

    botao.append(nome, acao);

    botao.addEventListener("click", async () => {
      if (!usuarioPodeGerenciarPlanos()) {
        mensagemClientesPlano.textContent =
          "Você não tem permissão para alterar planos.";
        return;
      }

      const hoje = formatarDataParaSalvar(new Date());
      clienteIdVinculoPlano.value = cliente.id;
      nomeClienteVinculoPlano.textContent = cliente.nome;
      pagamentoVinculoPlano.value = "";
      valorVinculoPlano.value = formatarValorEmReal(planoSelecionadoParaClientes.valor || 0);
      dataInicioCicloPlano.value = hoje;
      campoDataInicioCicloPlano.classList.add("escondida");
      formVinculoClientePlano.querySelector('input[name="inicio-ciclo-plano"][value="hoje"]').checked = true;
      listaClientesDisponiveisPlano.classList.add("escondida");
      formVinculoClientePlano.classList.remove("escondida");
    });

    listaClientesDisponiveisPlano.appendChild(botao);
  });
}

document.querySelectorAll('input[name="inicio-ciclo-plano"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    const escolherData = radio.checked && radio.value === "data";
    campoDataInicioCicloPlano.classList.toggle("escondida", !escolherData);
    dataInicioCicloPlano.required = escolherData;
  });
});

cancelarVinculoClientePlano?.addEventListener("click", () => {
  formVinculoClientePlano.classList.add("escondida");
  listaClientesDisponiveisPlano.classList.remove("escondida");
  mensagemClientesPlano.textContent = "";
});

valorVinculoPlano?.addEventListener("input", () => {
  formatarCampoValor(valorVinculoPlano);
});

formVinculoClientePlano?.addEventListener("submit", async (event) => {
  event.preventDefault();
  mensagemClientesPlano.textContent = "";

  if (!usuarioPodeGerenciarPlanos() || !planoSelecionadoParaClientes) {
    mensagemClientesPlano.textContent = "Você não tem permissão para alterar planos.";
    return;
  }

  const clienteId = clienteIdVinculoPlano.value;
  const cliente = clientes.find((item) => item.id === clienteId);
  const formaPagamento = pagamentoVinculoPlano.value;
  const valorPlano = converterValorParaNumero(valorVinculoPlano.value);
  const modoInicio = formVinculoClientePlano.querySelector(
    'input[name="inicio-ciclo-plano"]:checked'
  )?.value;
  const inicioCiclo = modoInicio === "data"
    ? dataInicioCicloPlano.value
    : formatarDataParaSalvar(new Date());

  if (!cliente || !["Dinheiro", "Pix", "Cartão"].includes(formaPagamento)
    || valorPlano <= 0 || !inicioCiclo) {
    mensagemClientesPlano.textContent = "Preencha a forma de pagamento, o valor e o início do ciclo.";
    return;
  }

  const atuaisIds = Array.isArray(planoSelecionadoParaClientes.clientesIds)
    ? planoSelecionadoParaClientes.clientesIds
    : [];
  const vinculosAtuais = vinculosDoPlano(planoSelecionadoParaClientes)
    .filter((vinculo) => vinculo.clienteId !== clienteId);
  const novoVinculo = {
    clienteId,
    clienteNome: cliente.nome,
    formaPagamento,
    valorPlano,
    inicioCiclo,
    ciclosPagos: [inicioCiclo],
    ativo: true,
    registradoEm: Date.now(),
    registradoPor: nomeUsuario
  };

  try {
    await updateDoc(doc(db, "planos", planoSelecionadoParaClientes.id), {
      clientesIds: [...new Set([...atuaisIds, clienteId])],
      clientesPlano: [...vinculosAtuais, novoVinculo],
      atualizadoEm: Date.now()
    });

    const agora = new Date();
    const dataPagamento = formatarDataParaSalvar(agora);
    const horaPagamento = `${String(agora.getHours()).padStart(2, "0")}:${String(agora.getMinutes()).padStart(2, "0")}`;
    const idMovimentacao = `assinatura_plano_${planoSelecionadoParaClientes.id}_${clienteId}_${inicioCiclo}`;

    await setDoc(doc(db, "movimentacoesFinanceiras", idMovimentacao), {
      tipo: "entrada",
      origem: "plano",
      categoria: "plano",
      descricao: `Assinatura do plano ${planoSelecionadoParaClientes.nome}`,
      valor: valorPlano,
      data: dataPagamento,
      hora: horaPagamento,
      formaPagamento,
      planoId: planoSelecionadoParaClientes.id,
      planoNome: planoSelecionadoParaClientes.nome,
      cliente: cliente.nome,
      clienteId,
      inicioCiclo,
      criadoPor: nomeUsuario,
      usuarioId,
      dataCadastro: Date.now()
    });

    mensagemClientesPlano.textContent = `${cliente.nome} foi adicionado ao plano.`;
    await carregarPlanos();
    planoSelecionadoParaClientes = planos.find(
      (item) => item.id === planoSelecionadoParaClientes.id
    ) || planoSelecionadoParaClientes;
    mostrarListaDePlanos();
    formVinculoClientePlano.classList.add("escondida");
    listaClientesDisponiveisPlano.classList.remove("escondida");
    mostrarClientesDisponiveisParaPlano();
  } catch (erro) {
    console.log("Erro ao adicionar cliente ao plano:", erro);
    mensagemClientesPlano.textContent = "Não foi possível adicionar o cliente.";
  }
});

/* =========================================================
   TEMA
========================================================= */

function aplicarTema(tema) {
  const temaClaro =
    tema === "claro";

  document.body.classList.toggle(
    "tema-claro",
    temaClaro
  );

  opcoesTema.forEach(
    (opcao) => {
      opcao.checked =
        opcao.value ===
        (
          temaClaro
            ? "claro"
            : "escuro"
        );
    }
  );
}

/* =========================================================
   CONFIGURAÇÕES
========================================================= */

async function abrirTelaConfiguracoes() {
  esconderTodasAsTelas();

  telaConfiguracoes.classList.remove(
    "escondida"
  );

  configuracaoSenha.classList.remove(
    "escondida"
  );

  mensagemTema.textContent = "";
  mensagemSenha.textContent = "";

  formAlterarSenha.reset();
  configuracaoApagarDados?.classList.toggle(
    "escondida",
    tipoUsuario !== "administrador"
  );
  if (confirmacaoApagarDados) confirmacaoApagarDados.value = "";
  if (senhaAdministradorApagarDados) senhaAdministradorApagarDados.value = "";
  if (mensagemApagarDados) mensagemApagarDados.textContent = "";

  if (
    tipoUsuario ===
    "administrador"
  ) {
    descricaoConfiguracaoSenha.textContent =
      "Altere a senha do administrador, da recepcionista ou de qualquer barbeiro cadastrado.";

    await carregarBarbeiros();

    preencherUsuariosParaAlterarSenha();
  } else if (
    tipoUsuario ===
    "recepcionista"
  ) {
    descricaoConfiguracaoSenha.textContent =
      "Altere somente a senha da recepcionista.";

    preencherUsuarioAtualParaAlterarSenha();
  } else {
    descricaoConfiguracaoSenha.textContent =
      "Altere somente a senha do seu usuário.";

    preencherUsuarioAtualParaAlterarSenha();
  }

  marcarBotaoAtivo(
    "Configurações"
  );
}

/* =========================================================
   MENU
========================================================= */

function montarMenu() {
  menu.innerHTML = "";

  const botoesAdministrador = [
    "Dashboard",
    "Clientes cadastrados",
    "Produtos e Serviços",
    "Planos",
    "Relatório",
    "Barbeiros",
    "Configurações",
    "Sair"
  ];

  const botoesRecepcionista = [
    "Dashboard",
    "Clientes cadastrados",
    "Produtos e Serviços",
    "Planos",
    "Relatório",
    "Barbeiros",
    "Configurações",
    "Sair"
  ];

  const botoesBarbeiro = [
    "Dashboard",
    "Clientes cadastrados",
    "Produtos e Serviços",
    "Planos",
    "Relatório",
    "Configurações",
    "Sair"
  ];

  let botoes =
    botoesBarbeiro;

  if (
    tipoUsuario ===
    "administrador"
  ) {
    botoes =
      botoesAdministrador;
  } else if (
    tipoUsuario ===
    "recepcionista"
  ) {
    botoes =
      botoesRecepcionista;
  }

  botoes.forEach(
    (nomeBotao) => {
      const botao =
        document.createElement(
          "button"
        );

      botao.type = "button";
      botao.className =
        "botao-menu";

      botao.textContent =
        nomeBotao;

      if (
        nomeBotao ===
        "Dashboard"
      ) {
        botao.classList.add(
          "ativo"
        );
      }

      botao.addEventListener(
        "click",
        async () => {
          if (
            nomeBotao ===
            "Dashboard"
          ) {
            abrirTelaDashboard();
            return;
          }

          if (
            nomeBotao ===
            "Clientes cadastrados"
          ) {
            await abrirTelaClientes();
            return;
          }

          if (
            nomeBotao ===
            "Produtos e Serviços"
          ) {
            await abrirTelaProdutosServicos();
            return;
          }

          if (
            nomeBotao ===
            "Planos"
          ) {
            await abrirTelaPlanos();
            return;
          }

          if (
            nomeBotao ===
            "Relatório"
          ) {
            await abrirTelaRelatorio();
            return;
          }

          if (
            nomeBotao ===
            "Barbeiros"
          ) {
            await abrirTelaBarbeiros();
            return;
          }

          if (
            nomeBotao ===
            "Configurações"
          ) {
            await abrirTelaConfiguracoes();
            return;
          }

          if (
            nomeBotao ===
            "Sair"
          ) {
            if (modalSair) {
              modalSair.classList.remove(
                "escondido"
              );
            } else {
              sessionStorage.clear();

              window.location.href =
                "index.html";
            }
          }
        }
      );

      menu.appendChild(
        botao
      );
    }
  );
}

/* =========================================================
   CARREGAR DADOS
========================================================= */

async function carregarBarbeiros() {
  const resposta =
    await getDocs(
      collection(
        db,
        "barbeiros"
      )
    );

  barbeiros =
    resposta.docs
      .map(
        (documento) => ({
          id: documento.id,
          ...documento.data()
        })
      )
      .filter(
        (barbeiro) =>
          barbeiro.ativo !== false
      )
      .sort(
        (a, b) =>
          a.nome.localeCompare(
            b.nome,
            "pt-BR"
          )
      );
}

async function carregarClientes() {
  const resposta =
    await getDocs(
      collection(
        db,
        "clientes"
      )
    );

  clientes =
    resposta.docs
      .map(
        (documento) => ({
          id: documento.id,
          ...documento.data()
        })
      )
      .sort(
        (a, b) =>
          a.nome.localeCompare(
            b.nome,
            "pt-BR"
          )
      );
}

async function carregarProdutos() {
  const resposta =
    await getDocs(
      collection(
        db,
        "produtos"
      )
    );

  produtos =
    resposta.docs
      .map(
        (documento) => ({
          id: documento.id,
          ...documento.data()
        })
      )
      .sort(
        (a, b) =>
          a.nome.localeCompare(
            b.nome,
            "pt-BR"
          )
      );
}

async function carregarServicos() {
  const resposta =
    await getDocs(
      collection(
        db,
        "servicos"
      )
    );

  servicos =
    resposta.docs
      .map(
        (documento) => ({
          id: documento.id,
          ...documento.data()
        })
      )
      .sort(
        (a, b) =>
          a.nome.localeCompare(
            b.nome,
            "pt-BR"
          )
      );
}

/* =========================================================
   SELECT BARBEIROS
========================================================= */

function preencherSelectDeBarbeiros() {
  selectBarbeiro.innerHTML = `
    <option value="">
      Escolha um barbeiro
    </option>
  `;

  barbeiros.forEach(
    (barbeiro) => {
      const opcao =
        document.createElement(
          "option"
        );

      opcao.value =
        barbeiro.nome;

      opcao.textContent =
        barbeiro.nome;

      selectBarbeiro.appendChild(
        opcao
      );
    }
  );

  if (barbeiroAtual) {
    selectBarbeiro.value =
      barbeiroAtual;
  }
}

/* =========================================================
   SENHAS
========================================================= */

function preencherUsuariosParaAlterarSenha() {
  usuarioAlterarSenha.disabled =
    false;

  usuarioAlterarSenha.innerHTML = `
    <option value="">
      Selecione um usuário
    </option>

    <option value="administrador">
      Administrador
    </option>

    <option value="recepcionista">
      Recepcionista
    </option>
  `;

  barbeiros.forEach(
    (barbeiro) => {
      const opcao =
        document.createElement(
          "option"
        );

      opcao.value =
        barbeiro.id;

      opcao.textContent =
        barbeiro.nome;

      usuarioAlterarSenha.appendChild(
        opcao
      );
    }
  );
}

function preencherUsuarioAtualParaAlterarSenha() {
  usuarioAlterarSenha.innerHTML =
    "";

  const opcao =
    document.createElement(
      "option"
    );

  opcao.value =
    usuarioId;

  opcao.textContent =
    nomeUsuario;

  usuarioAlterarSenha.appendChild(
    opcao
  );

  usuarioAlterarSenha.value =
    usuarioId;

  usuarioAlterarSenha.disabled =
    true;
}

/* =========================================================
   CLIENTES NO AGENDAMENTO
========================================================= */

function mostrarClientesNoAgendamento() {
  const pesquisa =
    pesquisaClienteAgendamento.value
      .trim()
      .toLowerCase();

  const clientesFiltrados =
    clientes.filter(
      (cliente) =>
        cliente.nome
          .toLowerCase()
          .includes(pesquisa)
    );

  listaClientesAgendamento.innerHTML =
    "";

  if (
    clientesFiltrados.length === 0
  ) {
    listaClientesAgendamento.innerHTML = `
      <p class="cliente-nao-encontrado">
        Nenhum cliente encontrado.
      </p>
    `;

    return;
  }

  clientesFiltrados.forEach(
    (cliente) => {
      const botao =
        document.createElement(
          "button"
        );

      botao.type = "button";

      botao.className =
        "opcao-cliente-agendamento";

      botao.textContent =
        cliente.nome;

      if (
        clienteSelecionado &&
        clienteSelecionado.id ===
          cliente.id
      ) {
        botao.classList.add(
          "selecionado"
        );
      }

      botao.addEventListener(
        "click",
        () => {
          clienteSelecionado =
            cliente;

          pesquisaClienteAgendamento.value =
            cliente.nome;

          mostrarClientesNoAgendamento();
        }
      );

      listaClientesAgendamento.appendChild(
        botao
      );
    }
  );
}

/* =========================================================
   AGENDAMENTOS
========================================================= */

async function carregarAgendamentos() {
  if (!barbeiroAtual) {
    agendamentos = [];
    return;
  }

  const [resposta, respostaMovimentacoes] = await Promise.all([
    getDocs(collection(db, "agendamentos")),
    getDocs(collection(db, "movimentacoesFinanceiras"))
  ]);

  agendamentos =
    resposta.docs
      .map(
        (documento) => ({
          id: documento.id,
          ...documento.data()
        })
      )
      .filter(
        (agendamento) =>
          agendamento.barbeiro ===
            barbeiroAtual &&
          agendamento.status !==
            "cancelado"
      );
}

function encontrarAgendamentos(
  data,
  hora
 ) {
  return agendamentos.filter(
    (agendamento) =>
      agendamento.data === data &&
      agendamento.hora === hora
  );
}

function mostrarProximosAgendamentos() {
  listaProximosAgendamentos.innerHTML =
    "";

  if (!barbeiroAtual) {
    quantidadeProximosAgendamentos.textContent =
      "0 horários";

    listaProximosAgendamentos.innerHTML = `
      <p class="lista-agendamentos-vazia">
        Escolha um barbeiro para visualizar os horários marcados.
      </p>
    `;

    return;
  }

  const proximosAgendamentos =
    agendamentos
      .filter(
        (agendamento) =>
          agendamento.status !==
            "cancelado" &&
          agendamento.status !==
            "concluido" &&
          agendamento.status !==
            "nao_realizado"
      )
      .sort(
        (a, b) =>
          criarDataHora(
            a.data,
            a.hora
          ) -
          criarDataHora(
            b.data,
            b.hora
          )
      );

  quantidadeProximosAgendamentos.textContent =
    proximosAgendamentos.length === 1
      ? "1 horário"
      : `${proximosAgendamentos.length} horários`;

  if (
    proximosAgendamentos.length === 0
  ) {
    listaProximosAgendamentos.innerHTML = `
      <p class="lista-agendamentos-vazia">
        Nenhum horário marcado para ${barbeiroAtual}.
      </p>
    `;

    return;
  }

  proximosAgendamentos.forEach(
    (agendamento) => {
      const botao =
        document.createElement(
          "button"
        );

      botao.type = "button";

      botao.className =
        "item-proximo-agendamento";

      const data =
        dataPorTexto(
          agendamento.data
        );

      const dataFormatada =
        data.toLocaleDateString(
          "pt-BR"
        );

      const diaDaSemana =
        data.toLocaleDateString(
          "pt-BR",
          {
            weekday: "long"
          }
        );

      botao.innerHTML = `
        <div class="data-proximo-agendamento">
          ${dataFormatada}
        </div>

        <div class="hora-proximo-agendamento">
          ${agendamento.hora}
        </div>

        <div class="cliente-proximo-agendamento">
          <strong>
            ${agendamento.cliente}
          </strong>

          <small>
            ${diaDaSemana}
          </small>
        </div>

        <div class="servico-proximo-agendamento">
          <strong>
            ${
              agendamento.servico ||
              agendamento.tipo ||
              "Horário marcado"
            }
          </strong>

          <small>
            ${agendamento.barbeiro}
          </small>
        </div>
      `;

      botao.addEventListener(
        "click",
        () => {
          abrirDetalhes(
            agendamento
          );
        }
      );

      listaProximosAgendamentos.appendChild(
        botao
      );
    }
  );
}

function mostrarAgenda() {
  const grade =
    document.createElement(
      "div"
    );

  grade.className =
    "grade-agenda";


  /* =========================================
     TAMANHOS DA GRADE
  ========================================= */

  const larguraHorario =
    Math.round(
      82 * zoomAgenda
    );

  const larguraColuna =
    Math.round(
      155 * zoomAgenda
    );

  const alturaCabecalho =
    Math.round(
      50 * zoomAgenda
    );

  const alturaLinha =
    Math.round(
      74 * zoomAgenda
    );

  const tamanhoTexto =
    Math.round(
      13 * zoomAgenda
    );


  grade.style.gridTemplateColumns =
    `${larguraHorario}px repeat(${dias.length}, ${larguraColuna}px)`;


  grade.style.setProperty(
    "--largura-coluna",
    `${larguraColuna}px`
  );

  grade.style.setProperty(
    "--altura-cabecalho",
    `${alturaCabecalho}px`
  );

  grade.style.setProperty(
    "--altura-linha",
    `${alturaLinha}px`
  );

  grade.style.setProperty(
    "--tamanho-texto",
    `${tamanhoTexto}px`
  );


  /* =========================================
     CANTO SUPERIOR
  ========================================= */

  const canto =
    document.createElement(
      "div"
    );

  canto.className =
    "canto-horario";

  grade.appendChild(
    canto
  );


  /* =========================================
     CABEÇALHO DOS DIAS
  ========================================= */

  dias.forEach(
    (dia) => {

      const cabecalho =
        document.createElement(
          "div"
        );

      cabecalho.className =
        "dia-cabecalho";

      cabecalho.textContent =
        formatarDataParaMostrar(
          dia
        );

      grade.appendChild(
        cabecalho
      );
    }
  );


  /* =========================================
     HORÁRIOS
  ========================================= */

  horarios.forEach(
    (hora) => {

      const horario =
        document.createElement(
          "div"
        );

      horario.className =
        "horario";

      horario.textContent =
        hora;

      grade.appendChild(
        horario
      );


      /* =========================================
         DIAS DE CADA HORÁRIO
      ========================================= */

      dias.forEach(
        (dia) => {

          const data =
            formatarDataParaSalvar(
              dia
            );


          /*
            Aqui pegamos TODOS os clientes
            daquele mesmo horário.
          */

          const agendamentosHorario =
            encontrarAgendamentos(
              data,
              hora
            );


          const celula =
            document.createElement(
              "div"
            );

          celula.className =
            "celula-horario";


          /* =========================================
             HORÁRIO VAZIO
          ========================================= */

          if (
            agendamentosHorario.length ===
            0
          ) {

            /*
              Horário vazio continua funcionando
              como antes.

              Clicou na célula = novo agendamento.
            */

            celula.addEventListener(
              "click",
              async () => {

                if (!barbeiroAtual) {

                  alert(
                    "Escolha um barbeiro antes de criar um agendamento."
                  );

                  return;
                }

                await abrirNovoAgendamento(
                  data,
                  hora
                );
              }
            );

          } else {

            /* =========================================
               HORÁRIO COM CLIENTES
            ========================================= */

            celula.classList.add(
              "ocupado"
            );


            const containerClientes =
              document.createElement(
                "div"
              );

            containerClientes.className =
              "clientes-mesmo-horario";


            /* =========================================
               MOSTRAR TODOS OS CLIENTES
            ========================================= */

            agendamentosHorario.forEach(
              (agendamento) => {

                const item =
                  document.createElement(
                    "button"
                  );

                item.type =
                  "button";

                item.className =
                  "cliente-horario-agenda";


                /* ===============================
                   STATUS
                =============================== */

                if (
                  agendamento.status ===
                  "concluido"
                ) {

                  item.classList.add(
                    "concluido"
                  );
                }


                if (
                  agendamento.status ===
                    "cancelado" ||
                  agendamento.status ===
                    "nao_realizado"
                ) {

                  item.classList.add(
                    "nao-realizado"
                  );
                }


                /* ===============================
                   NOME
                =============================== */

                const nome =
                  document.createElement(
                    "span"
                  );

                nome.className =
                  "nome-agendamento";

                nome.textContent =
                  agendamento.cliente;


                /* ===============================
                   TIPO / SERVIÇO
                =============================== */

                const tipo =
                  document.createElement(
                    "span"
                  );

                tipo.className =
                  "tipo-agendamento-grade";

                tipo.textContent =
                  agendamento.servico ||
                  agendamento.tipo ||
                  "Horário marcado";


                item.appendChild(
                  nome
                );

                item.appendChild(
                  tipo
                );


                /* ===============================
                   ABRIR CLIENTE
                =============================== */

                item.addEventListener(
                  "click",
                  (event) => {

                    event.stopPropagation();

                    abrirDetalhes(
                      agendamento
                    );
                  }
                );


                containerClientes.appendChild(
                  item
                );
              }
            );


            celula.appendChild(
              containerClientes
            );


            /* =========================================
               BOTÃO + NOVO CLIENTE
            ========================================= */

            const botaoAdicionar =
              document.createElement(
                "button"
              );

            botaoAdicionar.type =
              "button";

            botaoAdicionar.className =
              "botao-adicionar-cliente-horario";

            botaoAdicionar.textContent =
              "+";

            botaoAdicionar.title =
              "Adicionar outro cliente neste horário";


            botaoAdicionar.addEventListener(
              "click",
              async (event) => {

                event.stopPropagation();

                if (!barbeiroAtual) {

                  alert(
                    "Escolha um barbeiro antes de criar um agendamento."
                  );

                  return;
                }


                await abrirNovoAgendamento(
                  data,
                  hora
                );
              }
            );


            /*
              IMPORTANTE:
              agora o botão é colocado aqui,
              dentro do mesmo bloco em que
              ele foi criado.
            */

            celula.appendChild(
              botaoAdicionar
            );
          }


          grade.appendChild(
            celula
          );
        }
      );
    }
  );


  /* =========================================
     MOSTRAR GRADE
  ========================================= */

  agenda.innerHTML =
    "";

  agenda.appendChild(
    grade
  );


  mostrarProximosAgendamentos();
}

async function abrirNovoAgendamento(
  data,
  hora
) {
  await carregarClientes();

  if (
    clientes.length === 0
  ) {
    alert(
      "Cadastre um cliente antes de criar um agendamento."
    );

    return;
  }

  clienteSelecionado = null;

  pesquisaClienteAgendamento.value =
    "";

  const horarioMarcado =
    document.querySelector(
      'input[name="tipo-agendamento"][value="Horário marcado"]'
    );

  if (horarioMarcado) {
    horarioMarcado.checked =
      true;
  }

  mostrarClientesNoAgendamento();

  dataAgendamento.value =
    data;

  horaAgendamento.value =
    hora;

  const dataFormatada =
    dataPorTexto(
      data
    ).toLocaleDateString(
      "pt-BR"
    );

  informacaoHorario.textContent =
    `${dataFormatada} às ${hora}`;

  modalNovo.classList.remove(
    "escondido"
  );
}

function abrirDetalhes(
  agendamento
) {
  agendamentoSelecionado =
    agendamento;

  detalheCliente.textContent =
    agendamento.cliente;

  detalheData.textContent =
    dataPorTexto(
      agendamento.data
    ).toLocaleDateString(
      "pt-BR"
    );

  detalheHora.textContent =
    agendamento.hora;

  modalDetalhes.classList.remove(
    "escondido"
  );
}

function fecharModal(
  idModal
) {
  const modal =
    document.querySelector(
      `#${idModal}`
    );

  if (modal) {
    modal.classList.add(
      "escondido"
    );
  }
}

async function atualizarAgenda() {
  await carregarAgendamentos();

  mostrarAgenda();
}

/* =========================================================
   SALVAR AGENDAMENTO
========================================================= */

formAgendamento.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    if (!barbeiroAtual) {
      alert(
        "Escolha um barbeiro antes de salvar o agendamento."
      );

      return;
    }

    if (!clienteSelecionado) {
      alert(
        "Escolha um cliente."
      );

      return;
    }

    const tipoEscolhido =
      document.querySelector(
        'input[name="tipo-agendamento"]:checked'
      );

    if (!tipoEscolhido) {
      alert(
        "Escolha o tipo do atendimento."
      );

      return;
    }

    try {
      await addDoc(
        collection(
          db,
          "agendamentos"
        ),
        {
          barbeiro:
            barbeiroAtual,

          cliente:
            clienteSelecionado.nome,

          clienteId:
            clienteSelecionado.id,

          tipo:
            tipoEscolhido.value,

          status:
            "pendente",

          data:
            dataAgendamento.value,

          hora:
            horaAgendamento.value,

          dataCadastro:
            Date.now()
        }
      );

      fecharModal(
        "modal-novo"
      );

      await atualizarAgenda();
    } catch (erro) {
      console.log(
        "Erro ao salvar agendamento:",
        erro
      );

      alert(
        "Não foi possível salvar o agendamento."
      );
    }
  }
);

/* =========================================================
   CONCLUSÃO DO ATENDIMENTO
========================================================= */

async function obterClienteDoAgendamento() {
  await carregarClientes();

  if (agendamentoSelecionado?.clienteId) {
    const porId = clientes.find(
      (cliente) => cliente.id === agendamentoSelecionado.clienteId
    );

    if (porId) {
      return porId;
    }
  }

  return clientes.find(
    (cliente) =>
      String(cliente.nome || "").trim().toLowerCase() ===
      String(agendamentoSelecionado?.cliente || "").trim().toLowerCase()
  ) || null;
}

async function planosAtivosDoCliente(clienteId) {
  await Promise.all([
    carregarPlanos(),
    carregarUsosPlanos()
  ]);

  return planos.filter((plano) => {
    return plano.ativo !== false && Boolean(vinculoDoCliente(plano, clienteId));
  });
}

function criarBotaoModalPlano(texto, classe, acao) {
  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = classe;
  botao.textContent = texto;
  botao.addEventListener("click", acao);
  return botao;
}

async function iniciarConclusaoComPlano() {
  if (!agendamentoSelecionado) {
    return;
  }

  atendimentoPeloPlano = false;
  atendimentoPlanoComExtras = false;
  planoAtendimentoSelecionado = null;
  mensagemVerificarPlano.textContent = "";
  botoesVerificarPlano.innerHTML = "";

  try {
    const cliente = await obterClienteDoAgendamento();

    if (!cliente) {
      tituloVerificarPlano.textContent = "Plano do cliente";
      conteudoVerificarPlano.innerHTML = `
        <p>Não foi possível localizar este cliente no cadastro.</p>
      `;

      botoesVerificarPlano.appendChild(
        criarBotaoModalPlano(
          "Continuar normalmente",
          "botao-principal",
          async () => {
            fecharModal("modal-verificar-plano");
            await abrirConclusaoAtendimento(false);
          }
        )
      );

      fecharModal("modal-detalhes");
      modalVerificarPlano.classList.remove("escondido");
      return;
    }

    const planosCliente = await planosAtivosDoCliente(cliente.id);

    if (planosCliente.length === 0) {
      tituloVerificarPlano.textContent = "Cliente sem plano";
      conteudoVerificarPlano.innerHTML = `
        <p><strong>${cliente.nome}</strong> não possui plano ativo.</p>
        <p>O atendimento seguirá com a cobrança normal.</p>
      `;

      botoesVerificarPlano.appendChild(
        criarBotaoModalPlano(
          "Continuar",
          "botao-principal",
          async () => {
            fecharModal("modal-verificar-plano");
            await abrirConclusaoAtendimento(false);
          }
        )
      );
    } else {
      tituloVerificarPlano.textContent = "Cliente possui plano";

      const opcoes = planosCliente.map((plano) => {
        const ciclo = cicloIndividualDoCliente(
          plano,
          cliente.id,
          agendamentoSelecionado.data
        );
        const usados = usosDoClienteNoCicloIndividual(
          plano,
          cliente.id,
          agendamentoSelecionado.data
        );
        const limite = Number(plano.usosMensais) || 0;
        const restante = ciclo ? Math.max(0, limite - usados) : 0;

        return {
          plano,
          ciclo,
          usados,
          limite,
          restante
        };
      });

      const primeiroDisponivel = opcoes.find((item) => item.restante > 0)
        || opcoes[0];
      planoAtendimentoSelecionado = primeiroDisponivel.plano;

      const opcoesHtml = opcoes.map((item) => {
        const limiteTexto = item.restante > 0
          ? `${item.usados} de ${item.limite} usados`
          : `limite atingido (${item.usados}/${item.limite})`;

        return `<option value="${item.plano.id}">${item.plano.nome} — ${item.plano.servicoNome} — ${limiteTexto}</option>`;
      }).join("");

      conteudoVerificarPlano.innerHTML = `
        <p><strong>${cliente.nome}</strong> possui plano.</p>
        <p>Este atendimento foi realizado pelo plano?</p>
        <select id="plano-atendimento-escolha" class="seletor-plano-atendimento">
          ${opcoesHtml}
        </select>
        <p id="detalhe-plano-atendimento"></p>
      `;

      const selectPlano = conteudoVerificarPlano.querySelector(
        "#plano-atendimento-escolha"
      );
      const detalhe = conteudoVerificarPlano.querySelector(
        "#detalhe-plano-atendimento"
      );

      selectPlano.value = primeiroDisponivel.plano.id;

      const atualizarDetalhe = () => {
        const item = opcoes.find((opcao) => opcao.plano.id === selectPlano.value);
        if (!item) return;

        planoAtendimentoSelecionado = item.plano;
        detalhe.innerHTML = item.restante > 0
          ? `<strong>${item.plano.servicoNome}</strong> • restam ${item.restante} uso(s) no ciclo de ${item.ciclo.inicio.split("-").reverse().join("/")} a ${item.ciclo.fim.split("-").reverse().join("/")}.`
          : item.ciclo
            ? `<span class="aviso-limite-plano">O limite deste ciclo já foi atingido.</span>`
            : `<span class="aviso-limite-plano">O ciclo deste cliente ainda não começou.</span>`;
      };

      selectPlano.addEventListener("change", atualizarDetalhe);
      atualizarDetalhe();

      botoesVerificarPlano.append(
        criarBotaoModalPlano(
          "Não",
          "botao-secundario",
          async () => {
            atendimentoPeloPlano = false;
            planoAtendimentoSelecionado = null;
            fecharModal("modal-verificar-plano");
            await abrirConclusaoAtendimento(false);
          }
        ),
        criarBotaoModalPlano(
          "Sim, usar plano",
          "botao-principal",
          async () => {
            const item = opcoes.find(
              (opcao) => opcao.plano.id === selectPlano.value
            );

            if (!item || item.restante <= 0) {
              mensagemVerificarPlano.textContent =
                "O limite mensal deste plano já foi atingido.";
              return;
            }

            planoAtendimentoSelecionado = item.plano;
            atendimentoPeloPlano = true;
            fecharModal("modal-verificar-plano");

            textoExtrasPlano.textContent =
              `${item.plano.servicoNome} será contabilizado no plano ${item.plano.nome}.`;
            mensagemExtrasPlano.textContent = "";
            modalExtrasPlano.classList.remove("escondido");
          }
        )
      );
    }

    fecharModal("modal-detalhes");
    modalVerificarPlano.classList.remove("escondido");
  } catch (erro) {
    console.log("Erro ao verificar plano do cliente:", erro);
    alert("Não foi possível verificar o plano do cliente.");
  }
}

async function registrarUsoDoPlano(plano, agendamento, clienteId) {
  if (!plano || !agendamento || !clienteId) {
    throw new Error("Dados insuficientes para registrar o uso do plano.");
  }

  await carregarUsosPlanos();

  const ciclo = cicloIndividualDoCliente(plano, clienteId, agendamento.data);
  if (!ciclo) {
    throw new Error("CICLO_PLANO_NAO_INICIADO");
  }
  const usados = usosDoClienteNoCicloIndividual(plano, clienteId, agendamento.data);
  const limite = Number(plano.usosMensais) || 0;

  const usoJaRegistrado = usosPlanos.some(
    (uso) => uso.agendamentoId === agendamento.id && uso.cancelado !== true
  );

  if (usoJaRegistrado) {
    return;
  }

  if (usados >= limite) {
    throw new Error("LIMITE_PLANO_ATINGIDO");
  }

  await setDoc(
    doc(db, "usosPlanos", `uso_${agendamento.id}`),
    {
      planoId: plano.id,
      planoNome: plano.nome,
      clienteId,
      cliente: agendamento.cliente,
      agendamentoId: agendamento.id,
      servicoId: plano.servicoId,
      servico: plano.servicoNome,
      ciclo: ciclo.chave,
      cicloInicio: ciclo.inicio,
      cicloFim: ciclo.fim,
      data: agendamento.data,
      hora: agendamento.hora,
      barbeiro: agendamento.barbeiro,
      registradoPor: nomeUsuario,
      dataCadastro: Date.now()
    },
    { merge: true }
  );

  await carregarUsosPlanos();
}

async function finalizarAtendimentoSomentePlano() {
  if (!agendamentoSelecionado || !planoAtendimentoSelecionado) {
    return;
  }

  mensagemExtrasPlano.textContent = "";

  try {
    const cliente = await obterClienteDoAgendamento();

    if (!cliente) {
      mensagemExtrasPlano.textContent = "Cliente não localizado.";
      return;
    }

    const agendamentoAtual = { ...agendamentoSelecionado };
    const plano = planoAtendimentoSelecionado;

    await registrarUsoDoPlano(plano, agendamentoAtual, cliente.id);

    await updateDoc(
      doc(db, "agendamentos", agendamentoAtual.id),
      {
        status: "concluido",
        servicosIds: [plano.servicoId],
        servicos: [{
          id: plano.servicoId,
          nome: plano.servicoNome,
          valor: 0,
          valorOriginal: Number(
            servicos.find((servico) => servico.id === plano.servicoId)?.valor
          ) || 0,
          peloPlano: true
        }],
        servicoId: plano.servicoId,
        servico: plano.servicoNome,
        valorServico: 0,
        produtosIds: [],
        produtos: [],
        produtoId: "",
        produto: "",
        valorProduto: 0,
        valorTotal: 0,
        valorTotalBruto: 0,
        teveDesconto: false,
        valorDesconto: 0,
        valorLiquido: 0,
        formaPagamento: "Plano",
        atendimentoPeloPlano: true,
        planoId: plano.id,
        planoNome: plano.nome,
        servicoPlanoId: plano.servicoId,
        servicoPlano: plano.servicoNome,
        teveExtras: false,
        concluidoPor: nomeUsuario,
        tipoUsuarioConclusao: tipoUsuario,
        dataConclusao: Date.now()
      }
    );

    await deleteDoc(
      doc(db, "movimentacoesFinanceiras", `desconto_${agendamentoAtual.id}`)
    );

    fecharModal("modal-extras-plano");
    agendamentoSelecionado = null;
    planoAtendimentoSelecionado = null;
    atendimentoPeloPlano = false;
    atendimentoPlanoComExtras = false;

    await atualizarAgenda();
  } catch (erro) {
    console.log("Erro ao concluir atendimento pelo plano:", erro);
    mensagemExtrasPlano.textContent =
      erro?.message === "LIMITE_PLANO_ATINGIDO"
        ? "O limite mensal deste plano já foi atingido."
        : "Não foi possível concluir o atendimento pelo plano.";
  }
}

async function abrirConclusaoAtendimento(modoPlano = false) {
  if (!agendamentoSelecionado) {
    return;
  }

  mensagemConclusaoAtendimento.textContent = "";
  atendimentoPlanoComExtras = Boolean(modoPlano && planoAtendimentoSelecionado);

  if (tituloConclusaoAtendimento) {
    tituloConclusaoAtendimento.textContent = atendimentoPlanoComExtras
      ? "Extras do atendimento"
      : "Concluir atendimento";
  }

  if (descricaoConclusaoAtendimento) {
    descricaoConclusaoAtendimento.textContent = atendimentoPlanoComExtras
      ? `O serviço ${planoAtendimentoSelecionado?.servicoNome || "do plano"} já está incluído. Adicione somente produtos ou serviços extras.`
      : "Informe o serviço realizado, o produto vendido e a forma de pagamento.";
  }

  if (labelServicoAtendimento) {
    labelServicoAtendimento.textContent = atendimentoPlanoComExtras
      ? "Serviço extra"
      : "Serviço realizado";
  }

  try {
    await Promise.all([
      carregarProdutos(),
      carregarServicos()
    ]);
  } catch (erro) {
    console.log(erro);

    alert(
      "Não foi possível carregar os produtos e serviços."
    );

    return;
  }

  if (servicos.length === 0) {
    alert(
      "Cadastre pelo menos um serviço antes de concluir o atendimento."
    );

    return;
  }

  conclusaoCliente.textContent =
    agendamentoSelecionado.cliente;

  conclusaoBarbeiro.textContent =
    agendamentoSelecionado.barbeiro;

  const dataFormatada =
    dataPorTexto(
      agendamentoSelecionado.data
    ).toLocaleDateString(
      "pt-BR"
    );

  conclusaoDataHora.textContent =
    `${dataFormatada} às ${agendamentoSelecionado.hora}`;

  document
    .querySelectorAll("#container-servicos-atendimento .linha-selecao-atendimento")
    .forEach((linha, indice) => {
      if (indice > 0) linha.remove();
    });

  document
    .querySelectorAll("#container-produtos-atendimento .linha-selecao-atendimento")
    .forEach((linha, indice) => {
      if (indice > 0) linha.remove();
    });

  servicoAtendimento.innerHTML = atendimentoPlanoComExtras
    ? `<option value="">Nenhum serviço extra</option>`
    : `<option value="">Selecione o serviço</option>`;

  produtoAtendimento.innerHTML = `
    <option value="">Nenhum produto vendido</option>
  `;

  servicos.forEach(
    (servico) => {
      if (
        atendimentoPlanoComExtras &&
        servico.id === planoAtendimentoSelecionado?.servicoId
      ) {
        return;
      }
      const opcao =
        document.createElement(
          "option"
        );

      opcao.value =
        servico.id;

      opcao.textContent =
        `${servico.nome} — ${formatarValorEmReal(servico.valor)}`;

      servicoAtendimento.appendChild(
        opcao
      );
    }
  );

  if (produtos.length === 0) {
    const opcao =
      document.createElement(
        "option"
      );

    opcao.disabled = true;

    opcao.textContent =
      "Nenhum produto cadastrado";

    produtoAtendimento.appendChild(
      opcao
    );
  } else {
    produtos.forEach(
      (produto) => {
        const opcao =
          document.createElement(
            "option"
          );

        opcao.value =
          produto.id;

        opcao.textContent =
          `${produto.nome} — ${formatarValorEmReal(produto.valor)}`;

        produtoAtendimento.appendChild(
          opcao
        );
      }
    );
  }


  /* =========================================
     LIMPAR SELEÇÕES
  ========================================= */

  Array.from(
    servicoAtendimento.options
  ).forEach(
    (opcao) => {
      opcao.selected = false;
    }
  );

  Array.from(
    produtoAtendimento.options
  ).forEach(
    (opcao) => {
      opcao.selected = false;
    }
  );

  formaPagamentoAtendimento.value = "";


  /* =========================================
     DESCONTO
  ========================================= */

  if (teveDescontoAtendimento) {
    teveDescontoAtendimento.value =
      "nao";
  }

  if (valorDescontoAtendimento) {
    valorDescontoAtendimento.value =
      "";
  }

  if (areaDescontoAtendimento) {
    areaDescontoAtendimento.classList.add(
      "escondida"
    );
  }


  atualizarValoresConclusao();

  fecharModal(
    "modal-detalhes"
  );

  modalConcluirAtendimento.classList.remove(
    "escondido"
  );
}

function atualizarValoresConclusao() {

  /* =========================================
     PEGAR TODOS OS SERVIÇOS SELECIONADOS
  ========================================= */

  const selectsServicos =
    document.querySelectorAll(
      ".select-servico-atendimento"
    );

  const servicosSelecionados = [];

  selectsServicos.forEach(
    (select) => {

      if (!select.value) {
        return;
      }

      const servico =
        servicos.find(
          (item) =>
            item.id === select.value
        );

      if (servico) {
        servicosSelecionados.push(
          servico
        );
      }
    }
  );


  /* =========================================
     PEGAR TODOS OS PRODUTOS SELECIONADOS
  ========================================= */

  const selectsProdutos =
    document.querySelectorAll(
      ".select-produto-atendimento"
    );

  const produtosSelecionados = [];

  selectsProdutos.forEach(
    (select) => {

      if (!select.value) {
        return;
      }

      const produto =
        produtos.find(
          (item) =>
            item.id === select.value
        );

      if (produto) {
        produtosSelecionados.push(
          produto
        );
      }
    }
  );


  /* =========================================
     SOMAR SERVIÇOS
  ========================================= */

  const valorServico =
    servicosSelecionados.reduce(
      (total, servico) => {

        return (
          total +
          (
            Number(servico.valor) ||
            0
          )
        );
      },
      0
    );


  /* =========================================
     SOMAR PRODUTOS
  ========================================= */

  const valorProduto =
    produtosSelecionados.reduce(
      (total, produto) => {

        return (
          total +
          (
            Number(produto.valor) ||
            0
          )
        );
      },
      0
    );


  const valorBruto =
    valorServico +
    valorProduto;


  /* =========================================
     DESCONTO
  ========================================= */

  const temDesconto =
    teveDescontoAtendimento?.value ===
    "sim";

  let desconto = 0;

  if (
    temDesconto &&
    valorDescontoAtendimento
  ) {
    desconto =
      converterValorParaNumero(
        valorDescontoAtendimento.value
      );
  }

  if (desconto < 0) {
    desconto = 0;
  }


  const valorLiquido =
    Math.max(
      0,
      valorBruto - desconto
    );


  /* =========================================
     MOSTRAR VALORES
  ========================================= */

  valorServicoAtendimento.textContent =
    formatarValorEmReal(
      valorServico
    );

  valorProdutoAtendimento.textContent =
    formatarValorEmReal(
      valorProduto
    );

  valorTotalAtendimento.textContent =
    formatarValorEmReal(
      valorBruto
    );


  if (valorFinalAtendimento) {

    valorFinalAtendimento.textContent =
      formatarValorEmReal(
        valorLiquido
      );
  }
}

servicoAtendimento.addEventListener(
  "change",
  atualizarValoresConclusao
);

produtoAtendimento.addEventListener(
  "change",
  atualizarValoresConclusao
);

if (teveDescontoAtendimento) {
  teveDescontoAtendimento.addEventListener(
    "change",
    () => {
      const temDesconto =
        teveDescontoAtendimento.value ===
        "sim";

      if (areaDescontoAtendimento) {
        areaDescontoAtendimento.classList.toggle(
          "escondida",
          !temDesconto
        );
      }

      if (!temDesconto) {
        if (valorDescontoAtendimento) {
          valorDescontoAtendimento.value =
            "";
        }
      }

      atualizarValoresConclusao();
    }
  );
}

if (valorDescontoAtendimento) {
  valorDescontoAtendimento.addEventListener(
    "input",
    () => {
      formatarCampoValor(
        valorDescontoAtendimento
      );

      atualizarValoresConclusao();
    }
  );
}

botaoConcluirAgendamento.addEventListener(
  "click",
  iniciarConclusaoComPlano
);

formConcluirAtendimento.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    mensagemConclusaoAtendimento.textContent =
      "";

    if (!agendamentoSelecionado) {

      mensagemConclusaoAtendimento.textContent =
        "Nenhum agendamento foi selecionado.";

      return;
    }


    /* =========================================
       PEGAR TODOS OS SERVIÇOS
    ========================================= */

    const selectsServicos =
      document.querySelectorAll(
        ".select-servico-atendimento"
      );

    const servicosSelecionados = [];

    selectsServicos.forEach(
      (select) => {

        if (!select.value) {
          return;
        }

        const servico =
          servicos.find(
            (item) =>
              item.id === select.value
          );

        if (servico) {
          servicosSelecionados.push(
            servico
          );
        }
      }
    );


    /* =========================================
       PEGAR TODOS OS PRODUTOS
    ========================================= */

    const selectsProdutos =
      document.querySelectorAll(
        ".select-produto-atendimento"
      );

    const produtosSelecionados = [];

    selectsProdutos.forEach(
      (select) => {

        if (!select.value) {
          return;
        }

        const produto =
          produtos.find(
            (item) =>
              item.id === select.value
          );

        if (produto) {
          produtosSelecionados.push(
            produto
          );
        }
      }
    );


    const formaPagamento =
      formaPagamentoAtendimento.value;


    /* =========================================
       VALIDAÇÕES
    ========================================= */

    if (
      !atendimentoPlanoComExtras &&
      servicosSelecionados.length === 0
    ) {

      mensagemConclusaoAtendimento.textContent =
        "Selecione pelo menos um serviço realizado.";

      servicoAtendimento.focus();

      return;
    }

    if (
      atendimentoPlanoComExtras &&
      servicosSelecionados.length === 0 &&
      produtosSelecionados.length === 0
    ) {
      mensagemConclusaoAtendimento.textContent =
        "Adicione pelo menos um produto ou serviço extra.";
      return;
    }

    if (!formaPagamento) {

      mensagemConclusaoAtendimento.textContent =
        "Selecione a forma de pagamento.";

      formaPagamentoAtendimento.focus();

      return;
    }


    /* =========================================
       VALOR DOS SERVIÇOS
    ========================================= */

    const valorServico =
      servicosSelecionados.reduce(
        (total, servico) => {

          return (
            total +
            (
              Number(servico.valor) ||
              0
            )
          );
        },
        0
      );


    /* =========================================
       VALOR DOS PRODUTOS
    ========================================= */

    const valorProduto =
      produtosSelecionados.reduce(
        (total, produto) => {

          return (
            total +
            (
              Number(produto.valor) ||
              0
            )
          );
        },
        0
      );


    const valorBruto =
      valorServico +
      valorProduto;


    /* =========================================
       NOMES
    ========================================= */

    const nomesServicos =
      servicosSelecionados.map(
        (servico) =>
          servico.nome
      );

    const nomesProdutos =
      produtosSelecionados.map(
        (produto) =>
          produto.nome
      );


    const nomesServicosComPlano = atendimentoPlanoComExtras
      ? [planoAtendimentoSelecionado.servicoNome, ...nomesServicos]
      : nomesServicos;

    const textoServicos =
      nomesServicosComPlano.join(" + ");

    const textoProdutos =
      nomesProdutos.join(" + ");


    /* =========================================
       DESCONTO
    ========================================= */

    const temDesconto =
      teveDescontoAtendimento?.value ===
      "sim";

    let valorDesconto = 0;


    if (temDesconto) {

      valorDesconto =
        converterValorParaNumero(
          valorDescontoAtendimento?.value ||
          ""
        );
    }


    if (
      temDesconto &&
      valorDesconto <= 0
    ) {

      mensagemConclusaoAtendimento.textContent =
        "Informe um valor válido para o desconto.";

      valorDescontoAtendimento?.focus();

      return;
    }


    if (
      valorDesconto >
      valorBruto
    ) {

      mensagemConclusaoAtendimento.textContent =
        "O desconto não pode ser maior que o valor do atendimento.";

      valorDescontoAtendimento?.focus();

      return;
    }


    const valorLiquido =
      valorBruto -
      valorDesconto;


    /* =========================================
       DADOS DO AGENDAMENTO
    ========================================= */

    const agendamentoId =
      agendamentoSelecionado.id;

    const barbeiroAtendimento =
      agendamentoSelecionado.barbeiro;

    const clienteAtendimento =
      agendamentoSelecionado.cliente;

    const dataAtendimento =
      agendamentoSelecionado.data;

    const horaAtendimento =
      agendamentoSelecionado.hora;

    const clientePlano = atendimentoPlanoComExtras
      ? await obterClienteDoAgendamento()
      : null;

    if (atendimentoPlanoComExtras && !clientePlano) {
      mensagemConclusaoAtendimento.textContent =
        "Não foi possível localizar o cliente do plano.";
      return;
    }

    const servicosParaSalvar = atendimentoPlanoComExtras
      ? [
          {
            id: planoAtendimentoSelecionado.servicoId,
            nome: planoAtendimentoSelecionado.servicoNome,
            valor: 0,
            valorOriginal: Number(
              servicos.find((servico) =>
                servico.id === planoAtendimentoSelecionado.servicoId
              )?.valor
            ) || 0,
            peloPlano: true
          },
          ...servicosSelecionados.map((servico) => ({
            id: servico.id,
            nome: servico.nome,
            valor: Number(servico.valor) || 0,
            peloPlano: false
          }))
        ]
      : servicosSelecionados.map((servico) => ({
          id: servico.id,
          nome: servico.nome,
          valor: Number(servico.valor) || 0
        }));

    try {

      /* =========================================
         SALVAR ATENDIMENTO
      ========================================= */

      await updateDoc(
        doc(
          db,
          "agendamentos",
          agendamentoId
        ),
        {

          status:
            "concluido",


          /* ===============================
             SERVIÇOS
          =============================== */

          servicosIds:
            servicosParaSalvar.map(
              (servico) => servico.id
            ),

          servicos:
            servicosParaSalvar,


          /*
            Mantemos também esses campos
            para compatibilidade com outras
            partes do sistema.
          */

          servicoId:
            atendimentoPlanoComExtras
              ? planoAtendimentoSelecionado.servicoId
              : (servicosSelecionados[0]?.id || ""),

          servico:
            textoServicos,

          valorServico,


          /* ===============================
             PRODUTOS
          =============================== */

          produtosIds:
            produtosSelecionados.map(
              (produto) =>
                produto.id
            ),

          produtos:
            produtosSelecionados.map(
              (produto) => ({

                id:
                  produto.id,

                nome:
                  produto.nome,

                valor:
                  Number(
                    produto.valor
                  ) || 0

              })
            ),

          produtoId:
            produtosSelecionados[0]?.id ||
            "",

          produto:
            textoProdutos,

          valorProduto,


          /* ===============================
             VALORES
          =============================== */

          valorTotal:
            valorBruto,

          valorTotalBruto:
            valorBruto,

          teveDesconto:
            temDesconto,

          valorDesconto:
            valorDesconto,

          valorLiquido:
            valorLiquido,

          formaPagamento,

          atendimentoPeloPlano:
            atendimentoPlanoComExtras,

          planoId:
            atendimentoPlanoComExtras
              ? planoAtendimentoSelecionado.id
              : "",

          planoNome:
            atendimentoPlanoComExtras
              ? planoAtendimentoSelecionado.nome
              : "",

          servicoPlanoId:
            atendimentoPlanoComExtras
              ? planoAtendimentoSelecionado.servicoId
              : "",

          servicoPlano:
            atendimentoPlanoComExtras
              ? planoAtendimentoSelecionado.servicoNome
              : "",

          teveExtras:
            atendimentoPlanoComExtras,

          concluidoPor:
            nomeUsuario,

          tipoUsuarioConclusao:
            tipoUsuario,

          dataConclusao:
            Date.now()
        }
      );

      if (atendimentoPlanoComExtras) {
        await registrarUsoDoPlano(
          planoAtendimentoSelecionado,
          agendamentoSelecionado,
          clientePlano.id
        );
      }


      /* =========================================
         MOVIMENTAÇÃO DO DESCONTO
      ========================================= */

      const documentoDesconto =
        doc(
          db,
          "movimentacoesFinanceiras",
          `desconto_${agendamentoId}`
        );


      if (
        temDesconto &&
        valorDesconto > 0
      ) {

        await setDoc(
          documentoDesconto,
          {

            tipo:
              "saida",

            origem:
              "desconto",

            categoria:
              "desconto",

            descricao:
              `Desconto do atendimento - ${textoServicos}`,

            valor:
              valorDesconto,

            data:
              dataAtendimento,

            hora:
              horaAtendimento,

            barbeiro:
              barbeiroAtendimento,

            cliente:
              clienteAtendimento,

            servico:
              textoServicos,

            servicos:
              servicosSelecionados.map(
                (servico) => ({

                  id:
                    servico.id,

                  nome:
                    servico.nome,

                  valor:
                    Number(
                      servico.valor
                    ) || 0
                })
              ),

            produto:
              textoProdutos,

            produtos:
              produtosSelecionados.map(
                (produto) => ({

                  id:
                    produto.id,

                  nome:
                    produto.nome,

                  valor:
                    Number(
                      produto.valor
                    ) || 0
                })
              ),

            formaPagamento:
              formaPagamento,

            agendamentoId:
              agendamentoId,

            prioridadeHistorico:
              2,

            criadoPor:
              nomeUsuario,

            usuarioId:
              usuarioId,

            dataCadastro:
              Date.now()
          },
          {
            merge:
              true
          }
        );

      } else {

        await deleteDoc(
          documentoDesconto
        );
      }


      /* =========================================
         FECHAR / ATUALIZAR
      ========================================= */

      fecharModal(
        "modal-concluir-atendimento"
      );

      agendamentoSelecionado =
        null;

      planoAtendimentoSelecionado = null;
      atendimentoPeloPlano = false;
      atendimentoPlanoComExtras = false;

      await atualizarAgenda();


      if (
        conteudoRelatorioHistorico &&
        !conteudoRelatorioHistorico.classList.contains(
          "escondida"
        )
      ) {

        await atualizarHistoricoFinanceiro();
      }


    } catch (erro) {

      console.log(
        "Erro ao concluir atendimento:",
        erro
      );

      mensagemConclusaoAtendimento.textContent =
        "Não foi possível concluir o atendimento.";
    }
  }
);

/* =========================================================
   CANCELAR / NÃO REALIZADO
========================================================= */

botaoCancelarAgendamento.addEventListener(
  "click",
  async () => {
    if (!agendamentoSelecionado) {
      return;
    }

    try {
      await updateDoc(
        doc(
          db,
          "agendamentos",
          agendamentoSelecionado.id
        ),
        {
          status:
            "cancelado"
        }
      );

      fecharModal(
        "modal-detalhes"
      );

      agendamentoSelecionado =
        null;

      await atualizarAgenda();
    } catch (erro) {
      console.log(
        erro
      );

      alert(
        "Não foi possível cancelar o agendamento."
      );
    }
  }
);

botaoNaoRealizadoAgendamento.addEventListener(
  "click",
  async () => {
    if (!agendamentoSelecionado) {
      return;
    }

    try {
      await updateDoc(
        doc(
          db,
          "agendamentos",
          agendamentoSelecionado.id
        ),
        {
          status:
            "nao_realizado"
        }
      );

      fecharModal(
        "modal-detalhes"
      );

      agendamentoSelecionado =
        null;

      await atualizarAgenda();
    } catch (erro) {
      console.log(
        erro
      );

      alert(
        "Não foi possível atualizar o agendamento."
      );
    }
  }
);

/* =========================================================
   BARBEIROS
========================================================= */

function mostrarListaDeBarbeiros() {
  const pesquisa =
    pesquisaBarbeiro.value
      .trim()
      .toLowerCase();

  const filtrados =
    barbeiros.filter(
      (barbeiro) =>
        barbeiro.nome
          .toLowerCase()
          .includes(
            pesquisa
          )
    );

  listaGerenciarBarbeiros.innerHTML =
    "";

  if (
    filtrados.length === 0
  ) {
    listaGerenciarBarbeiros.innerHTML = `
      <p class="lista-vazia">
        Nenhum barbeiro encontrado.
      </p>
    `;

    return;
  }

  filtrados.forEach(
    (barbeiro) => {
      const linha =
        document.createElement(
          "div"
        );

      linha.className =
        "item-lista";

      const informacoes =
        document.createElement(
          "div"
        );

      const nome =
        document.createElement(
          "strong"
        );

      nome.textContent =
        barbeiro.nome;

      const descricao =
        document.createElement(
          "small"
        );

      descricao.textContent =
        "Barbeiro cadastrado";

      informacoes.append(
        nome,
        descricao
      );

      linha.appendChild(
        informacoes
      );

      if (
        usuarioPodeGerenciarBarbeiros()
      ) {
        const botaoExcluir =
          document.createElement(
            "button"
          );

        botaoExcluir.type =
          "button";

        botaoExcluir.className =
          "botao-excluir";

        botaoExcluir.textContent =
          "Excluir";

        botaoExcluir.addEventListener(
          "click",
          async () => {
            const resposta =
              await getDocs(
                collection(
                  db,
                  "agendamentos"
                )
              );

            const temPendente =
              resposta.docs.some(
                (documento) => {
                  const agendamento =
                    documento.data();

                  return (
                    agendamento.barbeiro ===
                      barbeiro.nome &&
                    agendamento.status !==
                      "cancelado" &&
                    agendamento.status !==
                      "concluido" &&
                    agendamento.status !==
                      "nao_realizado"
                  );
                }
              );

            if (temPendente) {
              mensagemBarbeiro.textContent =
                "Não é possível excluir este barbeiro porque ele possui um horário pendente.";

              return;
            }

            if (
              !confirm(
                `Deseja excluir o barbeiro ${barbeiro.nome}?`
              )
            ) {
              return;
            }

            await deleteDoc(
              doc(
                db,
                "barbeiros",
                barbeiro.id
              )
            );

            mensagemBarbeiro.textContent =
              `${barbeiro.nome} foi excluído com sucesso.`;

            if (
              barbeiroAtual ===
              barbeiro.nome
            ) {
              barbeiroAtual =
                "";
            }

            await carregarBarbeiros();

            preencherSelectDeBarbeiros();

            mostrarListaDeBarbeiros();
          }
        );

        linha.appendChild(
          botaoExcluir
        );
      }

      listaGerenciarBarbeiros.appendChild(
        linha
      );
    }
  );
}

botaoMostrarCadastroBarbeiro.addEventListener(
  "click",
  () => {
    if (
      !usuarioPodeGerenciarBarbeiros()
    ) {
      mensagemBarbeiro.textContent =
        "Somente o administrador pode cadastrar barbeiros.";

      return;
    }

    formCadastroBarbeiro.classList.toggle(
      "escondida"
    );

    mensagemBarbeiro.textContent =
      "";

    if (
      !formCadastroBarbeiro.classList.contains(
        "escondida"
      )
    ) {
      formCadastroBarbeiro.reset();

      nomeNovoBarbeiro.focus();
    }
  }
);

formCadastroBarbeiro.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    mensagemBarbeiro.textContent =
      "";

    if (
      !usuarioPodeGerenciarBarbeiros()
    ) {
      return;
    }

    const nome =
      nomeNovoBarbeiro.value.trim();

    const senha =
      senhaNovoBarbeiro.value.trim();

    const confirmacao =
      confirmarSenhaNovoBarbeiro.value.trim();

    if (!nome) {
      mensagemBarbeiro.textContent =
        "Digite o nome do barbeiro.";

      return;
    }

    if (
      senha.length < 4
    ) {
      mensagemBarbeiro.textContent =
        "A senha precisa ter pelo menos 4 caracteres.";

      return;
    }

    if (
      senha !== confirmacao
    ) {
      mensagemBarbeiro.textContent =
        "As senhas digitadas não são iguais.";

      return;
    }

    const jaExiste =
      barbeiros.some(
        (barbeiro) =>
          barbeiro.nome.toLowerCase() ===
          nome.toLowerCase()
      );

    if (jaExiste) {
      mensagemBarbeiro.textContent =
        "Esse barbeiro já está cadastrado.";

      return;
    }

    try {
      await addDoc(
        collection(
          db,
          "barbeiros"
        ),
        {
          nome,
          senha,
          ativo: true,
          dataCadastro:
            Date.now()
        }
      );

      formCadastroBarbeiro.reset();

      mensagemBarbeiro.textContent =
        `${nome} foi cadastrado com sucesso.`;

      await carregarBarbeiros();

      preencherSelectDeBarbeiros();

      mostrarListaDeBarbeiros();
    } catch (erro) {
      console.log(
        erro
      );

      mensagemBarbeiro.textContent =
        "Não foi possível cadastrar o barbeiro.";
    }
  }
);

/* =========================================================
   CLIENTES
========================================================= */

function mostrarListaDeClientes() {
  const pesquisa =
    pesquisaCliente.value
      .trim()
      .toLowerCase();

  const filtrados =
    clientes.filter(
      (cliente) =>
        cliente.nome
          .toLowerCase()
          .includes(
            pesquisa
          ) ||
        cliente.celular.includes(
          pesquisa
        )
    );

  listaGerenciarClientes.innerHTML =
    "";

  if (
    filtrados.length === 0
  ) {
    listaGerenciarClientes.innerHTML = `
      <p class="lista-vazia">
        Nenhum cliente encontrado.
      </p>
    `;

    return;
  }

  filtrados.forEach(
    (cliente) => {
      const linha =
        document.createElement(
          "div"
        );

      linha.className =
        "item-lista";

      const informacoes =
        document.createElement(
          "div"
        );

      const nome =
        document.createElement(
          "strong"
        );

      nome.textContent =
        cliente.nome;

      const celular =
        document.createElement(
          "small"
        );

      celular.textContent =
        cliente.celular;

      informacoes.append(
        nome,
        celular
      );

      const botaoExcluir =
        document.createElement(
          "button"
        );

      botaoExcluir.type =
        "button";

      botaoExcluir.className =
        "botao-excluir";

      botaoExcluir.textContent =
        "Excluir";

      botaoExcluir.addEventListener(
        "click",
        async () => {
          const resposta =
            await getDocs(
              collection(
                db,
                "agendamentos"
              )
            );

          const temPendente =
            resposta.docs.some(
              (documento) => {
                const agendamento =
                  documento.data();

                const pertence =
                  agendamento.clienteId ===
                    cliente.id ||
                  agendamento.cliente ===
                    cliente.nome;

                const pendente =
                  agendamento.status !==
                    "cancelado" &&
                  agendamento.status !==
                    "concluido" &&
                  agendamento.status !==
                    "nao_realizado";

                return (
                  pertence &&
                  pendente
                );
              }
            );

          if (temPendente) {
            mensagemCliente.textContent =
              "Não é possível excluir este cliente porque ele possui um horário pendente.";

            return;
          }

          if (
            !confirm(
              `Deseja excluir o cliente ${cliente.nome}?`
            )
          ) {
            return;
          }

          await deleteDoc(
            doc(
              db,
              "clientes",
              cliente.id
            )
          );

          mensagemCliente.textContent =
            `${cliente.nome} foi excluído com sucesso.`;

          await carregarClientes();

          mostrarListaDeClientes();
        }
      );

      linha.append(
        informacoes,
        botaoExcluir
      );

      listaGerenciarClientes.appendChild(
        linha
      );
    }
  );
}

botaoMostrarCadastroCliente.addEventListener(
  "click",
  () => {
    formCadastroCliente.classList.toggle(
      "escondida"
    );

    mensagemCliente.textContent =
      "";

    if (
      !formCadastroCliente.classList.contains(
        "escondida"
      )
    ) {
      formCadastroCliente.reset();

      nomeNovoCliente.focus();
    }
  }
);

function formatarCelular(valor) {
  const numeros =
    valor
      .replace(/\D/g, "")
      .slice(0, 11);

  if (
    numeros.length <= 2
  ) {
    return numeros;
  }

  if (
    numeros.length <= 7
  ) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  }

  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
}

celularNovoCliente.addEventListener(
  "input",
  () => {
    celularNovoCliente.value =
      formatarCelular(
        celularNovoCliente.value
      );
  }
);

formCadastroCliente.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    mensagemCliente.textContent =
      "";

    const nome =
      nomeNovoCliente.value.trim();

    const celular =
      celularNovoCliente.value.trim();

    const somenteNumeros =
      celular.replace(
        /\D/g,
        ""
      );

    if (!nome) {
      mensagemCliente.textContent =
        "Digite o nome do cliente.";

      return;
    }

    if (
      somenteNumeros.length !==
      11
    ) {
      mensagemCliente.textContent =
        "Digite um número de celular com 11 dígitos.";

      return;
    }

    const jaExiste =
      clientes.some(
        (cliente) => {
          const celularCliente =
            cliente.celular.replace(
              /\D/g,
              ""
            );

          return (
            cliente.nome.toLowerCase() ===
              nome.toLowerCase() ||
            celularCliente ===
              somenteNumeros
          );
        }
      );

    if (jaExiste) {
      mensagemCliente.textContent =
        "Já existe um cliente com esse nome ou celular.";

      return;
    }

    try {
      await addDoc(
        collection(
          db,
          "clientes"
        ),
        {
          nome,
          celular,
          dataCadastro:
            Date.now()
        }
      );

      formCadastroCliente.reset();

      mensagemCliente.textContent =
        `${nome} foi cadastrado com sucesso.`;

      await carregarClientes();

      mostrarListaDeClientes();
    } catch (erro) {
      console.log(
        erro
      );

      mensagemCliente.textContent =
        "Não foi possível cadastrar o cliente.";
    }
  }
);

/* =========================================================
   PRODUTOS
========================================================= */

function mostrarListaDeProdutos() {
  const pesquisa =
    pesquisaProduto.value
      .trim()
      .toLowerCase();

  const filtrados =
    produtos.filter(
      (produto) =>
        produto.nome
          .toLowerCase()
          .includes(
            pesquisa
          )
    );

  listaProdutos.innerHTML =
    "";

  if (
    filtrados.length === 0
  ) {
    listaProdutos.innerHTML = `
      <p class="lista-vazia">
        Nenhum produto encontrado.
      </p>
    `;

    return;
  }

  filtrados.forEach(
    (produto) => {
      const linha =
        document.createElement(
          "div"
        );

      linha.className =
        "item-lista";

      const informacoes =
        document.createElement(
          "div"
        );

      const nome =
        document.createElement(
          "strong"
        );

      nome.textContent =
        produto.nome;

      const valor =
        document.createElement(
          "small"
        );

      valor.textContent =
        formatarValorEmReal(
          produto.valor
        );

      informacoes.append(
        nome,
        valor
      );

      linha.appendChild(
        informacoes
      );

      if (
        usuarioPodeGerenciarCatalogo()
      ) {
        const botoes =
          document.createElement(
            "div"
          );

        botoes.className =
          "acoes-item-catalogo";

        const editar =
          document.createElement(
            "button"
          );

        editar.type =
          "button";

        editar.className =
          "botao-secundario";

        editar.textContent =
          "Editar";

        editar.addEventListener(
          "click",
          () => {
            abrirEdicaoCatalogo(
              "produto",
              produto
            );
          }
        );

        const excluir =
          document.createElement(
            "button"
          );

        excluir.type =
          "button";

        excluir.className =
          "botao-excluir";

        excluir.textContent =
          "Excluir";

        excluir.addEventListener(
          "click",
          async () => {
            if (
              !confirm(
                `Deseja excluir o produto ${produto.nome}?`
              )
            ) {
              return;
            }

            try {
              await deleteDoc(
                doc(
                  db,
                  "produtos",
                  produto.id
                )
              );

              mensagemProduto.textContent =
                `${produto.nome} foi excluído com sucesso.`;

              await carregarProdutos();

              mostrarListaDeProdutos();
            } catch (erro) {
              console.log(
                erro
              );

              mensagemProduto.textContent =
                "Não foi possível excluir o produto.";
            }
          }
        );

        botoes.append(
          editar,
          excluir
        );

        linha.appendChild(
          botoes
        );
      }

      listaProdutos.appendChild(
        linha
      );
    }
  );
}

botaoMostrarCadastroProduto.addEventListener(
  "click",
  () => {
    if (
      !usuarioPodeGerenciarCatalogo()
    ) {
      return;
    }

    formCadastroProduto.classList.toggle(
      "escondida"
    );

    mensagemProduto.textContent =
      "";

    if (
      !formCadastroProduto.classList.contains(
        "escondida"
      )
    ) {
      formCadastroProduto.reset();

      nomeNovoProduto.focus();
    }
  }
);

valorNovoProduto.addEventListener(
  "input",
  () =>
    formatarCampoValor(
      valorNovoProduto
    )
);

formCadastroProduto.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    mensagemProduto.textContent =
      "";

    if (
      !usuarioPodeGerenciarCatalogo()
    ) {
      return;
    }

    const nome =
      nomeNovoProduto.value.trim();

    const valor =
      converterValorParaNumero(
        valorNovoProduto.value
      );

    if (!nome) {
      mensagemProduto.textContent =
        "Digite o nome do produto.";

      return;
    }

    if (valor <= 0) {
      mensagemProduto.textContent =
        "Digite um valor válido para o produto.";

      return;
    }

    const jaExiste =
      produtos.some(
        (produto) =>
          produto.nome.toLowerCase() ===
          nome.toLowerCase()
      );

    if (jaExiste) {
      mensagemProduto.textContent =
        "Esse produto já está cadastrado.";

      return;
    }

    try {
      await addDoc(
        collection(
          db,
          "produtos"
        ),
        {
          nome,
          valor,
          ativo: true,
          dataCadastro:
            Date.now()
        }
      );

      formCadastroProduto.reset();

      mensagemProduto.textContent =
        `${nome} foi cadastrado com sucesso.`;

      await carregarProdutos();

      mostrarListaDeProdutos();
    } catch (erro) {
      console.log(
        erro
      );

      mensagemProduto.textContent =
        "Não foi possível cadastrar o produto.";
    }
  }
);

/* =========================================================
   SERVIÇOS
========================================================= */

function mostrarListaDeServicos() {
  const pesquisa =
    pesquisaServico.value
      .trim()
      .toLowerCase();

  const filtrados =
    servicos.filter(
      (servico) =>
        servico.nome
          .toLowerCase()
          .includes(
            pesquisa
          )
    );

  listaServicos.innerHTML =
    "";

  if (
    filtrados.length === 0
  ) {
    listaServicos.innerHTML = `
      <p class="lista-vazia">
        Nenhum serviço encontrado.
      </p>
    `;

    return;
  }

  filtrados.forEach(
    (servico) => {
      const linha =
        document.createElement(
          "div"
        );

      linha.className =
        "item-lista";

      const informacoes =
        document.createElement(
          "div"
        );

      const nome =
        document.createElement(
          "strong"
        );

      nome.textContent =
        servico.nome;

      const valor =
        document.createElement(
          "small"
        );

      valor.textContent =
        formatarValorEmReal(
          servico.valor
        );

      informacoes.append(
        nome,
        valor
      );

      linha.appendChild(
        informacoes
      );

      if (
        usuarioPodeGerenciarCatalogo()
      ) {
        const botoes =
          document.createElement(
            "div"
          );

        botoes.className =
          "acoes-item-catalogo";

        const editar =
          document.createElement(
            "button"
          );

        editar.type =
          "button";

        editar.className =
          "botao-secundario";

        editar.textContent =
          "Editar";

        editar.addEventListener(
          "click",
          () => {
            abrirEdicaoCatalogo(
              "servico",
              servico
            );
          }
        );

        const excluir =
          document.createElement(
            "button"
          );

        excluir.type =
          "button";

        excluir.className =
          "botao-excluir";

        excluir.textContent =
          "Excluir";

        excluir.addEventListener(
          "click",
          async () => {
            if (
              !confirm(
                `Deseja excluir o serviço ${servico.nome}?`
              )
            ) {
              return;
            }

            try {
              await deleteDoc(
                doc(
                  db,
                  "servicos",
                  servico.id
                )
              );

              mensagemServico.textContent =
                `${servico.nome} foi excluído com sucesso.`;

              await carregarServicos();

              mostrarListaDeServicos();
            } catch (erro) {
              console.log(
                erro
              );

              mensagemServico.textContent =
                "Não foi possível excluir o serviço.";
            }
          }
        );

        botoes.append(
          editar,
          excluir
        );

        linha.appendChild(
          botoes
        );
      }

      listaServicos.appendChild(
        linha
      );
    }
  );
}

botaoMostrarCadastroServico.addEventListener(
  "click",
  () => {
    if (
      !usuarioPodeGerenciarCatalogo()
    ) {
      return;
    }

    formCadastroServico.classList.toggle(
      "escondida"
    );

    mensagemServico.textContent =
      "";

    if (
      !formCadastroServico.classList.contains(
        "escondida"
      )
    ) {
      formCadastroServico.reset();

      nomeNovoServico.focus();
    }
  }
);

valorNovoServico.addEventListener(
  "input",
  () =>
    formatarCampoValor(
      valorNovoServico
    )
);

formCadastroServico.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    mensagemServico.textContent =
      "";

    if (
      !usuarioPodeGerenciarCatalogo()
    ) {
      return;
    }

    const nome =
      nomeNovoServico.value.trim();

    const valor =
      converterValorParaNumero(
        valorNovoServico.value
      );

    if (!nome) {
      mensagemServico.textContent =
        "Digite o nome do serviço.";

      return;
    }

    if (valor <= 0) {
      mensagemServico.textContent =
        "Digite um valor válido para o serviço.";

      return;
    }

    const jaExiste =
      servicos.some(
        (servico) =>
          servico.nome.toLowerCase() ===
          nome.toLowerCase()
      );

    if (jaExiste) {
      mensagemServico.textContent =
        "Esse serviço já está cadastrado.";

      return;
    }

    try {
      await addDoc(
        collection(
          db,
          "servicos"
        ),
        {
          nome,
          valor,
          ativo: true,
          dataCadastro:
            Date.now()
        }
      );

      formCadastroServico.reset();

      mensagemServico.textContent =
        `${nome} foi cadastrado com sucesso.`;

      await carregarServicos();

      mostrarListaDeServicos();
    } catch (erro) {
      console.log(
        erro
      );

      mensagemServico.textContent =
        "Não foi possível cadastrar o serviço.";
    }
  }
);

/* =========================================================
   EDITAR CATÁLOGO
========================================================= */

function abrirEdicaoCatalogo(
  tipo,
  item
) {
  if (
    !usuarioPodeGerenciarCatalogo()
  ) {
    return;
  }

  idEditarCatalogo.value =
    item.id;

  tipoEditarCatalogo.value =
    tipo;

  nomeEditarCatalogo.value =
    item.nome;

  valorEditarCatalogo.value =
    formatarValorEmReal(
      item.valor
    );

  tituloEditarCatalogo.textContent =
    tipo === "produto"
      ? "Editar produto"
      : "Editar serviço";

  mensagemEditarCatalogo.textContent =
    "";

  modalEditarCatalogo.classList.remove(
    "escondido"
  );
}

valorEditarCatalogo.addEventListener(
  "input",
  () =>
    formatarCampoValor(
      valorEditarCatalogo
    )
);

formEditarCatalogo.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    mensagemEditarCatalogo.textContent =
      "";

    if (
      !usuarioPodeGerenciarCatalogo()
    ) {
      return;
    }

    const id =
      idEditarCatalogo.value;

    const tipo =
      tipoEditarCatalogo.value;

    const nome =
      nomeEditarCatalogo.value.trim();

    const valor =
      converterValorParaNumero(
        valorEditarCatalogo.value
      );

    if (
      !id ||
      !tipo
    ) {
      mensagemEditarCatalogo.textContent =
        "Item não encontrado.";

      return;
    }

    if (!nome) {
      mensagemEditarCatalogo.textContent =
        "Digite o nome do item.";

      return;
    }

    if (valor <= 0) {
      mensagemEditarCatalogo.textContent =
        "Digite um valor válido.";

      return;
    }

    const nomeColecao =
      tipo === "produto"
        ? "produtos"
        : "servicos";

    try {
      await updateDoc(
        doc(
          db,
          nomeColecao,
          id
        ),
        {
          nome,
          valor,
          dataAtualizacao:
            Date.now()
        }
      );

      fecharModal(
        "modal-editar-catalogo"
      );

      if (
        tipo === "produto"
      ) {
        await carregarProdutos();

        mostrarListaDeProdutos();

        mensagemProduto.textContent =
          "Produto atualizado com sucesso.";
      } else {
        await carregarServicos();

        mostrarListaDeServicos();

        mensagemServico.textContent =
          "Serviço atualizado com sucesso.";
      }
    } catch (erro) {
      console.log(
        erro
      );

      mensagemEditarCatalogo.textContent =
        "Não foi possível salvar as alterações.";
    }
  }
);

/* =========================================================
   PESQUISAS
========================================================= */

pesquisaBarbeiro.addEventListener(
  "input",
  mostrarListaDeBarbeiros
);

pesquisaCliente.addEventListener(
  "input",
  mostrarListaDeClientes
);

pesquisaProduto.addEventListener(
  "input",
  mostrarListaDeProdutos
);

pesquisaServico.addEventListener(
  "input",
  mostrarListaDeServicos
);

pesquisaClienteAgendamento.addEventListener(
  "input",
  () => {
    clienteSelecionado =
      null;

    mostrarClientesNoAgendamento();
  }
);

/* =========================================================
   SELECIONAR BARBEIRO
========================================================= */

selectBarbeiro.addEventListener(
  "change",
  async () => {
    barbeiroAtual =
      selectBarbeiro.value;

    if (!barbeiroAtual) {
      textoAgenda.textContent =
        "Escolha um barbeiro para ver a agenda.";

      agendamentos = [];

      mostrarAgenda();

      return;
    }

    textoAgenda.textContent =
      `Agenda de ${barbeiroAtual}.`;

    await atualizarAgenda();
  }
);

/* =========================================================
   ROLAGEM DA AGENDA
========================================================= */

agendaScroll.addEventListener(
  "scroll",
  () => {
    const chegouAoFim =
      agendaScroll.scrollLeft +
        agendaScroll.clientWidth >=
      agendaScroll.scrollWidth -
        300;

    if (!chegouAoFim) {
      return;
    }

    const horizontal =
      agendaScroll.scrollLeft;

    const vertical =
      agendaScroll.scrollTop;

    adicionarMaisDias();

    mostrarAgenda();

    agendaScroll.scrollLeft =
      horizontal;

    agendaScroll.scrollTop =
      vertical;
  }
);

/* =========================================================
   ABAS DO RELATÓRIO
========================================================= */

function desativarAbasRelatorio() {
  conteudoRelatorioDesempenho?.classList.add(
    "escondida"
  );

  conteudoRelatorioFinanceiro?.classList.add(
    "escondida"
  );

  conteudoRelatorioHistorico?.classList.add(
    "escondida"
  );

  abaRelatorioDesempenho?.classList.remove(
    "ativo"
  );

  abaRelatorioFinanceiro?.classList.remove(
    "ativo"
  );

  abaRelatorioHistorico?.classList.remove(
    "ativo"
  );
}

function abrirRelatorioDesempenho() {
  desativarAbasRelatorio();

  conteudoRelatorioDesempenho.classList.remove(
    "escondida"
  );

  abaRelatorioDesempenho.classList.add(
    "ativo"
  );
}

async function abrirRelatorioFinanceiro() {
  if (
    !usuarioPodeVisualizarFinanceiro()
  ) {
    return;
  }

  desativarAbasRelatorio();

  conteudoRelatorioFinanceiro.classList.remove(
    "escondida"
  );

  abaRelatorioFinanceiro.classList.add(
    "ativo"
  );

  await atualizarFinanceiro();
}

async function abrirRelatorioHistorico() {
  if (
    !usuarioPodeVisualizarFinanceiro() ||
    !conteudoRelatorioHistorico
  ) {
    return;
  }

  desativarAbasRelatorio();

  conteudoRelatorioHistorico.classList.remove(
    "escondida"
  );

  abaRelatorioHistorico?.classList.add(
    "ativo"
  );

  await atualizarHistoricoFinanceiro();
}

/* =========================================================
   ABRIR TELA RELATÓRIO
========================================================= */

async function abrirTelaRelatorio() {
  esconderTodasAsTelas();

  telaRelatorio.classList.remove(
    "escondida"
  );

  marcarBotaoAtivo(
    "Relatório"
  );

  if (
    barbeiros.length === 0
  ) {
    await carregarBarbeiros();
  }

  filtroRelatorioBarbeiro.innerHTML =
    "";

  if (
    usuarioPodeVisualizarRelatorioGeral()
  ) {
    filtroRelatorioBarbeiro.innerHTML = `
      <option value="todos">
        Barbearia inteira
      </option>
    `;

    barbeiros.forEach(
      (barbeiro) => {
        const opcao =
          document.createElement(
            "option"
          );

        opcao.value =
          barbeiro.nome;

        opcao.textContent =
          barbeiro.nome;

        filtroRelatorioBarbeiro.appendChild(
          opcao
        );
      }
    );
  } else {
    const opcao =
      document.createElement(
        "option"
      );

    opcao.value =
      nomeUsuario;

    opcao.textContent =
      nomeUsuario;

    filtroRelatorioBarbeiro.appendChild(
      opcao
    );
  }

  if (
    usuarioPodeVisualizarFinanceiro()
  ) {
    abaRelatorioFinanceiro?.classList.remove(
      "escondida"
    );

    abaRelatorioHistorico?.classList.remove(
      "escondida"
    );

    preencherFiltroFinanceiroBarbeiros();

    preencherFiltroHistoricoBarbeiros();

    preencherBarbeirosSaida();
  } else {
    abaRelatorioFinanceiro?.classList.add(
      "escondida"
    );

    abaRelatorioHistorico?.classList.add(
      "escondida"
    );
  }

  await atualizarRelatorio();

  abrirRelatorioDesempenho();
}

/* =========================================================
   RELATÓRIO DE DESEMPENHO
========================================================= */

function obterPeriodoRelatorio() {
  const inicio =
    new Date(
      mesRelatorio.getFullYear(),
      mesRelatorio.getMonth(),
      1
    );

  const fim =
    new Date(
      mesRelatorio.getFullYear(),
      mesRelatorio.getMonth() +
        1,
      0
    );

  return {
    inicio:
      formatarDataParaSalvar(
        inicio
      ),

    fim:
      formatarDataParaSalvar(
        fim
      )
  };
}

function contarPorData(
  lista
) {
  const resultado = {};

  lista.forEach(
    (agendamento) => {
      resultado[
        agendamento.data
      ] =
        (
          resultado[
            agendamento.data
          ] || 0
        ) + 1;
    }
  );

  return resultado;
}

function mostrarCalendario(
  concluidos
) {
  const ano =
    mesRelatorio.getFullYear();

  const mes =
    mesRelatorio.getMonth();

  const hoje =
    formatarDataParaSalvar(
      new Date()
    );

  const quantidadePorData =
    contarPorData(
      concluidos
    );

  const primeiroDia =
    new Date(
      ano,
      mes,
      1
    );

  const quantidadeDias =
    new Date(
      ano,
      mes + 1,
      0
    ).getDate();

  const espacos =
    (
      primeiroDia.getDay() +
      6
    ) % 7;

  tituloCalendario.textContent =
    primeiroDia.toLocaleDateString(
      "pt-BR",
      {
        month: "long",
        year: "numeric"
      }
    );

  calendarioRelatorio.innerHTML =
    "";

  for (
    let numero = 0;
    numero < espacos;
    numero++
  ) {
    const vazio =
      document.createElement(
        "div"
      );

    vazio.className =
      "dia-calendario-vazio";

    calendarioRelatorio.appendChild(
      vazio
    );
  }

  for (
    let dia = 1;
    dia <= quantidadeDias;
    dia++
  ) {
    const data =
      formatarDataParaSalvar(
        new Date(
          ano,
          mes,
          dia
        )
      );

    const quantidade =
      quantidadePorData[
        data
      ] || 0;

    const cartao =
      document.createElement(
        "div"
      );

    cartao.className =
      "dia-calendario";

    if (data === hoje) {
      cartao.classList.add(
        "hoje"
      );
    }

    if (quantidade > 0) {
      cartao.classList.add(
        "com-atendimentos"
      );
    }

    cartao.innerHTML = `
      <span class="numero-dia">
        ${dia}
      </span>

      <span class="quantidade-dia">
        ${quantidade} atendimento${quantidade === 1 ? "" : "s"}
      </span>
    `;

    calendarioRelatorio.appendChild(
      cartao
    );
  }
}

function maiorInformacao(
  lista,
  campo
) {
  const contagem = {};

  lista.forEach(
    (agendamento) => {
      const valor =
        agendamento[
          campo
        ];

      if (!valor) {
        return;
      }

      contagem[valor] =
        (
          contagem[
            valor
          ] || 0
        ) + 1;
    }
  );

  const maior =
    Object.keys(
      contagem
    ).sort(
      (a, b) =>
        contagem[b] -
        contagem[a]
    )[0];

  return maior || "—";
}

async function atualizarRelatorio() {
  const resposta =
    await getDocs(
      collection(
        db,
        "agendamentos"
      )
    );

  const periodo =
    obterPeriodoRelatorio();

  const barbeiro =
    filtroRelatorioBarbeiro.value;

  const lista =
    resposta.docs
      .map(
        (documento) =>
          documento.data()
      )
      .filter(
        (agendamento) => {
          const estaNoPeriodo =
            agendamento.data >=
              periodo.inicio &&
            agendamento.data <=
              periodo.fim;

          const estaNoBarbeiro =
            barbeiro ===
              "todos" ||
            agendamento.barbeiro ===
              barbeiro;

          return (
            estaNoPeriodo &&
            estaNoBarbeiro
          );
        }
      );

  const concluidos =
    lista.filter(
      (agendamento) =>
        agendamento.status ===
        "concluido"
    );

  document.querySelector(
    "#total-concluido"
  ).textContent =
    concluidos.length;

  document.querySelector(
    "#horario-mais-atendido"
  ).textContent =
    maiorInformacao(
      concluidos,
      "hora"
    );

  const diasSemana =
    concluidos.map(
      (agendamento) =>
        dataPorTexto(
          agendamento.data
        ).toLocaleDateString(
          "pt-BR",
          {
            weekday:
              "long"
          }
        )
    );

  const contagemDias =
    {};

  diasSemana.forEach(
    (dia) => {
      contagemDias[dia] =
        (
          contagemDias[
            dia
          ] || 0
        ) + 1;
    }
  );

  const diaMaisAtendido =
    Object.keys(
      contagemDias
    ).sort(
      (a, b) =>
        contagemDias[b] -
        contagemDias[a]
    )[0];

  document.querySelector(
    "#dia-mais-atendido"
  ).textContent =
    diaMaisAtendido ||
    "—";

  mostrarCalendario(
    concluidos
  );

  if (graficoStatus) {
    graficoStatus.destroy();
  }

  let labels = [];
  let dados = [];

  if (
    filtroSegundoGrafico.value ===
    "horario"
  ) {
    const porHorario =
      {};

    concluidos.forEach(
      (agendamento) => {
        porHorario[
          agendamento.hora
        ] =
          (
            porHorario[
              agendamento.hora
            ] || 0
          ) + 1;
      }
    );

    labels =
      Object.keys(
        porHorario
      ).sort();

    dados =
      labels.map(
        (horario) =>
          porHorario[
            horario
          ]
      );

    tituloSegundoGrafico.textContent =
      "Horário que mais atende";
  } else {
    const ordemDias = [
      "segunda-feira",
      "terça-feira",
      "quarta-feira",
      "quinta-feira",
      "sexta-feira",
      "sábado",
      "domingo"
    ];

    const porDia = {};

    concluidos.forEach(
      (agendamento) => {
        const dia =
          dataPorTexto(
            agendamento.data
          ).toLocaleDateString(
            "pt-BR",
            {
              weekday:
                "long"
            }
          );

        porDia[dia] =
          (
            porDia[
              dia
            ] || 0
          ) + 1;
      }
    );

    labels =
      ordemDias.filter(
        (dia) =>
          porDia[dia]
      );

    dados =
      labels.map(
        (dia) =>
          porDia[dia]
      );

    tituloSegundoGrafico.textContent =
      "Dia da semana que mais atende";
  }

  const temaClaro =
    document.body.classList.contains(
      "tema-claro"
    );

  graficoStatus =
    new Chart(
      document.querySelector(
        "#grafico-status"
      ),
      {
        type: "bar",

        data: {
          labels,

          datasets: [
            {
              label:
                "Atendimentos concluídos",

              data:
                dados,

              backgroundColor:
                "#d8ad5b",

              borderColor:
                "#e7c77f",

              borderWidth:
                1
            }
          ]
        },

        options: {
          responsive:
            true,

          scales: {
            y: {
              beginAtZero:
                true,

              ticks: {
                stepSize:
                  1,

                color:
                  temaClaro
                    ? "#2d2d2d"
                    : "#ffffff"
              },

              grid: {
                color:
                  temaClaro
                    ? "#d4c7ad"
                    : "#444444"
              }
            },

            x: {
              ticks: {
                color:
                  temaClaro
                    ? "#2d2d2d"
                    : "#ffffff"
              },

              grid: {
                color:
                  temaClaro
                    ? "#d4c7ad"
                    : "#444444"
              }
            }
          }
        }
      }
    );
}

/* =========================================================
   PERÍODO FINANCEIRO
========================================================= */

function obterPeriodoGenerico(
  tipoPeriodo,
  dataReferencia
) {
  let inicio;
  let fim;
  let titulo;

  if (
    tipoPeriodo ===
      "diario" ||
    tipoPeriodo ===
      "dia"
  ) {
    inicio =
      new Date(
        dataReferencia
      );

    fim =
      new Date(
        dataReferencia
      );

    inicio.setHours(
      0,
      0,
      0,
      0
    );

    fim.setHours(
      23,
      59,
      59,
      999
    );

    titulo =
      dataReferencia.toLocaleDateString(
        "pt-BR",
        {
          weekday:
            "long",

          day:
            "2-digit",

          month:
            "long",

          year:
            "numeric"
        }
      );
  } else if (
    tipoPeriodo ===
      "semanal" ||
    tipoPeriodo ===
      "semana"
  ) {
    inicio =
      obterInicioDaSemana(
        dataReferencia
      );

    fim =
      obterFimDaSemana(
        dataReferencia
      );

    titulo =
      `${inicio.toLocaleDateString("pt-BR")} até ${fim.toLocaleDateString("pt-BR")}`;
  } else {
    inicio =
      new Date(
        dataReferencia.getFullYear(),
        dataReferencia.getMonth(),
        1
      );

    fim =
      new Date(
        dataReferencia.getFullYear(),
        dataReferencia.getMonth() +
          1,
        0
      );

    fim.setHours(
      23,
      59,
      59,
      999
    );

    titulo =
      dataReferencia.toLocaleDateString(
        "pt-BR",
        {
          month:
            "long",

          year:
            "numeric"
        }
      );
  }

  return {
    tipoPeriodo,

    inicio,

    fim,

    titulo,

    inicioTexto:
      formatarDataParaSalvar(
        inicio
      ),

    fimTexto:
      formatarDataParaSalvar(
        fim
      )
  };
}

function obterPeriodoFinanceiro() {
  return obterPeriodoGenerico(
    periodoRelatorioFinanceiro.value,
    dataFinanceiro
  );
}

function preencherFiltroFinanceiroBarbeiros() {
  if (
    !filtroFinanceiroBarbeiro
  ) {
    return;
  }

  filtroFinanceiroBarbeiro.innerHTML = `
    <option value="todos">
      Barbearia inteira
    </option>
  `;

  barbeiros.forEach(
    (barbeiro) => {
      const opcao =
        document.createElement(
          "option"
        );

      opcao.value =
        barbeiro.nome;

      opcao.textContent =
        barbeiro.nome;

      filtroFinanceiroBarbeiro.appendChild(
        opcao
      );
    }
  );
}

/* =========================================================
   GRÁFICO FINANCEIRO
========================================================= */

function criarDadosGraficoFinanceiro(
  lista,
  periodo
) {
  let labels = [];
  let dados = [];

  const valores = {};

  if (
    periodo.tipoPeriodo ===
      "diario" ||
    periodo.tipoPeriodo ===
      "dia"
  ) {
    labels =
      horarios;

    labels.forEach(
      (hora) => {
        valores[hora] =
          0;
      }
    );

    lista.forEach(
      (agendamento) => {
        if (
          valores[
            agendamento.hora
          ] !== undefined
        ) {
          valores[
            agendamento.hora
          ] +=
            Number(
              agendamento.valorTotal
            ) || 0;
        }
      }
    );

    dados =
      labels.map(
        (hora) =>
          valores[hora]
      );

    tituloGraficoFinanceiro.textContent =
      "Faturamento por horário";
  } else if (
    periodo.tipoPeriodo ===
      "semanal" ||
    periodo.tipoPeriodo ===
      "semana"
  ) {
    const nomesDias = [
      "Seg",
      "Ter",
      "Qua",
      "Qui",
      "Sex",
      "Sáb",
      "Dom"
    ];

    labels =
      nomesDias;

    labels.forEach(
      (dia) => {
        valores[dia] =
          0;
      }
    );

    lista.forEach(
      (agendamento) => {
        const data =
          dataPorTexto(
            agendamento.data
          );

        const indice =
          (
            data.getDay() +
            6
          ) % 7;

        const nomeDia =
          nomesDias[
            indice
          ];

        valores[nomeDia] +=
          Number(
            agendamento.valorTotal
          ) || 0;
      }
    );

    dados =
      labels.map(
        (dia) =>
          valores[dia]
      );

    tituloGraficoFinanceiro.textContent =
      "Faturamento semanal";
  } else {
    const quantidadeDias =
      new Date(
        dataFinanceiro.getFullYear(),
        dataFinanceiro.getMonth() +
          1,
        0
      ).getDate();

    labels =
      Array.from(
        {
          length:
            quantidadeDias
        },
        (_, indice) =>
          String(
            indice + 1
          )
      );

    labels.forEach(
      (dia) => {
        valores[dia] =
          0;
      }
    );

    lista.forEach(
      (agendamento) => {
        const dia =
          String(
            Number(
              agendamento.data.split(
                "-"
              )[2]
            )
          );

        if (
          valores[
            dia
          ] !== undefined
        ) {
          valores[dia] +=
            Number(
              agendamento.valorTotal
            ) || 0;
        }
      }
    );

    dados =
      labels.map(
        (dia) =>
          valores[dia]
      );

    tituloGraficoFinanceiro.textContent =
      "Faturamento mensal";
  }

  return {
    labels,
    dados
  };
}

/* =========================================================
   RANKINGS
========================================================= */

function mostrarRankingFinanceiro(
  elemento,
  dados,
  mensagemVazia,
  mostrarValor
) {
  if (!elemento) {
    return;
  }

  elemento.innerHTML =
    "";

  const itens =
    Object.entries(
      dados
    )
      .sort(
        (a, b) =>
          b[1].valor -
          a[1].valor
      )
      .slice(
        0,
        10
      );

  if (
    itens.length === 0
  ) {
    elemento.innerHTML = `
      <p class="lista-vazia">
        ${mensagemVazia}
      </p>
    `;

    return;
  }

  itens.forEach(
    (
      [
        nome,
        informacoes
      ],
      indice
    ) => {
      const linha =
        document.createElement(
          "div"
        );

      linha.className =
        "item-ranking-financeiro";

      const nomeElemento =
        document.createElement(
          "strong"
        );

      nomeElemento.textContent =
        `${indice + 1}. ${nome}`;

      const resultado =
        document.createElement(
          "span"
        );

      resultado.textContent =
        mostrarValor
          ? `${formatarValorEmReal(informacoes.valor)} · ${informacoes.quantidade}`
          : `${informacoes.quantidade} vez${informacoes.quantidade === 1 ? "" : "es"}`;

      linha.append(
        nomeElemento,
        resultado
      );

      elemento.appendChild(
        linha
      );
    }
  );
}

/* =========================================================
   ATUALIZAR FINANCEIRO
========================================================= */

async function atualizarFinanceiro() {
  if (
    !usuarioPodeVisualizarFinanceiro()
  ) {
    return;
  }

  const [resposta, respostaMovimentacoes] = await Promise.all([
    getDocs(collection(db, "agendamentos")),
    getDocs(collection(db, "movimentacoesFinanceiras"))
  ]);

  const periodo =
    obterPeriodoFinanceiro();

  const barbeiroSelecionado =
    filtroFinanceiroBarbeiro?.value ||
    "todos";

  tituloPeriodoFinanceiro.textContent =
    periodo.titulo;

  const concluidos =
    resposta.docs
      .map(
        (documento) => ({
          id: documento.id,
          ...documento.data()
        })
      )
      .filter(
        (agendamento) =>
          agendamento.status ===
            "concluido" &&
          agendamento.data >=
            periodo.inicioTexto &&
          agendamento.data <=
            periodo.fimTexto &&
          (
            barbeiroSelecionado ===
              "todos" ||
            agendamento.barbeiro ===
              barbeiroSelecionado
          )
      );

  const assinaturasPlanos = respostaMovimentacoes.docs
    .map((documento) => ({
      id: documento.id,
      ...documento.data()
    }))
    .filter((movimentacao) =>
      movimentacao.tipo === "entrada" &&
      movimentacao.origem === "plano" &&
      movimentacao.data >= periodo.inicioTexto &&
      movimentacao.data <= periodo.fimTexto &&
      barbeiroSelecionado === "todos"
    )
    .map((movimentacao) => ({
      id: movimentacao.id,
      tipoRegistro: "assinatura_plano",
      data: movimentacao.data,
      hora: movimentacao.hora || "00:00",
      formaPagamento: movimentacao.formaPagamento || "",
      valorTotal: Number(movimentacao.valor) || 0,
      servicos: [{
        id: movimentacao.planoId || "",
        nome: `${movimentacao.planoNome || "Plano"} (Plano)`,
        valor: Number(movimentacao.valor) || 0
      }],
      produtos: []
    }));

  const registrosFinanceiros = [
    ...concluidos,
    ...assinaturasPlanos
  ];

  let faturamentoTotal = 0;
  let totalServicos = 0;
  let totalProdutos = 0;

  let pix = 0;
  let dinheiro = 0;
  let cartao = 0;

  let quantidadePix = 0;
  let quantidadeDinheiro = 0;
  let quantidadeCartao = 0;
  
  let quantidadeServicos = 0;
  let quantidadeProdutos = 0;

  const rankingBarbeiros = {};
  const rankingServicos = {};
  const rankingProdutos = {};

registrosFinanceiros.forEach(
  (agendamento) => {

    /* =========================================
       SERVIÇOS DO ATENDIMENTO
    ========================================= */

    let servicosDoAtendimento = [];

    if (
      Array.isArray(agendamento.servicos) &&
      agendamento.servicos.length > 0
    ) {
      servicosDoAtendimento =
        agendamento.servicos;
    } else if (agendamento.servico) {

      /*
        Compatibilidade com atendimentos antigos
        que possuem apenas um serviço.
      */

      servicosDoAtendimento = [
        {
          id:
            agendamento.servicoId ||
            "",

          nome:
            agendamento.servico,

          valor:
            Number(
              agendamento.valorServico
            ) || 0
        }
      ];
    }


    /* =========================================
       PRODUTOS DO ATENDIMENTO
    ========================================= */

    let produtosDoAtendimento = [];

    if (
      Array.isArray(agendamento.produtos) &&
      agendamento.produtos.length > 0
    ) {
      produtosDoAtendimento =
        agendamento.produtos;
    } else if (agendamento.produto) {

      /*
        Compatibilidade com atendimentos antigos.
      */

      produtosDoAtendimento = [
        {
          id:
            agendamento.produtoId ||
            "",

          nome:
            agendamento.produto,

          valor:
            Number(
              agendamento.valorProduto
            ) || 0
        }
      ];
    }


    /* =========================================
       VALORES
    ========================================= */

    const valorServico =
      servicosDoAtendimento.reduce(
        (total, servico) => {
          return (
            total +
            (
              Number(servico.valor) ||
              0
            )
          );
        },
        0
      );


    const valorProduto =
      produtosDoAtendimento.reduce(
        (total, produto) => {
          return (
            total +
            (
              Number(produto.valor) ||
              0
            )
          );
        },
        0
      );


    const valorTotal =
      Number(
        agendamento.valorTotal
      ) ||
      valorServico +
      valorProduto;


    faturamentoTotal +=
      valorTotal;

    totalServicos +=
      valorServico;

    totalProdutos +=
      valorProduto;


    /* =========================================
       QUANTIDADES
    ========================================= */

    quantidadeServicos +=
      servicosDoAtendimento.length;

    quantidadeProdutos +=
      produtosDoAtendimento.length;


    /* =========================================
       FORMA DE PAGAMENTO
    ========================================= */

    if (
      agendamento.formaPagamento ===
      "Pix"
    ) {
      pix += valorTotal;
      quantidadePix++;
    }


    if (
      agendamento.formaPagamento ===
      "Dinheiro"
    ) {
      dinheiro += valorTotal;
      quantidadeDinheiro++;
    }


    if (
      agendamento.formaPagamento ===
      "Cartão"
    ) {
      cartao += valorTotal;
      quantidadeCartao++;
    }


    /* =========================================
       RANKING DOS BARBEIROS
    ========================================= */

    const nomeBarbeiro =
      agendamento.barbeiro ||
      "Não informado";

    if (agendamento.tipoRegistro !== "assinatura_plano") {
      if (!rankingBarbeiros[nomeBarbeiro]) {
        rankingBarbeiros[nomeBarbeiro] = {
          valor: 0,
          quantidade: 0
        };
      }

      rankingBarbeiros[nomeBarbeiro].valor += valorTotal;
      rankingBarbeiros[nomeBarbeiro].quantidade++;
    }


    /* =========================================
       RANKING DOS SERVIÇOS
    ========================================= */

    servicosDoAtendimento.forEach(
      (servico) => {

        const nomeServico =
          servico.nome ||
          "Não informado";


        if (
          !rankingServicos[
            nomeServico
          ]
        ) {
          rankingServicos[
            nomeServico
          ] = {
            valor: 0,
            quantidade: 0
          };
        }


        rankingServicos[
          nomeServico
        ].valor +=
          Number(
            servico.valor
          ) || 0;


        rankingServicos[
          nomeServico
        ].quantidade++;
      }
    );


    /* =========================================
       RANKING DOS PRODUTOS
    ========================================= */

    produtosDoAtendimento.forEach(
      (produto) => {

        const nomeProduto =
          produto.nome ||
          "Não informado";


        if (
          !rankingProdutos[
            nomeProduto
          ]
        ) {
          rankingProdutos[
            nomeProduto
          ] = {
            valor: 0,
            quantidade: 0
          };
        }


        rankingProdutos[
          nomeProduto
        ].valor +=
          Number(
            produto.valor
          ) || 0;


        rankingProdutos[
          nomeProduto
        ].quantidade++;
      }
    );
  }
);

  document.querySelector(
    "#financeiro-faturamento-total"
  ).textContent =
    formatarValorEmReal(
      faturamentoTotal
    );

  document.querySelector(
    "#financeiro-total-servicos"
  ).textContent =
    formatarValorEmReal(
      totalServicos
    );

  document.querySelector(
    "#financeiro-total-produtos"
  ).textContent =
    formatarValorEmReal(
      totalProdutos
    );

  const numeroAtendimentos =
    document.querySelector(
      "#financeiro-total-atendimentos-numero"
    );

  if (numeroAtendimentos) {
    numeroAtendimentos.textContent =
      concluidos.length;
  }

  document.querySelector(
    "#financeiro-total-atendimentos"
  ).textContent =
    `${concluidos.length} atendimento${concluidos.length === 1 ? "" : "s"} no período`;

  document.querySelector(
  "#financeiro-quantidade-servicos"
  ).textContent =
  `${quantidadeServicos} serviço${quantidadeServicos === 1 ? "" : "s"} realizado${quantidadeServicos === 1 ? "" : "s"}`;

  document.querySelector(
    "#financeiro-quantidade-produtos"
  ).textContent =
    `${quantidadeProdutos} produto${quantidadeProdutos === 1 ? "" : "s"} vendido${quantidadeProdutos === 1 ? "" : "s"}`;

  document.querySelector(
    "#financeiro-total-pix"
  ).textContent =
    formatarValorEmReal(
      pix
    );

  document.querySelector(
    "#financeiro-total-dinheiro"
  ).textContent =
    formatarValorEmReal(
      dinheiro
    );

  document.querySelector(
    "#financeiro-total-cartao"
  ).textContent =
    formatarValorEmReal(
      cartao
    );

  document.querySelector(
    "#financeiro-quantidade-pix"
  ).textContent =
    `${quantidadePix} pagamento${quantidadePix === 1 ? "" : "s"}`;

  document.querySelector(
    "#financeiro-quantidade-dinheiro"
  ).textContent =
    `${quantidadeDinheiro} pagamento${quantidadeDinheiro === 1 ? "" : "s"}`;

  document.querySelector(
    "#financeiro-quantidade-cartao"
  ).textContent =
    `${quantidadeCartao} pagamento${quantidadeCartao === 1 ? "" : "s"}`;

  totalGraficoFinanceiro.textContent =
    formatarValorEmReal(
      faturamentoTotal
    );

  mostrarRankingFinanceiro(
    rankingFinanceiroBarbeiros,
    rankingBarbeiros,
    "Nenhum atendimento concluído no período.",
    true
  );

  mostrarRankingFinanceiro(
    rankingFinanceiroServicos,
    rankingServicos,
    "Nenhum serviço registrado no período.",
    false
  );

  mostrarRankingFinanceiro(
    rankingFinanceiroProdutos,
    rankingProdutos,
    "Nenhum produto vendido no período.",
    false
  );

  const dadosGrafico =
    criarDadosGraficoFinanceiro(
      registrosFinanceiros,
      periodo
    );

  if (
    graficoFinanceiro
  ) {
    graficoFinanceiro.destroy();
  }

  const temaClaro =
    document.body.classList.contains(
      "tema-claro"
    );

  graficoFinanceiro =
    new Chart(
      document.querySelector(
        "#grafico-financeiro"
      ),
      {
        type: "line",

        data: {
          labels:
            dadosGrafico.labels,

          datasets: [
            {
              label:
                "Faturamento",

              data:
                dadosGrafico.dados,

              fill:
                true,

              tension:
                0.35,

              borderWidth:
                3,

              borderColor:
                "#d4af37",

              backgroundColor:
                "rgba(212, 175, 55, 0.16)",

              pointBackgroundColor:
                "#d4af37",

              pointBorderColor:
                "#f3d98f",

              pointRadius:
                3,

              pointHoverRadius:
                6
            }
          ]
        },

        options: {
          responsive:
            true,

          maintainAspectRatio:
            false,

          interaction: {
            intersect:
              false,

            mode:
              "index"
          },

          plugins: {
            legend: {
              display:
                false
            },

            tooltip: {
              callbacks: {
                label(contexto) {
                  return formatarValorEmReal(
                    contexto.parsed.y
                  );
                }
              }
            }
          },

          scales: {
            y: {
              beginAtZero:
                true,

              ticks: {
                color:
                  temaClaro
                    ? "#3b3327"
                    : "#bdbdbd",

                callback(valor) {
                  return formatarValorEmReal(
                    valor
                  );
                }
              },

              grid: {
                color:
                  temaClaro
                    ? "#ded4c0"
                    : "#303030"
              }
            },

            x: {
              ticks: {
                color:
                  temaClaro
                    ? "#3b3327"
                    : "#bdbdbd"
              },

              grid: {
                display:
                  false
              }
            }
          }
        }
      }
    );
}

/* =========================================================
   CARREGAR BIBLIOTECAS DO PDF
========================================================= */

function carregarScriptPdf(src) {
  return new Promise((resolve, reject) => {
    const existente =
      document.querySelector(
        `script[src="${src}"]`
      );

    if (existente) {
      if (
        window.jspdf ||
        src.includes("autotable")
      ) {
        resolve();
        return;
      }

      existente.addEventListener(
        "load",
        resolve,
        { once: true }
      );

      existente.addEventListener(
        "error",
        reject,
        { once: true }
      );

      return;
    }

    const script =
      document.createElement(
        "script"
      );

    script.src = src;

    script.onload = resolve;
    script.onerror = reject;

    document.head.appendChild(
      script
    );
  });
}

async function garantirBibliotecasPdf() {
  if (!window.jspdf) {
    await carregarScriptPdf(
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
    );
  }

  const {
    jsPDF
  } = window.jspdf;

  /*
    Só carrega AutoTable se ainda
    não estiver disponível.
  */
  const documentoTeste =
    new jsPDF();

  if (
    typeof documentoTeste.autoTable !==
    "function"
  ) {
    await carregarScriptPdf(
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"
    );
  }
}

/* =========================================================
   DADOS DO PDF FINANCEIRO
========================================================= */

async function obterDadosPdfFinanceiro() {
  const periodo =
    obterPeriodoFinanceiro();

  const barbeiroSelecionado =
    filtroFinanceiroBarbeiro?.value ||
    "todos";

  const [
    respostaAgendamentos,
    respostaMovimentacoes
  ] = await Promise.all([
    getDocs(
      collection(
        db,
        "agendamentos"
      )
    ),

    getDocs(
      collection(
        db,
        "movimentacoesFinanceiras"
      )
    )
  ]);

  const atendimentos =
    respostaAgendamentos.docs
      .map((documento) => ({
        id: documento.id,
        ...documento.data()
      }))
      .filter((agendamento) => {
        const concluido =
          agendamento.status ===
          "concluido";

        const dentroPeriodo =
          agendamento.data >=
            periodo.inicioTexto &&
          agendamento.data <=
            periodo.fimTexto;

        const barbeiroCorreto =
          barbeiroSelecionado ===
            "todos" ||
          agendamento.barbeiro ===
            barbeiroSelecionado;

        return (
          concluido &&
          dentroPeriodo &&
          barbeiroCorreto
        );
      })
      .sort((a, b) => {
        return (
          criarDataHora(
            a.data,
            a.hora || "00:00"
          ) -
          criarDataHora(
            b.data,
            b.hora || "00:00"
          )
        );
      });

  const descontos =
    respostaMovimentacoes.docs
      .map((documento) => ({
        id: documento.id,
        ...documento.data()
      }))
      .filter((movimentacao) => {
        const desconto =
          movimentacao.tipo ===
            "saida" &&
          movimentacao.origem ===
            "desconto";

        const dentroPeriodo =
          movimentacao.data >=
            periodo.inicioTexto &&
          movimentacao.data <=
            periodo.fimTexto;

        const barbeiroCorreto =
          barbeiroSelecionado ===
            "todos" ||
          movimentacao.barbeiro ===
            barbeiroSelecionado;

        return (
          desconto &&
          dentroPeriodo &&
          barbeiroCorreto
        );
      });

  const assinaturasPlanos = respostaMovimentacoes.docs
    .map((documento) => ({
      id: documento.id,
      ...documento.data()
    }))
    .filter((movimentacao) =>
      movimentacao.tipo === "entrada" &&
      movimentacao.origem === "plano" &&
      movimentacao.data >= periodo.inicioTexto &&
      movimentacao.data <= periodo.fimTexto &&
      barbeiroSelecionado === "todos"
    );

  let faturamentoBruto = 0;
  let totalServicos = 0;
  let totalProdutos = 0;

  let totalPix = 0;
  let totalDinheiro = 0;
  let totalCartao = 0;

  let quantidadePix = 0;
  let quantidadeDinheiro = 0;
  let quantidadeCartao = 0;
  let quantidadeProdutos = 0;

  const rankingBarbeiros = {};
  const rankingServicos = {};
  const rankingProdutos = {};

  atendimentos.forEach(
    (agendamento) => {
      const valorServico =
        Number(
          agendamento.valorServico
        ) || 0;

      const valorProduto =
        Number(
          agendamento.valorProduto
        ) || 0;

      const valorTotal =
        Number(
          agendamento.valorTotalBruto
        ) ||
        Number(
          agendamento.valorTotal
        ) ||
        valorServico +
          valorProduto;

      faturamentoBruto +=
        valorTotal;

      totalServicos +=
        valorServico;

      totalProdutos +=
        valorProduto;

      if (agendamento.produto) {
        quantidadeProdutos++;
      }

      if (
        agendamento.formaPagamento ===
        "Pix"
      ) {
        totalPix += valorTotal;
        quantidadePix++;
      }

      if (
        agendamento.formaPagamento ===
        "Dinheiro"
      ) {
        totalDinheiro +=
          valorTotal;

        quantidadeDinheiro++;
      }

      if (
        agendamento.formaPagamento ===
        "Cartão"
      ) {
        totalCartao +=
          valorTotal;

        quantidadeCartao++;
      }

      const barbeiro =
        agendamento.barbeiro ||
        "Não informado";

      if (!rankingBarbeiros[barbeiro]) {
        rankingBarbeiros[barbeiro] = {
          valor: 0,
          quantidade: 0
        };
      }

      rankingBarbeiros[
        barbeiro
      ].valor += valorTotal;

      rankingBarbeiros[
        barbeiro
      ].quantidade++;

      if (agendamento.servico) {
        if (
          !rankingServicos[
            agendamento.servico
          ]
        ) {
          rankingServicos[
            agendamento.servico
          ] = {
            valor: 0,
            quantidade: 0
          };
        }

        rankingServicos[
          agendamento.servico
        ].valor += valorServico;

        rankingServicos[
          agendamento.servico
        ].quantidade++;
      }

      if (agendamento.produto) {
        if (
          !rankingProdutos[
            agendamento.produto
          ]
        ) {
          rankingProdutos[
            agendamento.produto
          ] = {
            valor: 0,
            quantidade: 0
          };
        }

        rankingProdutos[
          agendamento.produto
        ].valor += valorProduto;

        rankingProdutos[
          agendamento.produto
        ].quantidade++;
      }
    }
  );

  assinaturasPlanos.forEach((assinatura) => {
    const valorPlano = Number(assinatura.valor) || 0;
    const nomePlano = `${assinatura.planoNome || "Plano"} (Plano)`;

    faturamentoBruto += valorPlano;
    totalServicos += valorPlano;

    if (assinatura.formaPagamento === "Pix") {
      totalPix += valorPlano;
      quantidadePix++;
    }

    if (assinatura.formaPagamento === "Dinheiro") {
      totalDinheiro += valorPlano;
      quantidadeDinheiro++;
    }

    if (assinatura.formaPagamento === "Cartão") {
      totalCartao += valorPlano;
      quantidadeCartao++;
    }

    if (!rankingServicos[nomePlano]) {
      rankingServicos[nomePlano] = {
        valor: 0,
        quantidade: 0
      };
    }

    rankingServicos[nomePlano].valor += valorPlano;
    rankingServicos[nomePlano].quantidade++;
  });

  const totalDescontos =
    descontos.reduce(
      (total, desconto) => {
        return (
          total +
          (
            Number(
              desconto.valor
            ) || 0
          )
        );
      },
      0
    );

  const faturamentoLiquido =
    faturamentoBruto -
    totalDescontos;

  return {
    periodo,
    barbeiroSelecionado,
    atendimentos,
    descontos,

    faturamentoBruto,
    faturamentoLiquido,
    totalDescontos,

    totalServicos,
    totalProdutos,

    totalPix,
    totalDinheiro,
    totalCartao,

    quantidadePix,
    quantidadeDinheiro,
    quantidadeCartao,
    quantidadeProdutos,

    rankingBarbeiros,
    rankingServicos,
    rankingProdutos
  };
}

/* =========================================================
   RANKING PARA PDF
========================================================= */

function transformarRankingParaPdf(
  ranking
) {
  return Object.entries(
    ranking
  )
    .sort(
      (a, b) =>
        b[1].valor -
        a[1].valor
    )
    .map(
      (
        [
          nome,
          dados
        ],
        indice
      ) => [
        indice + 1,
        nome,
        dados.quantidade,
        formatarValorEmReal(
          dados.valor
        )
      ]
    );
}

/* =========================================================
   GERAR PDF FINANCEIRO
========================================================= */

async function gerarPdfFinanceiro() {
  if (
    !usuarioPodeVisualizarFinanceiro()
  ) {
    alert(
      "Você não tem permissão para gerar este relatório."
    );

    return;
  }

  if (botaoGerarPdfFinanceiro) {
    botaoGerarPdfFinanceiro.disabled =
      true;

    botaoGerarPdfFinanceiro.textContent =
      "Gerando PDF...";
  }

  try {
    await garantirBibliotecasPdf();

    const {
      jsPDF
    } = window.jspdf;

    const dados =
      await obterDadosPdfFinanceiro();

    const pdf =
      new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

    const larguraPagina =
      pdf.internal.pageSize.getWidth();

    const margem = 14;

    /*
      ========================================================
      CABEÇALHO
      ========================================================
    */

    pdf.setFillColor(
      18,
      18,
      18
    );

    pdf.rect(
      0,
      0,
      larguraPagina,
      37,
      "F"
    );

    pdf.setTextColor(
      212,
      175,
      55
    );

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(18);

    pdf.text(
      "TRADIÇÃO BARBEARIA",
      margem,
      15
    );

    pdf.setTextColor(
      255,
      255,
      255
    );

    pdf.setFontSize(12);

    pdf.text(
      "Relatório Financeiro",
      margem,
      24
    );

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(9);

    const barbeiroTexto =
      dados.barbeiroSelecionado ===
      "todos"
        ? "Barbearia inteira"
        : dados.barbeiroSelecionado;

    pdf.text(
      `${dados.periodo.titulo} | ${barbeiroTexto}`,
      margem,
      31
    );

    /*
      ========================================================
      RESUMO
      ========================================================
    */

    let y = 48;

    pdf.setTextColor(
      30,
      30,
      30
    );

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(13);

    pdf.text(
      "Resumo financeiro",
      margem,
      y
    );

    y += 5;

    pdf.autoTable({
      startY: y,

      head: [[
        "Faturamento bruto",
        "Descontos",
        "Faturamento líquido",
        "Atendimentos"
      ]],

      body: [[
        formatarValorEmReal(
          dados.faturamentoBruto
        ),

        formatarValorEmReal(
          dados.totalDescontos
        ),

        formatarValorEmReal(
          dados.faturamentoLiquido
        ),

        String(
          dados.atendimentos.length
        )
      ]],

      theme: "grid",

      headStyles: {
        fillColor: [
          35,
          35,
          35
        ],

        textColor: [
          240,
          210,
          130
        ]
      },

      styles: {
        fontSize: 8,
        cellPadding: 3
      },

      margin: {
        left: margem,
        right: margem
      }
    });

    y =
      pdf.lastAutoTable.finalY +
      8;

    /*
      ========================================================
      SERVIÇOS / PRODUTOS
      ========================================================
    */

    pdf.setFontSize(12);

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.text(
      "Origem do faturamento",
      margem,
      y
    );

    y += 4;

    pdf.autoTable({
      startY: y,

      head: [[
        "Descrição",
        "Quantidade",
        "Valor"
      ]],

      body: [
        [
          "Serviços",
          dados.atendimentos.length,
          formatarValorEmReal(
            dados.totalServicos
          )
        ],

        [
          "Produtos",
          dados.quantidadeProdutos,
          formatarValorEmReal(
            dados.totalProdutos
          )
        ]
      ],

      theme: "striped",

      headStyles: {
        fillColor: [
          212,
          175,
          55
        ],

        textColor: [
          25,
          25,
          25
        ]
      },

      styles: {
        fontSize: 9
      },

      margin: {
        left: margem,
        right: margem
      }
    });

    y =
      pdf.lastAutoTable.finalY +
      8;

    /*
      ========================================================
      FORMAS DE PAGAMENTO
      ========================================================
    */

    pdf.setFontSize(12);

    pdf.text(
      "Formas de pagamento",
      margem,
      y
    );

    y += 4;

    pdf.autoTable({
      startY: y,

      head: [[
        "Forma",
        "Pagamentos",
        "Valor bruto"
      ]],

      body: [
        [
          "Pix",
          dados.quantidadePix,
          formatarValorEmReal(
            dados.totalPix
          )
        ],

        [
          "Dinheiro",
          dados.quantidadeDinheiro,
          formatarValorEmReal(
            dados.totalDinheiro
          )
        ],

        [
          "Cartão",
          dados.quantidadeCartao,
          formatarValorEmReal(
            dados.totalCartao
          )
        ]
      ],

      theme: "striped",

      headStyles: {
        fillColor: [
          212,
          175,
          55
        ],

        textColor: [
          25,
          25,
          25
        ]
      },

      styles: {
        fontSize: 9
      },

      margin: {
        left: margem,
        right: margem
      }
    });

    /*
      ========================================================
      NOVA PÁGINA — ATENDIMENTOS
      ========================================================
    */

    pdf.addPage();

    pdf.setTextColor(
      30,
      30,
      30
    );

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(14);

    pdf.text(
      "Atendimentos concluídos",
      margem,
      18
    );

    const linhasAtendimentos =
      dados.atendimentos.map(
        (agendamento) => {
          const data =
            dataPorTexto(
              agendamento.data
            ).toLocaleDateString(
              "pt-BR"
            );

          const valorBruto =
            Number(
              agendamento.valorTotalBruto
            ) ||
            Number(
              agendamento.valorTotal
            ) ||
            0;

          const desconto =
            Number(
              agendamento.valorDesconto
            ) || 0;

          const liquido =
            valorBruto -
            desconto;

          let servico =
            agendamento.servico ||
            "Atendimento";

          if (
            agendamento.produto
          ) {
            servico +=
              ` + ${agendamento.produto}`;
          }

          return [
            `${data} ${agendamento.hora || ""}`,

            agendamento.barbeiro ||
              "—",

            servico,

            agendamento.formaPagamento ||
              "—",

            formatarValorEmReal(
              valorBruto
            ),

            desconto > 0
              ? formatarValorEmReal(
                  desconto
                )
              : "—",

            formatarValorEmReal(
              liquido
            )
          ];
        }
      );

    if (
      linhasAtendimentos.length ===
      0
    ) {
      linhasAtendimentos.push([
        "—",
        "—",
        "Nenhum atendimento",
        "—",
        "—",
        "—",
        "—"
      ]);
    }

    pdf.autoTable({
      startY: 24,

      head: [[
        "Data",
        "Barbeiro",
        "Serviço",
        "Pagamento",
        "Bruto",
        "Desconto",
        "Líquido"
      ]],

      body:
        linhasAtendimentos,

      theme: "grid",

      headStyles: {
        fillColor: [
          35,
          35,
          35
        ],

        textColor: [
          240,
          210,
          130
        ]
      },

      styles: {
        fontSize: 7,
        cellPadding: 2
      },

      columnStyles: {
        0: {
          cellWidth: 25
        },

        1: {
          cellWidth: 23
        },

        2: {
          cellWidth: 42
        },

        3: {
          cellWidth: 23
        },

        4: {
          cellWidth: 22
        },

        5: {
          cellWidth: 22
        },

        6: {
          cellWidth: 22
        }
      },

      margin: {
        left: margem,
        right: margem
      }
    });

    /*
      ========================================================
      RANKINGS
      ========================================================
    */

    pdf.addPage();

    pdf.setFontSize(14);

    pdf.text(
      "Rankings do período",
      margem,
      18
    );

    const rankingBarbeiros =
      transformarRankingParaPdf(
        dados.rankingBarbeiros
      );

    pdf.autoTable({
      startY: 24,

      head: [[
        "#",
        "Barbeiro",
        "Atendimentos",
        "Faturamento"
      ]],

      body:
        rankingBarbeiros.length
          ? rankingBarbeiros
          : [[
              "—",
              "Nenhum registro",
              "0",
              "R$ 0,00"
            ]],

      theme: "striped",

      headStyles: {
        fillColor: [
          212,
          175,
          55
        ],

        textColor: [
          25,
          25,
          25
        ]
      },

      styles: {
        fontSize: 9
      },

      margin: {
        left: margem,
        right: margem
      }
    });

    y =
      pdf.lastAutoTable.finalY +
      8;

    const rankingServicos =
      transformarRankingParaPdf(
        dados.rankingServicos
      );

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(12);

    pdf.text(
      "Serviços mais realizados",
      margem,
      y
    );

    pdf.autoTable({
      startY: y + 4,

      head: [[
        "#",
        "Serviço",
        "Quantidade",
        "Valor"
      ]],

      body:
        rankingServicos.length
          ? rankingServicos
          : [[
              "—",
              "Nenhum registro",
              "0",
              "R$ 0,00"
            ]],

      theme: "striped",

      headStyles: {
        fillColor: [
          35,
          35,
          35
        ],

        textColor: [
          240,
          210,
          130
        ]
      },

      styles: {
        fontSize: 9
      },

      margin: {
        left: margem,
        right: margem
      }
    });

    y =
      pdf.lastAutoTable.finalY +
      8;

    const rankingProdutos =
      transformarRankingParaPdf(
        dados.rankingProdutos
      );

    if (y > 240) {
      pdf.addPage();
      y = 18;
    }

    pdf.setFontSize(12);

    pdf.text(
      "Produtos mais vendidos",
      margem,
      y
    );

    pdf.autoTable({
      startY: y + 4,

      head: [[
        "#",
        "Produto",
        "Quantidade",
        "Valor"
      ]],

      body:
        rankingProdutos.length
          ? rankingProdutos
          : [[
              "—",
              "Nenhum registro",
              "0",
              "R$ 0,00"
            ]],

      theme: "striped",

      headStyles: {
        fillColor: [
          35,
          35,
          35
        ],

        textColor: [
          240,
          210,
          130
        ]
      },

      styles: {
        fontSize: 9
      },

      margin: {
        left: margem,
        right: margem
      }
    });

    /*
      ========================================================
      RODAPÉ EM TODAS AS PÁGINAS
      ========================================================
    */

    const totalPaginas =
      pdf.getNumberOfPages();

    for (
      let pagina = 1;
      pagina <= totalPaginas;
      pagina++
    ) {
      pdf.setPage(pagina);

      const alturaPagina =
        pdf.internal.pageSize.getHeight();

      pdf.setDrawColor(
        210,
        210,
        210
      );

      pdf.line(
        margem,
        alturaPagina - 13,
        larguraPagina - margem,
        alturaPagina - 13
      );

      pdf.setTextColor(
        110,
        110,
        110
      );

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(7);

      pdf.text(
        `Tradição Barbearia | Gerado em ${new Date().toLocaleString("pt-BR")}`,
        margem,
        alturaPagina - 7
      );

      pdf.text(
        `Página ${pagina} de ${totalPaginas}`,
        larguraPagina - margem,
        alturaPagina - 7,
        {
          align: "right"
        }
      );
    }

    /*
      ========================================================
      NOME DO ARQUIVO
      ========================================================
    */

    const periodoArquivo =
      dados.periodo.inicioTexto ===
      dados.periodo.fimTexto
        ? dados.periodo.inicioTexto
        : `${dados.periodo.inicioTexto}_${dados.periodo.fimTexto}`;

    const barbeiroArquivo =
      barbeiroTexto
        .normalize("NFD")
        .replace(
          /[\u0300-\u036f]/g,
          ""
        )
        .replace(
          /[^a-zA-Z0-9]+/g,
          "_"
        )
        .replace(
          /^_|_$/g,
          ""
        );

    pdf.save(
      `relatorio_financeiro_${barbeiroArquivo}_${periodoArquivo}.pdf`
    );
  } catch (erro) {
    console.log(
      "Erro ao gerar PDF financeiro:",
      erro
    );

    alert(
      "Não foi possível gerar o PDF financeiro."
    );
  } finally {
    if (botaoGerarPdfFinanceiro) {
      botaoGerarPdfFinanceiro.disabled =
        false;

      botaoGerarPdfFinanceiro.textContent =
        "Gerar PDF";
    }
  }
}

/* =========================================================
   HISTÓRICO — FILTROS
========================================================= */

function preencherFiltroHistoricoBarbeiros() {
  if (
    !filtroHistoricoBarbeiro
  ) {
    return;
  }

  filtroHistoricoBarbeiro.innerHTML = `
    <option value="todos">
      Barbearia inteira
    </option>
  `;

  barbeiros.forEach(
    (barbeiro) => {
      const opcao =
        document.createElement(
          "option"
        );

      opcao.value =
        barbeiro.nome;

      opcao.textContent =
        barbeiro.nome;

      filtroHistoricoBarbeiro.appendChild(
        opcao
      );
    }
  );
}

function preencherBarbeirosSaida() {
  if (!barbeiroSaida) {
    return;
  }

  barbeiroSaida.innerHTML = `
    <option value="Barbearia">
      Barbearia
    </option>
  `;

  barbeiros.forEach(
    (barbeiro) => {
      const opcao =
        document.createElement(
          "option"
        );

      opcao.value =
        barbeiro.nome;

      opcao.textContent =
        barbeiro.nome;

      barbeiroSaida.appendChild(
        opcao
      );
    }
  );
}

function obterPeriodoHistorico() {
  const tipo =
    periodoRelatorioHistorico?.value ||
    "mensal";

  return obterPeriodoGenerico(
    tipo,
    dataHistorico
  );
}

/* =========================================================
   HISTÓRICO — MONTAR ENTRADAS
========================================================= */

function transformarAtendimentoEmEntrada(
  agendamento
) {
  const valorServico =
    Number(
      agendamento.valorServico
    ) || 0;

  const valorProduto =
    Number(
      agendamento.valorProduto
    ) || 0;

  /*
    A entrada mostra o valor cheio,
    ANTES do desconto.
  */
  const valor =
    Number(
      agendamento.valorTotalBruto
    ) ||
    Number(
      agendamento.valorTotal
    ) ||
    valorServico +
      valorProduto;

  let descricao =
    agendamento.servico ||
    "Atendimento";

  if (
    agendamento.produto
  ) {
    descricao +=
      ` + ${agendamento.produto}`;
  }

  return {
    id:
      agendamento.id,

    origem:
      "atendimento",

    tipo:
      "entrada",

    descricao,

    valor,

    data:
      agendamento.data,

    hora:
      agendamento.hora ||
      "00:00",

    barbeiro:
      agendamento.barbeiro ||
      "",

    cliente:
      agendamento.cliente ||
      "",

    formaPagamento:
      agendamento.formaPagamento ||
      "",

    prioridadeHistorico:
      1
  };
}

/* =========================================================
   HISTÓRICO — ATUALIZAR
========================================================= */

async function atualizarHistoricoFinanceiro() {
  if (
    !usuarioPodeVisualizarFinanceiro() ||
    !listaHistoricoFinanceiro
  ) {
    return;
  }

  const periodo =
    obterPeriodoHistorico();

  if (tituloPeriodoHistorico) {
    tituloPeriodoHistorico.textContent =
      periodo.titulo;
  }

  try {
    const [
      respostaAgendamentos,
      respostaMovimentacoes
    ] = await Promise.all([
      getDocs(
        collection(
          db,
          "agendamentos"
        )
      ),

      getDocs(
        collection(
          db,
          "movimentacoesFinanceiras"
        )
      )
    ]);

    /* ===============================
       ENTRADAS
    =============================== */

    const entradas =
      respostaAgendamentos.docs
        .map((documento) => ({
          id: documento.id,
          ...documento.data()
        }))
        .filter((agendamento) => {
          return (
            agendamento.status ===
            "concluido"
          );
        })
        .map(
          transformarAtendimentoEmEntrada
        );

    const entradasPlanos = respostaMovimentacoes.docs
      .map((documento) => ({
        id: documento.id,
        ...documento.data()
      }))
      .filter((movimentacao) =>
        movimentacao.tipo === "entrada" &&
        movimentacao.origem === "plano"
      )
      .map((movimentacao) => ({
        ...movimentacao,
        barbeiro: movimentacao.barbeiro || "",
        prioridadeHistorico: 1
      }));

    /* ===============================
       SAÍDAS
    =============================== */

    const saidas =
      respostaMovimentacoes.docs
        .map((documento) => ({
          id: documento.id,
          origem: "manual",
          ...documento.data()
        }))
        .filter((movimentacao) => {
          return (
            movimentacao.tipo ===
            "saida"
          );
        });

    const todasMovimentacoes = [
      ...entradas,
      ...entradasPlanos,
      ...saidas
    ];

    const barbeiroSelecionado =
      filtroHistoricoBarbeiro?.value ||
      "todos";

    const tipoSelecionado =
      filtroHistoricoTipo?.value ||
      "todos";

    /* ===============================
       MOVIMENTAÇÕES DO PERÍODO
       usado nos cards
    =============================== */

    const movimentacoesPeriodo =
      todasMovimentacoes.filter(
        (movimentacao) => {
          const dentroPeriodo =
            movimentacao.data >=
              periodo.inicioTexto &&
            movimentacao.data <=
              periodo.fimTexto;

          const barbeiroCorreto =
            barbeiroSelecionado ===
              "todos" ||
            movimentacao.barbeiro ===
              barbeiroSelecionado;

          return (
            dentroPeriodo &&
            barbeiroCorreto
          );
        }
      );

    /* ===============================
       FILTRO DA LISTA
    =============================== */

    const movimentacoes =
      movimentacoesPeriodo
        .filter((movimentacao) => {
          const tipoCorreto =
            tipoSelecionado ===
              "todos" ||
            tipoSelecionado ===
              "todas" ||
            movimentacao.tipo ===
              tipoSelecionado;

          return tipoCorreto;
        })
        .sort((a, b) => {
          const diferencaData =
            criarDataHora(
              b.data,
              b.hora || "00:00"
            ) -
            criarDataHora(
              a.data,
              a.hora || "00:00"
            );

          if (diferencaData !== 0) {
            return diferencaData;
          }

          /*
            Se a entrada e o desconto forem
            do mesmo horário, o desconto fica
            imediatamente acima.
          */
          return (
            Number(
              b.prioridadeHistorico
            ) || 0
          ) - (
            Number(
              a.prioridadeHistorico
            ) || 0
          );
        });

    /* ===============================
       TOTAIS
    =============================== */

    const entradasPeriodo =
      movimentacoesPeriodo.filter(
        (movimentacao) => {
          return (
            movimentacao.tipo ===
            "entrada"
          );
        }
      );

    const saidasPeriodo =
      movimentacoesPeriodo.filter(
        (movimentacao) => {
          return (
            movimentacao.tipo ===
            "saida"
          );
        }
      );

    const totalEntradas =
      entradasPeriodo.reduce(
        (total, movimentacao) => {
          return (
            total +
            (
              Number(
                movimentacao.valor
              ) || 0
            )
          );
        },
        0
      );

    const totalSaidas =
      saidasPeriodo.reduce(
        (total, movimentacao) => {
          return (
            total +
            (
              Number(
                movimentacao.valor
              ) || 0
            )
          );
        },
        0
      );

    const saldo =
      totalEntradas -
      totalSaidas;

    if (historicoTotalEntradas) {
      historicoTotalEntradas.textContent =
        formatarValorEmReal(
          totalEntradas
        );
    }

    if (historicoTotalSaidas) {
      historicoTotalSaidas.textContent =
        formatarValorEmReal(
          totalSaidas
        );
    }

    if (historicoSaldo) {
      historicoSaldo.textContent =
        formatarValorEmReal(
          saldo
        );
    }

    if (historicoQuantidadeEntradas) {
      historicoQuantidadeEntradas.textContent =
        `${entradasPeriodo.length} movimentação${
          entradasPeriodo.length === 1
            ? ""
            : "ões"
        }`;
    }

    if (historicoQuantidadeSaidas) {
      historicoQuantidadeSaidas.textContent =
        `${saidasPeriodo.length} movimentação${
          saidasPeriodo.length === 1
            ? ""
            : "ões"
        }`;
    }

    if (
      quantidadeMovimentacoesHistorico
    ) {
      quantidadeMovimentacoesHistorico.textContent =
        `${movimentacoes.length} movimentação${
          movimentacoes.length === 1
            ? ""
            : "ões"
        }`;
    }

    /* ===============================
       CRIAR LISTA
    =============================== */

    listaHistoricoFinanceiro.innerHTML =
      "";

    if (
      movimentacoes.length === 0
    ) {
      listaHistoricoFinanceiro.innerHTML = `
        <div class="historico-vazio">
          Nenhuma movimentação encontrada neste período.
        </div>
      `;

      return;
    }

    /* ===============================
       CABEÇALHO DA TABELA
    =============================== */

    const cabecalho =
      document.createElement(
        "div"
      );

    cabecalho.className =
      "cabecalho-tabela-historico";

    cabecalho.innerHTML = `
      <div>Data e hora</div>
      <div>Movimentação</div>
      <div>Barbeiro</div>
      <div>Cliente</div>
      <div>Pagamento</div>
      <div>Valor</div>
      <div>Tipo</div>
    `;

    listaHistoricoFinanceiro.appendChild(
      cabecalho
    );

    /* ===============================
       LINHAS
    =============================== */

    movimentacoes.forEach(
      (movimentacao) => {
        const linha =
          document.createElement(
            "div"
          );

        linha.className =
          `linha-historico ${movimentacao.tipo}`;

        const dataFormatada =
          dataPorTexto(
            movimentacao.data
          ).toLocaleDateString(
            "pt-BR"
          );

        const hora =
          movimentacao.hora ||
          "00:00";

        const descricao =
          movimentacao.descricao ||
          (
            movimentacao.tipo ===
            "entrada"
              ? "Atendimento"
              : "Saída"
          );

        const barbeiro =
          movimentacao.barbeiro ||
          "Barbearia";

        const cliente =
          movimentacao.cliente ||
          "—";

        const pagamento =
          movimentacao.formaPagamento ||
          "—";

        const valor =
          Number(
            movimentacao.valor
          ) || 0;

        const sinal =
          movimentacao.tipo ===
          "saida"
            ? "-"
            : "+";

        const textoTipo =
          movimentacao.tipo ===
          "saida"
            ? "Saída"
            : "Entrada";

        linha.innerHTML = `
          <div class="coluna-historico coluna-data-historico">
            <strong>
              ${dataFormatada}
            </strong>

            <span>
              ${hora}
            </span>
          </div>

          <div class="coluna-historico coluna-movimentacao-historico">
            <strong>
              ${descricao}
            </strong>
          </div>

          <div class="coluna-historico">
            <span>
              ${barbeiro}
            </span>
          </div>

          <div class="coluna-historico coluna-cliente-historico">
            <span>
              ${cliente}
            </span>
          </div>

          <div class="coluna-historico">
            <span>
              ${pagamento}
            </span>
          </div>

          <div class="coluna-historico coluna-valor-historico">
            <strong>
              ${sinal}
              ${formatarValorEmReal(valor)}
            </strong>
          </div>

          <div class="coluna-historico coluna-tipo-historico">
            <span class="indicador-movimento ${movimentacao.tipo}">
              <i></i>
              ${textoTipo}
            </span>
          </div>
        `;

        listaHistoricoFinanceiro.appendChild(
          linha
        );
      }
    );
  } catch (erro) {
    console.log(
      "Erro ao carregar histórico financeiro:",
      erro
    );

    listaHistoricoFinanceiro.innerHTML = `
      <div class="historico-vazio">
        Não foi possível carregar o histórico financeiro.
      </div>
    `;
  }
}

/* =========================================================
   REGISTRAR SAÍDA
========================================================= */

function abrirModalRegistrarSaida() {
  if (
    !usuarioPodeVisualizarFinanceiro() ||
    !modalRegistrarSaida
  ) {
    return;
  }

  formRegistrarSaida?.reset();

  if (mensagemSaida) {
    mensagemSaida.textContent =
      "";
  }

  const agora =
    new Date();

  if (dataSaida) {
    dataSaida.value =
      formatarDataParaSalvar(
        agora
      );
  }

  if (horaSaida) {
    horaSaida.value =
      `${String(agora.getHours()).padStart(2, "0")}:${String(agora.getMinutes()).padStart(2, "0")}`;
  }

  preencherBarbeirosSaida();

  modalRegistrarSaida.classList.remove(
    "escondido"
  );
}

if (valorSaida) {
  valorSaida.addEventListener(
    "input",
    () => {
      formatarCampoValor(
        valorSaida
      );
    }
  );
}

if (
  botaoRegistrarSaida
) {
  botaoRegistrarSaida.addEventListener(
    "click",
    abrirModalRegistrarSaida
  );
}

if (
  formRegistrarSaida
) {
  formRegistrarSaida.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      if (
        !usuarioPodeVisualizarFinanceiro()
      ) {
        return;
      }

      if (mensagemSaida) {
        mensagemSaida.textContent =
          "";
      }

      const descricao =
        descricaoSaida?.value
          .trim() || "";

      const valor =
        converterValorParaNumero(
          valorSaida?.value ||
          ""
        );

      const data =
        dataSaida?.value ||
        formatarDataParaSalvar(
          new Date()
        );

      const hora =
        horaSaida?.value ||
        "00:00";

      const barbeiro =
        barbeiroSaida?.value ||
        "Barbearia";

      if (!descricao) {
        if (mensagemSaida) {
          mensagemSaida.textContent =
            "Digite uma descrição para a saída.";
        }

        descricaoSaida?.focus();

        return;
      }

      if (valor <= 0) {
        if (mensagemSaida) {
          mensagemSaida.textContent =
            "Digite um valor válido para a saída.";
        }

        valorSaida?.focus();

        return;
      }

      try {
        await addDoc(
          collection(
            db,
            "movimentacoesFinanceiras"
          ),
          {
            tipo:
              "saida",

            descricao,

            valor,

            data,

            hora,

            barbeiro,

            criadoPor:
              nomeUsuario,

            usuarioId,

            dataCadastro:
              Date.now()
          }
        );

        if (
          modalRegistrarSaida
        ) {
          modalRegistrarSaida.classList.add(
            "escondido"
          );
        }

        formRegistrarSaida.reset();

        await atualizarHistoricoFinanceiro();
      } catch (erro) {
        console.log(
          "Erro ao registrar saída:",
          erro
        );

        if (mensagemSaida) {
          mensagemSaida.textContent =
            "Não foi possível registrar a saída.";
        }
      }
    }
  );
}

/* =========================================================
   NAVEGAÇÃO DO DESEMPENHO
========================================================= */

botaoMesAnterior.addEventListener(
  "click",
  () => {
    mesRelatorio.setMonth(
      mesRelatorio.getMonth() -
        1
    );

    atualizarRelatorio();
  }
);

botaoProximoMes.addEventListener(
  "click",
  () => {
    mesRelatorio.setMonth(
      mesRelatorio.getMonth() +
        1
    );

    atualizarRelatorio();
  }
);

filtroRelatorioBarbeiro.addEventListener(
  "change",
  atualizarRelatorio
);

filtroSegundoGrafico.addEventListener(
  "change",
  atualizarRelatorio
);

/* =========================================================
   NAVEGAÇÃO FINANCEIRA
========================================================= */

if (
  periodoRelatorioFinanceiro
) {
  periodoRelatorioFinanceiro.addEventListener(
    "change",
    async () => {
      dataFinanceiro =
        new Date();

      await atualizarFinanceiro();
    }
  );
}

if (
  filtroFinanceiroBarbeiro
) {
  filtroFinanceiroBarbeiro.addEventListener(
    "change",
    atualizarFinanceiro
  );
}

if (
  botaoPeriodoFinanceiroAnterior
) {
  botaoPeriodoFinanceiroAnterior.addEventListener(
    "click",
    async () => {
      const periodo =
        periodoRelatorioFinanceiro.value;

      if (
        periodo === "diario"
      ) {
        dataFinanceiro.setDate(
          dataFinanceiro.getDate() -
            1
        );
      } else if (
        periodo === "semanal"
      ) {
        dataFinanceiro.setDate(
          dataFinanceiro.getDate() -
            7
        );
      } else {
        dataFinanceiro.setMonth(
          dataFinanceiro.getMonth() -
            1
        );
      }

      await atualizarFinanceiro();
    }
  );
}

if (
  botaoPeriodoFinanceiroProximo
) {
  botaoPeriodoFinanceiroProximo.addEventListener(
    "click",
    async () => {
      const periodo =
        periodoRelatorioFinanceiro.value;

      if (
        periodo === "diario"
      ) {
        dataFinanceiro.setDate(
          dataFinanceiro.getDate() +
            1
        );
      } else if (
        periodo === "semanal"
      ) {
        dataFinanceiro.setDate(
          dataFinanceiro.getDate() +
            7
        );
      } else {
        dataFinanceiro.setMonth(
          dataFinanceiro.getMonth() +
            1
        );
      }

      await atualizarFinanceiro();
    }
  );
}

/* =========================================================
   NAVEGAÇÃO DO HISTÓRICO
========================================================= */

if (
  periodoRelatorioHistorico
) {
  periodoRelatorioHistorico.addEventListener(
    "change",
    async () => {
      dataHistorico =
        new Date();

      await atualizarHistoricoFinanceiro();
    }
  );
}

if (
  filtroHistoricoBarbeiro
) {
  filtroHistoricoBarbeiro.addEventListener(
    "change",
    atualizarHistoricoFinanceiro
  );
}

if (
  filtroHistoricoTipo
) {
  filtroHistoricoTipo.addEventListener(
    "change",
    atualizarHistoricoFinanceiro
  );
}

if (
  botaoPeriodoHistoricoAnterior
) {
  botaoPeriodoHistoricoAnterior.addEventListener(
    "click",
    async () => {
      const periodo =
        periodoRelatorioHistorico?.value ||
        "mensal";

      if (
        periodo === "diario" ||
        periodo === "dia"
      ) {
        dataHistorico.setDate(
          dataHistorico.getDate() -
            1
        );
      } else if (
        periodo === "semanal" ||
        periodo === "semana"
      ) {
        dataHistorico.setDate(
          dataHistorico.getDate() -
            7
        );
      } else {
        dataHistorico.setMonth(
          dataHistorico.getMonth() -
            1
        );
      }

      await atualizarHistoricoFinanceiro();
    }
  );
}

if (
  botaoPeriodoHistoricoProximo
) {
  botaoPeriodoHistoricoProximo.addEventListener(
    "click",
    async () => {
      const periodo =
        periodoRelatorioHistorico?.value ||
        "mensal";

      if (
        periodo === "diario" ||
        periodo === "dia"
      ) {
        dataHistorico.setDate(
          dataHistorico.getDate() +
            1
        );
      } else if (
        periodo === "semanal" ||
        periodo === "semana"
      ) {
        dataHistorico.setDate(
          dataHistorico.getDate() +
            7
        );
      } else {
        dataHistorico.setMonth(
          dataHistorico.getMonth() +
            1
        );
      }

      await atualizarHistoricoFinanceiro();
    }
  );
}

/* =========================================================
   BOTÕES DAS ABAS
========================================================= */

abaRelatorioDesempenho?.addEventListener(
  "click",
  abrirRelatorioDesempenho
);

abaRelatorioFinanceiro?.addEventListener(
  "click",
  abrirRelatorioFinanceiro
);

abaRelatorioHistorico?.addEventListener(
  "click",
  abrirRelatorioHistorico
);

/* =========================================================
   APAGAR DADOS OPERACIONAIS
========================================================= */

const colecoesOperacionais = [
  "agendamentos",
  "movimentacoesFinanceiras",
  "usosPlanos",
  "clientes",
  "barbeiros",
  "planos",
  "servicos",
  "produtos"
];

async function esvaziarColecaoOperacional(nomeColecao) {
  let quantidadeRemovida = 0;

  while (true) {
    const documentos = await getDocs(
      query(collection(db, nomeColecao), limit(400))
    );

    if (documentos.empty) return quantidadeRemovida;

    const lote = writeBatch(db);
    documentos.docs.forEach((documento) => lote.delete(documento.ref));
    await lote.commit();
    quantidadeRemovida += documentos.size;
  }
}

botaoApagarDados?.addEventListener("click", async () => {
  if (tipoUsuario !== "administrador") {
    mensagemApagarDados.textContent =
      "Somente o administrador pode apagar os dados.";
    return;
  }

  if (confirmacaoApagarDados.value.trim() !== "APAGAR") {
    mensagemApagarDados.textContent =
      "Digite APAGAR exatamente como indicado.";
    confirmacaoApagarDados.focus();
    return;
  }

  const senhaInformada = senhaAdministradorApagarDados.value;
  if (!senhaInformada) {
    mensagemApagarDados.textContent =
      "Digite a senha atual do administrador.";
    senhaAdministradorApagarDados.focus();
    return;
  }

  try {
    const documentoConfiguracao = await getDoc(configuracaoGeral);
    const configuracoes = documentoConfiguracao.exists()
      ? documentoConfiguracao.data()
      : {};
    const senhaAdministradorAtual =
      configuracoes.senhaAdministrador ||
      configuracoes.senha ||
      "tradicao123";

    if (senhaInformada !== senhaAdministradorAtual) {
      mensagemApagarDados.textContent =
        "Senha do administrador incorreta.";
      senhaAdministradorApagarDados.value = "";
      senhaAdministradorApagarDados.focus();
      return;
    }
  } catch (erro) {
    console.log("Erro ao validar senha do administrador:", erro);
    mensagemApagarDados.textContent =
      "Não foi possível validar a senha do administrador.";
    return;
  }

  const confirmou = confirm(
    "Confirma a exclusão permanente de todos os dados operacionais? As senhas do administrador e da recepção serão preservadas."
  );
  if (!confirmou) return;

  botaoApagarDados.disabled = true;
  confirmacaoApagarDados.disabled = true;
  senhaAdministradorApagarDados.disabled = true;
  mensagemApagarDados.textContent = "Iniciando limpeza...";

  try {
    const resumo = [];

    for (const nomeColecao of colecoesOperacionais) {
      mensagemApagarDados.textContent = `Limpando ${nomeColecao}...`;
      const quantidade = await esvaziarColecaoOperacional(nomeColecao);
      resumo.push(`${nomeColecao}: ${quantidade}`);
    }

    mensagemApagarDados.textContent =
      `Limpeza concluída. Registros apagados — ${resumo.join("; ")}. ` +
      "Administrador e recepcionista foram preservados. Atualize a página para começar.";
    confirmacaoApagarDados.value = "";
    senhaAdministradorApagarDados.value = "";
  } catch (erro) {
    console.log("Erro ao apagar dados operacionais:", erro);
    mensagemApagarDados.textContent =
      "A limpeza foi interrompida. Tente novamente para concluir os dados restantes.";
    botaoApagarDados.disabled = false;
    confirmacaoApagarDados.disabled = false;
    senhaAdministradorApagarDados.disabled = false;
  }
});

/* =========================================================
   TEMA
========================================================= */

opcoesTema.forEach(
  (opcao) => {
    opcao.addEventListener(
      "change",
      async () => {
        try {
          await setDoc(
            configuracaoGeral,
            {
              tema:
                opcao.value
            },
            {
              merge:
                true
            }
          );

          mensagemTema.textContent =
            "Tema atualizado com sucesso.";
        } catch (erro) {
          console.log(
            erro
          );

          mensagemTema.textContent =
            "Não foi possível salvar o tema.";
        }
      }
    );
  }
);

/* =========================================================
   ALTERAR SENHA
========================================================= */

formAlterarSenha.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    mensagemSenha.textContent =
      "";

    const selecionado =
      usuarioAlterarSenha.value;

    const senha =
      novaSenha.value.trim();

    const confirmacao =
      confirmarNovaSenha.value.trim();

    if (!selecionado) {
      mensagemSenha.textContent =
        "Selecione o usuário.";

      return;
    }

    if (
      senha.length < 4
    ) {
      mensagemSenha.textContent =
        "A senha precisa ter pelo menos 4 caracteres.";

      return;
    }

    if (
      senha !== confirmacao
    ) {
      mensagemSenha.textContent =
        "As duas senhas não são iguais.";

      return;
    }

    if (
      tipoUsuario !==
        "administrador" &&
      selecionado !==
        usuarioId
    ) {
      mensagemSenha.textContent =
        "Você só pode alterar a sua própria senha.";

      return;
    }

    try {
      if (
        selecionado ===
        "administrador"
      ) {
        if (
          tipoUsuario !==
          "administrador"
        ) {
          return;
        }

        await setDoc(
          configuracaoGeral,
          {
            senhaAdministrador:
              senha
          },
          {
            merge:
              true
          }
        );

        mensagemSenha.textContent =
          "Senha do administrador alterada com sucesso.";
      } else if (
        selecionado ===
        "recepcionista"
      ) {
        if (
          tipoUsuario !==
            "administrador" &&
          tipoUsuario !==
            "recepcionista"
        ) {
          return;
        }

        await setDoc(
          configuracaoGeral,
          {
            senhaRecepcionista:
              senha
          },
          {
            merge:
              true
          }
        );

        mensagemSenha.textContent =
          "Senha da recepcionista alterada com sucesso.";
      } else {
        const barbeiro =
          barbeiros.find(
            (item) =>
              item.id ===
              selecionado
          );

        if (!barbeiro) {
          mensagemSenha.textContent =
            "Barbeiro não encontrado.";

          return;
        }

        if (
          tipoUsuario !==
            "administrador" &&
          usuarioId !==
            barbeiro.id
        ) {
          mensagemSenha.textContent =
            "Você só pode alterar a sua própria senha.";

          return;
        }

        await updateDoc(
          doc(
            db,
            "barbeiros",
            barbeiro.id
          ),
          {
            senha
          }
        );

        mensagemSenha.textContent =
          `Senha de ${barbeiro.nome} alterada com sucesso.`;
      }

      novaSenha.value =
        "";

      confirmarNovaSenha.value =
        "";

      if (
        tipoUsuario ===
        "administrador"
      ) {
        usuarioAlterarSenha.value =
          "";
      }
    } catch (erro) {
      console.log(
        erro
      );

      mensagemSenha.textContent =
        "Não foi possível alterar a senha.";
    }
  }
);

/* =========================================================
   SINCRONIZAÇÃO DO TEMA
========================================================= */

onSnapshot(
  configuracaoGeral,

  (documento) => {
    const configuracoes =
      documento.exists()
        ? documento.data()
        : {};

    aplicarTema(
      configuracoes.tema ||
      "escuro"
    );

    if (
      !telaRelatorio.classList.contains(
        "escondida"
      )
    ) {
      if (
        conteudoRelatorioFinanceiro &&
        !conteudoRelatorioFinanceiro.classList.contains(
          "escondida"
        )
      ) {
        atualizarFinanceiro();
      } else if (
        conteudoRelatorioHistorico &&
        !conteudoRelatorioHistorico.classList.contains(
          "escondida"
        )
      ) {
        atualizarHistoricoFinanceiro();
      } else {
        atualizarRelatorio();
      }
    }
  },

  (erro) => {
    console.log(
      "Erro ao carregar configurações:",
      erro
    );

    aplicarTema(
      "escuro"
    );
  }
);

/* =========================================================
   ZOOM
========================================================= */

function atualizarBotoesZoom() {
  botaoDiminuirZoom.disabled =
    zoomAgenda <=
    ZOOM_MINIMO;

  botaoAumentarZoom.disabled =
    zoomAgenda >=
    ZOOM_MAXIMO;
}

function alterarZoom(valor) {
  const novoZoom =
    Math.min(
      ZOOM_MAXIMO,
      Math.max(
        ZOOM_MINIMO,
        zoomAgenda +
          valor
      )
    );

  if (
    novoZoom ===
    zoomAgenda
  ) {
    return;
  }

  const horizontal =
    agendaScroll.scrollLeft;

  const vertical =
    agendaScroll.scrollTop;

  zoomAgenda =
    Number(
      novoZoom.toFixed(
        2
      )
    );

  mostrarAgenda();

  agendaScroll.scrollLeft =
    horizontal;

  agendaScroll.scrollTop =
    vertical;

  atualizarBotoesZoom();
}

botaoDiminuirZoom.addEventListener(
  "click",
  () => {
    alterarZoom(
      -PASSO_ZOOM
    );
  }
);

botaoAumentarZoom.addEventListener(
  "click",
  () => {
    alterarZoom(
      PASSO_ZOOM
    );
  }
);

/* =========================================================
   FECHAR MODAIS
========================================================= */

document
  .querySelectorAll(
    "[data-fechar]"
  )
  .forEach(
    (botao) => {
      botao.addEventListener(
        "click",
        () => {
          fecharModal(
            botao.dataset.fechar
          );
        }
      );
    }
  );

/* =========================================================
   SAIR
========================================================= */

if (
  botaoConfirmarSair
) {
  botaoConfirmarSair.addEventListener(
    "click",
    () => {
      sessionStorage.clear();

      window.location.href =
        "index.html";
    }
  );
}

/* =========================================================
   INICIALIZAÇÃO
========================================================= */

async function iniciarDashboard() {
  montarMenu();

  criarPrimeirosDias();

  atualizarBotoesZoom();

  boasVindas.textContent =
    `Boas-vindas, ${nomeUsuario}!`;

  try {
    await carregarBarbeiros();

    if (
      usuarioPodeVisualizarTodasAgendas()
    ) {
      escolherBarbeiro.classList.add(
        "ativo"
      );

      preencherSelectDeBarbeiros();

      textoAgenda.textContent =
        "Escolha um barbeiro para ver a agenda.";

      barbeiroAtual =
        "";

      agendamentos =
        [];

      mostrarAgenda();
    } else {
      escolherBarbeiro.classList.remove(
        "ativo"
      );

      barbeiroAtual =
        nomeUsuario;

      textoAgenda.textContent =
        `Sua agenda: ${barbeiroAtual}.`;

      await atualizarAgenda();
    }
  } catch (erro) {
    textoAgenda.textContent =
      "Não foi possível conectar ao Firebase.";

    console.log(
      "Erro ao iniciar o dashboard:",
      erro
    );
  }
}

function adicionarCampoServico() {

  const container =
    document.querySelector(
      "#container-servicos-atendimento"
    );

  const linha =
    document.createElement("div");

  linha.className =
    "linha-selecao-atendimento";


  const select =
    document.createElement("select");

  select.className =
    "select-servico-atendimento";


  select.innerHTML = `
    <option value="">
      Selecione outro serviço
    </option>
  `;


  servicos.forEach((servico) => {

    const opcao =
      document.createElement("option");

    opcao.value =
      servico.id;

    opcao.textContent =
      `${servico.nome} — ${formatarValorEmReal(servico.valor)}`;

    select.appendChild(
      opcao
    );
  });


  const remover =
    document.createElement("button");

  remover.type =
    "button";

  remover.className =
    "botao-remover-item-atendimento";

  remover.textContent =
    "×";


  select.addEventListener(
    "change",
    atualizarValoresConclusao
  );


  remover.addEventListener(
    "click",
    () => {

      linha.remove();

      atualizarValoresConclusao();
    }
  );


  linha.append(
    select,
    remover
  );


  container.appendChild(
    linha
  );
}

function adicionarCampoProduto() {

  const container =
    document.querySelector(
      "#container-produtos-atendimento"
    );

  const linha =
    document.createElement("div");

  linha.className =
    "linha-selecao-atendimento";


  const select =
    document.createElement("select");

  select.className =
    "select-produto-atendimento";


  select.innerHTML = `
    <option value="">
      Selecione outro produto
    </option>
  `;


  produtos.forEach((produto) => {

    const opcao =
      document.createElement("option");

    opcao.value =
      produto.id;

    opcao.textContent =
      `${produto.nome} — ${formatarValorEmReal(produto.valor)}`;

    select.appendChild(
      opcao
    );
  });


  const remover =
    document.createElement("button");

  remover.type =
    "button";

  remover.className =
    "botao-remover-item-atendimento";

  remover.textContent =
    "×";


  select.addEventListener(
    "change",
    atualizarValoresConclusao
  );


  remover.addEventListener(
    "click",
    () => {

      linha.remove();

      atualizarValoresConclusao();
    }
  );


  linha.append(
    select,
    remover
  );


  container.appendChild(
    linha
  );
}

document
  .querySelector(
    "#adicionar-servico-atendimento"
  )
  .addEventListener(
    "click",
    adicionarCampoServico
  );


document
  .querySelector(
    "#adicionar-produto-atendimento"
  )
  .addEventListener(
    "click",
    adicionarCampoProduto
  );

/* =========================================================
   EVENTOS DOS PLANOS
========================================================= */

if (botaoMostrarCadastroPlano) {
  botaoMostrarCadastroPlano.addEventListener("click", async () => {
    limparFormularioPlano();
    await carregarServicos();
    preencherServicosDoPlano();
    formCadastroPlano.classList.toggle("escondida");
  });
}

if (cancelarEdicaoPlano) {
  cancelarEdicaoPlano.addEventListener("click", () => {
    limparFormularioPlano();
    formCadastroPlano.classList.add("escondida");
  });
}

if (valorNovoPlano) {
  valorNovoPlano.addEventListener("input", () => {
    formatarCampoValor(valorNovoPlano);
  });
}

if (pesquisaPlano) {
  pesquisaPlano.addEventListener("input", mostrarListaDePlanos);
}

if (formCadastroPlano) {
  formCadastroPlano.addEventListener("submit", async (event) => {
    event.preventDefault();
    mensagemPlano.textContent = "";

    if (!usuarioPodeGerenciarPlanos()) {
      mensagemPlano.textContent = "Você não tem permissão para alterar planos.";
      return;
    }

    const nome = nomeNovoPlano.value.trim();
    const valor = converterValorParaNumero(valorNovoPlano.value);
    const servicoId = servicoNovoPlano.value;
    const usosMensais = Number(usosNovoPlano.value);
    const servico = servicos.find((item) => item.id === servicoId);

    if (!nome || valor <= 0 || !servico || !Number.isInteger(usosMensais) || usosMensais <= 0) {
      mensagemPlano.textContent = "Preencha corretamente os dados do plano.";
      return;
    }

    const idEdicao = planoIdEdicao.value;
    const planoAnterior = planos.find((plano) => plano.id === idEdicao);

    const dados = {
      nome,
      valor,
      servicoId: servico.id,
      servicoNome: servico.nome,
      usosMensais,
      clientesIds: Array.isArray(planoAnterior?.clientesIds)
        ? planoAnterior.clientesIds
        : [],
      clientesPlano: Array.isArray(planoAnterior?.clientesPlano)
        ? planoAnterior.clientesPlano
        : [],
      ativo: true,
      atualizadoEm: Date.now()
    };

    try {
      if (idEdicao) {
        await updateDoc(doc(db, "planos", idEdicao), dados);
        mensagemPlano.textContent = "Plano atualizado com sucesso.";
      } else {
        await addDoc(collection(db, "planos"), {
          ...dados,
          dataCadastro: Date.now(),
          criadoPor: nomeUsuario
        });
        mensagemPlano.textContent = "Plano criado com sucesso.";
      }

      await carregarPlanos();
      mostrarListaDePlanos();
      limparFormularioPlano();
      formCadastroPlano.classList.add("escondida");
    } catch (erro) {
      console.log("Erro ao salvar plano:", erro);
      mensagemPlano.textContent = "Não foi possível salvar o plano.";
    }
  });
}

if (botaoPlanoSemExtras) {
  botaoPlanoSemExtras.addEventListener("click", finalizarAtendimentoSomentePlano);
}

if (botaoPlanoComExtras) {
  botaoPlanoComExtras.addEventListener("click", async () => {
    atendimentoPeloPlano = true;
    atendimentoPlanoComExtras = true;
    fecharModal("modal-extras-plano");
    await abrirConclusaoAtendimento(true);
  });
}

iniciarDashboard();
