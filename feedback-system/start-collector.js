const FeedbackCollector = require('./collector.js');
const collector = new FeedbackCollector();

console.log('🎯 Système de Collecte de Feedbacks KAMINA-OS');
console.log('=============================================');

// Afficher les statistiques actuelles
const stats = collector.getStats();
console.log('📊 Statistiques actuelles:');
console.log(`   Total feedbacks: ${stats.total}`);
console.log(`   Note moyenne: ${stats.averageRating}/5`);
console.log(`   Dernier: ${stats.lastFeedback ? stats.lastFeedback.date : 'Aucun'}`);

console.log('\n🔍 Feedbacks récents:');
collector.getFeedbacks().slice(-5).forEach(fb => {
    console.log(`   ⭐ ${fb.rating}/5 - ${fb.message.substring(0, 50)}...`);
});

console.log('\n✅ Système prêt à collecter les feedbacks!');
console.log('🌐 Les utilisateurs peuvent maintenant donner leur avis sur:');
console.log('   https://votre-site.netlify.app/feedback.html');
