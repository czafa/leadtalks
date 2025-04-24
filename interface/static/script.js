// 🔍 Filtro de contatos
function filtrarContatos() {
  const termo = document.getElementById("buscaContato").value.toLowerCase();
  const contatos = document.querySelectorAll("#listaContatos li");

  contatos.forEach((li) => {
    const texto = li.textContent.toLowerCase();
    li.style.display = texto.includes(termo) ? "block" : "none";
  });
}

// 🔢 Coleta todos os contatos selecionados
function getNumerosSelecionados() {
  const checkboxes = document.querySelectorAll(".contato-checkbox:checked");
  return Array.from(checkboxes).map(
    (cb) => cb.getAttribute("data-numero") || cb.value
  );
}

// 📨 Dispara o envio de mensagens
function confirmarEnvio() {
  const numeros = getNumerosSelecionados();
  const mensagem = document.getElementById("mensagemTexto").value.trim();
  const intervalo = parseInt(document.getElementById("intervalo").value, 10);
  const saida = document.getElementById("saidaEnvio");

  saida.textContent = "";

  if (numeros.length === 0) {
    alert("⚠️ Selecione pelo menos um contato.");
    return;
  }

  if (!mensagem) {
    alert("⚠️ Digite uma mensagem.");
    return;
  }

  const numerosFormatados = numeros.map((n) => {
    const numero = n.replace(/\D/g, "");
    return numero.startsWith("55") ? numero : `55${numero}`;
  });

  const payload = {
    numeros: numerosFormatados,
    mensagem,
    intervaloSegundos: intervalo || 10,
  };

  saida.textContent = "⏳ Enviando mensagens, aguarde...\n";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutos

  fetch("/api/enviar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: controller.signal,
  })
    .then((res) => {
      clearTimeout(timeoutId);
      return res.json();
    })
    .then((data) => {
      if (data.status === "ok") {
        saida.textContent += "✅ Envio finalizado!\n\n" + (data.saida || "");
      } else if (data.status === "timeout") {
        saida.textContent = "⏱ Tempo limite excedido. Tente novamente.";
      } else {
        saida.textContent = "❌ Erro: " + data.erro;
      }
    })
    .catch((err) => {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        saida.textContent =
          "❌ Tempo limite atingido. A operação foi cancelada.";
      } else {
        saida.textContent = "❌ Erro inesperado: " + err.message;
      }
    });
}

// 📄 Busca e exibe o conteúdo do log
function verLog() {
  const saida = document.getElementById("saidaEnvio");
  saida.textContent = "🔄 Carregando log...";

  fetch("/log")
    .then((res) => res.json())
    .then((data) => {
      saida.textContent = data.log || "⚠️ Log vazio.";
    })
    .catch((err) => {
      saida.textContent = "❌ Erro ao buscar log: " + err.message;
    });
}
