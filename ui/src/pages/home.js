import { configurarEventosUI, carregarContatos, carregarGrupos } from "../ui.js";

export function showHome(app) {
  app.innerHTML = `
    <div class="p-4 max-w-6xl mx-auto">

      <!-- Barra superior -->
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end mb-4">
        <input id="buscaContato" type="text" placeholder="🔍 Pesquise um contato"
          class="border border-gray-300 rounded p-2 w-full" />
        <textarea id="mensagemTexto" placeholder="Mensagem personalizada (use {{nome}})" rows="1"
          class="border border-gray-300 rounded p-2 w-full resize-none"></textarea>
        <input type="number" id="intervalo" placeholder="Intervalo (segundos)" value="10" min="1"
          class="border border-gray-300 rounded p-2 w-full" />
        <button id="btnEnviar"
          class="bg-whatsapp-green hover:bg-whatsapp-green-dark text-white font-bold px-4 py-2 rounded">
          📨 Enviar
        </button>
      </div>

      <!-- Botão de log -->
      <div class="text-center mb-4">
        <button id="btnVerLog" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded">
          📄 Ver Log
        </button>
      </div>

      <!-- Log -->
      <pre id="saidaEnvio" class="bg-white text-gray-800 p-4 rounded shadow max-h-64 overflow-y-auto"></pre>

      <!-- Contatos e Grupos lado a lado -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

        <!-- Contatos -->
        <div class="bg-white shadow rounded p-4">
          <h2 class="text-lg font-semibold text-whatsapp-header mb-2">Contatos</h2>
          <ul id="listaContatos" class="space-y-2"></ul>
        </div>

        <!-- Grupos -->
        <div class="bg-white shadow rounded p-4">
          <h2 class="text-lg font-semibold text-whatsapp-header mb-2">Grupos</h2>
          <ul id="listaGrupos" class="space-y-2 bg-gray-100 p-2 rounded"></ul>
        </div>

      </div>
    </div>
  `;

  configurarEventosUI();
  carregarContatos();
  carregarGrupos();
}
