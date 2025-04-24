export async function enviarMensagem(numeros, mensagem, intervalo = 10) {
  const saida = document.getElementById("saidaEnvio");
  saida.textContent = "⏳ Enviando mensagens...\n";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);

  try {
    const payload = {
      numeros: formatarNumeros(numeros),
      mensagem,
      intervaloSegundos: intervalo,
    };

    const res = await fetch("/api/enviar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await res.json();

    if (data.status === "ok")
      return "✅ Envio finalizado!\n\n" + (data.saida || "");
    if (data.status === "timeout") return "⏱ Tempo limite excedido.";
    return "❌ Erro: " + data.erro;
  } catch (err) {
    if (err.name === "AbortError") return "⏱ Tempo limite atingido.";
    return "❌ Erro inesperado: " + err.message;
  }
}

export async function buscarLog() {
  const res = await fetch("/log");
  const data = await res.json();
  return data.log || "⚠️ Log vazio.";
}

function formatarNumeros(numeros) {
  return numeros.map((n) => {
    const numero = n.replace(/\D/g, "");
    return numero.startsWith("55") ? numero : `55${numero}`;
  });
}
