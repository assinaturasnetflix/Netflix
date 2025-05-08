// Configuração da API
const API_URL = 'https://server-5-zufd.onrender.com';
let currentKey = null;

// Elementos do DOM
const keyInput = document.getElementById('key-input');
const verifyKeyBtn = document.getElementById('verify-key-btn');
const keyError = document.getElementById('key-error');
const subscriptionInfo = document.getElementById('subscription-info');
const planInfo = document.getElementById('plan-info');
const daysRemaining = document.getElementById('days-remaining');
const expiresAt = document.getElementById('expires-at');
const boardSection = document.getElementById('board-section');
const generateSignalBtn = document.getElementById('generate-signal-btn');
const board = document.getElementById('board');

// Event Listeners
verifyKeyBtn.addEventListener('click', verifyKey);
generateSignalBtn.addEventListener('click', generateNewSignal);

// Verificar chave armazenada no localStorage
window.addEventListener('DOMContentLoaded', () => {
  const savedKey = localStorage.getItem('acmines-key');
  if (savedKey) {
    keyInput.value = savedKey;
    verifyKey();
  }
});

// Função para verificar a chave
async function verifyKey() {
  const key = keyInput.value.trim();
  
  if (!key) {
    showError('Por favor, insira uma chave válida.');
    return;
  }
  
  try {
    showError('');
    
    const response = await fetch(`${API_URL}/api/verify-key`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ key })
    });
    
    const data = await response.json();
    
    if (!data.valid) {
      showError('Chave inválida ou expirada.');
      return;
    }
    
    // Salvar chave no localStorage
    localStorage.setItem('acmines-key', key);
    currentKey = key;
    
    // Exibir informações da assinatura
    displaySubscriptionInfo(data);
    
    // Exibir o tabuleiro
    showBoardSection();
    
    // Gerar o primeiro sinal
    generateNewSignal();
  } catch (error) {
    console.error('Erro ao verificar chave:', error);
    showError('Erro ao verificar chave. Tente novamente.');
  }
}

// Função para exibir informações da assinatura
function displaySubscriptionInfo(data) {
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
  
  // Formatar data de expiração
  const expiryDate = new Date(data.expiresAt);
  const formattedDate = formatDate(expiryDate);
  
  // Atualizar elementos na página
  planInfo.textContent = planText;
  daysRemaining.textContent = data.remainingDays;
  expiresAt.textContent = formattedDate;
  
  // Mostrar a seção de informações
  subscriptionInfo.classList.remove('hidden');
}

// Função para mostrar a seção do tabuleiro
function showBoardSection() {
  boardSection.classList.remove('hidden');
}

// Função para gerar um novo sinal
async function generateNewSignal() {
  if (!currentKey) {
    showError('Chave inválida. Por favor, verifique sua chave.');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/api/generate-signal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ key: currentKey })
    });
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    renderBoard(data.board);
  } catch (error) {
    console.error('Erro ao gerar novo sinal:', error);
    showError('Erro ao gerar novo sinal. Tente novamente.');
  }
}

// Função para renderizar o tabuleiro
function renderBoard(boardData) {
  // Limpar o tabuleiro atual
  board.innerHTML = '';
  
  // Renderizar cada célula do tabuleiro
  boardData.forEach(row => {
    row.forEach(cell => {
      const mineElement = document.createElement('div');
      mineElement.className = `mine ${cell.color}`;
      mineElement.textContent = `${cell.percentage}%`;
      board.appendChild(mineElement);
    });
  });
  
  // Adicionar efeito de animação ao tabuleiro
  board.style.opacity = '0';
  setTimeout(() => {
    board.style.transition = 'opacity 0.5s ease';
    board.style.opacity = '1';
  }, 100);
}

// Função para mostrar mensagens de erro
function showError(message) {
  if (message) {
    keyError.textContent = message;
    keyError.classList.add('show');
  } else {
    keyError.textContent = '';
    keyError.classList.remove('show');
  }
}

// Função para formatar data
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("key-modal");
  const closeModalBtn = document.getElementById("already-have-key-btn");

  // Mostrar o modal ao carregar a página
  modal.style.display = "flex";

  // Fechar o modal ao clicar em "Já tenho chave"
  closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });
});