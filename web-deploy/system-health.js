// 🏥 SYSTÈME DE SANTÉ KAMINA-OS-WALK
class SystemHealth {
    constructor() {
        this.metrics = {};
        this.thresholds = {
            memory: 80, // 80% max
            storage: 90, // 90% max  
            errors: 10, // max 10 erreurs/heure
            response: 5000 // 5 secondes max
        };
    }

    async checkAll() {
        const healthReport = {
            timestamp: new Date().toISOString(),
            status: 'healthy',
            metrics: {},
            issues: []
        };

        // Vérifier le stockage
        await this.checkStorage(healthReport);
        
        // Vérifier la mémoire
        await this.checkMemory(healthReport);
        
        // Vérifier les erreurs
        await this.checkErrors(healthReport);
        
        // Vérifier la performance
        await this.checkPerformance(healthReport);
        
        // Vérifier la connectivité
        await this.checkConnectivity(healthReport);

        this.metrics = healthReport;
        return healthReport;
    }

    async checkStorage(report) {
        try {
            if (navigator.storage && navigator.storage.estimate) {
                const estimate = await navigator.storage.estimate();
                const usage = (estimate.usage / estimate.quota) * 100;
                
                report.metrics.storage = {
                    usage: usage.toFixed(2) + '%',
                    status: usage < this.thresholds.storage ? 'healthy' : 'warning'
                };

                if (usage >= this.thresholds.storage) {
                    report.issues.push('Stockage presque plein: ' + usage.toFixed(2) + '%');
                    report.status = 'warning';
                }
            }
        } catch (error) {
            report.metrics.storage = { status: 'unknown', error: error.message };
        }
    }

    async checkMemory(report) {
        try {
            if (performance.memory) {
                const memory = performance.memory;
                const usage = (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
                
                report.metrics.memory = {
                    usage: usage.toFixed(2) + '%',
                    status: usage < this.thresholds.memory ? 'healthy' : 'warning'
                };

                if (usage >= this.thresholds.memory) {
                    report.issues.push('Utilisation mémoire élevée: ' + usage.toFixed(2) + '%');
                    report.status = 'warning';
                }
            }
        } catch (error) {
            report.metrics.memory = { status: 'unknown', error: error.message };
        }
    }

    async checkErrors(report) {
        // Compter les erreurs récentes (simulation)
        const errorCount = Math.floor(Math.random() * 5);
        
        report.metrics.errors = {
            count: errorCount,
            status: errorCount < this.thresholds.errors ? 'healthy' : 'warning'
        };

        if (errorCount >= this.thresholds.errors) {
            report.issues.push('Trop d\'erreurs récentes: ' + errorCount);
            report.status = 'warning';
        }
    }

    async checkPerformance(report) {
        const start = performance.now();
        
        // Simuler une opération
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const responseTime = performance.now() - start;
        
        report.metrics.performance = {
            responseTime: responseTime.toFixed(2) + 'ms',
            status: responseTime < this.thresholds.response ? 'healthy' : 'warning'
        };

        if (responseTime >= this.thresholds.response) {
            report.issues.push('Temps de réponse lent: ' + responseTime.toFixed(2) + 'ms');
            report.status = 'warning';
        }
    }

    async checkConnectivity(report) {
        try {
            const response = await fetch('https://silly-kringle-6a0a28.netlify.app', { 
                method: 'HEAD',
                cache: 'no-cache'
            });
            
            report.metrics.connectivity = {
                status: response.ok ? 'healthy' : 'error',
                online: navigator.onLine
            };

            if (!response.ok || !navigator.onLine) {
                report.issues.push('Problèmes de connectivité détectés');
                report.status = 'error';
            }
        } catch (error) {
            report.metrics.connectivity = { status: 'error', error: error.message };
            report.issues.push('Erreur de connectivité: ' + error.message);
            report.status = 'error';
        }
    }

    generateReport() {
        const report = this.metrics;
        console.log('🏥 RAPPORT SANTÉ KAMINA-OS-WALK:', report);
        return report;
    }

    startMonitoring(interval = 60000) { // Toutes les minutes
        setInterval(() => {
            this.checkAll().then(report => {
                if (report.status !== 'healthy') {
                    console.warn('⚠️  Problèmes détectés:', report.issues);
                    // Envoyer une alerte
                    if (window.sendSecurityAlert) {
                        window.sendSecurityAlert('Problèmes système détectés: ' + report.issues.join(', '));
                    }
                }
            });
        }, interval);
    }
}

// Initialisation globale
const systemHealth = new SystemHealth();
window.kaminaHealth = systemHealth;

// Démarrer le monitoring au chargement
document.addEventListener('DOMContentLoaded', function() {
    systemHealth.checkAll().then(report => {
        console.log('✅ Santé système initiale:', report);
    });
    systemHealth.startMonitoring();
});
