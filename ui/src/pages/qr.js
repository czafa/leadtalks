import QRCode from "qrcode";
import "../style.css";

export function showQR(container) {
  container.innerHTML = `
    <div class="bg-white p-6 rounded shadow-md text-center max-w-md mx-auto mt-10">
      <h1 class="text-2xl font-bold mb-4">📱 Escaneie o QR Code</h1>
      <p class="mb-4 text-gray-700">Conecte seu WhatsApp para iniciar.</p>
      <div id="spinner" class="flex justify-center mb-4">
        <div class="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
      </div>
      <canvas id="qrcode" class="hidden"></canvas>
      <p id="status" class="text-sm text-gray-600 mt-4">Aguardando conexão...</p>
    </div>
  `;

  const qrcodeDiv = document.getElementById("qrcode");
  const spinnerDiv = document.getElementById("spinner");
  const statusMsg = document.getElementById("status");

  async function verificarSessaoAntes() {
    const { data: { user } } = await window.supabase.auth.getUser();

    if (!user) {
      window.location.href = "/#/login";
      return;
    }

    const { data: sessao } = await window.supabase
      .from("sessao")
      .select("ativo")
      .eq("usuario_id", user.id)
      .single();

    if (sessao?.ativo) {
      window.location.href = "/#/home";
      return;
    }

    await carregarQRCode(); // carrega inicialmente
    setInterval(carregarQRCode, 5000); // Atualiza o QR a cada 5 segundos
    monitorarSessao();
  }

  async function carregarQRCode() {
    try {
      if (!qrcodeDiv || !spinnerDiv || !statusMsg) {
        console.error("Elementos necessários não encontrados!");
        return;
      }

      const response = await fetch("http://136.248.124.114:3000/api/qr");
      const data = await response.json();

      if (data.qr) {
        spinnerDiv.classList.add("hidden");
        qrcodeDiv.classList.remove("hidden");
        await QRCode.toCanvas(qrcodeDiv, data.qr, { width: 256 });
      } else {
        statusMsg.textContent = "❌ QR code ainda não disponível.";
        spinnerDiv.classList.add("hidden");
      }
    } catch (err) {
      console.error("Erro ao carregar QR:", err);
      spinnerDiv.classList.add("hidden");
      statusMsg.textContent = "❌ Erro ao carregar QR Code.";
    }
  }

  async function monitorarSessao() {
    const { data: { user } } = await window.supabase.auth.getUser();

    window.supabase
      .channel("sessao-status")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "sessao", filter: `usuario_id=eq.${user.id}` },
        (payload) => {
          if (payload.new.ativo) {
            window.location.href = "/#/home";
          }
        }
      )
      .subscribe();
  }

  verificarSessaoAntes();
}
