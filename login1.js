import { db } from "./firebase.js";

import {
  collection,
  doc,
  getDocs,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

/* ELEMENTOS DA TELA */

const etapaTipoUsuario = document.querySelector("#etapa-tipo-usuario");
const etapaBarbeiros = document.querySelector("#etapa-barbeiros");
const etapaSenha = document.querySelector("#etapa-senha");

const botaoTipoAdministrador = document.querySelector(
  "#botao-tipo-administrador"
);

const botaoTipoBarbeiro = document.querySelector(
  "#botao-tipo-barbeiro"
);

const listaBarbeiros = document.querySelector("#lista-barbeiros");
const mensagemBarbeiros = document.querySelector("#mensagem-barbeiros");

const botaoVoltarTipos = document.querySelector("#voltar-tipos");
const botaoVoltarSelecao = document.querySelector("#voltar-selecao");

const tipoUsuarioSelecionado = document.querySelector(
  "#tipo-usuario-selecionado"
);

const nomeUsuarioSelecionado = document.querySelector(
  "#nome-usuario-selecionado"
);

const form = document.querySelector("#login-form");
const passwordInput = document.querySelector("#password");
const togglePassword = document.querySelector("#toggle-password");
const formMessage = document.querySelector("#form-message");

/* DADOS DO USUÁRIO SELECIONADO */

let usuarioSelecionado = null;
let senhaAdministrador = "tradicao123";
let barbeiros = [];

/* TEMA */

function aplicarTema(tema) {
  document.body.classList.toggle(
    "tema-claro",
    tema === "claro"
  );
}

onSnapshot(
  doc(db, "configuracoes", "geral"),

  (documento) => {
    if (!documento.exists()) {
      aplicarTema("escuro");
      return;
    }

    const configuracoes = documento.data();

    senhaAdministrador =
      configuracoes.senhaAdministrador ||
      configuracoes.senha ||
      "tradicao123";

    aplicarTema(configuracoes.tema || "escuro");
  },

  (erro) => {
    console.log(
      "Não foi possível carregar as configurações.",
      erro
    );

    aplicarTema("escuro");
  }
);

/* CONTROLE DAS ETAPAS */

function esconderTodasEtapas() {
  etapaTipoUsuario.classList.add("escondida");
  etapaBarbeiros.classList.add("escondida");
  etapaSenha.classList.add("escondida");
}

function abrirEtapaTipos() {
  esconderTodasEtapas();

  etapaTipoUsuario.classList.remove("escondida");

  usuarioSelecionado = null;

  passwordInput.value = "";
  formMessage.textContent = "";
  mensagemBarbeiros.textContent = "";
}

function abrirEtapaBarbeiros() {
  esconderTodasEtapas();

  etapaBarbeiros.classList.remove("escondida");

  passwordInput.value = "";
  formMessage.textContent = "";
}

function abrirEtapaSenha(usuario) {
  usuarioSelecionado = usuario;

  esconderTodasEtapas();

  etapaSenha.classList.remove("escondida");

  if (usuario.tipo === "administrador") {
    tipoUsuarioSelecionado.textContent =
      "Acesso de administrador";
  } else {
    tipoUsuarioSelecionado.textContent =
      "Acesso de barbeiro";
  }

  nomeUsuarioSelecionado.textContent = usuario.nome;

  passwordInput.value = "";
  formMessage.textContent = "";

  setTimeout(() => {
    passwordInput.focus();
  }, 100);
}

/* CARREGAR BARBEIROS */

async function carregarBarbeiros() {
  listaBarbeiros.innerHTML = `
    <p class="carregando">
      Carregando barbeiros...
    </p>
  `;

  mensagemBarbeiros.textContent = "";

  try {
    const resposta = await getDocs(
      collection(db, "barbeiros")
    );

    barbeiros = resposta.docs
      .map((documento) => {
        return {
          id: documento.id,
          ...documento.data()
        };
      })
      .filter((barbeiro) => {
        return barbeiro.ativo !== false;
      })
      .sort((barbeiroA, barbeiroB) => {
        return barbeiroA.nome.localeCompare(
          barbeiroB.nome,
          "pt-BR"
        );
      });

    mostrarBarbeiros();
  } catch (erro) {
    console.log("Erro ao carregar barbeiros:", erro);

    listaBarbeiros.innerHTML = "";

    mensagemBarbeiros.textContent =
      "Não foi possível carregar os barbeiros.";
  }
}

function mostrarBarbeiros() {
  listaBarbeiros.innerHTML = "";

  if (barbeiros.length === 0) {
    listaBarbeiros.innerHTML = `
      <p class="lista-vazia">
        Nenhum barbeiro cadastrado ainda.
      </p>
    `;

    return;
  }

  barbeiros.forEach((barbeiro) => {
    const botao = document.createElement("button");

    botao.type = "button";
    botao.className = "botao-barbeiro";

    const primeiraLetra = barbeiro.nome
      .trim()
      .charAt(0)
      .toUpperCase();

    botao.innerHTML = `
      <span class="inicial-barbeiro">
        ${primeiraLetra}
      </span>

      <span class="dados-barbeiro">
        <strong>${barbeiro.nome}</strong>
        <small>Entrar como barbeiro</small>
      </span>

      <span class="seta">→</span>
    `;

    botao.addEventListener("click", () => {
      abrirEtapaSenha({
        id: barbeiro.id,
        nome: barbeiro.nome,
        tipo: "barbeiro",
        senha: barbeiro.senha || ""
      });
    });

    listaBarbeiros.appendChild(botao);
  });
}

/* BOTÕES DE SELEÇÃO */

botaoTipoAdministrador.addEventListener("click", () => {
  abrirEtapaSenha({
    id: "administrador",
    nome: "Administrador",
    tipo: "administrador",
    senha: senhaAdministrador
  });
});

botaoTipoBarbeiro.addEventListener("click", async () => {
  abrirEtapaBarbeiros();

  await carregarBarbeiros();
});

botaoVoltarTipos.addEventListener("click", () => {
  abrirEtapaTipos();
});

botaoVoltarSelecao.addEventListener("click", () => {
  if (
    usuarioSelecionado &&
    usuarioSelecionado.tipo === "barbeiro"
  ) {
    abrirEtapaBarbeiros();
    return;
  }

  abrirEtapaTipos();
});

/* MOSTRAR E OCULTAR SENHA */

togglePassword.addEventListener("click", () => {
  const senhaEstaVisivel =
    passwordInput.type === "text";

  passwordInput.type = senhaEstaVisivel
    ? "password"
    : "text";

  togglePassword.classList.toggle(
    "is-visible",
    !senhaEstaVisivel
  );

  togglePassword.setAttribute(
    "aria-label",
    senhaEstaVisivel
      ? "Mostrar senha"
      : "Ocultar senha"
  );

  passwordInput.focus();
});

/* VALIDAR LOGIN */

form.addEventListener("submit", (event) => {
  event.preventDefault();

  formMessage.textContent = "";

  if (!usuarioSelecionado) {
    formMessage.textContent =
      "Selecione um usuário para continuar.";

    abrirEtapaTipos();
    return;
  }

  const senhaDigitada = passwordInput.value.trim();

  if (senhaDigitada === "") {
    formMessage.textContent =
      "Digite a senha para continuar.";

    passwordInput.focus();
    return;
  }

  if (
    usuarioSelecionado.tipo === "barbeiro" &&
    !usuarioSelecionado.senha
  ) {
    formMessage.textContent =
      "Este barbeiro ainda não possui uma senha cadastrada.";

    return;
  }

  if (senhaDigitada !== usuarioSelecionado.senha) {
    formMessage.textContent =
      "Senha incorreta. Tente novamente.";

    passwordInput.value = "";
    passwordInput.focus();

    return;
  }

  sessionStorage.setItem(
    "nomeUsuario",
    usuarioSelecionado.nome
  );

  sessionStorage.setItem(
    "tipoUsuario",
    usuarioSelecionado.tipo
  );

  sessionStorage.setItem(
    "usuarioId",
    usuarioSelecionado.id
  );

  window.location.href = "dashboard.html";
});

/* INICIALIZAÇÃO */

sessionStorage.clear();
abrirEtapaTipos();