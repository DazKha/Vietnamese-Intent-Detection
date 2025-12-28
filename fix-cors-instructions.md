# Hướng dẫn sửa lỗi CORS cho Intent Classifier Server

## Vấn đề
Lỗi CORS xảy ra khi trình duyệt chặn request từ web app (file:// hoặc localhost) đến server ngrok.

## Giải pháp

Trong notebook `intent-classifier-server.ipynb`, tìm cell tạo FastAPI app (cell 13) và **THAY THẾ** bằng code sau:

```python
# ====== FastAPI + ngrok (với CORS middleware) ======
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # ← THÊM DÒNG NÀY
from pydantic import BaseModel
import uvicorn
import nest_asyncio
from threading import Thread
from pyngrok import ngrok, conf
import asyncio
from uvicorn import Config, Server

class ParseIn(BaseModel):
    utterance: str

app = FastAPI()

# ====== THÊM CORS MIDDLEWARE ======
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cho phép tất cả origins (hoặc chỉ định cụ thể)
    allow_credentials=True,
    allow_methods=["*"],  # Cho phép tất cả methods (GET, POST, etc.)
    allow_headers=["*"],  # Cho phép tất cả headers
)
# ==================================

@app.get("/health")
def health():
    return {"status": "ok", "device": device}

@app.post("/parse")
async def parse(req: ParseIn):
    text = req.utterance.strip()
    tokens = tokenize_underthesea_seqin(text)
    result = predictor.predict_single(tokens, threshold=0.9)
    return build_response_schema(text, result)

PORT = 8000
nest_asyncio.apply()

def run_server():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    config = Config(
        app=app,
        host="0.0.0.0",
        port=PORT,
        loop="asyncio",
        log_level="warning",
        access_log=False
    )
    server = Server(config)
    loop.run_until_complete(server.serve())

server_thread = Thread(target=run_server, daemon=True)
server_thread.start()

NGROK_HOSTNAME = "hypothalamic-lianne-unfurnitured.ngrok-free.dev"

if NGROK_AUTH_TOKEN:
    conf.get_default().auth_token = NGROK_AUTH_TOKEN

tunnel = ngrok.connect(addr=PORT, proto="http", hostname=NGROK_HOSTNAME)
public_url = tunnel.public_url
print("PUBLIC URL:", public_url)
```

## Các thay đổi chính:

1. **Import CORSMiddleware**:
   ```python
   from fastapi.middleware.cors import CORSMiddleware
   ```

2. **Thêm middleware vào app**:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["*"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

## Sau khi sửa:

1. **Restart kernel** trong Kaggle notebook
2. **Chạy lại tất cả cells** từ đầu
3. Đợi server khởi động và ngrok tunnel được tạo
4. **Refresh** trang web chat của bạn
5. Kiểm tra status indicator - nó sẽ chuyển sang màu xanh!

## Lưu ý bảo mật (Production):

Nếu deploy thật, thay `allow_origins=["*"]` bằng domain cụ thể:
```python
allow_origins=[
    "https://your-domain.com",
    "http://localhost:3000"
]
```

## Test thử:

Sau khi sửa, bạn có thể test bằng curl:
```bash
curl -X POST https://hypothalamic-lianne-unfurnitured.ngrok-free.dev/parse \
  -H "Content-Type: application/json" \
  -d '{"utterance":"Hôm nay tôi ăn bún bò hết 50k"}'
```

Hoặc mở web chat và thử gửi tin nhắn!
