// sender.js (atualizado para atualizar sessao ativa no Supabase)
import crypto from "crypto";
import { makeWASocket, useMultiFileAuthState } from "@whiskeysockets/baileys";
import P from "pino";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const authPath = path.join(__dirname, "auth");
const queuePath = path.join(__dirname, "queue.json");
const logPath = path.join(__dirname, "logs", "envio.log");
const qrPath = path.join(__dirname, "temp", "qr.txt");

fs.mkdirSync(path.join(__dirname, "logs"), { recursive: true });
fs.mkdirSync(path.join(__dirname, "temp"), { recursive: true });

function log(msg) {
  const timestamp = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());

  const linha = `[${timestamp}] ${msg}`;
  console.log(linha);
  fs.appendFileSync(logPath, linha + "\n");
}

function personalizarMensagem(template, nome) {
  return template.replace(/{{\s*nome\s*}}/gi, nome);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function atualizarSessaoAtiva(usuario_id) {
  await supabase.from("sessao").upsert({
    usuario_id,
    ativo: true,
    atualizado_em: new Date().toISOString(),
  });
  log("🟢 Sessão do usuário atualizada como ativa no Supabase.");
}

async function enviarMensagens() {
  if (!fs.existsSync(queuePath)) {
    console.error("❌ Arquivo queue.json não encontrado.");
    process.exit(1);
  }

  const { mensagem, intervaloSegundos, contatos, usuario_id } = JSON.parse(
    fs.readFileSync(queuePath, "utf8")
  );

  if (!mensagem || !contatos?.length || !intervaloSegundos || !usuario_id) {
    console.error("❌ queue.json mal formatado.");
    process.exit(1);
  }

  if (!fs.existsSync(path.join(authPath, "creds.json"))) {
    console.error("❌ Autenticação não encontrada. Rode: node auth.js");
    process.exit(1);
  }

  log("");
  log("🔄 Iniciando conexão com WhatsApp...");
  const { state, saveCreds } = await useMultiFileAuthState(authPath);
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: P({ level: "silent" }),
    browser: ["Chrome (Linux)", "Chrome", "104"],
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async ({ connection, qr }) => {
    if (qr) {
      fs.writeFileSync(qrPath, qr);
      log("📸 QR Code gerado e salvo em temp/qr.txt");
    
      // 🆕 Atualiza o QR no Supabase também
      await supabase
        .from("sessao")
        .update({ qr, atualizado_em: new Date().toISOString() })
        .eq("usuario_id", usuario_id);
      log("📤 QR Code atualizado no Supabase.");
    }

    if (connection === "open") {
      log("✅ Conectado ao WhatsApp.");

      // Atualiza sessao.ativo = true
      await atualizarSessaoAtiva(usuario_id);

      for (const contato of contatos) {
        const jid = `${contato.numero.replace(/[^\d]/g, "")}@s.whatsapp.net`;
        const msg = personalizarMensagem(mensagem, contato.nome);

        try {
          log(`📤 Enviando para ${contato.nome} (${contato.numero})...`);
          await sock.sendMessage(jid, { text: msg });
          log(`✅ Mensagem enviada para ${contato.nome}.`);
        } catch (err) {
          log(`❌ Erro ao enviar para ${contato.nome}: ${err.message}`);
        }

        const espera = intervaloSegundos * 1000;
        const esperaAleatoria = espera + Math.floor(Math.random() * espera);
        log(
          `⏳ Aguardando ${Math.round(esperaAleatoria / 1000)} segundos...\n`
        );
        await delay(esperaAleatoria);
      }

      log("🏁 Envio finalizado.");
      fs.rmSync(qrPath, { force: true });
      process.exit(0);
    }

    if (connection === "close") {
      log("❌ Conexão encerrada.");
      process.exit(1);
    }
  });
}

enviarMensagens();
