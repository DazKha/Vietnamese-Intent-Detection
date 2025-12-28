# 🚀 Quick Start Guide

## Deployment trong 5 phút!

### Cách 1: Sử dụng Script Tự Động (Khuyến nghị)

```bash
./deploy.sh
```

Script sẽ hỏi bạn:
1. GitHub username
2. Tên repository (mặc định: IntentClassifierWeb)
3. Ngrok API URL

Sau đó tự động:
- Khởi tạo git
- Push code lên GitHub
- Hướng dẫn setup GitHub Secret và Pages

### Cách 2: Thủ Công

#### Bước 1: Push lên GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/IntentClassifierWeb.git
git push -u origin main
```

#### Bước 2: Tạo GitHub Secret

1. Vào: `https://github.com/YOUR_USERNAME/IntentClassifierWeb/settings/secrets/actions`
2. Click **"New repository secret"**
3. Điền:
   - **Name**: `NGROK_API_URL`
   - **Value**: `https://your-ngrok-url.ngrok-free.dev`
4. Click **"Add secret"**

#### Bước 3: Enable GitHub Pages

1. Vào: `https://github.com/YOUR_USERNAME/IntentClassifierWeb/settings/pages`
2. Trong **"Source"**, chọn: **"GitHub Actions"**
3. Save

#### Bước 4: Deploy

1. Vào tab **"Actions"**
2. Click workflow **"Deploy to GitHub Pages"**
3. Click **"Run workflow"** → **"Run workflow"**

### ✅ Xong!

Website sẽ có tại: `https://YOUR_USERNAME.github.io/IntentClassifierWeb/`

---

## 🔄 Cập nhật Ngrok URL

Khi ngrok URL thay đổi:

1. Vào: `https://github.com/YOUR_USERNAME/IntentClassifierWeb/settings/secrets/actions`
2. Click vào secret **NGROK_API_URL**
3. Click **"Update secret"**
4. Nhập URL mới
5. Save
6. Vào tab **Actions** → **Run workflow** để deploy lại

---

## 🧪 Test Local

```bash
# Cập nhật config.js với ngrok URL của bạn
# Sau đó mở file:
open index.html
```

---

## 📁 Cấu trúc Project

```
IntentClassifierWeb/
├── index.html              # Giao diện chính
├── style.css               # Styles
├── script.js               # Logic
├── config.js               # API config (local)
├── deploy.sh               # Script deploy tự động
├── README.md               # Hướng dẫn đầy đủ
├── QUICKSTART.md           # File này
└── .github/
    └── workflows/
        └── deploy.yml      # GitHub Actions workflow
```

---

## ❓ Troubleshooting

### CORS Error
- Đảm bảo server có CORS middleware (xem `fix-cors-instructions.md`)

### 404 Not Found
- Kiểm tra GitHub Pages đã enable chưa
- Đợi 1-2 phút sau khi deploy

### API Connection Failed
- Kiểm tra ngrok URL còn hoạt động không
- Kiểm tra GitHub Secret đã set đúng chưa

---

## 🎯 Next Steps

1. ✅ Deploy lên GitHub Pages
2. 🎨 Customize colors trong `style.css`
3. 📱 Test trên mobile
4. 🚀 Share với team!
