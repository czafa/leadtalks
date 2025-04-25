# 🔣 LeadTalks

**LeadTalks** é uma aplicação full stack para captação de leads via WhatsApp, permitindo selecionar contatos e grupos, personalizar mensagens e acompanhar logs de envio, tudo por meio de uma interface web moderna integrada a uma API desenvolvida com FastAPI.

---

## 🚀 Tecnologias Utilizadas

- **Backend**: [FastAPI](https://fastapi.tiangolo.com/), Python 3.12
- **Frontend**: Vite + TailwindCSS (SPA buildada em `ui/`)
- **Envio WhatsApp**: [Baileys](https://github.com/WhiskeySockets/Baileys) via Node.js
- **Execução assíncrona**: subprocessos Node a partir da API
- **Armazenamento**: arquivos JSON simulando banco de dados (`contatos.json`, `grupos.json`, etc.)

---

## 📁 Estrutura do Projeto

```bash
leadTalks/
├── api/                    # Backend FastAPI
│   ├── main.py             # Entrypoint FastAPI
│   ├── routes/             # Rotas: contatos, enviar, grupos, log, membros
│   └── utils.py            # Funções auxiliares (leitura de arquivos, paths)
├── ui/                     # Frontend Vite + Tailwind
│   ├── index.html          # Página principal
│   └── src/                # Scripts e componentes frontend
├── whatsapp-core/          # Núcleo de envio (Node.js com Baileys)
│   ├── sender.js           # Script que envia mensagens
│   ├── queue.json          # Fila de envio gerada pela API
│   ├── auth/               # Autenticação WhatsApp
│   └── logs/               # Log de envios
├── requirements.txt        # Dependências do Python
├── estrutura.txt           # (gerado via tree -L 2)
└── Readme.md               # Este arquivo
```

---

## ⚙️ Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/seu-usuario/leadtalks.git
   cd leadtalks
   ```

2. Crie o ambiente virtual:

   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Instale as dependências:

   ```bash
   pip install -r requirements.txt
   ```

4. Instale dependências Node no `whatsapp-core`:

   ```bash
   cd whatsapp-core
   npm install
   ```

5. Instale o frontend:
   ```bash
   cd ../ui
   npm install
   npm run build
   ```

---

## ▶️ Execução

Com o ambiente ativado:

```bash
uvicorn api.main:app --reload
```

Acesse: [http://localhost:8000](http://localhost:8000)  
Docs da API: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📬 Fluxo de Envio

1. O usuário seleciona contatos e escreve uma mensagem personalizada (com `{{nome}}`).
2. A mensagem é enviada via POST para a API `/api/enviar`.
3. A API grava os dados no `queue.json` e dispara o `sender.js`.
4. O Node envia as mensagens com intervalo aleatório e loga tudo em `logs/envio.log`.
5. A interface exibe os logs ao vivo usando o endpoint `/log`.

---

## 📌 Endpoints Principais

| Método | Rota                  | Descrição                         |
| ------ | --------------------- | --------------------------------- |
| GET    | `/api/contatos`       | Retorna lista de contatos         |
| GET    | `/api/grupos`         | Retorna grupos e membros          |
| GET    | `/api/membros-grupos` | Retorna membros por grupo         |
| POST   | `/api/enviar`         | Envia mensagem para contatos      |
| GET    | `/log`                | Retorna últimos 100 logs de envio |

---

## 🛡️ Considerações de Segurança

- O CORS está liberado com `allow_origins=["*"]` — restrinja isso em produção.
- O sistema usa arquivos JSON como base de dados simulada.
- O `sender.js` roda subprocessos diretamente — idealmente rodar isso em ambiente seguro.

---

## 📄 Licença

Este projeto é de uso interno ou educacional. Para distribuição ou uso comercial, entre em contato com o autor.

---

## ✉️ Contato

Criado por **Caio Zafalon**.  
Para dúvidas técnicas ou colaboração, abra uma [issue](https://github.com/seu-usuario/leadtalks/issues) ou envie um PR 🚀
