#!/bin/bash

# 音频字幕翻译器后端启动脚本

echo "🚀 启动音频字幕翻译器后端..."

# 检查Python版本
python_version=$(python3 --version 2>&1)
echo "📋 Python版本: $python_version"

# 检查是否存在虚拟环境
if [ ! -d "venv" ]; then
    echo "📦 创建虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
echo "🔄 激活虚拟环境..."
source venv/bin/activate

# 安装依赖
echo "📚 安装依赖..."
pip install -r requirements.txt

# 创建必要的目录
echo "📁 创建必要的目录..."
mkdir -p uploads
mkdir -p logs

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "⚠️  警告: .env 文件不存在，请复制 .env.example 并配置API密钥"
    echo "📝 请运行: cp .env.example .env"
    echo "🔧 然后编辑 .env 文件配置您的API密钥"
fi

# 检查FFmpeg
echo "🎬 检查FFmpeg..."
if command -v ffmpeg &> /dev/null; then
    echo "✅ FFmpeg已安装"
else
    echo "❌ FFmpeg未安装，请安装FFmpeg以支持视频处理"
    echo "📦 macOS: brew install ffmpeg"
    echo "📦 Ubuntu: sudo apt install ffmpeg"
    echo "📦 CentOS: sudo yum install ffmpeg"
fi

# 启动应用
echo "🚀 启动FastAPI应用..."
echo "📱 API文档: http://localhost:8000/docs"
echo "🌐 前端地址: http://localhost:3000"

# 启动服务器
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --log-level info