// 🔐 SYSTÈME D'AUTHENTIFICATION AVANCÉ KAMINA-OS
class AdvancedAuthSystem {
    constructor() {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.oauthProviders = {
            google: {
                clientId: 'YOUR_GOOGLE_CLIENT_ID',
                authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
                scope: 'profile email'
            },
            github: {
                clientId: 'YOUR_GITHUB_CLIENT_ID',
                authUrl: 'https://github.com/login/oauth/authorize',
                scope: 'user:email'
            }
        };
        this.init();
    }

    init() {
        this.checkExistingSession();
        this.setupAuthUI();
        this.setupOAuthListeners();
    }

    // 🔐 CONNEXION AVANCÉE
    async loginWithCredentials(username, password, rememberMe = false) {
        try {
            // Simulation de vérification avec hachage
            const hashedPassword = await this.hashPassword(password);
            const user = await this.verifyCredentials(username, hashedPassword);
            
            if (user) {
                await this.createSession(user, rememberMe);
                this.dispatchAuthEvent('login', user);
                return { success: true, user };
            } else {
                throw new Error('Identifiants incorrects');
            }
        } catch (error) {
            this.dispatchAuthEvent('error', error);
            return { success: false, error: error.message };
        }
    }

    // 👤 INSCRIPTION AVANCÉE
    async registerUser(userData) {
        try {
            this.validateUserData(userData);
            
            // Vérifier si l'utilisateur existe déjà
            if (await this.userExists(userData.email)) {
                throw new Error('Un compte avec cet email existe déjà');
            }

            // Créer le compte utilisateur
            const user = await this.createUserAccount(userData);
            await this.sendVerificationEmail(user);
            
            this.dispatchAuthEvent('register', user);
            return { success: true, user, message: 'Compte créé avec succès' };
            
        } catch (error) {
            this.dispatchAuthEvent('error', error);
            return { success: false, error: error.message };
        }
    }

    // 🔗 OAUTH GOOGLE
    async loginWithGoogle() {
        const googleAuthUrl = new URL(this.oauthProviders.google.authUrl);
        googleAuthUrl.searchParams.set('client_id', this.oauthProviders.google.clientId);
        googleAuthUrl.searchParams.set('redirect_uri', `${window.location.origin}/oauth-callback.html`);
        googleAuthUrl.searchParams.set('response_type', 'code');
        googleAuthUrl.searchParams.set('scope', this.oauthProviders.google.scope);
        googleAuthUrl.searchParams.set('state', this.generateState());
        
        // Stocker l'état pour la vérification
        localStorage.setItem('oauth_state', googleAuthUrl.searchParams.get('state'));
        
        // Redirection vers Google
        window.location.href = googleAuthUrl.toString();
    }

    // 🎯 GESTION SESSION
    async createSession(user, rememberMe = false) {
        const session = {
            user: user,
            token: this.generateJWT(user),
            expiresAt: Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000),
            createdAt: Date.now()
        };

        if (rememberMe) {
            localStorage.setItem('kamina_session', JSON.stringify(session));
        } else {
            sessionStorage.setItem('kamina_session', JSON.stringify(session));
        }

        this.currentUser = user;
        this.isLoggedIn = true;
        
        // Mettre à jour l'interface
        this.updateAuthUI();
    }

    // 📧 VÉRIFICATION EMAIL
    async sendVerificationEmail(user) {
        // Simulation d'envoi d'email
        const verificationToken = this.generateVerificationToken();
        user.verificationToken = verificationToken;
        user.emailVerified = false;
        
        console.log(`📧 Email de vérification envoyé à ${user.email}`);
        console.log(`🔗 Lien de vérification: ${window.location.origin}/verify-email.html?token=${verificationToken}`);
        
        // En production, envoyer un vrai email
        return true;
    }

    // 🔄 RÉINITIALISATION MOT DE PASSE
    async requestPasswordReset(email) {
        const user = await this.findUserByEmail(email);
        if (user) {
            const resetToken = this.generateResetToken();
            user.resetToken = resetToken;
            user.resetTokenExpires = Date.now() + 3600000; // 1 heure
            
            console.log(`🔐 Email de réinitialisation envoyé à ${email}`);
            console.log(`🔗 Lien: ${window.location.origin}/reset-password.html?token=${resetToken}`);
            
            return { success: true, message: 'Email de réinitialisation envoyé' };
        }
        return { success: false, error: 'Aucun compte trouvé avec cet email' };
    }

    // 🛡️ VALIDATION AVANCÉE
    validateUserData(userData) {
        const errors = [];
        
        // Validation email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            errors.push('Email invalide');
        }
        
        // Validation mot de passe
        if (userData.password.length < 8) {
            errors.push('Le mot de passe doit contenir au moins 8 caractères');
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(userData.password)) {
            errors.push('Le mot de passe doit contenir des majuscules, minuscules et chiffres');
        }
        
        // Validation username
        if (userData.username.length < 3) {
            errors.push('Le nom d\'utilisateur doit contenir au moins 3 caractères');
        }
        
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
    }

    // 🎨 INTERFACE UTILISATEUR
    setupAuthUI() {
        // Créer les éléments d'interface d'authentification
        this.createAuthModal();
        this.createUserProfileDropdown();
    }

    createAuthModal() {
        const modalHTML = `
        <div id="authModal" class="auth-modal">
            <div class="auth-modal-content">
                <span class="close-auth-modal">&times;</span>
                
                <div class="auth-tabs">
                    <button class="auth-tab active" data-tab="login">Connexion</button>
                    <button class="auth-tab" data-tab="register">Inscription</button>
                </div>
                
                <div id="loginTab" class="auth-tab-content active">
                    <form id="loginForm" class="auth-form">
                        <input type="text" name="username" placeholder="Email ou nom d'utilisateur" required>
                        <input type="password" name="password" placeholder="Mot de passe" required>
                        <div class="auth-options">
                            <label>
                                <input type="checkbox" name="rememberMe"> Se souvenir de moi
                            </label>
                            <a href="#" class="forgot-password">Mot de passe oublié?</a>
                        </div>
                        <button type="submit" class="auth-btn primary">Se connecter</button>
                    </form>
                    
                    <div class="oauth-buttons">
                        <button class="oauth-btn google" onclick="advancedAuth.loginWithGoogle()">
                            <span>🔗</span> Continuer avec Google
                        </button>
                        <button class="oauth-btn github" onclick="advancedAuth.loginWithGitHub()">
                            <span>💻</span> Continuer avec GitHub
                        </button>
                    </div>
                </div>
                
                <div id="registerTab" class="auth-tab-content">
                    <form id="registerForm" class="auth-form">
                        <input type="text" name="username" placeholder="Nom d'utilisateur" required>
                        <input type="email" name="email" placeholder="Email" required>
                        <input type="password" name="password" placeholder="Mot de passe" required>
                        <input type="password" name="confirmPassword" placeholder="Confirmer le mot de passe" required>
                        <div class="terms-agreement">
                            <label>
                                <input type="checkbox" name="agreeTerms" required>
                                J'accepte les <a href="#" class="terms-link">conditions d'utilisation</a>
                            </label>
                        </div>
                        <button type="submit" class="auth-btn primary">Créer un compte</button>
                    </form>
                </div>
            </div>
        </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.setupAuthModalEvents();
    }

    // 🎪 ÉVÉNEMENTS ET INTERACTIONS
    setupAuthModalEvents() {
        // Navigation entre onglets
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchAuthTab(tabName);
            });
        });

        // Fermeture modal
        document.querySelector('.close-auth-modal').addEventListener('click', () => {
            this.hideAuthModal();
        });

        // Soumission formulaires
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLoginForm(e.target);
        });

        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegisterForm(e.target);
        });
    }

    // 🚀 MÉTHODES UTILITAIRES
    async hashPassword(password) {
        // Simulation de hachage - en production utiliser bcrypt
        const encoder = new TextEncoder();
        const data = encoder.encode(password + 'KAMINA_SALT');
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    generateJWT(user) {
        // Simulation de token JWT
        const header = { alg: 'HS256', typ: 'JWT' };
        const payload = {
            sub: user.id,
            username: user.username,
            email: user.email,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 heures
        };
        
        return btoa(JSON.stringify(header)) + '.' + 
               btoa(JSON.stringify(payload)) + '.' + 
               'signature_simulation';
    }

    generateState() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }

    generateVerificationToken() {
        return 'verify_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    generateResetToken() {
        return 'reset_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    // 🎯 GESTION DES ÉVÉNEMENTS
    dispatchAuthEvent(type, data) {
        const event = new CustomEvent(`auth:${type}`, { detail: data });
        window.dispatchEvent(event);
    }

    // 🎨 MISE À JOUR INTERFACE
    updateAuthUI() {
        const authElements = document.querySelectorAll('.auth-status, .user-profile');
        
        authElements.forEach(element => {
            if (this.isLoggedIn) {
                element.innerHTML = this.getLoggedInUI();
            } else {
                element.innerHTML = this.getLoggedOutUI();
            }
        });
    }

    getLoggedInUI() {
        return `
        <div class="user-profile-dropdown">
            <div class="user-avatar">
                ${this.currentUser.username.charAt(0).toUpperCase()}
            </div>
            <div class="user-info">
                <div class="user-name">${this.currentUser.username}</div>
                <div class="user-email">${this.currentUser.email}</div>
            </div>
            <div class="user-menu">
                <a href="#" class="menu-item" onclick="advancedAuth.showProfile()">👤 Profil</a>
                <a href="#" class="menu-item" onclick="advancedAuth.showSettings()">⚙️ Paramètres</a>
                <a href="#" class="menu-item" onclick="advancedAuth.logout()">🚪 Déconnexion</a>
            </div>
        </div>
        `;
    }

    getLoggedOutUI() {
        return `
        <div class="auth-buttons">
            <button class="auth-btn secondary" onclick="advancedAuth.showAuthModal()">
                🔑 Connexion
            </button>
            <button class="auth-btn primary" onclick="advancedAuth.showAuthModal('register')">
                📝 Inscription
            </button>
        </div>
        `;
    }

    // 🎪 MÉTHODES D'INTERFACE
    showAuthModal(defaultTab = 'login') {
        document.getElementById('authModal').style.display = 'block';
        this.switchAuthTab(defaultTab);
    }

    hideAuthModal() {
        document.getElementById('authModal').style.display = 'none';
    }

    switchAuthTab(tabName) {
        // Masquer tous les onglets
        document.querySelectorAll('.auth-tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Afficher l'onglet sélectionné
        document.getElementById(tabName + 'Tab').classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    }

    // 🎯 GESTION DES FORMULAIRES
    async handleLoginForm(form) {
        const formData = new FormData(form);
        const credentials = {
            username: formData.get('username'),
            password: formData.get('password'),
            rememberMe: formData.get('rememberMe') === 'on'
        };
        
        const result = await this.loginWithCredentials(credentials.username, credentials.password, credentials.rememberMe);
        
        if (result.success) {
            this.hideAuthModal();
            this.showNotification('✅ Connexion réussie!', 'success');
        } else {
            this.showNotification(`❌ ${result.error}`, 'error');
        }
    }

    async handleRegisterForm(form) {
        const formData = new FormData(form);
        const userData = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            agreeTerms: formData.get('agreeTerms') === 'on'
        };
        
        if (userData.password !== userData.confirmPassword) {
            this.showNotification('❌ Les mots de passe ne correspondent pas', 'error');
            return;
        }
        
        if (!userData.agreeTerms) {
            this.showNotification('❌ Vous devez accepter les conditions', 'error');
            return;
        }
        
        const result = await this.registerUser(userData);
        
        if (result.success) {
            this.hideAuthModal();
            this.showNotification('✅ Compte créé! Vérifiez votre email.', 'success');
        } else {
            this.showNotification(`❌ ${result.error}`, 'error');
        }
    }

    // 🔔 NOTIFICATIONS
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `auth-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            color: white;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            ${type === 'success' ? 'background: #00b09b;' : ''}
            ${type === 'error' ? 'background: #ff6b6b;' : ''}
            ${type === 'info' ? 'background: #667eea;' : ''}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // 🎪 MÉTHODES SIMULÉES POUR LA DÉMO
    async verifyCredentials(username, passwordHash) {
        // Simulation - en production, vérifier avec la base de données
        const users = JSON.parse(localStorage.getItem('kamina_users') || '[]');
        return users.find(u => 
            (u.username === username || u.email === username) && 
            u.passwordHash === passwordHash
        ) || { id: 1, username: 'demo', email: 'demo@kamina.os' };
    }

    async userExists(email) {
        const users = JSON.parse(localStorage.getItem('kamina_users') || '[]');
        return users.some(u => u.email === email);
    }

    async createUserAccount(userData) {
        const user = {
            id: Date.now(),
            username: userData.username,
            email: userData.email,
            passwordHash: await this.hashPassword(userData.password),
            createdAt: new Date().toISOString(),
            emailVerified: false,
            profile: {
                avatar: null,
                bio: '',
                website: ''
            }
        };
        
        const users = JSON.parse(localStorage.getItem('kamina_users') || '[]');
        users.push(user);
        localStorage.setItem('kamina_users', JSON.stringify(users));
        
        return user;
    }

    async findUserByEmail(email) {
        const users = JSON.parse(localStorage.getItem('kamina_users') || '[]');
        return users.find(u => u.email === email);
    }

    checkExistingSession() {
        let session = sessionStorage.getItem('kamina_session') || 
                     localStorage.getItem('kamina_session');
        
        if (session) {
            session = JSON.parse(session);
            if (session.expiresAt > Date.now()) {
                this.currentUser = session.user;
                this.isLoggedIn = true;
                this.updateAuthUI();
            } else {
                this.logout();
            }
        }
    }

    // 🚪 DÉCONNEXION
    logout() {
        sessionStorage.removeItem('kamina_session');
        localStorage.removeItem('kamina_session');
        this.currentUser = null;
        this.isLoggedIn = false;
        this.updateAuthUI();
        this.dispatchAuthEvent('logout');
        this.showNotification('👋 Déconnexion réussie', 'info');
    }
}

// Initialisation globale
const advancedAuth = new AdvancedAuthSystem();
window.advancedAuth = advancedAuth;

// CSS pour l'authentification
const authStyles = `
<style>
.auth-modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.8);
    backdrop-filter: blur(10px);
}

.auth-modal-content {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    margin: 5% auto;
    padding: 0;
    border-radius: 20px;
    width: 90%;
    max-width: 400px;
    border: 2px solid #00ff41;
    box-shadow: 0 0 50px rgba(0, 255, 65, 0.3);
    position: relative;
}

.close-auth-modal {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
    position: absolute;
    right: 15px;
    top: 10px;
    cursor: pointer;
}

.close-auth-modal:hover {
    color: #00ff41;
}

.auth-tabs {
    display: flex;
    border-bottom: 1px solid rgba(0, 255, 65, 0.3);
}

.auth-tab {
    flex: 1;
    padding: 15px;
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-family: 'Courier New', monospace;
    transition: all 0.3s ease;
}

.auth-tab.active {
    background: rgba(0, 255, 65, 0.2);
    color: #00ff41;
}

.auth-tab-content {
    display: none;
    padding: 30px;
}

.auth-tab-content.active {
    display: block;
}

.auth-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.auth-form input {
    padding: 15px;
    border: 1px solid rgba(0, 255, 65, 0.3);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-family: 'Courier New', monospace;
}

.auth-form input:focus {
    outline: none;
    border-color: #00ff41;
    box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
}

.auth-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9rem;
}

.forgot-password {
    color: #00ff41;
    text-decoration: none;
}

.terms-agreement {
    font-size: 0.9rem;
}

.terms-link {
    color: #00ff41;
}

.auth-btn {
    padding: 15px;
    border: none;
    border-radius: 10px;
    font-family: 'Courier New', monospace;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
}

.auth-btn.primary {
    background: #00ff41;
    color: black;
}

.auth-btn.secondary {
    background: transparent;
    color: #00ff41;
    border: 2px solid #00ff41;
}

.auth-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 255, 65, 0.3);
}

.oauth-buttons {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.oauth-btn {
    padding: 12px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: center;
    transition: all 0.3s ease;
}

.oauth-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
}

.user-profile-dropdown {
    position: relative;
    display: inline-block;
}

.user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #00ff41;
    color: black;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    cursor: pointer;
}

.user-menu {
    display: none;
    position: absolute;
    right: 0;
    top: 100%;
    background: #1a1a2e;
    border: 1px solid #00ff41;
    border-radius: 10px;
    min-width: 200px;
    z-index: 1000;
}

.user-profile-dropdown:hover .user-menu {
    display: block;
}

.menu-item {
    display: block;
    padding: 12px 15px;
    color: white;
    text-decoration: none;
    border-bottom: 1px solid rgba(0, 255, 65, 0.2);
}

.menu-item:hover {
    background: rgba(0, 255, 65, 0.1);
    color: #00ff41;
}

@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', authStyles);
</style>
`;

document.head.insertAdjacentHTML('beforeend', authStyles);
