import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  setDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const nomeUsuario = sessionStorage.getItem("nomeUsuario");
const tipoUsuario = sessionStorage.getItem("tipoUsuario");

const menu = document.querySelector("#menu");
const boasVindas = document.querySelector("#boas-vindas");
const escolherBarbeiro = document.querySelector("#escolher-barbeiro");
const selectBarbeiro = document.querySelector("#select-barbeiro");

const telaDashboard = document.querySelector("#tela-dashboard");
const telaBarbeiros = document.querySelector("#tela-barbeiros");
const telaClientes = document.querySelector("#tela-clientes");
const telaConfiguracoes = document.querySelector("#tela-configuracoes");

const textoAgenda = document.querySelector("#texto-agenda");
const agenda = document.querySelector("#agenda");
const agendaScroll = document.querySelector("#agenda-scroll");

const botaoDiminuirZoom = document.querySelector("#diminuir-zoom");
const botaoAumentarZoom = document.querySelector("#aumentar-zoom");

const modalNovo = document.querySelector("#modal-novo");
const modalDetalhes = document.querySelector("#modal-detalhes");

const formAgendamento = document.querySelector("#form-agendamento");
const dataAgendamento = document.querySelector("#data-agendamento");
const horaAgendamento = document.querySelector("#hora-agendamento");
const pesquisaClienteAgendamento = document.querySelector(
  "#pesquisa-cliente-agendamento"
);

const botaoConcluirAgendamento = document.querySelector(
  "#concluir-agendamento"
);

const listaClientesAgendamento = document.querySelector(
  "#lista-clientes-agendamento"
);
const informacaoHorario = document.querySelector("#informacao-horario");

const detalheCliente = document.querySelector("#detalhe-cliente");
const detalheData = document.querySelector("#detalhe-data");
const detalheHora = document.querySelector("#detalhe-hora");
const botaoCancelarAgendamento = document.querySelector(
  "#cancelar-agendamento"
);

const botaoMostrarCadastroBarbeiro = document.querySelector(
  "#botao-mostrar-cadastro-barbeiro"
);
const formCadastroBarbeiro = document.querySelector(
  "#form-cadastro-barbeiro"
);
const nomeNovoBarbeiro = document.querySelector("#nome-novo-barbeiro");
const pesquisaBarbeiro = document.querySelector("#pesquisa-barbeiro");
const mensagemBarbeiro = document.querySelector("#mensagem-barbeiro");
const listaGerenciarBarbeiros = document.querySelector(
  "#lista-gerenciar-barbeiros"
);

const botaoMostrarCadastroCliente = document.querySelector(
  "#botao-mostrar-cadastro-cliente"
);

const botaoNaoRealizadoAgendamento = document.querySelector(
  "#nao-realizado-agendamento"
);

const formCadastroCliente = document.querySelector("#form-cadastro-cliente");
const nomeNovoCliente = document.querySelector("#nome-novo-cliente");
const celularNovoCliente = document.querySelector("#celular-novo-cliente");
const pesquisaCliente = document.querySelector("#pesquisa-cliente");
const mensagemCliente = document.querySelector("#mensagem-cliente");
const listaGerenciarClientes = document.querySelector(
  "#lista-gerenciar-clientes"
);

const telaRelatorio = document.querySelector("#tela-relatorio");
const filtroRelatorioBarbeiro = document.querySelector(
  "#filtro-relatorio-barbeiro"
);
const botaoMesAnterior = document.querySelector("#mes-anterior");
const botaoProximoMes = document.querySelector("#proximo-mes");
const tituloCalendario = document.querySelector("#titulo-calendario");
const calendarioRelatorio = document.querySelector("#calendario-relatorio");

const filtroSegundoGrafico = document.querySelector(
  "#filtro-segundo-grafico"
);

const tituloSegundoGrafico = document.querySelector(
  "#titulo-segundo-grafico"
);

const configuracaoSenha = document.querySelector("#configuracao-senha");
const formAlterarSenha = document.querySelector("#form-alterar-senha");
const novaSenha = document.querySelector("#nova-senha");
const confirmarNovaSenha = document.querySelector("#confirmar-nova-senha");
const mensagemSenha = document.querySelector("#mensagem-senha");
const mensagemTema = document.querySelector("#mensagem-tema");
const opcoesTema = document.querySelectorAll('input[name="tema"]');
const configuracaoGeral = doc(db, "configuracoes", "geral");

const modalSair = document.querySelector("#modal-sair");
const botaoConfirmarSair = document.querySelector("#confirmar-sair");

let graficoStatus = null;
let mesRelatorio = new Date();

let barbeiroAtual = "";
let barbeiros = [];
let clientes = [];
let agendamentos = [];
let dias = [];
let agendamentoSelecionado = null;
let clienteSelecionado = null;

let zoomAgenda = 1;

const ZOOM_MINIMO = 0.7;
const ZOOM_MAXIMO = 1.6;
const PASSO_ZOOM = 0.15;

if (!nomeUsuario || !tipoUsuario) {
  window.location.href = "index.html";
}

function criarHorarios() {
  const horarios = [];
  let minutos = 8 * 60 + 30;
  const ultimoHorario = 20 * 60;

  while (minutos <= ultimoHorario) {
    const hora = String(Math.floor(minutos / 60)).padStart(2, "0");
    const minuto = String(minutos % 60).padStart(2, "0");

    horarios.push(`${hora}:${minuto}`);
    minutos += 30;
  }

  return horarios;
}

const horarios = criarHorarios();

function formatarDataParaSalvar(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function formatarDataParaMostrar(data) {
  return data.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function dataPorTexto(dataTexto) {
  const partes = dataTexto.split("-");
  return new Date(partes[0], partes[1] - 1, partes[2]);
}

function criarPrimeirosDias() {
  const hoje = new Date();

  hoje.setHours(0, 0, 0, 0);

  for (let numero = 0; numero < 21; numero++) {
    const novoDia = new Date(hoje);

    novoDia.setDate(hoje.getDate() + numero);

    dias.push(novoDia);
  }
}

function adicionarMaisDias() {
  const ultimoDia = dias[dias.length - 1];

  for (let numero = 1; numero <= 14; numero++) {
    const novoDia = new Date(ultimoDia);

    novoDia.setDate(ultimoDia.getDate() + numero);

    dias.push(novoDia);
  }
}

function marcarBotaoAtivo(nomeDoBotao) {
  document.querySelectorAll(".botao-menu").forEach((botao) => {
    botao.classList.toggle("ativo", botao.textContent === nomeDoBotao);
  });
}

function abrirTelaDashboard() {
  telaDashboard.classList.remove("escondida");
  telaBarbeiros.classList.add("escondida");
  telaClientes.classList.add("escondida");
  telaRelatorio.classList.add("escondida");
  telaConfiguracoes.classList.add("escondida");

  marcarBotaoAtivo("Dashboard");
}

async function abrirTelaBarbeiros() {
  telaDashboard.classList.add("escondida");
  telaClientes.classList.add("escondida");
  telaRelatorio.classList.add("escondida");
  telaConfiguracoes.classList.add("escondida");
  telaBarbeiros.classList.remove("escondida");

  marcarBotaoAtivo("Barbeiros");

  formCadastroBarbeiro.classList.add("escondida");
  mensagemBarbeiro.textContent = "";
  pesquisaBarbeiro.value = "";

  await carregarBarbeiros();
  mostrarListaDeBarbeiros();
}

async function abrirTelaClientes() {
  telaDashboard.classList.add("escondida");
  telaBarbeiros.classList.add("escondida");
  telaRelatorio.classList.add("escondida");
  telaConfiguracoes.classList.add("escondida");
  telaClientes.classList.remove("escondida");

  marcarBotaoAtivo("Clientes cadastrados");

  formCadastroCliente.classList.add("escondida");
  mensagemCliente.textContent = "";
  pesquisaCliente.value = "";

  await carregarClientes();
  mostrarListaDeClientes();
}

function aplicarTema(tema) {
  const temaClaro = tema === "claro";

  document.body.classList.toggle("tema-claro", temaClaro);

  opcoesTema.forEach((opcao) => {
    opcao.checked = opcao.value === (temaClaro ? "claro" : "escuro");
  });
}

function abrirTelaConfiguracoes() {
  telaDashboard.classList.add("escondida");
  telaBarbeiros.classList.add("escondida");
  telaClientes.classList.add("escondida");
  telaRelatorio.classList.add("escondida");
  telaConfiguracoes.classList.remove("escondida");

  configuracaoSenha.classList.toggle(
    "escondida",
    tipoUsuario !== "administrador"
  );

  mensagemTema.textContent = "";
  mensagemSenha.textContent = "";
  marcarBotaoAtivo("Configurações");
}

function montarMenu() {
  const botoesAdministrador = [
    "Dashboard",
    "Clientes cadastrados",
    "Relatório",
    "Barbeiros",
    "Configurações",
    "Sair"
  ];

  const botoesBarbeiro = [
    "Dashboard",
    "Clientes cadastrados",
    "Relatório",
    "Configurações",
    "Sair"
  ];

  const botoes = tipoUsuario === "administrador"
    ? botoesAdministrador
    : botoesBarbeiro;

  botoes.forEach((nomeBotao) => {
    const botao = document.createElement("button");

    botao.type = "button";
    botao.className = "botao-menu";
    botao.textContent = nomeBotao;

    if (nomeBotao === "Dashboard") {
      botao.classList.add("ativo");
    }

    botao.addEventListener("click", async () => {
      if (nomeBotao === "Sair") {
        if (modalSair) {
          modalSair.classList.remove("escondido");
        } else {
          sessionStorage.clear();
          window.location.href = "index.html";
        }

        return;
      }

      if (nomeBotao === "Dashboard") {
        abrirTelaDashboard();
        return;
      }

      if (nomeBotao === "Barbeiros") {
        await abrirTelaBarbeiros();
        return;
      }

      if (nomeBotao === "Clientes cadastrados") {
        await abrirTelaClientes();
        return;
      }

      if (nomeBotao === "Relatório") {
        await abrirTelaRelatorio();
        return;
      }

      if (nomeBotao === "Configurações") {
        abrirTelaConfiguracoes();
        return;
      }

      alert(`A página "${nomeBotao}" será criada na próxima etapa.`);
    });

    menu.appendChild(botao);
  });
}

async function carregarBarbeiros() {
  const resposta = await getDocs(collection(db, "barbeiros"));

  barbeiros = resposta.docs.map((documento) => {
    return {
      id: documento.id,
      ...documento.data()
    };
  });
}

async function carregarClientes() {
  const resposta = await getDocs(collection(db, "clientes"));

  clientes = resposta.docs.map((documento) => {
    return {
      id: documento.id,
      ...documento.data()
    };
  });
}

function preencherSelectDeBarbeiros() {
  selectBarbeiro.innerHTML =
    '<option value="">Escolha um barbeiro</option>';

  barbeiros.forEach((barbeiro) => {
    const opcao = document.createElement("option");

    opcao.value = barbeiro.nome;
    opcao.textContent = barbeiro.nome;

    selectBarbeiro.appendChild(opcao);
  });
}

function mostrarClientesNoAgendamento() {
  const pesquisa = pesquisaClienteAgendamento.value
    .trim()
    .toLowerCase();

  const clientesFiltrados = [...clientes]
    .sort((clienteA, clienteB) => {
      return clienteA.nome.localeCompare(clienteB.nome, "pt-BR");
    })
    .filter((cliente) => {
      return cliente.nome.toLowerCase().includes(pesquisa);
    });

  listaClientesAgendamento.innerHTML = "";

  if (clientesFiltrados.length === 0) {
    listaClientesAgendamento.innerHTML = `
      <p class="cliente-nao-encontrado">
        Nenhum cliente encontrado.
      </p>
    `;
    return;
  }

  clientesFiltrados.forEach((cliente) => {
    const botao = document.createElement("button");

    botao.type = "button";
    botao.className = "opcao-cliente-agendamento";
    botao.textContent = cliente.nome;

    if (clienteSelecionado && clienteSelecionado.id === cliente.id) {
      botao.classList.add("selecionado");
    }

    botao.addEventListener("click", () => {
      clienteSelecionado = cliente;
      pesquisaClienteAgendamento.value = cliente.nome;

      mostrarClientesNoAgendamento();
    });

    listaClientesAgendamento.appendChild(botao);
  });
}

async function carregarAgendamentos() {
  if (!barbeiroAtual) {
    agendamentos = [];
    return;
  }

  const resposta = await getDocs(collection(db, "agendamentos"));

  agendamentos = resposta.docs
    .map((documento) => {
      return {
        id: documento.id,
        ...documento.data()
      };
    })
    .filter((agendamento) => {
  return (
    agendamento.barbeiro === barbeiroAtual &&
    agendamento.status !== "cancelado"
  );
 });
}

function encontrarAgendamento(data, hora) {
  return agendamentos.find((agendamento) => {
    return agendamento.data === data && agendamento.hora === hora;
  });
}

function mostrarAgenda() {
  const grade = document.createElement("div");

  grade.className = "grade-agenda";
  const larguraHorario = Math.round(82 * zoomAgenda);
  const larguraColuna = Math.round(155 * zoomAgenda);
  const alturaCabecalho = Math.round(50 * zoomAgenda);
  const alturaLinha = Math.round(74 * zoomAgenda);
  const tamanhoTexto = Math.round(13 * zoomAgenda);

  grade.style.gridTemplateColumns =
    `${larguraHorario}px repeat(${dias.length}, ${larguraColuna}px)`;

  grade.style.setProperty("--largura-coluna", `${larguraColuna}px`);
  grade.style.setProperty("--altura-cabecalho", `${alturaCabecalho}px`);
  grade.style.setProperty("--altura-linha", `${alturaLinha}px`);
  grade.style.setProperty("--tamanho-texto", `${tamanhoTexto}px`);

  const canto = document.createElement("div");
  canto.className = "canto-horario";
  grade.appendChild(canto);

  dias.forEach((dia) => {
    const cabecalhoDia = document.createElement("div");

    cabecalhoDia.className = "dia-cabecalho";
    cabecalhoDia.textContent = formatarDataParaMostrar(dia);

    grade.appendChild(cabecalhoDia);
  });

  horarios.forEach((hora) => {
    const horario = document.createElement("div");

    horario.className = "horario";
    horario.textContent = hora;

    grade.appendChild(horario);

    dias.forEach((dia) => {
      const data = formatarDataParaSalvar(dia);
      const agendamento = encontrarAgendamento(data, hora);

      const celula = document.createElement("div");

      celula.className = "celula-horario";

      if (agendamento) {
        celula.classList.add("ocupado");

        if (agendamento.status === "concluido") {
        celula.classList.add("concluido");
        }

        if (
        agendamento.status === "cancelado" ||
        agendamento.status === "nao_realizado"
        ) {
        celula.classList.add("nao-realizado");
        }

        const nome = document.createElement("span");
        nome.className = "nome-agendamento";
        nome.textContent = agendamento.cliente;

        const tipo = document.createElement("span");
        tipo.className = "tipo-agendamento-grade";
        tipo.textContent = agendamento.tipo || "Horário marcado";

        celula.appendChild(nome);
        celula.appendChild(tipo);

        celula.addEventListener("click", () => {
          abrirDetalhes(agendamento);
        });
      } else {
        celula.addEventListener("click", async () => {
          if (!barbeiroAtual) {
            alert("Escolha um barbeiro antes de criar um agendamento.");
            return;
          }

          await abrirNovoAgendamento(data, hora);
        });
      }

      grade.appendChild(celula);
    });
  });

  agenda.innerHTML = "";
  agenda.appendChild(grade);
}

async function abrirNovoAgendamento(data, hora) {
  await carregarClientes();
  clienteSelecionado = null;
    pesquisaClienteAgendamento.value = "";
    document.querySelector(
    'input[name="tipo-agendamento"][value="Horário marcado"]'
    ).checked = true;
    mostrarClientesNoAgendamento();

    if (clientes.length === 0)  {
    alert("Cadastre um cliente antes de criar um agendamento.");
    return;
  }

  dataAgendamento.value = data;
  horaAgendamento.value = hora;

  const dataFormatada = dataPorTexto(data).toLocaleDateString("pt-BR");

  informacaoHorario.textContent = `${dataFormatada} às ${hora}`;
  modalNovo.classList.remove("escondido");
}

function abrirDetalhes(agendamento) {
  agendamentoSelecionado = agendamento;

  detalheCliente.textContent = agendamento.cliente;
  detalheData.textContent = dataPorTexto(agendamento.data).toLocaleDateString(
    "pt-BR"
  );
  detalheHora.textContent = agendamento.hora;

  modalDetalhes.classList.remove("escondido");
}

function fecharModal(idModal) {
  document.querySelector(`#${idModal}`).classList.add("escondido");
}

async function atualizarAgenda() {
  await carregarAgendamentos();
  mostrarAgenda();
}

function mostrarListaDeBarbeiros() {
  const pesquisa = pesquisaBarbeiro.value.trim().toLowerCase();

  const barbeirosFiltrados = barbeiros.filter((barbeiro) => {
    return barbeiro.nome.toLowerCase().includes(pesquisa);
  });

  listaGerenciarBarbeiros.innerHTML = "";

  if (barbeirosFiltrados.length === 0) {
    listaGerenciarBarbeiros.innerHTML =
      '<p class="lista-vazia">Nenhum barbeiro encontrado.</p>';
    return;
  }

  barbeirosFiltrados.forEach((barbeiro) => {
    const linha = document.createElement("div");
    linha.className = "item-lista";

    const nome = document.createElement("strong");
    nome.textContent = barbeiro.nome;

    const botaoExcluir = document.createElement("button");
    botaoExcluir.type = "button";
    botaoExcluir.className = "botao-excluir";
    botaoExcluir.textContent = "Excluir";

    botaoExcluir.addEventListener("click", async () => {
      const resposta = await getDocs(collection(db, "agendamentos"));

      const temHorarioMarcado = resposta.docs.some((documento) => {
        return documento.data().barbeiro === barbeiro.nome;
      });

      if (temHorarioMarcado) {
        mensagemBarbeiro.textContent =
          "Não é possível excluir este barbeiro porque ele tem horário marcado.";
        return;
      }

      if (!confirm(`Deseja excluir o barbeiro ${barbeiro.nome}?`)) {
        return;
      }

      await deleteDoc(doc(db, "barbeiros", barbeiro.id));

      mensagemBarbeiro.textContent =
        `${barbeiro.nome} foi excluído com sucesso.`;

      await carregarBarbeiros();
      preencherSelectDeBarbeiros();
      mostrarListaDeBarbeiros();
    });

    linha.appendChild(nome);
    linha.appendChild(botaoExcluir);

    listaGerenciarBarbeiros.appendChild(linha);
  });
}

function mostrarListaDeClientes() {
  const pesquisa = pesquisaCliente.value.trim().toLowerCase();

  const clientesFiltrados = clientes.filter((cliente) => {
    return (
      cliente.nome.toLowerCase().includes(pesquisa) ||
      cliente.celular.includes(pesquisa)
    );
  });

  listaGerenciarClientes.innerHTML = "";

  if (clientesFiltrados.length === 0) {
    listaGerenciarClientes.innerHTML =
      '<p class="lista-vazia">Nenhum cliente encontrado.</p>';
    return;
  }

  clientesFiltrados.forEach((cliente) => {
    const linha = document.createElement("div");
    linha.className = "item-lista";

    const informacoes = document.createElement("div");

    const nome = document.createElement("strong");
    nome.textContent = cliente.nome;

    const celular = document.createElement("small");
    celular.textContent = cliente.celular;

    informacoes.appendChild(nome);
    informacoes.appendChild(celular);

    const botaoExcluir = document.createElement("button");
    botaoExcluir.type = "button";
    botaoExcluir.className = "botao-excluir";
    botaoExcluir.textContent = "Excluir";

    botaoExcluir.addEventListener("click", async () => {
      const resposta = await getDocs(collection(db, "agendamentos"));

      const temHorarioMarcado = resposta.docs.some((documento) => {
        const agendamento = documento.data();

        return (
          agendamento.clienteId === cliente.id ||
          agendamento.cliente === cliente.nome
        );
      });

      if (temHorarioMarcado) {
        mensagemCliente.textContent =
          "Não é possível excluir este cliente porque ele tem horário marcado.";
        return;
      }

      if (!confirm(`Deseja excluir o cliente ${cliente.nome}?`)) {
        return;
      }

      await deleteDoc(doc(db, "clientes", cliente.id));

      mensagemCliente.textContent =
        `${cliente.nome} foi excluído com sucesso.`;

      await carregarClientes();
      mostrarListaDeClientes();
    });

    linha.appendChild(informacoes);
    linha.appendChild(botaoExcluir);

    listaGerenciarClientes.appendChild(linha);
  });
}

formAgendamento.addEventListener("submit", async (event) => {
  event.preventDefault();

  const clienteEscolhido = clienteSelecionado;

  if (!clienteEscolhido) {
    alert("Escolha um cliente.");
    return;
  }

  try {
   const tipoEscolhido = document.querySelector(
  'input[name="tipo-agendamento"]:checked'
    ).value;

   await addDoc(collection(db, "agendamentos"), {
    barbeiro: barbeiroAtual,
    cliente: clienteEscolhido.nome,
    clienteId: clienteEscolhido.id,
    tipo: tipoEscolhido,
    status: "pendente",
    data: dataAgendamento.value,
    hora: horaAgendamento.value
    });

    fecharModal("modal-novo");
    await atualizarAgenda();
  } catch (erro) {
    alert("Não foi possível salvar o agendamento.");
    console.log(erro);
  }
});

botaoCancelarAgendamento.addEventListener("click", async () => {
  if (!agendamentoSelecionado) {
    return;
  }

  await updateDoc(
    doc(db, "agendamentos", agendamentoSelecionado.id),
    {
      status: "cancelado"
    }
  );

  fecharModal("modal-detalhes");
  await atualizarAgenda();
});

botaoMostrarCadastroBarbeiro.addEventListener("click", () => {
  formCadastroBarbeiro.classList.toggle("escondida");

  if (!formCadastroBarbeiro.classList.contains("escondida")) {
    nomeNovoBarbeiro.focus();
  }
});

formCadastroBarbeiro.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nome = nomeNovoBarbeiro.value.trim();

  if (barbeiros.some((barbeiro) => barbeiro.nome.toLowerCase() === nome.toLowerCase())) {
    mensagemBarbeiro.textContent = "Esse barbeiro já está cadastrado.";
    return;
  }

  await addDoc(collection(db, "barbeiros"), { nome: nome });

  nomeNovoBarbeiro.value = "";
  mensagemBarbeiro.textContent = `${nome} foi cadastrado com sucesso.`;

  await carregarBarbeiros();
  preencherSelectDeBarbeiros();
  mostrarListaDeBarbeiros();
});

botaoMostrarCadastroCliente.addEventListener("click", () => {
  formCadastroCliente.classList.toggle("escondida");

  if (!formCadastroCliente.classList.contains("escondida")) {
    nomeNovoCliente.focus();
  }
});

function formatarCelular(valor) {
  const numeros = valor.replace(/\D/g, "").slice(0, 11);

  if (numeros.length <= 2) {
    return numeros;
  }

  if (numeros.length <= 7) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  }

  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
}

celularNovoCliente.addEventListener("input", () => {
  celularNovoCliente.value = formatarCelular(celularNovoCliente.value);
});

formCadastroCliente.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nome = nomeNovoCliente.value.trim();
  const celular = celularNovoCliente.value.trim();
  const celularSomenteNumeros = celular.replace(/\D/g, "");

  if (celularSomenteNumeros.length !== 11) {
    mensagemCliente.textContent =
      "Digite um número de celular com 11 dígitos.";
    return;
  }

  const clienteJaExiste = clientes.some((cliente) => {
    const celularCliente = cliente.celular.replace(/\D/g, "");

    return (
      cliente.nome.toLowerCase() === nome.toLowerCase() ||
      celularCliente === celularSomenteNumeros
    );
  });

  if (clienteJaExiste) {
    mensagemCliente.textContent =
      "Já existe um cliente com esse nome ou celular.";
    return;
  }

  await addDoc(collection(db, "clientes"), {
    nome: nome,
    celular: celular
  });

  nomeNovoCliente.value = "";
  celularNovoCliente.value = "";

  mensagemCliente.textContent = `${nome} foi cadastrado com sucesso.`;

  await carregarClientes();
  mostrarListaDeClientes();
});

pesquisaBarbeiro.addEventListener("input", () => {
  mostrarListaDeBarbeiros();
});

pesquisaCliente.addEventListener("input", () => {
  mostrarListaDeClientes();
});

selectBarbeiro.addEventListener("change", async () => {
  barbeiroAtual = selectBarbeiro.value;

  if (!barbeiroAtual) {
    textoAgenda.textContent = "Escolha um barbeiro para ver a agenda.";
    mostrarAgenda();
    return;
  }

  textoAgenda.textContent = `Agenda de ${barbeiroAtual}.`;

  await atualizarAgenda();
});

agendaScroll.addEventListener("scroll", () => {
  const chegouAoFim =
    agendaScroll.scrollLeft + agendaScroll.clientWidth >=
    agendaScroll.scrollWidth - 300;

  if (chegouAoFim) {
    const posicaoHorizontal = agendaScroll.scrollLeft;
    const posicaoVertical = agendaScroll.scrollTop;

    adicionarMaisDias();
    mostrarAgenda();

    agendaScroll.scrollLeft = posicaoHorizontal;
    agendaScroll.scrollTop = posicaoVertical;
  }
});

document.querySelectorAll("[data-fechar]").forEach((botao) => {
  botao.addEventListener("click", () => {
    fecharModal(botao.dataset.fechar);
  });
});

async function iniciarDashboard() {
  montarMenu();
  criarPrimeirosDias();

  boasVindas.textContent = `Boas-vindas, ${nomeUsuario}!`;

  try {
    await carregarBarbeiros();

    if (tipoUsuario === "administrador") {
      escolherBarbeiro.classList.add("ativo");
      preencherSelectDeBarbeiros();

      textoAgenda.textContent = "Escolha um barbeiro para ver a agenda.";
      mostrarAgenda();
    } else {
      barbeiroAtual = nomeUsuario;
      textoAgenda.textContent = `Sua agenda: ${barbeiroAtual}.`;

      await atualizarAgenda();
    }
  } catch (erro) {
    textoAgenda.textContent = "Não foi possível conectar ao Firebase.";
    console.log(erro);
  }
}

pesquisaClienteAgendamento.addEventListener("input", () => {
  clienteSelecionado = null;

  mostrarClientesNoAgendamento();
});

botaoConcluirAgendamento.addEventListener("click", async () => {
  if (!agendamentoSelecionado) {
    return;
  }

  await updateDoc(
    doc(db, "agendamentos", agendamentoSelecionado.id),
    {
      status: "concluido"
    }
  );

  fecharModal("modal-detalhes");
  await atualizarAgenda();
});

botaoNaoRealizadoAgendamento.addEventListener("click", async () => {
  if (!agendamentoSelecionado) {
    return;
  }

  await updateDoc(
    doc(db, "agendamentos", agendamentoSelecionado.id),
    {
      status: "nao_realizado"
    }
  );

  fecharModal("modal-detalhes");
  await atualizarAgenda();
});

function abrirTelaRelatorio() {
  telaDashboard.classList.add("escondida");
  telaBarbeiros.classList.add("escondida");
  telaClientes.classList.add("escondida");
  telaConfiguracoes.classList.add("escondida");
  telaRelatorio.classList.remove("escondida");

  marcarBotaoAtivo("Relatório");

  filtroRelatorioBarbeiro.innerHTML = "";

  if (tipoUsuario === "administrador") {
    filtroRelatorioBarbeiro.innerHTML =
      '<option value="todos">Barbearia inteira</option>';

    barbeiros.forEach((barbeiro) => {
      const opcao = document.createElement("option");
      opcao.value = barbeiro.nome;
      opcao.textContent = barbeiro.nome;
      filtroRelatorioBarbeiro.appendChild(opcao);
    });
  } else {
    const opcao = document.createElement("option");
    opcao.value = nomeUsuario;
    opcao.textContent = nomeUsuario;
    filtroRelatorioBarbeiro.appendChild(opcao);
  }

  atualizarRelatorio();
}

function obterPeriodoRelatorio() {
  const inicio = new Date(
    mesRelatorio.getFullYear(),
    mesRelatorio.getMonth(),
    1
  );
  const fim = new Date(
    mesRelatorio.getFullYear(),
    mesRelatorio.getMonth() + 1,
    0
  );

  return {
    inicio: formatarDataParaSalvar(inicio),
    fim: formatarDataParaSalvar(fim)
  };
}

function mostrarCalendario(concluidos) {
  const ano = mesRelatorio.getFullYear();
  const mes = mesRelatorio.getMonth();
  const hoje = formatarDataParaSalvar(new Date());
  const quantidadePorData = contarPorData(concluidos, "concluido");
  const primeiroDia = new Date(ano, mes, 1);
  const quantidadeDeDias = new Date(ano, mes + 1, 0).getDate();
  const espacosAntesDoPrimeiroDia = (primeiroDia.getDay() + 6) % 7;

  tituloCalendario.textContent = primeiroDia.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric"
  });

  calendarioRelatorio.innerHTML = "";

  for (let numero = 0; numero < espacosAntesDoPrimeiroDia; numero++) {
    const vazio = document.createElement("div");
    vazio.className = "dia-calendario-vazio";
    calendarioRelatorio.appendChild(vazio);
  }

  for (let dia = 1; dia <= quantidadeDeDias; dia++) {
    const data = formatarDataParaSalvar(new Date(ano, mes, dia));
    const quantidade = quantidadePorData[data] || 0;
    const cartaoDia = document.createElement("div");
    const numeroDia = document.createElement("span");
    const totalDia = document.createElement("span");

    cartaoDia.className = "dia-calendario";
    if (data === hoje) {
      cartaoDia.classList.add("hoje");
    }
    if (quantidade > 0) {
      cartaoDia.classList.add("com-atendimentos");
    }

    numeroDia.className = "numero-dia";
    numeroDia.textContent = dia;
    totalDia.className = "quantidade-dia";
    totalDia.textContent = `${quantidade} atendimento${quantidade === 1 ? "" : "s"}`;

    cartaoDia.append(numeroDia, totalDia);
    calendarioRelatorio.appendChild(cartaoDia);
  }
}

function contarPorData(lista, status) {
  const resultado = {};

  lista.forEach((agendamento) => {
    if (!status || agendamento.status === status) {
      resultado[agendamento.data] = (resultado[agendamento.data] || 0) + 1;
    }
  });

  return resultado;
}

function maiorInformacao(lista, campo) {
  const contagem = {};

  lista.forEach((agendamento) => {
    contagem[agendamento[campo]] = (contagem[agendamento[campo]] || 0) + 1;
  });

  const maior = Object.keys(contagem).sort((a, b) => {
    return contagem[b] - contagem[a];
  })[0];

  return maior || "—";
}

async function atualizarRelatorio() {
  const resposta = await getDocs(collection(db, "agendamentos"));
  const periodo = obterPeriodoRelatorio();
  const barbeiro = filtroRelatorioBarbeiro.value;
  const corTextoGrafico = document.body.classList.contains("tema-claro")
    ? "#2d2d2d"
    : "#ffffff";
  const corGradeGrafico = document.body.classList.contains("tema-claro")
    ? "#d4c7ad"
    : "#444444";

  const lista = resposta.docs
    .map((documento) => documento.data())
    .filter((agendamento) => {
      const estaNoPeriodo =
        agendamento.data >= periodo.inicio &&
        agendamento.data <= periodo.fim;

      const estaNoBarbeiro =
        barbeiro === "todos" || agendamento.barbeiro === barbeiro;

      return estaNoPeriodo && estaNoBarbeiro;
    });

  const concluidos = lista.filter((agendamento) => {
    return agendamento.status === "concluido";
  });

  document.querySelector("#total-concluido").textContent =
    concluidos.length;

  document.querySelector("#horario-mais-atendido").textContent =
    maiorInformacao(concluidos, "hora");

  const diasSemana = concluidos.map((agendamento) => {
    return dataPorTexto(agendamento.data).toLocaleDateString("pt-BR", {
      weekday: "long"
    });
  });

  const contagemDias = {};

  diasSemana.forEach((dia) => {
    contagemDias[dia] = (contagemDias[dia] || 0) + 1;
  });

  const diaMaisAtendido = Object.keys(contagemDias).sort((a, b) => {
    return contagemDias[b] - contagemDias[a];
  })[0];

  document.querySelector("#dia-mais-atendido").textContent =
    diaMaisAtendido || "—";

  mostrarCalendario(concluidos);

  if (graficoStatus) {
    graficoStatus.destroy();
  }

  let labelsSegundoGrafico = [];
  let dadosSegundoGrafico = [];

  if (filtroSegundoGrafico.value === "horario") {
    const porHorario = {};

    concluidos.forEach((agendamento) => {
      porHorario[agendamento.hora] =
        (porHorario[agendamento.hora] || 0) + 1;
    });

    labelsSegundoGrafico = Object.keys(porHorario).sort();
    dadosSegundoGrafico = labelsSegundoGrafico.map((horario) => {
      return porHorario[horario];
    });

    tituloSegundoGrafico.textContent = "Horário que mais atende";
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

    const porDiaSemana = {};

    concluidos.forEach((agendamento) => {
      const dia = dataPorTexto(agendamento.data).toLocaleDateString(
        "pt-BR",
        { weekday: "long" }
      );

      porDiaSemana[dia] = (porDiaSemana[dia] || 0) + 1;
    });

    labelsSegundoGrafico = ordemDias.filter((dia) => {
      return porDiaSemana[dia];
    });

    dadosSegundoGrafico = labelsSegundoGrafico.map((dia) => {
      return porDiaSemana[dia];
    });

    tituloSegundoGrafico.textContent =
      "Dia da semana que mais atende";
  }

  graficoStatus = new Chart(
    document.querySelector("#grafico-status"),
    {
      type: "bar",
      data: {
        labels: labelsSegundoGrafico,
        datasets: [{
          label: "Atendimentos concluídos",
          data: dadosSegundoGrafico,
          backgroundColor: "#d8ad5b",
          borderColor: "#e7c77f",
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: corTextoGrafico, stepSize: 1 },
            grid: { color: corGradeGrafico }
          },
          x: {
            ticks: { color: corTextoGrafico },
            grid: { color: corGradeGrafico }
          }
        }
      }
    }
  );
}

function gerarDiasDoPeriodo(inicio, fim) {
  const dias = [];
  const dataAtual = dataPorTexto(inicio);
  const dataFinal = dataPorTexto(fim);

  while (dataAtual <= dataFinal) {
    dias.push(formatarDataParaSalvar(dataAtual));

    dataAtual.setDate(dataAtual.getDate() + 1);
  }

  return dias;
}

botaoMesAnterior.addEventListener("click", () => {
  mesRelatorio.setMonth(mesRelatorio.getMonth() - 1);
  atualizarRelatorio();
});

botaoProximoMes.addEventListener("click", () => {
  mesRelatorio.setMonth(mesRelatorio.getMonth() + 1);
  atualizarRelatorio();
});

filtroRelatorioBarbeiro.addEventListener("change", () => {
  atualizarRelatorio();
});

filtroSegundoGrafico.addEventListener("change", () => {
  atualizarRelatorio();
});

opcoesTema.forEach((opcao) => {
  opcao.addEventListener("change", async () => {
    try {
      await setDoc(
        configuracaoGeral,
        { tema: opcao.value },
        { merge: true }
      );

      mensagemTema.textContent = "Tema atualizado com sucesso.";
    } catch (erro) {
      mensagemTema.textContent = "Não foi possível salvar o tema.";
      console.log(erro);
    }
  });
});

formAlterarSenha.addEventListener("submit", async (event) => {
  event.preventDefault();

  const senha = novaSenha.value.trim();
  const confirmacao = confirmarNovaSenha.value.trim();

  if (senha.length < 4) {
    mensagemSenha.textContent = "A senha precisa ter pelo menos 4 caracteres.";
    return;
  }

  if (senha !== confirmacao) {
    mensagemSenha.textContent = "As duas senhas não são iguais.";
    return;
  }

  try {
    await setDoc(
      configuracaoGeral,
      { senha: senha },
      { merge: true }
    );

    formAlterarSenha.reset();
    mensagemSenha.textContent = "Senha alterada com sucesso.";
  } catch (erro) {
    mensagemSenha.textContent = "Não foi possível alterar a senha.";
    console.log(erro);
  }
});

onSnapshot(configuracaoGeral, (documento) => {
  const configuracoes = documento.exists() ? documento.data() : {};
  aplicarTema(configuracoes.tema || "escuro");

  if (!telaRelatorio.classList.contains("escondida")) {
    atualizarRelatorio();
  }
});

function atualizarBotoesZoom() {
  botaoDiminuirZoom.disabled = zoomAgenda <= ZOOM_MINIMO;
  botaoAumentarZoom.disabled = zoomAgenda >= ZOOM_MAXIMO;
}

function alterarZoom(valor) {
  const novoZoom = Math.min(
    ZOOM_MAXIMO,
    Math.max(ZOOM_MINIMO, zoomAgenda + valor)
  );

  if (novoZoom === zoomAgenda) {
    return;
  }

  const posicaoHorizontal = agendaScroll.scrollLeft;
  const posicaoVertical = agendaScroll.scrollTop;

  zoomAgenda = Number(novoZoom.toFixed(2));

  mostrarAgenda();

  agendaScroll.scrollLeft = posicaoHorizontal;
  agendaScroll.scrollTop = posicaoVertical;

  atualizarBotoesZoom();
}

botaoDiminuirZoom.addEventListener("click", () => {
  alterarZoom(-PASSO_ZOOM);
});

botaoAumentarZoom.addEventListener("click", () => {
  alterarZoom(PASSO_ZOOM);
});

if (botaoConfirmarSair) {
  botaoConfirmarSair.addEventListener("click", () => {
    sessionStorage.clear();
    window.location.href = "index.html";
  });
}

atualizarBotoesZoom();


iniciarDashboard();
