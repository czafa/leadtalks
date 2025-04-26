import { showLogin } from "./auth/login.js";
import { showRegister } from "./auth/register.js";
import { showRecover } from "./auth/recover.js";
import { showQR } from "./auth/qr.js";
import { showHome } from "./auth/home.js";
import { configurarEventosUI, carregarContatos, carregarGrupos } from "./ui.js";

export function navegar(hash) {
  const app = document.getElementById("app");

  switch (hash) {
    case "#/login":
      showLogin(app);
      break;
    case "#/register":
      showRegister(app);
      break;
    case "#/recover":
      showRecover(app);
      break;
    case "#/qr":
      showQR(app);
      break;
    case "#/home":
      showHome(app);
      break;
    default:
      window.location.hash = "/login"; // Redireciona para login se rota inválida
  }
}
