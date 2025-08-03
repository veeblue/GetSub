#!/bin/bash

# 音频字幕翻译器 - 完整启动脚本

echo "🎵 音频字幕翻译器 - 前后端分离版本"
echo "=================================="

# 检查必要的工具
echo "🔍 检查运行环境..."

# 检查Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未安装，请先安装Python3"
    exit 1
fi

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装Node.js"
    exit 1
fi

# 检查FFmpeg
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  FFmpeg未安装，视频处理功能将不可用"
    echo "📦 安装FFmpeg: brew install ffmpeg (macOS) 或 sudo apt install ffmpeg (Ubuntu)"
fi

echo "✅ 环境检查完成"

# 启动后端
echo ""
echo "🚀 启动后端服务..."
cd backend

# 创建虚拟环境（如果不存在）
if [ ! -d "venv" ]; then
    echo "📦 创建Python虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
echo "🔄 激活虚拟环境..."
source venv/bin/activate

# 安装依赖
echo "📚 安装Python依赖..."
pip install -r requirements.txt

# 创建必要的目录
echo "📁 创建必要的目录..."
mkdir -p uploads
mkdir -p logs

# 检查环境变量
if [ ! -f ".env" ]; then
    echo "⚠️  警告: .env 文件不存在，请复制 .env.example 并配置API密钥"
    echo "📝 请运行: cp .env.example .env"
    echo "🔧 然后编辑 .env 文件配置您的API密钥"
fi

# 启动后端（在后台运行）
echo "🚀 启动FastAPI后端服务..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --log-level info &
BACKEND_PID=$!

# 等待后端启动
echo "⏳ 等待后端服务启动..."
sleep 5

# 检查后端是否启动成功
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ 后端服务启动成功"
    echo "🔗 后端API: http://localhost:8000"
    echo "📖 API文档: http://localhost:8000/docs"
else
    echo "❌ 后端服务启动失败"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# 启动前端
echo ""
echo "🚀 启动前端服务..."
cd ../frontend

# 安装前端依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装前端依赖..."
    npm install --legacy-peer-deps
fi

# 启动前端开发服务器
echo "🚀 启动React开发服务器..."
echo "🌐 前端地址: http://localhost:3000"
echo ""
echo "🎉 应用启动完成！"
echo "=================================="
echo "🌐 前端: http://localhost:3000"
echo "🔗 后端API: http://localhost:8000"
echo "📖 API文档: http://localhost:8000/docs"
echo "=================================="
echo "按 Ctrl+C 停止所有服务"

# 启动前端
npm start &
FRONTEND_PID=$!

# 等待用户中断
trap 'echo ""; echo "🛑 正在停止服务..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT

# 等待所有进程
wait