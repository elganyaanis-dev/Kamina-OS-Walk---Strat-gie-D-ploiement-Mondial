// 🌐 BLOCKCHAIN KAMINA-CHAIN AVANCÉE
class KaminaBlockchain {
    constructor() {
        this.chain = [];
        this.pendingTransactions = [];
        this.difficulty = 4;
        this.miningReward = 50;
        this.networkNodes = [];
        this.init();
    }

    init() {
        console.log('🌐 Initialisation de KAMINA-CHAIN...');
        this.createGenesisBlock();
        this.startNetwork();
        this.loadFromStorage();
    }

    createGenesisBlock() {
        const genesisBlock = {
            index: 0,
            timestamp: Date.now(),
            transactions: [],
            previousHash: '0',
            hash: this.calculateHash(0, Date.now(), [], '0'),
            nonce: 0,
            difficulty: this.difficulty
        };
        this.chain.push(genesisBlock);
        console.log('✅ Bloc genesis créé:', genesisBlock.hash);
    }

    // 🏗️ CRÉATION DE BLOC
    createNewBlock(nonce, previousHash, hash) {
        const newBlock = {
            index: this.chain.length,
            timestamp: Date.now(),
            transactions: this.pendingTransactions,
            previousHash: previousHash,
            hash: hash,
            nonce: nonce,
            difficulty: this.difficulty,
            validator: this.getValidator()
        };

        this.pendingTransactions = [];
        this.chain.push(newBlock);
        
        // Récompense de minage
        this.pendingTransactions.push({
            from: 'network',
            to: this.getValidator(),
            amount: this.miningReward,
            timestamp: Date.now(),
            type: 'mining_reward'
        });

        this.saveToStorage();
        this.broadcastNewBlock(newBlock);
        
        return newBlock;
    }

    // ⛏️ PREUVE DE TRAVAIL (MINING)
    proofOfWork(previousHash, currentBlockData) {
        let nonce = 0;
        let hash = this.calculateHashWithNonce(previousHash, currentBlockData, nonce);
        
        while (hash.substring(0, this.difficulty) !== Array(this.difficulty + 1).join('0')) {
            nonce++;
            hash = this.calculateHashWithNonce(previousHash, currentBlockData, nonce);
        }
        
        return nonce;
    }

    // 🔗 HACHAGE
    calculateHash(index, timestamp, transactions, previousHash, nonce = 0) {
        return SHA256(
            index + timestamp + JSON.stringify(transactions) + previousHash + nonce
        ).toString();
    }

    calculateHashWithNonce(previousHash, currentBlockData, nonce) {
        const dataAsString = previousHash + JSON.stringify(currentBlockData) + nonce;
        return SHA256(dataAsString).toString();
    }

    // 💰 CRÉATION DE TRANSACTION
    createTransaction(transaction) {
        // Validation de la transaction
        if (!this.isValidTransaction(transaction)) {
            throw new Error('Transaction invalide');
        }

        // Vérifier le solde
        if (!this.hasSufficientBalance(transaction.from, transaction.amount)) {
            throw new Error('Solde insuffisant');
        }

        // Signer la transaction
        transaction.signature = this.signTransaction(transaction);
        transaction.timestamp = Date.now();
        transaction.status = 'pending';
        transaction.hash = this.calculateTransactionHash(transaction);

        this.pendingTransactions.push(transaction);
        this.broadcastTransaction(transaction);

        return transaction;
    }

    // 🪙 TOKEN KMN - SMART CONTRACT
    kmnTokenContract = {
        name: 'Kamina Token',
        symbol: 'KMN',
        decimals: 18,
        totalSupply: 1000000,
        balances: {},
        
        transfer: function(from, to, amount) {
            if (this.balances[from] >= amount) {
                this.balances[from] -= amount;
                this.balances[to] = (this.balances[to] || 0) + amount;
                
                // Émettre un événement
                this.emit('Transfer', { from, to, amount });
                return true;
            }
            return false;
        },
        
        mint: function(to, amount) {
            this.totalSupply += amount;
            this.balances[to] = (this.balances[to] || 0) + amount;
            this.emit('Mint', { to, amount });
        },
        
        burn: function(from, amount) {
            if (this.balances[from] >= amount) {
                this.balances[from] -= amount;
                this.totalSupply -= amount;
                this.emit('Burn', { from, amount });
                return true;
            }
            return false;
        }
    };

    // 🎯 STAKING ET RÉCOMPENSES
    stakingContract = {
        stakers: {},
        totalStaked: 0,
        apy: 15, // 15% APY
        
        stake: function(wallet, amount) {
            if (this.stakers[wallet]) {
                this.stakers[wallet].amount += amount;
            } else {
                this.stakers[wallet] = {
                    amount: amount,
                    startTime: Date.now(),
                    rewards: 0
                };
            }
            this.totalStaked += amount;
            this.emit('Staked', { wallet, amount });
        },
        
        unstake: function(wallet, amount) {
            if (this.stakers[wallet] && this.stakers[wallet].amount >= amount) {
                this.stakers[wallet].amount -= amount;
                this.totalStaked -= amount;
                
                // Calculer les récompenses
                const rewards = this.calculateRewards(wallet);
                this.stakers[wallet].rewards += rewards;
                
                this.emit('Unstaked', { wallet, amount, rewards });
                return rewards;
            }
            return 0;
        },
        
        calculateRewards: function(wallet) {
            const staker = this.stakers[wallet];
            const stakingTime = Date.now() - staker.startTime;
            const yearlyReward = (staker.amount * this.apy) / 100;
            const actualReward = (yearlyReward * stakingTime) / (365 * 24 * 60 * 60 * 1000);
            return actualReward;
        }
    };

    // 🔍 EXPLORER LA BLOCKCHAIN
    getBlockchain() {
        return {
            chain: this.chain,
            length: this.chain.length,
            totalTransactions: this.chain.reduce((acc, block) => acc + block.transactions.length, 0),
            totalStaked: this.stakingContract.totalStaked,
            networkNodes: this.networkNodes.length,
            difficulty: this.difficulty
        };
    }

    getBlock(blockHash) {
        return this.chain.find(block => block.hash === blockHash);
    }

    getTransaction(transactionHash) {
        for (let block of this.chain) {
            const transaction = block.transactions.find(tx => tx.hash === transactionHash);
            if (transaction) return transaction;
        }
        return null;
    }

    getAddressTransactions(address) {
        const transactions = [];
        for (let block of this.chain) {
            for (let tx of block.transactions) {
                if (tx.from === address || tx.to === address) {
                    transactions.push(tx);
                }
            }
        }
        return transactions;
    }

    // 🌐 RÉSEAU P2P
    startNetwork() {
        // Simulation de nœuds réseau
        this.networkNodes = [
            'node1.kamina-chain.io',
            'node2.kamina-chain.io', 
            'node3.kamina-chain.io'
        ];
        
        console.log('🌐 Réseau P2P démarré avec', this.networkNodes.length, 'nœuds');
    }

    broadcastNewBlock(newBlock) {
        // Simulation de diffusion aux autres nœuds
        this.networkNodes.forEach(node => {
            console.log(`📤 Diffusion du bloc ${newBlock.hash} à ${node}`);
        });
    }

    broadcastTransaction(transaction) {
        this.networkNodes.forEach(node => {
            console.log(`📤 Diffusion transaction ${transaction.hash} à ${node}`);
        });
    }

    // 💾 PERSISTANCE
    saveToStorage() {
        const blockchainData = {
            chain: this.chain,
            pendingTransactions: this.pendingTransactions,
            stakingContract: this.stakingContract
        };
        localStorage.setItem('kamina_blockchain', JSON.stringify(blockchainData));
    }

    loadFromStorage() {
        const saved = localStorage.getItem('kamina_blockchain');
        if (saved) {
            const data = JSON.parse(saved);
            this.chain = data.chain || [];
            this.pendingTransactions = data.pendingTransactions || [];
            this.stakingContract = data.stakingContract || this.stakingContract;
            console.log('💾 Blockchain chargée depuis le stockage');
        }
    }

    // 🛡️ VALIDATION
    isValidTransaction(transaction) {
        return transaction.from && 
               transaction.to && 
               transaction.amount > 0 &&
               this.verifySignature(transaction);
    }

    hasSufficientBalance(address, amount) {
        const balance = this.getBalance(address);
        return balance >= amount;
    }

    getBalance(address) {
        let balance = 1000; // Balance initiale pour la démo
        
        for (let block of this.chain) {
            for (let tx of block.transactions) {
                if (tx.from === address) {
                    balance -= tx.amount;
                }
                if (tx.to === address) {
                    balance += tx.amount;
                }
            }
        }
        
        return balance;
    }

    // 🔐 SIGNATURE NUMÉRIQUE (simulation)
    signTransaction(transaction) {
        const data = transaction.from + transaction.to + transaction.amount + transaction.timestamp;
        return 'sig_' + SHA256(data + 'KAMINA_PRIVATE_KEY').toString().substring(0, 32);
    }

    verifySignature(transaction) {
        const data = transaction.from + transaction.to + transaction.amount + transaction.timestamp;
        const expectedSig = 'sig_' + SHA256(data + 'KAMINA_PRIVATE_KEY').toString().substring(0, 32);
        return transaction.signature === expectedSig;
    }

    getValidator() {
        // Simulation de Proof-of-Stake
        const stakers = Object.keys(this.stakingContract.stakers);
        if (stakers.length > 0) {
            return stakers[Math.floor(Math.random() * stakers.length)];
        }
        return 'validator_node_1';
    }

    // 🎯 MINEUR AUTOMATIQUE (démo)
    startAutoMining() {
        setInterval(() => {
            if (this.pendingTransactions.length > 0) {
                console.log('⛏️  Début du minage...');
                const previousHash = this.chain[this.chain.length - 1].hash;
                const nonce = this.proofOfWork(previousHash, this.pendingTransactions);
                const hash = this.calculateHashWithNonce(previousHash, this.pendingTransactions, nonce);
                
                const newBlock = this.createNewBlock(nonce, previousHash, hash);
                console.log('✅ Nouveau bloc miné:', newBlock.hash);
                
                // Émettre un événement
                this.emit('BlockMined', newBlock);
            }
        }, 30000); // Toutes les 30 secondes
    }
}

// 📊 EXPLORER DE BLOCKCHAIN
class BlockchainExplorer {
    constructor(blockchain) {
        this.blockchain = blockchain;
        this.init();
    }

    init() {
        this.setupUI();
        this.startLiveUpdates();
    }

    setupUI() {
        // Créer l'interface de l'explorer
        this.createExplorerInterface();
    }

    createExplorerInterface() {
        const explorerHTML = `
        <div id="blockchainExplorer" class="blockchain-explorer">
            <div class="explorer-header">
                <h2>🔗 KAMINA-CHAIN EXPLORER</h2>
                <div class="network-stats" id="networkStats"></div>
            </div>
            
            <div class="explorer-grid">
                <div class="blocks-panel">
                    <h3>📦 Derniers Blocs</h3>
                    <div id="blocksList" class="blocks-list"></div>
                </div>
                
                <div class="transactions-panel">
                    <h3>💸 Transactions Récentes</h3>
                    <div id="transactionsList" class="transactions-list"></div>
                </div>
                
                <div class="staking-panel">
                    <h3>🎯 Staking & Récompenses</h3>
                    <div id="stakingInfo" class="staking-info"></div>
                </div>
            </div>
            
            <div class="mining-controls">
                <button onclick="blockchain.startAutoMining()" class="mine-btn">⛏️ Démarrer Mining</button>
                <button onclick="blockchain.createDemoTransaction()" class="tx-btn">🔄 Transaction Démo</button>
            </div>
        </div>
        `;

        document.body.insertAdjacentHTML('beforeend', explorerHTML);
        this.updateExplorer();
    }

    updateExplorer() {
        this.updateNetworkStats();
        this.updateBlocksList();
        this.updateTransactionsList();
        this.updateStakingInfo();
    }

    updateNetworkStats() {
        const stats = this.blockchain.getBlockchain();
        document.getElementById('networkStats').innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Hauteur:</span>
                <span class="stat-value">${stats.length}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Transactions:</span>
                <span class="stat-value">${stats.totalTransactions}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Staké:</span>
                <span class="stat-value">${stats.totalStaked} KMN</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Nœuds:</span>
                <span class="stat-value">${stats.networkNodes.length}</span>
            </div>
        `;
    }

    updateBlocksList() {
        const blocks = this.blockchain.chain.slice(-5).reverse();
        document.getElementById('blocksList').innerHTML = blocks.map(block => `
            <div class="block-item">
                <div class="block-header">
                    <span class="block-hash">${block.hash.substring(0, 16)}...</span>
                    <span class="block-number">#${block.index}</span>
                </div>
                <div class="block-details">
                    <div>Transactions: ${block.transactions.length}</div>
                    <div>Nonce: ${block.nonce}</div>
                    <div>Validateur: ${block.validator}</div>
                </div>
            </div>
        `).join('');
    }

    updateTransactionsList() {
        const recentTxs = [];
        this.blockchain.chain.slice(-3).forEach(block => {
            block.transactions.forEach(tx => recentTxs.push(tx));
        });
        
        document.getElementById('transactionsList').innerHTML = recentTxs.slice(-10).reverse().map(tx => `
            <div class="transaction-item">
                <div class="tx-header">
                    <span class="tx-hash">${tx.hash?.substring(0, 12) || 'N/A'}...</span>
                    <span class="tx-amount">${tx.amount} KMN</span>
                </div>
                <div class="tx-details">
                    <div>De: ${tx.from.substring(0, 8)}...</div>
                    <div>À: ${tx.to.substring(0, 8)}...</div>
                    <div>Statut: ${tx.status || 'confirmed'}</div>
                </div>
            </div>
        `).join('');
    }

    updateStakingInfo() {
        const staking = this.blockchain.stakingContract;
        document.getElementById('stakingInfo').innerHTML = `
            <div class="staking-stats">
                <div>Total Staké: <strong>${staking.totalStaked} KMN</strong></div>
                <div>APY: <strong>${staking.apy}%</strong></div>
                <div>Stakers: <strong>${Object.keys(staking.stakers).length}</strong></div>
            </div>
            <button onclick="showStakingInterface()" class="stake-btn">🎯 Commencer le Staking</button>
        `;
    }

    startLiveUpdates() {
        setInterval(() => {
            this.updateExplorer();
        }, 5000);
    }
}

// 🚀 SIMULATION SHA256 (pour la démo)
function SHA256(input) {
    // Simulation simple - en production utiliser une vraie librairie
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return {
        toString: () => Math.abs(hash).toString(16)
    };
}

// Initialisation globale
const blockchain = new KaminaBlockchain();
const explorer = new BlockchainExplorer(blockchain);

// Méthodes globales pour l'interface
window.showStakingInterface = function() {
    alert('🎯 Interface de Staking KMN\n\nAPY: 15%\nMinimum: 100 KMN\nPériode: 90 jours\n\nFonctionnalité en développement...');
};

window.createDemoTransaction = function() {
    const tx = blockchain.createTransaction({
        from: 'KMN_USER1',
        to: 'KMN_USER2', 
        amount: Math.floor(Math.random() * 100) + 1,
        type: 'transfer'
    });
    alert(`🔄 Transaction démo créée!\n\n${tx.amount} KMN de ${tx.from} à ${tx.to}`);
};

// CSS pour la blockchain
const blockchainStyles = `
<style>
.blockchain-explorer {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 15px;
    padding: 25px;
    margin: 20px 0;
    border: 2px solid #00ff41;
    font-family: 'Courier New', monospace;
}

.explorer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    border-bottom: 1px solid rgba(0, 255, 65, 0.3);
    padding-bottom: 15px;
}

.network-stats {
    display: flex;
    gap: 20px;
}

.stat-item {
    text-align: center;
}

.stat-label {
    display: block;
    font-size: 0.8rem;
    opacity: 0.8;
}

.stat-value {
    display: block;
    font-size: 1.2rem;
    font-weight: bold;
    color: #00ff41;
}

.explorer-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 20px;
    margin-bottom: 25px;
}

.blocks-panel, .transactions-panel, .staking-panel {
    background: rgba(0, 0, 0, 0.5);
    padding: 20px;
    border-radius: 10px;
    border: 1px solid rgba(0, 255, 65, 0.2);
}

.blocks-list, .transactions-list, .staking-info {
    max-height: 300px;
    overflow-y: auto;
}

.block-item, .transaction-item {
    background: rgba(255, 255, 255, 0.05);
    padding: 12px;
    margin: 8px 0;
    border-radius: 8px;
    border-left: 3px solid #00ff41;
}

.block-header, .tx-header {
    display: flex;
    justify-content: space-between;
    font-weight: bold;
    margin-bottom: 5px;
}

.block-hash, .tx-hash {
    color: #00ff41;
    font-size: 0.9rem;
}

.block-number, .tx-amount {
    color: #ffd700;
}

.block-details, .tx-details {
    font-size: 0.8rem;
    opacity: 0.8;
}

.mining-controls {
    display: flex;
    gap: 15px;
    justify-content: center;
}

.mine-btn, .tx-btn, .stake-btn {
    background: #00ff41;
    color: black;
    border: none;
    padding: 12px 20px;
    border-radius: 25px;
    font-family: 'Courier New', monospace;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
}

.mine-btn:hover, .tx-btn:hover, .stake-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 255, 65, 0.3);
}

.staking-stats {
    margin-bottom: 15px;
    line-height: 1.6;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', blockchainStyles);
