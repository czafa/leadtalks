// src/main.js

import "./style.css";
import { navegar } from "./router.js";
import { createClient } from "@supabase/supabase-js"; // 👈 importar aqui

// 🔥 Criar o supabase globalmente
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// 🔥 Expor no window para poder usar no console
window.supabase = supabase;

document.addEventListener("DOMContentLoaded", () => {
  if (!location.hash || location.hash === "#" || location.hash === "#/") {
    window.location.replace("#/login");
  } else {
    navegar(location.hash);
  }
});

window.addEventListener("hashchange", () => {
  navegar(location.hash);
});
