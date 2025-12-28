// ===== Configuration =====
const CONFIG = {
    apiBaseUrl: window.API_CONFIG?.apiBaseUrl || 'https://hypothalamic-lianne-unfurnitured.ngrok-free.dev',
    threshold: 0.5,
    maxRetries: 3,
    retryDelay: 1000
};

// ===== State Management =====
const state = {
    isConnected: false,
    isProcessing: false,
    currentAnalysis: null
};

// ===== DOM Elements =====
const elements = {
    chatMessages: document.getElementById('chatMessages'),
    userInput: document.getElementById('userInput'),
    sendBtn: document.getElementById('sendBtn'),
    statusDot: document.getElementById('statusDot'),
    statusText: document.getElementById('statusText'),
    charCount: document.getElementById('charCount'),
    analysisContent: document.getElementById('analysisContent')
};

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkServerHealth();
});

function setupEventListeners() {
    // Send message on Enter (without Shift)
    elements.userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Character counter and auto-resize
    elements.userInput.addEventListener('input', () => {
        const length = elements.userInput.value.length;
        elements.charCount.textContent = length;
        autoResizeTextarea();
    });
}

function autoResizeTextarea() {
    elements.userInput.style.height = 'auto';
    elements.userInput.style.height = Math.min(elements.userInput.scrollHeight, 120) + 'px';
}

// ===== Server Health Check =====
async function checkServerHealth() {
    try {
        updateStatus('connecting', 'Connecting...');

        const response = await fetch(`${CONFIG.apiBaseUrl}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }
        });

        if (response.ok) {
            const data = await response.json();
            updateStatus('connected', `Connected (${data.device || 'CPU'})`);
            state.isConnected = true;
        } else {
            throw new Error('Server not responding');
        }
    } catch (error) {
        console.error('Health check failed:', error);
        updateStatus('disconnected', 'Disconnected');
        state.isConnected = false;
    }
}

function updateStatus(status, text) {
    elements.statusText.textContent = text;
    elements.statusDot.className = 'status-dot';

    if (status === 'disconnected') {
        elements.statusDot.classList.add('disconnected');
    }
}

// ===== Message Handling =====
async function sendMessage() {
    const text = elements.userInput.value.trim();

    if (!text || state.isProcessing) return;

    if (!state.isConnected) {
        alert('Please check server connection');
        return;
    }

    // Clear input
    elements.userInput.value = '';
    elements.charCount.textContent = '0';
    autoResizeTextarea();

    // Add user message
    addUserMessage(text);

    // Show loading
    const loadingId = addLoadingMessage();

    // Process message
    state.isProcessing = true;
    elements.sendBtn.disabled = true;

    try {
        const result = await analyzeIntent(text);
        removeMessage(loadingId);
        addAssistantMessage(result);
        updateAnalysisPanel(result);
    } catch (error) {
        console.error('Error analyzing intent:', error);
        removeMessage(loadingId);
        addAssistantMessage({ error: error.message });
    } finally {
        state.isProcessing = false;
        elements.sendBtn.disabled = false;
        elements.userInput.focus();
    }
}

async function analyzeIntent(text, retryCount = 0) {
    try {
        const response = await fetch(`${CONFIG.apiBaseUrl}/parse`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({ utterance: text })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        if (retryCount < CONFIG.maxRetries) {
            console.log(`Retry ${retryCount + 1}/${CONFIG.maxRetries}...`);
            await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay));
            return analyzeIntent(text, retryCount + 1);
        }
        throw error;
    }
}

// ===== Chat UI Functions =====
function addUserMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    messageDiv.innerHTML = `
        <div class="message-avatar">U</div>
        <div class="message-content">
            <div class="message-bubble">${escapeHtml(text)}</div>
            <div class="message-time">${getCurrentTime()}</div>
        </div>
    `;
    elements.chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function addAssistantMessage(result) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant';

    let content = '';
    if (result.error) {
        content = `❌ Error: ${result.error}`;
    } else if (result.intents) {
        const intents = result.intents.join(', ');
        content = `✅ Detected: <strong>${intents}</strong>`;
    } else {
        content = '✅ Analysis complete';
    }

    messageDiv.innerHTML = `
        <div class="message-avatar">AI</div>
        <div class="message-content">
            <div class="message-bubble">${content}</div>
            <div class="message-time">${getCurrentTime()}</div>
        </div>
    `;
    elements.chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function addLoadingMessage() {
    const messageId = `loading-${Date.now()}`;
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant';
    messageDiv.id = messageId;
    messageDiv.innerHTML = `
        <div class="message-avatar">AI</div>
        <div class="message-content">
            <div class="message-bubble">
                <div class="loading-dots">
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                </div>
            </div>
        </div>
    `;
    elements.chatMessages.appendChild(messageDiv);
    scrollToBottom();
    return messageId;
}

function removeMessage(messageId) {
    const message = document.getElementById(messageId);
    if (message) message.remove();
}

function scrollToBottom() {
    setTimeout(() => {
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    }, 100);
}

// ===== Analysis Panel =====
function updateAnalysisPanel(result) {
    state.currentAnalysis = result;

    const html = `
        <!-- Intents Section -->
        <div class="analysis-section">
            <div class="section-header">
                <h4>Detected Intents</h4>
            </div>
            <div class="section-content">
                <div class="intent-tags">
                    ${renderIntents(result.intents)}
                </div>
            </div>
        </div>
        
        <!-- Probabilities Section -->
        <div class="analysis-section">
            <div class="section-header">
                <h4>Intent Probabilities</h4>
            </div>
            <div class="section-content">
                <div class="probability-list">
                    ${renderProbabilities(result.probabilities)}
                </div>
            </div>
        </div>
        
        <!-- Tokenization Section -->
        <div class="analysis-section">
            <div class="section-header">
                <h4>Tokenization (Underthesea)</h4>
            </div>
            <div class="section-content">
                <div class="token-display">
                    ${renderTokens(result.debug_info?.tokenized || [])}
                </div>
            </div>
        </div>
        
        <!-- BPE Tokens Section -->
        <div class="analysis-section">
            <div class="section-header">
                <h4>BPE Tokens (PhoBERT)</h4>
            </div>
            <div class="section-content">
                <div class="token-display">
                    ${renderBPETokens(result.debug_info?.bpe || [])}
                </div>
            </div>
        </div>
        
        <!-- h_cls Vector Section -->
        <div class="analysis-section">
            <div class="section-header">
                <h4>h_cls Vector (First 10 dims)</h4>
            </div>
            <div class="section-content">
                <div class="vector-display">
                    ${renderVector(result.debug_info?.h_cls_sample || [])}
                </div>
            </div>
        </div>
    `;

    elements.analysisContent.innerHTML = html;
}

function renderIntents(intents) {
    if (!intents || intents.length === 0) {
        return '<span class="intent-tag none">none</span>';
    }
    return intents.map(intent =>
        `<span class="intent-tag ${intent === 'none' ? 'none' : ''}">${escapeHtml(intent)}</span>`
    ).join('');
}

function renderProbabilities(probabilities) {
    if (!probabilities) return '<p>No probability data</p>';

    const sorted = Object.entries(probabilities)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    return sorted.map(([intent, prob]) => `
        <div class="probability-item">
            <span class="probability-label">${escapeHtml(intent)}</span>
            <div class="probability-bar-container">
                <div class="probability-bar" style="width: ${prob * 100}%"></div>
            </div>
            <span class="probability-value">${(prob * 100).toFixed(1)}%</span>
        </div>
    `).join('');
}

function renderTokens(tokens) {
    if (!tokens || tokens.length === 0) return '<p>No tokens</p>';
    return tokens.map(token =>
        `<span class="token">${escapeHtml(token)}</span>`
    ).join('');
}

function renderBPETokens(bpeTokens) {
    if (!bpeTokens || bpeTokens.length === 0) return '<p>No BPE tokens</p>';

    return bpeTokens.map(token => {
        const isSpecial = token.startsWith('<') && token.endsWith('>');
        const isSubword = token.includes('@@');
        const className = isSpecial ? 'token special' : (isSubword ? 'token subword' : 'token');
        return `<span class="${className}">${escapeHtml(token)}</span>`;
    }).join('');
}

function renderVector(vector) {
    if (!vector || vector.length === 0) return '<p>No vector data</p>';

    return vector.map((val, idx) =>
        `<span class="vector-item"><span class="vector-label">[${idx}]</span> ${val.toFixed(4)}</span>`
    ).join(' ');
}

// ===== Utility Functions =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getCurrentTime() {
    return new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function fillExample(text) {
    elements.userInput.value = text;
    elements.charCount.textContent = text.length;
    autoResizeTextarea();
    elements.userInput.focus();
}

function clearChat() {
    if (confirm('Clear all messages?')) {
        elements.chatMessages.innerHTML = `
            <div class="welcome-card">
                <div class="welcome-icon">👋</div>
                <h3>Chào mừng!</h3>
                <p>Nhập câu tiếng Việt để phân tích ý định</p>
                <div class="quick-examples">
                    <button onclick="fillExample('Hôm nay tôi ăn bún bò hết 50k')">Ví dụ 1</button>
                    <button onclick="fillExample('Xoá tiền trà sữa 30k hôm qua')">Ví dụ 2</button>
                    <button onclick="fillExample('Sửa lại cái tiền điện hôm qua thành 1 triệu rưỡi')">Ví dụ 3</button>
                </div>
            </div>
        `;
        elements.analysisContent.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                    <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <p>Gửi tin nhắn để xem phân tích chi tiết</p>
            </div>
        `;
    }
}

// ===== Periodic Health Check =====
setInterval(() => {
    if (!state.isProcessing) {
        checkServerHealth();
    }
}, 30000);
