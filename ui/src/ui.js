// src/ui.js
import { enviarMensagem, buscarLog } from "./api.js";
import { getNumerosSelecionados } from "./utils.js";

export function configurarEventosUI() {
  const btnEnviar = document.querySelector("#btnEnviar");
  const inputBusca = document.querySelector("#buscaContato");
  const btnLog = document.querySelector("#btnVerLog");

  if (btnEnviar) btnEnviar.addEventListener("click", confirmarEnvio);
  if (inputBusca) inputBusca.addEventListener("keyup", filtrarContatos);
  if (btnLog) btnLog.addEventListener("click", verLog);
}

export async function carregarContatos() {
  const ul = document.getElementById("listaContatos");
  ul.innerHTML = "<li>🔄 Carregando contatos...</li>";

  try {
    const res = await fetch("/api/contatos");
    const contatos = await res.json();

    if (!contatos.length) {
      ul.innerHTML = "<li>⚠️ Nenhum contato encontrado.</li>";
      return;
    }

    ul.innerHTML = contatos
      .map(
        (c) => `
      <li>
        <label>
          <input type="checkbox" class="contato-checkbox" data-numero="${c.numero}" />
          ${c.nome}
        </label>
      </li>
    `
      )
      .join("");
  } catch (err) {
    ul.innerHTML = "<li>❌ Erro ao carregar contatos.</li>";
  }
}

function filtrarContatos() {
  const termo = document.getElementById("buscaContato").value.toLowerCase();
  const contatos = document.querySelectorAll("#listaContatos li");

  contatos.forEach((li) => {
    const texto = li.textContent.toLowerCase();
    li.style.display = texto.includes(termo) ? "block" : "none";
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function intervaloRandomico(base) {
  // Primeira mensagem espera exatamente "base" segundos
  if (!intervaloRandomico.foiPrimeira) {
    intervaloRandomico.foiPrimeira = true;
    return base * 1000;
  }
  // Próximas esperam entre base e base + 20 segundos (totalmente aleatório)
  const max = base + 20;
  return (Math.floor(Math.random() * (max - base + 1)) + base) * 1000;
}
intervaloRandomico.foiPrimeira = false;

async function confirmarEnvio() {
  const numeros = getNumerosSelecionados();
  const mensagem = document.getElementById("mensagemTexto").value.trim();
  const intervaloBase = parseInt(
    document.getElementById("intervalo").value,
    10
  );
  const saida = document.getElementById("saidaEnvio");

  if (numeros.length === 0) return alert("⚠️ Selecione pelo menos um contato.");
  if (!mensagem) return alert("⚠️ Digite uma mensagem.");

  saida.textContent = "📤 Iniciando envio das mensagens...";
  intervaloRandomico.foiPrimeira = false; // reseta controle

  for (let i = 0; i < numeros.length; i++) {
    const numero = numeros[i];
    const status = await enviarMensagem([numero], mensagem, 1);
    saida.textContent += `\n${new Date().toLocaleTimeString()} → ${numero}: ${status}`;

    const delay = intervaloRandomico(intervaloBase);
    await sleep(delay);
  }

  saida.textContent += "\n✅ Envio concluído.";
}

function verLog() {
  const saida = document.getElementById("saidaEnvio");
  saida.textContent = "🔄 Carregando log...";

  buscarLog()
    .then((log) => (saida.textContent = log))
    .catch(
      (err) => (saida.textContent = "❌ Erro ao buscar log: " + err.message)
    );
}
