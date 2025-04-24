// === Importações e configurações ===
import crypto from "crypto";
globalThis.crypto = crypto.webcrypto; // Corrige dependência de ambiente para webcrypto

import { makeWASocket, useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys";
import P from "pino"; // Logger opcional
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import qrcode from "qrcode-terminal"; // Para exibir QR code no terminal

// Converte para diretório local compatível com ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === Função principal de conexão ===
async function connectToWhatsApp() {
  try {
    const authPath = path.join(__dirname, "auth"); // Caminho da pasta de autenticação
    console.log("\n🔐 Diretório de autenticação:", authPath);

    // Cria a pasta de autenticação se ainda não existir
    if (!fs.existsSync(authPath)) {
      fs.mkdirSync(authPath, { recursive: true });
      console.log("📁 Diretório criado com sucesso");
    } else {
      console.log("📂 Usando dados anteriores de autenticação.");
    }

    // Carrega o estado de autenticação existente (ou cria novo se vazio)
    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    console.log("✅ Estado de autenticação carregado");

    // Cria o socket de conexão com o WhatsApp
    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      logger: P({ level: "silent" }),
      browser: ["Chrome (Linux)", "Chrome", "104"], // Define o agente
      connectTimeoutMs: 120000,
      qrTimeout: 60000,
      defaultQueryTimeoutMs: 30000
    });

    // Salva as credenciais quando houver atualização
    sock.ev.on("creds.update", saveCreds);

    return new Promise((resolve, reject) => {
      let qrCodeCount = 0;
      const maxQrAttempts = 5;

      // Timeout global de 2 minutos
      const timeout = setTimeout(() => {
        reject(new Error("Timeout ao aguardar conexão (120s)"));
        process.exit(1);
      }, 120000);

      // Monitora mudanças de conexão
      sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
        console.log("\n🔌 Estado da conexão:", connection);

        // Se houver QR para escanear
        if (qr) {
          qrCodeCount++;

          // Aguarda 5s a partir da 2ª tentativa para evitar flood
          if (qrCodeCount > 1) {
            console.log("⏳ Aguardando 5 segundos antes de gerar novo QR Code...");
            await new Promise(resolve => setTimeout(resolve, 5000));
          }

          console.clear();
          console.log(`\n🔄 QR Code gerado (tentativa ${qrCodeCount} de ${maxQrAttempts})`);
          console.log("\n1. Abra o WhatsApp no seu celular");
          console.log("2. Toque em Menu > Aparelhos conectados > Conectar um aparelho");
          console.log("3. Aponte a câmera para este QR Code\n");
          qrcode.generate(qr, { small: true });

          // Limita tentativas
          if (qrCodeCount >= maxQrAttempts) {
            clearTimeout(timeout);
            reject(new Error("Número máximo de tentativas de QR Code atingido"));
            process.exit(1);
          }
        }

        // Se conexão for aberta com sucesso
        if (connection === "open") {
          clearTimeout(timeout);
          console.log("\n✅ Conectado com sucesso ao WhatsApp!");
          console.log("📱 Agora você pode usar o sender.js para enviar mensagens\n");
          resolve();
          process.exit(0);
        }

        // Se conexão foi encerrada
        if (connection === "close") {
          clearTimeout(timeout);

          // Extrai códigos de erro
          const statusCode = lastDisconnect?.error?.output?.statusCode;
          const errorMessage = lastDisconnect?.error?.message;

          console.log(`❌ Conexão fechada (${statusCode}): ${errorMessage}`);

          // Se foi logout, limpa arquivos antigos
          if (statusCode === DisconnectReason.loggedOut) {
            console.log("🧹 Sessão desconectada, limpando dados...");
            fs.rmSync(authPath, { recursive: true, force: true });
            fs.mkdirSync(authPath, { recursive: true });
          }

          // Se ainda houver tentativas possíveis, tenta reconectar
          if (qrCodeCount < maxQrAttempts) {
            console.log("🔄 Tentando reconectar...");
            await connectToWhatsApp(); // chamada recursiva
          } else {
            reject(new Error(`Falha na autenticação (${statusCode}): ${errorMessage}`));
            process.exit(1);
          }
        }
      });
    });

  } catch (error) {
    console.error("\n❌ Erro fatal:", error.message);
    process.exit(1);
  }
}

// === Execução principal ===
console.log("\n🚀 Iniciando processo de autenticação do WhatsApp...\n");
connectToWhatsApp();
