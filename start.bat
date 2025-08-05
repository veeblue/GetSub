@echo off
chcp 65001 >nul
title 音频字幕翻译器 - Windows启动脚本

echo 🎵 音频字幕翻译器 - 前后端分离版本
echo ==================================

:: 检查必要的工具
echo 🔍 检查运行环境...

:: 检查Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python 未安装，请先安装Python
    pause
    exit /b 1
)

:: 检查Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安装，请先安装Node.js
    pause
    exit /b 1
)

:: 检查FFmpeg
ffmpeg -version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  FFmpeg未安装，视频处理功能将不可用
    echo 📦 请从 https://ffmpeg.org/download.html 下载FFmpeg并添加到PATH
)

echo ✅ 环境检查完成

:: 启动后端
echo.
echo 🚀 启动后端服务...
cd backend

:: 创建虚拟环境（如果不存在）
if not exist "venv" (
    echo 📦 创建Python虚拟环境...
    python -m venv venv
)

:: 激活虚拟环境
echo 🔄 激活虚拟环境...
call venv\Scripts\activate.bat

:: 安装依赖
echo 📚 安装Python依赖...
pip install -r requirements.txt

:: 创建必要的目录
echo 📁 创建必要的目录...
if not exist "uploads" mkdir uploads
if not exist "logs" mkdir logs

:: 检查环境变量
if not exist ".env" (
    echo ⚠️  警告: .env 文件不存在，请复制 .env.example 并配置API密钥
    echo 📝 请运行: copy .env.example .env
    echo 🔧 然后编辑 .env 文件配置您的API密钥
)

:: 启动后端（在新的命令行窗口）
echo 🚀 启动FastAPI后端服务...
start "后端服务" cmd /k "uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --log-level info"

:: 等待后端启动
echo ⏳ 等待后端服务启动...
timeout /t 10 /nobreak >nul

:: 检查后端是否启动成功
curl -s http://localhost:8000/health >nul 2>&1
if errorlevel 1 (
    echo ❌ 后端服务启动失败，请检查后端窗口中的错误信息
    echo.
    echo 按任意键退出...
    pause >nul
    exit /b 1
)

echo ✅ 后端服务启动成功
echo 🔗 后端API: http://localhost:8000
echo 📖 API文档: http://localhost:8000/docs

:: 启动前端
echo.
echo 🚀 启动前端服务...
cd ..\frontend

:: 安装前端依赖
if not exist "node_modules" (
    echo 📦 安装前端依赖...
    npm install --legacy-peer-deps
)

:: 启动前端开发服务器（在新的命令行窗口）
echo 🚀 启动React开发服务器...
echo 🌐 前端地址: http://localhost:3000
echo.
echo 🎉 应用启动完成！
echo ==================================
echo 🌐 前端: http://localhost:3000
echo 🔗 后端API: http://localhost:8000
echo 📖 API文档: http://localhost:8000/docs
echo ==================================
echo 服务将在独立的命令行窗口中运行
echo 关闭相应的命令行窗口可停止服务
echo.

:: 启动前端
start "前端服务" cmd /k "npm start"

echo ✅ 所有服务已启动！
echo.
echo 提示：
echo - 后端服务运行在独立的命令行窗口中
echo - 前端服务运行在独立的命令行窗口中
echo - 关闭相应窗口可停止对应的服务
echo - 如需完全停止，请关闭所有打开的命令行窗口
echo.
pause