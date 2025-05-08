// Variáveis globais
let chaveAtual = null;
let intervalId = null;

// Elementos DOM
const authContainer = document.getElementById('auth-container');
const mainContent = document.getElementById('main-content');
const keyInput = document.getElementById('keyInput');
const validateBtn = document.getElementById('validateBtn');
const authMessage = document.getElementById('auth-message');
const planoTipo = document.getElementById('plano-tipo');
const status = document.getElementById('status');
const diasRestantes = document.getElementById('dias-restantes');
const gerarSinalBtn = document.getElementById('gerarSinalBtn');
const velasContainer = document.getElementById('velas-container');
const rosasTimesContainer = document.getElementById('rosas-times');

// URL base da API - alterar conforme necessário
// URL base da API - usar a API hospedada no Render
const API_BASE_URL = 'https://server-7-trbx.onrender.com';
// Verifica se há uma chave salva no localStorage
document.addEventListener('DOMContentLoaded', () => {
    const savedKey = localStorage.getItem('cacadorRosasKey');
    if (savedKey) {
        keyInput.value = savedKey;
        validarChave(savedKey);
    }

    // Formatar entrada da chave com hífen
    keyInput.addEventListener('input', formatarChave);
});

// Event listeners
validateBtn.addEventListener('click', () => {
    const chave = keyInput.value.trim();
    if (chave) {
        validarChave(chave);
    } else {
        mostrarMensagem('Por favor, insira uma chave válida', 'error');
    }
});

gerarSinalBtn.addEventListener('click', gerarSinal);

// Funções de validação e autenticação
function validarChave(chave) {
    authMessage.textContent = 'Validando chave...';
    
    fetch(`${API_BASE_URL}/api/chaves/validar/${chave}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.chave.valida) {
                // Chave válida
                chaveAtual = data.chave;
                localStorage.setItem('cacadorRosasKey', chave);
                atualizarInfoChave(data.chave);
                
                // Mostrar conteúdo principal
                authContainer.style.display = 'none';
                mainContent.style.display = 'block';
            } else {
                // Chave inválida ou expirada
                const mensagem = data.success ? 'Chave expirada. Por favor, adquira uma nova chave.' : data.message;
                mostrarMensagem(mensagem, 'error');
                localStorage.removeItem('cacadorRosasKey');
            }
        })
        .catch(error => {
            console.error('Erro ao validar chave:', error);
            mostrarMensagem('Erro ao validar chave. Tente novamente mais tarde.', 'error');
        });
}

function atualizarInfoChave(chave) {
    planoTipo.textContent = `${chave.tipo} dias`;
    status.textContent = chave.valida ? 'Ativa' : 'Expirada';
    status.style.color = chave.valida ? '#4caf50' : '#f44336';
    diasRestantes.textContent = chave.dias_restantes;
}

function mostrarMensagem(texto, tipo = 'info') {
    authMessage.textContent = texto;
    
    // Aplicar estilos conforme o tipo de mensagem
    if (tipo === 'error') {
        authMessage.style.color = '#f44336';
    } else if (tipo === 'success') {
        authMessage.style.color = '#4caf50';
    } else {
        authMessage.style.color = '#b0b0b0';
    }
}

function formatarChave(e) {
    // Remove todos os hífens
    let value = e.target.value.replace(/-/g, '');
    
    // Limita a 16 caracteres
    value = value.substring(0, 16);
    
    // Adiciona hífens a cada 4 caracteres
    let formattedValue = '';
    for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
            formattedValue += '-';
        }
        formattedValue += value[i];
    }
    
    e.target.value = formattedValue;
}

// Lógica de simulação das velas
function gerarSinal() {
    // Limpar contêiner de velas
    velasContainer.innerHTML = '';
    rosasTimesContainer.innerHTML = '';
    
    // Desabilitar botão durante a simulação
    gerarSinalBtn.disabled = true;
    gerarSinalBtn.textContent = 'Gerando...';
    
    // Gerar número de velas (entre 20 e 30)
    const totalVelas = Math.floor(Math.random() * 11) + 20;
    const rosasPosicoes = gerarPosicoesRosas(totalVelas);
    
    // Criar e exibir velas uma por uma
    let velaIndex = 0;
    
    if (intervalId) {
        clearInterval(intervalId);
    }
    
    intervalId = setInterval(() => {
        if (velaIndex < totalVelas) {
            const tipo = rosasPosicoes.includes(velaIndex) ? 'rosa' : (Math.random() > 0.5 ? 'azul' : 'roxa');
            criarVela(tipo, velaIndex);
            velaIndex++;
        } else {
            // Simulação completa
            clearInterval(intervalId);
            gerarSinalBtn.disabled = false;
            gerarSinalBtn.textContent = 'Gerar Sinal';
            
            // Exibir previsões de próximas rosas
            exibirPrevisaoRosas();
        }
    }, 300); // Intervalo entre velas
}

function gerarPosicoesRosas(totalVelas) {
    const posicoes = [];
    const quantidadeRosas = Math.floor(Math.random() * 3) + 1; // 1 a 3 rosas
    
    // Gerar posições aleatórias únicas
    while (posicoes.length < quantidadeRosas) {
        const posicao = Math.floor(Math.random() * totalVelas);
        if (!posicoes.includes(posicao)) {
            posicoes.push(posicao);
        }
    }
    
    return posicoes.sort((a, b) => a - b); // Ordenar posições
}

function criarVela(tipo, index) {
    const vela = document.createElement('div');
    vela.className = `vela ${tipo}`;
    
    // Altura aleatória para dar variação às velas
    const altura = 60 + Math.floor(Math.random() * 60);
    vela.style.height = `${altura}px`;
    
    velasContainer.appendChild(vela);
    
    // Rolar automaticamente para a direita conforme novas velas são adicionadas
    velasContainer.scrollLeft = velasContainer.scrollWidth;
}

function exibirPrevisaoRosas() {
    // Limpar contêiner de previsões
    rosasTimesContainer.innerHTML = '';
    
    // Gerar de 2 a 5 previsões
    const quantidadePrevisoes = Math.floor(Math.random() * 4) + 2;
    
    for (let i = 0; i < quantidadePrevisoes; i++) {
        // Obter hora atual
        const agora = new Date();
        
        // Adicionar tempo aleatório (1 a 60 minutos)
        const minutosAdicionais = Math.floor(Math.random() * 60) + 1;
        agora.setMinutes(agora.getMinutes() + minutosAdicionais);
        
        // Formatar hora
        const horaFormatada = agora.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit'
        });
        
        // Criar elemento de previsão
        const previsao = document.createElement('div');
        previsao.className = 'rosa-time';
        previsao.textContent = horaFormatada;
        
        rosasTimesContainer.appendChild(previsao);
    }
               }
