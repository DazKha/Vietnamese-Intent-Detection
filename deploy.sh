#!/bin/bash

# Deploy to GitHub Pages Script
# This script helps you set up and deploy the Intent Classifier Web to GitHub Pages

set -e

echo "🚀 Intent Classifier Web - GitHub Pages Deployment"
echo "=================================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    git branch -M main
else
    echo "✅ Git repository already initialized"
fi

# Get GitHub username and repo name
read -p "Enter your GitHub username: " GITHUB_USER
read -p "Enter repository name (default: IntentClassifierWeb): " REPO_NAME
REPO_NAME=${REPO_NAME:-IntentClassifierWeb}

# Check if remote exists
if git remote | grep -q "origin"; then
    echo "✅ Remote 'origin' already exists"
else
    echo "🔗 Adding remote origin..."
    git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"
fi

# Get ngrok URL
read -p "Enter your ngrok API URL (e.g., https://your-url.ngrok-free.dev): " NGROK_URL

echo ""
echo "📝 Summary:"
echo "  GitHub User: $GITHUB_USER"
echo "  Repository: $REPO_NAME"
echo "  Ngrok URL: $NGROK_URL"
echo ""
read -p "Continue with deployment? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Update config.js for local testing
echo "📝 Updating config.js..."
cat > config.js << EOF
// Default config for local development
// This file will be overwritten by GitHub Actions during deployment
window.API_CONFIG = {
    apiBaseUrl: '$NGROK_URL'
};
EOF

# Add all files
echo "📦 Adding files to git..."
git add .

# Commit
echo "💾 Creating commit..."
git commit -m "Deploy Intent Classifier Web to GitHub Pages" || echo "No changes to commit"

# Push to GitHub
echo "⬆️  Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Code pushed to GitHub!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Go to: https://github.com/$GITHUB_USER/$REPO_NAME/settings/secrets/actions"
echo "2. Click 'New repository secret'"
echo "3. Name: NGROK_API_URL"
echo "4. Value: $NGROK_URL"
echo "5. Click 'Add secret'"
echo ""
echo "6. Go to: https://github.com/$GITHUB_USER/$REPO_NAME/settings/pages"
echo "7. Under 'Source', select 'GitHub Actions'"
echo "8. Save"
echo ""
echo "9. Go to: https://github.com/$GITHUB_USER/$REPO_NAME/actions"
echo "10. Click 'Deploy to GitHub Pages' workflow"
echo "11. Click 'Run workflow' → 'Run workflow'"
echo ""
echo "Your site will be available at:"
echo "🌐 https://$GITHUB_USER.github.io/$REPO_NAME/"
echo ""
echo "✨ Done!"
