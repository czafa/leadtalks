// /src/auth/login.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

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
    window.location.href = "/index.html";
  } else {
    window.location.href = "/qr.html";
  }
});
