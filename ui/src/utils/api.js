// src/api.js

export async function enviarMensagem(numeros, mensagem, tentativas = 1) {
  try {
    const response = await fetch('/api/enviar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        numeros,
        mensagem,
        tentativas
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.status || '✅ Mensagem enviada com sucesso';
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return `❌ Erro ao enviar mensagem: ${error.message}`;
  }
}

export async function buscarLog() {
  try {
    const response = await fetch('/api/log');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.log || 'Nenhum log disponível';
  } catch (error) {
    console.error('Erro ao buscar log:', error);
    throw error;
  }
} 