// 🔗 SYSTÈME DE MESSAGERIE TEMPS RÉEL KAMINA-OS
class RealtimeMessaging {
    constructor() {
        this.messages = [];
        this.connections = new Map();
        this.init();
    }

    init() {
        console.log('🔗 Initialisation du système de messagerie temps réel');
        this.loadMessages();
        this.setupEventListeners();
        this.startHeartbeat();
    }

    setupEventListeners() {
        // Écouter les messages du localStorage pour la communication entre onglets
        window.addEventListener('storage', (event) => {
            if (event.key === 'kaminaMessages') {
                this.handleNewMessage(JSON.parse(event.newValue));
            }
        });

        // Écouter les messages broadcast
        window.addEventListener('message', (event) => {
            if (event.data.type === 'kaminaMessage') {
                this.handleBroadcastMessage(event.data);
            }
        });
    }

    sendMessage(content, type = 'text', recipient = 'all') {
        const message = {
            id: this.generateMessageId(),
            content: content,
            type: type,
            sender: this.getCurrentUser()?.username || 'Anonymous',
            recipient: recipient,
            timestamp: new Date().toISOString(),
            status: 'sent'
        };

        this.messages.push(message);
        this.saveMessages();
        this.broadcastMessage(message);
        this.displayMessage(message);

        return message;
    }

    broadcastMessage(message) {
        // Broadcast via localStorage
        localStorage.setItem('kaminaMessages', JSON.stringify(message));
        
        // Broadcast via window.postMessage
        window.postMessage({
            type: 'kaminaMessage',
            data: message
        }, '*');

        // Simuler la réception sur d'autres pages
        setTimeout(() => {
            if (Math.random() > 0.3) { // 70% de chance de "réception"
                message.status = 'delivered';
                this.updateMessageStatus(message.id, 'delivered');
            }
        }, 1000);
    }

    handleNewMessage(message) {
        if (message.id && !this.messages.find(m => m.id === message.id)) {
            this.messages.push(message);
            this.displayMessage(message);
        }
    }

    handleBroadcastMessage(data) {
        this.handleNewMessage(data.data);
    }

    displayMessage(message) {
        const chatContainer = document.getElementById('chatMessages');
        if (chatContainer) {
            const messageElement = document.createElement('div');
            messageElement.className = `message ${message.sender === (this.getCurrentUser()?.username || 'Anonymous') ? 'own' : 'other'}`;
            messageElement.innerHTML = `
                <div class="message-header">
                    <strong>${message.sender}</strong>
                    <span class="time">${new Date(message.timestamp).toLocaleTimeString()}</span>
                </div>
                <div class="message-content">${this.formatMessageContent(message)}</div>
                <div class="message-status">${message.status === 'delivered' ? '✓✓' : '✓'}</div>
            `;
            chatContainer.appendChild(messageElement);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    formatMessageContent(message) {
        switch (message.type) {
            case 'system':
                return `<div class="system-message">🔔 ${message.content}</div>`;
            case 'transaction':
                return `<div class="transaction-message">💰 ${message.content}</div>`;
            case 'alert':
                return `<div class="alert-message">🚨 ${message.content}</div>`;
            default:
                return message.content;
        }
    }

    startHeartbeat() {
        setInterval(() => {
            this.sendMessage('❤️ Heartbeat', 'system');
        }, 30000); // Toutes les 30 secondes
    }

    generateMessageId() {
        return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('kaminaUser') || 'null');
    }

    saveMessages() {
        localStorage.setItem('kaminaMessageHistory', JSON.stringify(this.messages.slice(-100))); // Garder les 100 derniers
    }

    loadMessages() {
        const saved = localStorage.getItem('kaminaMessageHistory');
        if (saved) {
            this.messages = JSON.parse(saved);
            this.messages.forEach(msg => this.displayMessage(msg));
        }
    }

    updateMessageStatus(messageId, status) {
        const message = this.messages.find(m => m.id === messageId);
        if (message) {
            message.status = status;
            this.saveMessages();
        }
    }

    // Fonctions utilitaires
    sendTransactionAlert(amount, toAddress) {
        return this.sendMessage(
            `Transaction de ${amount} KMN vers ${toAddress}`,
            'transaction'
        );
    }

    sendSecurityAlert(alert) {
        return this.sendMessage(alert, 'alert');
    }

    sendSystemNotification(notification) {
        return this.sendMessage(notification, 'system');
    }
}

// Initialisation globale
const kaminaMessaging = new RealtimeMessaging();

// API globale
window.sendKaminaMessage = (content, type = 'text') => {
    return kaminaMessaging.sendMessage(content, type);
};

window.sendTransactionAlert = (amount, toAddress) => {
    return kaminaMessaging.sendTransactionAlert(amount, toAddress);
};

window.sendSecurityAlert = (alert) => {
    return kaminaMessaging.sendSecurityAlert(alert);
};
