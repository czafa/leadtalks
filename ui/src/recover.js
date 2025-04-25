// /src/auth/recover.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

document.getElementById("recoverForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const sucessoMsg = document.getElementById("sucessoMsg");
  const erroMsg = document.getElementById("erroMsg");
  sucessoMsg.classList.add("hidden");
  erroMsg.classList.add("hidden");

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/login.html`,
  });

  if (error) {
    erroMsg.textContent = "❌ Erro ao enviar email: " + error.message;
    erroMsg.classList.remove("hidden");
    return;
  }

  sucessoMsg.classList.remove("hidden");
});
