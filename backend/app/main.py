from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

# 加载环境变量（从当前目录）
load_dotenv()

# 新版本的OpenAI库支持代理环境变量，不再需要移除
# from .api import subtitles_router, config_router, health_router
from .api import subtitles_router, config_router, health_router
from .services.file_service import FileService


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时执行
    print("Starting Audio Subtitle Translator API with LangChain...")
    
    # 清理旧文件
    file_service = FileService()
    file_service.cleanup_temp_files()
    
    yield
    
    # 关闭时执行
    print("Shutting down Audio Subtitle Translator API...")


# 创建FastAPI应用
app = FastAPI(
    title="Audio Subtitle Translator API",
    description="API for audio/video subtitle generation and translation",
    version="1.0.0",
    lifespan=lifespan
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # React开发服务器
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 静态文件服务
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# 注册路由
app.include_router(health_router, prefix="/api", tags=["Health"])
app.include_router(config_router, prefix="/api", tags=["Configuration"])
app.include_router(subtitles_router, prefix="/api", tags=["Subtitles"])


@app.get("/")
async def root():
    """根路径"""
    return {
        "message": "Audio Subtitle Translator API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health"
    }


@app.get("/api/info")
async def api_info():
    """API信息"""
    return {
        "name": "Audio Subtitle Translator API",
        "version": "1.0.0",
        "description": "API for audio/video subtitle generation and translation",
        "endpoints": {
            "health": "/api/health",
            "config": "/api/config",
            "subtitles": "/api/generate-subtitles",
            "upload": "/api/upload"
        },
        "supported_formats": {
            "audio": ["mp3", "wav", "m4a", "flac", "ogg"],
            "video": ["mp4", "avi", "mov", "mkv", "wmv", "flv", "webm"]
        },
        "supported_languages": [
            "auto", "zh", "en", "es", "fr", "de", "ja", "ko", "ru", "pt", "it", "ar", "hi", "th", "vi", "tr"
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)