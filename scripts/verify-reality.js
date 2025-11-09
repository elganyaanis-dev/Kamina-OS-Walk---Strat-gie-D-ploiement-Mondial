const https = require('https');

class RealityVerifier {
    async verifyAllDeployments() {
        console.log("🔍 VÉRIFICATION QUE KAMINA-OS EST RÉEL...");
        
        const checks = [
            { name: 'Site Web', url: 'https://kamina-os.vercel.app', expected: 200 },
            { name: 'API Cloud', url: 'https://api.kamina-os.lambda-url.com', expected: 200 },
            { name: 'APK Mobile', url: 'https://drive.google.com/file/d/...', expected: 200 }
        ];
        
        for (let check of checks) {
            const isLive = await this.checkUrl(check.url);
            console.log(`${isLive ? '✅' : '❌'} ${check.name}: ${isLive ? 'RÉEL' : 'HORS LIGNE'}`);
        }
        
        console.log(isLive ? "\n🎉 KAMINA-OS EST MAINTENANT RÉEL!" : "\n⚠️  Certains services sont hors ligne");
    }
    
    checkUrl(url) {
        return new Promise((resolve) => {
            https.get(url, (res) => {
                resolve(res.statusCode === 200);
            }).on('error', () => resolve(false));
        });
    }
}

new RealityVerifier().verifyAllDeployments();
