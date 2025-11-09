// 🚀 SYSTÈME D'AUTHENTIFICATION KAMINA-OS
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.init();
    }

    init() {
        // Vérifier si l'utilisateur est déjà connecté
        const savedUser = localStorage.getItem('kaminaUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.isLoggedIn = true;
            this.updateUI();
        }
    }

    register(username, password, email) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (username && password) {
                    const user = {
                        id: Date.now(),
                        username: username,
                        email: email,
                        joinDate: new Date().toISOString(),
                        wallet: {
                            balance: 1000,
                            address: 'KMN_' + Math.random().toString(36).substr(2, 9).toUpperCase()
                        }
                    };
                    
                    localStorage.setItem('kaminaUser', JSON.stringify(user));
                    this.currentUser = user;
                    this.isLoggedIn = true;
                    this.updateUI();
                    
                    resolve({ success: true, user: user });
                } else {
                    reject({ success: false, error: 'Données manquantes' });
                }
            }, 1000);
        });
    }

    login(username, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulation de vérification
                if (username === 'admin' && password === 'admin') {
                    const user = {
                        id: 1,
                        username: username,
                        joinDate: new Date().toISOString(),
                        wallet: {
                            balance: 1000,
                            address: 'KMN_ADMIN123'
                        }
                    };
                    
                    localStorage.setItem('kaminaUser', JSON.stringify(user));
                    this.currentUser = user;
                    this.isLoggedIn = true;
                    this.updateUI();
                    
                    resolve({ success: true, user: user });
                } else {
                    reject({ success: false, error: 'Identifiants incorrects' });
                }
            }, 1000);
        });
    }

    logout() {
        localStorage.removeItem('kaminaUser');
        this.currentUser = null;
        this.isLoggedIn = false;
        this.updateUI();
    }

    updateUI() {
        // Mettre à jour toutes les pages
        const authElements = document.querySelectorAll('.auth-status');
        authElements.forEach(element => {
            if (this.isLoggedIn) {
                element.innerHTML = `
                    <div style="background: #00b09b; padding: 10px; border-radius: 5px;">
                        👋 Connecté: ${this.currentUser.username} 
                        <button onclick="auth.logout()" style="margin-left: 10px; background: #ff6b6b; border: none; padding: 5px 10px; border-radius: 3px; color: white;">Déconnexion</button>
                    </div>
                `;
            } else {
                element.innerHTML = `
                    <div style="background: #ffa500; padding: 10px; border-radius: 5px;">
                        🔒 Non connecté 
                        <button onclick="showLogin()" style="margin-left: 10px; background: #00ff41; border: none; padding: 5px 10px; border-radius: 3px; color: black;">Connexion</button>
                    </div>
                `;
            }
        });

        // Mettre à jour les boutons selon l'état de connexion
        const protectedButtons = document.querySelectorAll('.protected-btn');
        protectedButtons.forEach(btn => {
            btn.disabled = !this.isLoggedIn;
            btn.title = this.isLoggedIn ? '' : 'Connectez-vous pour utiliser cette fonction';
        });
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// Initialiser le système d'authentification
const auth = new AuthSystem();

// Fonctions globales pour l'interface
function showLogin() {
    const username = prompt('Nom d\'utilisateur:', 'admin');
    const password = prompt('Mot de passe:', 'admin');
    
    if (username && password) {
        auth.login(username, password)
            .then(result => {
                alert('✅ Connexion réussie! Bienvenue ' + result.user.username);
            })
            .catch(error => {
                alert('❌ ' + error.error);
            });
    }
}

function showRegister() {
    const username = prompt('Choisissez un nom d\'utilisateur:');
    const email = prompt('Votre email:');
    const password = prompt('Choisissez un mot de passe:');
    
    if (username && password) {
        auth.register(username, password, email)
            .then(result => {
                alert('✅ Compte créé! Bienvenue ' + result.user.username);
            })
            .catch(error => {
                alert('❌ ' + error.error);
            });
    }
}
