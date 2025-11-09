const fs = require('fs');
const { exec } = require('child_process');

class KaminaDeployer {
    constructor() {
        this.watchDir = __dirname;
        this.startWatching();
    }

    startWatching() {
        console.log("👁️ Surveillance KAMINA-OS-WALK activée");
        
        fs.watch(this.watchDir, (eventType, filename) => {
            if (filename && this.shouldDeploy(filename)) {
                console.log(`🔄 Modification détectée: ${filename}`);
                this.autoDeploy();
            }
        });
    }

    shouldDeploy(filename) {
        return /\.(js|md|json|txt|yml|yaml)$/.test(filename);
    }

    autoDeploy() {
        exec('git add . && git commit -m "Auto-deploy: Development update" && git push origin main', 
            (error, stdout, stderr) => {
                if (error) {
                    console.log(`❌ Erreur: ${error}`);
                    return;
                }
                console.log('✅ Push automatique réussi!');
                this.logDeployment();
            });
    }

    logDeployment() {
        const logEntry = `Deployed: ${new Date().toISOString()}\n`;
        fs.appendFileSync('/sdcard/deepbridge/kamina-os-walk/deploy.log', logEntry);
    }
}

new KaminaDeployer();
