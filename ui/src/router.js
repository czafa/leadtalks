import { showLogin } from "./pages/login.js";
import { showRegister } from "./pages/register.js";
import { showRecover } from "./pages/recover.js";
import { showQR } from "./pages/qr.js";
import { showHome } from "./pages/home.js";
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
