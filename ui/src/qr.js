// /src/auth/qr.js
import { createClient } from "@supabase/supabase-js";
import QRCode from "qrcode";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const qrcodeDiv = document.getElementById("qrcode");
const statusMsg = document.getElementById("status");

async function carregarQRCode() {
  try {
    const res = await fetch("/api/qr");
    if (!res.ok) throw new Error("QR não encontrado");
    const { qr } = await res.json();
    QRCode.toCanvas(qrcodeDiv, qr, { width: 256 });
  } catch (err) {
    console.error("Erro ao carregar QR:", err);
    statusMsg.textContent = "❌ Erro ao carregar QR Code";
  }
}

async function monitorarSessao() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const canal = supabase
    .channel("sessao-status")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "sessao",
        filter: `usuario_id=eq.${user.id}`,
      },
      (payload) => {
        if (payload.new.ativo) {
          window.location.href = "/index.html";
        }
      }
    )
    .subscribe();
}

carregarQRCode();
monitorarSessao();
