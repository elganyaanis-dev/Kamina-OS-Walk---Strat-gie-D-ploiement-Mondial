const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

class KaminaDeployer {
    constructor() {
        this.watchDir = process.cwd();
        this.isDeploying = false;
        this.deployCount = 0;
        this.startWatching();
        console.log("🚀 KAMINA-OS-WALK AUTO-DEPLOYER v2.0 ACTIVATED");
    }

    startWatching() {
        console.log("👁️ Real-time monitoring: " + this.watchDir);
        console.log("🔗 GitHub Auto-Push: SECURE MODE");
        
        fs.watch(this.watchDir, { recursive: true }, (eventType, filename) => {
            if (filename && this.shouldDeploy(filename) && !filename.includes('.git') && !this.isDeploying) {
                console.log(`🔄 Change detected: ${filename}`);
                setTimeout(() => this.safeDeploy(), 3000);
            }
        });
    }

    shouldDeploy(filename) {
        return /\.(js|md|json|txt|yml|yaml|html|css)$/.test(filename);
    }

    safeDeploy() {
        if (this.isDeploying) {
            console.log("⏳ Deployment already in progress...");
            return;
        }
        
        this.isDeploying = true;
        this.deployCount++;
        console.log(`🔄 Starting safe deployment #${this.deployCount}...`);
        
        const deploySteps = [
            'git fetch origin',
            'git merge origin/main --no-edit',
            'git add .',
            `git commit -m "Auto-deploy #${this.deployCount}: ${new Date().toLocaleString()}"`,
            'git push origin main'
        ];

        this.executeSteps(deploySteps, 0);
    }

    executeSteps(steps, index) {
        if (index >= steps.length) {
            console.log('✅ Deployment completed successfully!');
            this.logDeployment(true, `Deployment #${this.deployCount} successful`);
            this.isDeploying = false;
            return;
        }

        const command = steps[index];
        console.log(`   ↳ Step ${index + 1}: ${command.split(' ')[0]}`);

        exec(command, (error, stdout, stderr) => {
            if (error && !command.includes('commit')) {
                console.log(`❌ Error at step ${index + 1}:`, error.message);
                this.logDeployment(false, `Failed at step ${index + 1}: ${error.message}`);
                this.isDeploying = false;
                return;
            }
            
            // Continue même si commit échoue (rien à commit)
            this.executeSteps(steps, index + 1);
        });
    }

    logDeployment(success, message) {
        const timestamp = new Date().toISOString();
        const status = success ? 'SUCCESS' : 'FAILED';
        const logEntry = `[${timestamp}] ${status}: ${message}\n`;
        
        fs.appendFileSync('/sdcard/deepbridge/kamina-os-walk/deploy.log', logEntry);
        
        // Notification bridge
        const notification = {
            project: "kamina-os-walk",
            deployment: this.deployCount,
            status: status,
            message: message,
            timestamp: timestamp
        };
        fs.writeFileSync('/sdcard/deepbridge/kamina-os-walk/last_deploy.json', JSON.stringify(notification, null, 2));
    }
}

// Démarrer le système
new KaminaDeployer();
