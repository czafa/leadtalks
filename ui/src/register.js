// /src/auth/register.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login.html`,
      },
    });

    if (error) {
      erroMsg.textContent = "❌ Erro ao registrar: " + error.message;
      erroMsg.classList.remove("hidden");
      return;
    }

    sucessoMsg.classList.remove("hidden");
  });
