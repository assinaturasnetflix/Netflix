const API_URL = 'https://server-6-4yh2.onrender.com'; // URL fixa da API
const STORAGE_KEY = 'ac_mines_user';

// Elementos DOM
const loginSection = document.getElementById('loginSection');
const userInfoSection = document.getElementById('userInfoSection');
const boardSection = document.getElementById('boardSection');
const minesBoard = document.getElementById('minesBoard');
const gerarSinalBtn = document.getElementById('gerarSinalBtn');
const keyInputArea = document.getElementById('keyInputArea');
const keyInput = document.getElementById('keyInput');
const validateKeyBtn = document.getElementById('validateKeyBtn');
const errorMessage = document.getElementById('errorMessage');
const userKey = document.getElementById('userKey');
const userPlan = document.getElementById('userPlan');
const timeRemaining = document.getElementById('timeRemaining');
const refreshPredictionBtn = document.getElementById('refreshPredictionBtn');
const logoutBtn = document.getElementById('logoutBtn');
const prediction = document.getElementById('prediction');
const recommendedTile = document.getElementById('recommendedTile');

// Estado da aplicação
let userData = null;
let countdownInterval = null;

// Inicialização
document.addEventListener('DOMContentLoaded', init);

function init() {
    createBoard();
    setupEventListeners();
    checkAuthentication();
}

// Criar tabuleiro 5x5
function createBoard() {
    minesBoard.innerHTML = '';
    for (let i = 0; i < 25; i++) {
        const tile = document.createElement('div');
        tile.className = 'tile blinking';
        tile.id = `tile-${i}`;
        tile.dataset.index = i;
        minesBoard.appendChild(tile);
    }
}

// Configurar listeners de eventos
function setupEventListeners() {
    gerarSinalBtn.addEventListener('click', showKeyInput);
    validateKeyBtn.addEventListener('click', validateKey);
    refreshPredictionBtn.addEventListener('click', generatePrediction);
    logoutBtn.addEventListener('click', logout);
}

// Verificar se o usuário está autenticado
function checkAuthentication() {
    const savedUser = localStorage.getItem(STORAGE_KEY);
    
    if (savedUser) {
        userData = JSON.parse(savedUser);
        validateStoredKey();
    }
}

// Validar chave armazenada no localStorage
async function validateStoredKey() {
    try {
        const response = await fetch(`${API_URL}/auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ key: userData.key })
        });

        const data = await response.json();
        
        if (data.status === 'valid') {
            userData = {
                ...userData,
                plan: data.plano,
                timeRemaining: data.tempoRestante
            };
            
            localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
            showAuthenticatedUI();
            startCountdown();
            generatePrediction();
        } else {
            logout();
            showError(data.status === 'expired' ? 'Sua chave expirou.' : 'Chave bloqueada ou inválida.');
        }
    } catch (error) {
        console.error('Erro ao validar chave:', error);
        showError('Erro de conexão com o servidor.');
    }
}

// Mostrar campo de entrada da chave
function showKeyInput() {
    keyInputArea.classList.remove('hidden');
    gerarSinalBtn.classList.add('hidden');
}

// Validar chave inserida pelo usuário
async function validateKey() {
    const key = keyInput.value.trim();
    
    if (!key) {
        showError('Por favor, insira uma chave.');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ key })
        });

        const data = await response.json();
        
        if (data.status === 'valid') {
            userData = {
                key,
                plan: data.plano,
                timeRemaining: data.tempoRestante
            };
            
            localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
            showAuthenticatedUI();
            startCountdown();
            generatePrediction();
        } else {
            showError(data.status === 'expired' ? 'Chave expirada.' : 'Chave bloqueada ou inválida.');
        }
    } catch (error) {
        console.error('Erro ao validar chave:', error);
        showError('Erro de conexão com o servidor.');
    }
}

// Mostrar interface autenticada
function showAuthenticatedUI() {
    loginSection.classList.add('hidden');
    userInfoSection.classList.remove('hidden');
    errorMessage.classList.add('hidden');
    
    userKey.textContent = maskKey(userData.key);
    userPlan.textContent = formatPlan(userData.plan);
    
    // Remover animação piscante do tabuleiro
    document.querySelectorAll('.tile').forEach(tile => {
        tile.classList.remove('blinking');
    });
}

// Mascarar a chave para exibição parcial
function maskKey(key) {
    if (key.length <= 4) return key;
    return key.substring(0, 3) + '*'.repeat(key.length - 6) + key.substring(key.length - 3);
}

// Formatar o plano para exibição
function formatPlan(plan) {
    const plans = {
        '7d': '7 dias',
        '15d': '15 dias',
        '30d': '30 dias'
    };
    return plans[plan] || plan;
}

// Iniciar contagem regressiva
function startCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    updateCountdown();
    
    countdownInterval = setInterval(() => {
        userData.timeRemaining -= 1000;
        if (userData.timeRemaining <= 0) {
            clearInterval(countdownInterval);
            logout();
            showError('Seu acesso expirou.');
            return;
        }
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        updateCountdown();
    }, 1000);
}

// Atualizar contador regressivo
function updateCountdown() {
    const days = Math.floor(userData.timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((userData.timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((userData.timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((userData.timeRemaining % (1000 * 60)) / 1000);
    
    timeRemaining.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

// Gerar previsão
async function generatePrediction() {
    if (!userData) return;
    
    try {
        const response = await fetch(`${API_URL}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ key: userData.key })
        });

        const data = await response.json();
        
        if (data.success) {
            updateBoard(data.probabilities);
            prediction.classList.remove('hidden');
            recommendedTile.textContent = `${Math.floor(data.recommended / 5) + 1}x${data.recommended % 5 + 1}`;
        } else {
            showError('Erro ao gerar previsão.');
        }
    } catch (error) {
        console.error('Erro ao gerar previsão:', error);
        showError('Erro de conexão com o servidor.');
    }
}

// Atualizar o tabuleiro com as probabilidades
function updateBoard(probabilities) {
    document.querySelectorAll('.tile').forEach((tile, index) => {
        // Remover classes anteriores
        tile.classList.remove('safe', 'medium', 'danger');
        
        // Adicionar novas classes baseadas nas probabilidades
        const probability = probabilities[index];
        tile.textContent = `${probability}%`;
        
        if (probability >= 70) {
            tile.classList.add('safe');
        } else if (probability >= 40) {
            tile.classList.add('medium');
        } else {
            tile.classList.add('danger');
        }
    });
}

// Logout
function logout() {
    userData = null;
    localStorage.removeItem(STORAGE_KEY);
    
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    // Resetar UI
    loginSection.classList.remove('hidden');
    gerarSinalBtn.classList.remove('hidden');
    keyInputArea.classList.add('hidden');
    userInfoSection.classList.add('hidden');
    prediction.classList.add('hidden');
    keyInput.value = '';
    
    // Resetar tabuleiro
    document.querySelectorAll('.tile').forEach(tile => {
        tile.textContent = '';
        tile.className = 'tile blinking';
    });
}

// Mostrar mensagem de erro
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}