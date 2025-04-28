import { createClient } from "@supabase/supabase-js";
import "../style.css";
import { navegar } from "../router.js"; // novo arquivo que controla as telas

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function showLogin(container) {
  container.innerHTML = `
    <div class="bg-white p-8 rounded shadow-md w-full max-w-sm mx-auto mt-10">
      <h1 class="text-2xl font-bold text-center mb-6">🔐 Login no LeadTalks</h1>
      <form id="loginForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" id="email" required
            class="mt-1 p-2 w-full border rounded focus:outline-none focus:ring" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Senha</label>
          <input type="password" id="password" required
            class="mt-1 p-2 w-full border rounded focus:outline-none focus:ring" />
        </div>

        <button type="submit"
          class="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded font-semibold">
          Entrar
        </button>
      </form>

      <div class="text-sm text-center mt-4">
        <a href="#/register" class="text-blue-600 hover:underline">Criar conta</a> ·
        <a href="#/recover" class="text-blue-600 hover:underline">Esqueci a senha</a>
      </div>

      <p id="erroMsg" class="text-red-500 text-sm mt-4 text-center hidden">Erro ao fazer login</p>
    </div>
  `;

  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const erroMsg = document.getElementById("erroMsg");
    erroMsg.classList.add("hidden");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error(error);
      erroMsg.textContent = "❌ Email ou senha inválidos.";
      erroMsg.classList.remove("hidden");
      return;
    }

    const user = data.user;
    if (!user) {
      erroMsg.textContent = "❌ Usuário não encontrado.";
      erroMsg.classList.remove("hidden");
      return;
    }

    // 🔍 Checar se sessão WhatsApp já existe
    const { data: sessao } = await supabase
      .from("sessao")
      .select("ativo")
      .eq("usuario_id", user.id)
      .single();

    if (sessao?.ativo) {
      window.location.hash = "/home"; // 🚀 Muda o hash para a página inicial
    } else {
      window.location.hash = "/qr"; // 🚀 Muda o hash para a tela de QR Code
    }
  });
}
