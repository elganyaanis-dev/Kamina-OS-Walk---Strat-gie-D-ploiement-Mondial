const fs = require('fs');
const path = require('path');

class FeedbackCollector {
    constructor() {
        this.feedbackFile = path.join(__dirname, 'feedbacks.json');
        this.init();
    }
    
    init() {
        if (!fs.existsSync(this.feedbackFile)) {
            fs.writeFileSync(this.feedbackFile, JSON.stringify([], null, 2));
        }
    }
    
    addFeedback(feedback) {
        const feedbacks = this.getFeedbacks();
        feedbacks.push({
            ...feedback,
            id: this.generateId(),
            date: new Date().toISOString()
        });
        
        fs.writeFileSync(this.feedbackFile, JSON.stringify(feedbacks, null, 2));
        console.log('✅ Nouveau feedback enregistré:', feedback.id);
    }
    
    getFeedbacks() {
        return JSON.parse(fs.readFileSync(this.feedbackFile, 'utf8'));
    }
    
    generateId() {
        return 'FB_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    getStats() {
        const feedbacks = this.getFeedbacks();
        const stats = {
            total: feedbacks.length,
            averageRating: 0,
            experience: {},
            lastFeedback: feedbacks[feedbacks.length - 1]
        };
        
        const ratings = feedbacks.filter(f => f.rating).map(f => parseInt(f.rating));
        if (ratings.length > 0) {
            stats.averageRating = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
        }
        
        feedbacks.forEach(f => {
            if (f.experience) {
                stats.experience[f.experience] = (stats.experience[f.experience] || 0) + 1;
            }
        });
        
        return stats;
    }
}

module.exports = FeedbackCollector;
