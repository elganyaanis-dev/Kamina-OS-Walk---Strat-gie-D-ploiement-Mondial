#!/bin/bash
echo "🌐 Deploying KAMINA-OS to Web..."
# Build pour web
cd ~/kamina-final
npm run build:web
echo "✅ Web deployment ready"
