// sender.js (refatorado para envio em lote com delay aleatório)
import crypto from "crypto";
//globalThis.crypto = crypto.webcrypto; // Para compatibilidade com Node.js 22-

import { makeWASocket, useMultiFileAuthState } from "@whiskeysockets/baileys";
import P from "pino";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const authPath = path.join(__dirname, "auth");
const queuePath = path.join(__dirname, "queue.json");
const logPath = path.join(__dirname, "logs", "envio.log");

// Garante pasta de logs
fs.mkdirSync(path.join(__dirname, "logs"), { recursive: true });

// Utilitário para log
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

// Função para substituir variáveis do tipo {{nome}}
function personalizarMensagem(template, nome) {
  return template.replace(/{{\s*nome\s*}}/gi, nome);
}

// Função para aguardar um tempo (em milissegundos)
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function enviarMensagens() {
  if (!fs.existsSync(queuePath)) {
    console.error("❌ Arquivo queue.json não encontrado.");
    process.exit(1);
  }

  const { mensagem, intervaloSegundos, contatos } = JSON.parse(
    fs.readFileSync(queuePath, "utf8")
  );

  if (!mensagem || !contatos?.length || !intervaloSegundos) {
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

  sock.ev.on("connection.update", async ({ connection }) => {
    if (connection === "open") {
      log("✅ Conectado ao WhatsApp.");

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

        // Espera entre mensagens (entre X e X*2 segundos)
        const espera = intervaloSegundos * 1000;
        const esperaAleatoria = espera + Math.floor(Math.random() * espera);
        log(
          `⏳ Aguardando ${Math.round(esperaAleatoria / 1000)} segundos...\n`
        );
        await delay(esperaAleatoria);
      }

      log("🏁 Envio finalizado.");
      process.exit(0);
    }

    if (connection === "close") {
      log("❌ Conexão encerrada.");
      process.exit(1);
    }
  });
}

enviarMensagens();
