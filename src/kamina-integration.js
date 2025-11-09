// Bridge entre KAMINA-OS-WALK et KAMINA-OS existant
const path = require('path');

class KaminaIntegration {
    static connectToExistingSystem() {
        try {
            const kaminaPath = path.join(process.env.HOME, 'kamina-final');
            const kaminaSystem = require(path.join(kaminaPath, 'kamina_system.js'));
            console.log("🔗 Connected to existing KAMINA-OS system");
            return kaminaSystem;
        } catch (error) {
            console.log("❌ KAMINA-OS not found, deploying standalone");
            return null;
        }
    }
}
module.exports = KaminaIntegration;
