const fs = require('fs');
const path = require('path');

class InfrastructureMonitor {
    constructor() {
        this.baseDir = process.cwd();
        this.criticalFiles = [
            'file_bridge.js',
            'instant_connect.js', 
            'deploy_watch.js',
            'android-deploy/advanced-apk-builder.sh',
            'network/quantum_protocol.js',
            'README.md'
        ];
    }

    auditSystem() {
        console.log('🔍 AUDIT INFRASTRUCTURE KAMINA-OS');
        console.log('================================');
        
        let missingFiles = [];
        let presentFiles = [];

        this.criticalFiles.forEach(file => {
            const fullPath = path.join(this.baseDir, file);
            if (fs.existsSync(fullPath)) {
                presentFiles.push(file);
                console.log(`✅ ${file}`);
            } else {
                missingFiles.push(file);
                console.log(`❌ ${file}`);
            }
        });

        // Générer rapport
        const report = {
            timestamp: new Date().toISOString(),
            presentFiles: presentFiles,
            missingFiles: missingFiles,
            totalFiles: this.criticalFiles.length,
            coverage: ((presentFiles.length / this.criticalFiles.length) * 100).toFixed(2) + '%'
        };

        fs.writeFileSync('infrastructure_audit.json', JSON.stringify(report, null, 2));
        console.log(`\n📊 COUVERTURE: ${report.coverage}`);
        
        return report;
    }

    syncWithGitHub() {
        // Script de synchronisation automatique
        const syncScript = `
#!/bin/bash
# Script de synchronisation automatique
cd $HOME/kamina-os-walk
git add .
git commit -m "🔄 Sync auto - $(date)"
git push origin main
echo "🔄 Synchronisation GitHub terminée"
        `;
        
        fs.writeFileSync('auto-sync.sh', syncScript);
        fs.chmodSync('auto-sync.sh', '755');
    }
}

// Exécution de l'audit
const monitor = new InfrastructureMonitor();
monitor.auditSystem();
monitor.syncWithGitHub();
