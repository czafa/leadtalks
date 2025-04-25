import "./style.css";
import { configurarEventosUI, carregarContatos, carregarGrupos } from "./ui.js";

document.addEventListener("DOMContentLoaded", () => {
  configurarEventosUI(); // Inicia eventos dos botões
  carregarContatos();
  carregarGrupos(); // Carrega os contatos no início
});
