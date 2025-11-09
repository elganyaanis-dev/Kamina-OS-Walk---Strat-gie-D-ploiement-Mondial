#!/bin/bash
echo "📱 Deploying KAMINA-OS to Android..."
# Intégration avec le système existant
cd ~/kamina-final
npm run build:android
echo "✅ Android deployment ready"
