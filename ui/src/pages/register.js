import { createClient } from "@supabase/supabase-js";
import "../style.css";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function showRegister(container) {
  container.innerHTML = `
    <div class="bg-white p-8 rounded shadow-md w-full max-w-sm mx-auto mt-10">
      <h1 class="text-2xl font-bold text-center mb-6">📝 Criar conta</h1>

      <form id="registerForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" id="email" required
            class="mt-1 p-2 w-full border rounded focus:outline-none focus:ring" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Senha</label>
          <input type="password" id="password" required minlength="6"
            class="mt-1 p-2 w-full border rounded focus:outline-none focus:ring" />
        </div>

        <button type="submit"
          class="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded font-semibold">
          Criar conta
        </button>
      </form>

      <div class="text-sm text-center mt-4">
        <a href="#/login" class="text-blue-600 hover:underline">Já tenho uma conta</a>
      </div>

      <p id="sucessoMsg" class="text-green-600 text-sm mt-4 text-center hidden">
        ✅ Verifique seu email para confirmar o cadastro.
      </p>
      <p id="erroMsg" class="text-red-500 text-sm mt-2 text-center hidden">Erro ao registrar.</p>
    </div>
  `;

  document
    .getElementById("registerForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const sucessoMsg = document.getElementById("sucessoMsg");
      const erroMsg = document.getElementById("erroMsg");
      sucessoMsg.classList.add("hidden");
      erroMsg.classList.add("hidden");

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/#/login`, // 👈 Agora é hash!
        },
      });

      if (error) {
        erroMsg.textContent = "❌ Erro ao registrar: " + error.message;
        erroMsg.classList.remove("hidden");
        return;
      }

      sucessoMsg.classList.remove("hidden");
    });
}
