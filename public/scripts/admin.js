// Configuração da API
const API_URL = 'https://server-5-zufd.onrender.com';

// Elementos do DOM
const planSelect = document.getElementById('plan-select');
const generateKeyBtn = document.getElementById('generate-key-btn');
const keyResult = document.getElementById('key-result');
const generatedKey = document.getElementById('generated-key');
const copyKeyBtn = document.getElementById('copy-key-btn');
const keyPlan = document.getElementById('key-plan');
const keyCreatedAt = document.getElementById('key-created-at');
const keysTableBody = document.getElementById('keys-table-body');

// Event Listeners
generateKeyBtn.addEventListener('click', generateKey);
copyKeyBtn.addEventListener('click', copyKeyToClipboard);

// Carregar chaves existentes quando a página carregar
window.addEventListener('DOMContentLoaded', loadKeys);

// Função para gerar uma nova chave
async function generateKey() {
  const plan = planSelect.value;
  
  try {
    const response = await fetch(`${API_URL}/api/admin/generate-key`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ plan })
    });
    
    const data = await response.json();
    
    if (data.error) {
      alert(`Erro: ${data.error}`);
      return;
    }
    
    // Exibir a chave gerada
    displayGeneratedKey(data);
    
    // Recarregar a lista de chaves
    loadKeys();
  } catch (error) {
    console.error('Erro ao gerar chave:', error);
    alert('Erro ao gerar chave. Tente novamente.');
  }
}

// Função para exibir a chave gerada
function displayGeneratedKey(data) {
  // Traduzir o plano para um formato mais amigável
  let planText;
  switch (data.plan) {
    case '7d':
      planText = '7 dias';
      break;
    case '15d':
      planText = '15 dias';
      break;
    case '30d':
      planText = '30 dias';
      break;
    default:
      planText = data.plan;
  }
  
  // Formatar data de criação
  const createdDate = new Date(data.createdAt);
  const formattedDate = formatDate(createdDate);
  
  // Atualizar elementos na página
  generatedKey.textContent = data.key;
  keyPlan.textContent = planText;
  keyCreatedAt.textContent = formattedDate;
  
  // Mostrar a seção de resultado
  keyResult.classList.remove('hidden');
}

// Função para copiar a chave para a área de transferência
async function copyKeyToClipboard() {
  const key = generatedKey.textContent;
  
  try {
    await navigator.clipboard.writeText(key);
    
    // Feedback visual temporário
    const originalText = copyKeyBtn.textContent;
    copyKeyBtn.textContent = 'Copiado!';
    
    setTimeout(() => {
      copyKeyBtn.textContent = originalText;
    }, 2000);
  } catch (error) {
    console.error('Erro ao copiar para a área de transferência:', error);
    alert('Não foi possível copiar a chave. Por favor, copie manualmente.');
  }
}

// Função para carregar todas as chaves
async function loadKeys() {
  try {
    const response = await fetch(`${API_URL}/api/admin/keys`);
    const keys = await response.json();
    
    if (keys.error) {
      throw new Error(keys.error);
    }
    
    renderKeysTable(keys);
  } catch (error) {
    console.error('Erro ao carregar chaves:', error);
    keysTableBody.innerHTML = `
      <tr>
        <td colspan="4" class="table-empty">Erro ao carregar chaves. Tente novamente mais tarde.</td>
      </tr>
    `;
  }
}

// Função para renderizar a tabela de chaves
function renderKeysTable(keys) {
  if (!keys || keys.length === 0) {
    keysTableBody.innerHTML = `
      <tr>
        <td colspan="4" class="table-empty">Nenhuma chave encontrada.</td>
      </tr>
    `;
    return;
  }
  
  // Limpar a tabela
  keysTableBody.innerHTML = '';
  
  // Adicionar cada chave à tabela
  keys.forEach(key => {
    // Traduzir o plano para um formato mais amigável
    let planText;
    switch (key.plan) {
      case '7d':
        planText = '7 dias';
        break;
      case '15d':
        planText = '15 dias';
        break;
      case '30d':
        planText = '30 dias';
        break;
      default:
        planText = key.plan;
    }
    
    // Formatar datas
    const createdDate = new Date(key.createdAt);
    const expiresDate = new Date(key.expiresAt);
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${key.key}</td>
      <td>${planText}</td>
      <td>${formatDate(createdDate)}</td>
      <td>${formatDate(expiresDate)}</td>
    `;
    
    keysTableBody.appendChild(row);
  });
}

// Função para formatar data
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}