// src/ui.js
import { enviarMensagem, buscarLog } from "./utils/api.js";
import { getNumerosSelecionados } from "./utils/utils.js";

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

export async function carregarGrupos() {
  const [resGrupos, resMembros] = await Promise.all([
    fetch("/api/grupos"),
    fetch("/api/membros-grupos"),
  ]);

  const gruposData = await resGrupos.json();
  const membrosData = await resMembros.json();

  const lista = document.getElementById("listaGrupos");
  lista.innerHTML = "";

  gruposData.grupos.forEach((grupo) => {
    const li = document.createElement("li");

    // Checkbox do grupo (seleciona o grupo como remetente)
    const checkboxGrupo = document.createElement("input");
    checkboxGrupo.type = "checkbox";
    checkboxGrupo.className = "contato-checkbox";
    checkboxGrupo.value = grupo.jid;
    checkboxGrupo.setAttribute("data-numero", grupo.jid);

    // Rótulo clicável que expande/minimiza os membros
    const label = document.createElement("label");
    label.className = "ml-2 grupo-toggle cursor-pointer font-semibold";
    label.textContent = grupo.nome;

    // Sublista oculta de membros
    const ulMembros = document.createElement("ul");
    ulMembros.className = "ml-6 text-sm text-gray-600 hidden";

    const membros = membrosData.grupos[grupo.nome];
    if (membros && membros.length > 0) {
      membros.forEach(({ nome, numero }) => {
        const membroLi = document.createElement("li");

        const checkboxMembro = document.createElement("input");
        checkboxMembro.type = "checkbox";
        checkboxMembro.className = "contato-checkbox";
        checkboxMembro.setAttribute("data-numero", numero);
        checkboxMembro.value = numero;

        const labelMembro = document.createElement("label");
        labelMembro.className = "ml-2";
        labelMembro.textContent = `${nome} (${numero})`;

        membroLi.appendChild(checkboxMembro);
        membroLi.appendChild(labelMembro);
        ulMembros.appendChild(membroLi);
      });
    }

    // Expande ou minimiza os membros do grupo ao clicar no rótulo
    label.addEventListener("click", () => {
      ulMembros.classList.toggle("hidden");
    });

    li.appendChild(checkboxGrupo);
    li.appendChild(label);
    li.appendChild(ulMembros);

    lista.appendChild(li);
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function intervaloRandomico(base) {
  if (!intervaloRandomico.foiPrimeira) {
    intervaloRandomico.foiPrimeira = true;
    return base * 1000;
  }
  const max = base + 20;
  return (Math.floor(Math.random() * (max - base + 1)) + base) * 1000;
}
intervaloRandomico.foiPrimeira = false;

function dataHoraLocalFormatada() {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());
}

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
  intervaloRandomico.foiPrimeira = false;

  for (let i = 0; i < numeros.length; i++) {
    const numero = numeros[i];
    const status = await enviarMensagem([numero], mensagem, 1);

    const agora = dataHoraLocalFormatada();
    saida.textContent += `\n[${agora}] → ${numero}: ${status}`;

    const delay = intervaloRandomico(intervaloBase);
    await sleep(delay);
  }
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
