# Intent Classifier Web Interface

Vietnamese Intent Classification powered by VSLIM and PhoBERT.

## 🚀 Features

- **Two-column layout**: Chat interface on the left, detailed analysis on the right
- **Real-time analysis**: Instant intent classification with probability scores
- **Detailed tokenization view**: 
  - Underthesea word segmentation
  - PhoBERT BPE tokens with syntax highlighting
  - h_cls vector visualization
- **Modern UI**: Dark theme with glassmorphism effects

## 🛠️ Local Development

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/IntentClassifierWeb.git
cd IntentClassifierWeb
```

2. Update `config.js` with your ngrok API URL:
```javascript
window.API_CONFIG = {
    apiBaseUrl: 'https://your-ngrok-url.ngrok-free.dev'
};
```

3. Open `index.html` in your browser or use a local server:
```bash
# Using Python
python -m http.server 8080

# Using Node.js
npx serve

# Or just open the file
open index.html
```

## 📦 Deploy to GitHub Pages

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/IntentClassifierWeb.git
git push -u origin main
```

### 2. Set up GitHub Secret

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `NGROK_API_URL`
5. Value: Your ngrok URL (e.g., `https://hypothalamic-lianne-unfurnitured.ngrok-free.dev`)
6. Click **Add secret**

### 3. Enable GitHub Pages

1. Go to **Settings** → **Pages**
2. Source: **GitHub Actions**
3. Save

### 4. Deploy

The GitHub Action will automatically deploy on every push to `main` branch.

You can also manually trigger deployment:
1. Go to **Actions** tab
2. Select **Deploy to GitHub Pages** workflow
3. Click **Run workflow**

Your site will be available at: `https://YOUR_USERNAME.github.io/IntentClassifierWeb/`

## 🔧 Configuration

The API URL is configured via GitHub Secrets for security. The workflow automatically creates a `config.js` file during deployment with the secret value.

For local development, edit `config.js` directly.

## 📝 API Requirements

Your backend API should support:

### Health Check
```
GET /health
Response: { "status": "ok", "device": "cuda" }
```

### Parse Intent
```
POST /parse
Body: { "utterance": "Hôm nay tôi ăn bún bò hết 50k" }
Response: {
  "utterance": "...",
  "intents": ["add_expense"],
  "probabilities": { "add_expense": 0.99, ... },
  "debug_info": {
    "tokenized": ["Hôm_nay", "tôi", ...],
    "bpe": ["<s>", "Hôm", "nay", ...],
    "h_cls_sample": [0.1234, -0.5678, ...]
  }
}
```

## 🎨 Customization

### Colors
Edit CSS variables in `style.css`:
```css
:root {
    --primary: #667eea;
    --secondary: #f093fb;
    --bg-primary: #0a0a0f;
    ...
}
```

### Layout
Modify grid layout in `style.css`:
```css
.main-content {
    grid-template-columns: 1fr 1fr; /* Adjust column ratio */
}
```

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
