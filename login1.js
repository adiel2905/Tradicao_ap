import { db } from "./firebase.js";

import {
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const form = document.querySelector("#login-form");
const passwordInput = document.querySelector("#password");
const togglePassword = document.querySelector("#toggle-password");
const formMessage = document.querySelector("#form-message");

let senhaCorreta = "tradicao123";

function aplicarTema(tema) {
  document.body.classList.toggle("tema-claro", tema === "claro");
}

onSnapshot(
  doc(db, "configuracoes", "geral"),
  (documento) => {
    if (!documento.exists()) {
      return;
    }

    const configuracoes = documento.data();

    senhaCorreta = configuracoes.senha || "tradicao123";
    aplicarTema(configuracoes.tema || "escuro");
  },
  (erro) => {
    console.log("Não foi possível carregar as configurações.", erro);
  }
);

togglePassword.addEventListener("click", () => {
  const senhaEstaVisivel = passwordInput.type === "text";

  passwordInput.type = senhaEstaVisivel ? "password" : "text";

  togglePassword.classList.toggle("is-visible", !senhaEstaVisivel);

  togglePassword.setAttribute(
    "aria-label",
    senhaEstaVisivel ? "Mostrar senha" : "Ocultar senha"
  );

  passwordInput.focus();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const senhaDigitada = passwordInput.value.trim();

  if (senhaDigitada === "") {
    formMessage.textContent = "Digite a senha para continuar.";
    passwordInput.focus();
    return;
  }

  if (senhaDigitada === senhaCorreta) {
    window.location.href = "escolher-usuario.html";
    return;
  }

  formMessage.textContent = "Senha incorreta. Tente novamente.";
  passwordInput.value = "";
  passwordInput.focus();
});
