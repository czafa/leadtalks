import { configurarEventosUI, carregarContatos } from "./ui.js";

document.addEventListener("DOMContentLoaded", () => {
  configurarEventosUI(); // Inicia eventos dos botões
  carregarContatos(); // Carrega os contatos no início
});
