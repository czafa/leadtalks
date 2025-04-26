import "./style.css";
import { navegar } from "./router.js";

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
