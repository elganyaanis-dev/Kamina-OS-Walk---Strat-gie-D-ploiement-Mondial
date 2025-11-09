// 🔗 SYSTÈME DE COORDINATION ENTRE PAGES KAMINA-OS
class CoordinationSystem {
    constructor() {
        this.modules = {};
        this.init();
    }

    init() {
        console.log('🔗 Système de coordination initialisé');
        this.setupEventListeners();
        this.loadUserData();
    }

    setupEventListeners() {
        // Écouter les messages entre pages
        window.addEventListener('storage', (event) => {
            if (event.key === 'kaminaData') {
                this.handleDataUpdate(JSON.parse(event.newValue));
            }
        });
    }

    loadUserData() {
        const userData = localStorage.getItem('kaminaUser');
        if (userData) {
            this.modules.user = JSON.parse(userData);
        }
    }

    handleDataUpdate(newData) {
        // Mettre à jour tous les modules avec les nouvelles données
        Object.keys(newData).forEach(module => {
            this.modules[module] = newData[module];
        });
        
        // Déclencher des mises à jour d'interface
        this.updateAllInterfaces();
    }

    updateAllInterfaces() {
        // Mettre à jour les soldes wallet sur toutes les pages
        const balanceElements = document.querySelectorAll('.wallet-balance');
        if (this.modules.user && this.modules.user.wallet) {
            balanceElements.forEach(element => {
                element.textContent = this.modules.user.wallet.balance + ' KMN';
            });
        }

        // Mettre à jour les statuts
        const statusElements = document.querySelectorAll('.system-status');
        statusElements.forEach(element => {
            element.textContent = '🟢 SYSTÈME OPÉRATIONNEL';
            element.style.color = '#00ff41';
        });
    }

    // Communication entre modules
    sendTransaction(amount, toAddress) {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (this.modules.user && this.modules.user.wallet) {
                    this.modules.user.wallet.balance -= amount;
                    localStorage.setItem('kaminaUser', JSON.stringify(this.modules.user));
                    this.updateAllInterfaces();
                    
                    resolve({
                        success: true,
                        transactionId: 'TX_' + Date.now(),
                        newBalance: this.modules.user.wallet.balance
                    });
                }
            }, 2000);
        });
    }

    // Synchronisation des données
    syncAllData() {
        const data = {
            user: this.modules.user,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('kaminaData', JSON.stringify(data));
    }
}

// Initialiser le système de coordination
const coordinator = new CoordinationSystem();
