#!/bin/bash

# 音频字幕翻译器前端启动脚本

echo "🚀 启动音频字幕翻译器前端..."

# 检查Node.js版本
node_version=$(node --version 2>&1)
echo "📋 Node.js版本: $node_version"

# 检查npm版本
npm_version=$(npm --version 2>&1)
echo "📋 npm版本: $npm_version"

# 检查是否存在node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 启动开发服务器
echo "🚀 启动React开发服务器..."
echo "🌐 前端地址: http://localhost:3000"
echo "🔗 后端API: http://localhost:8000"
echo "📖 API文档: http://localhost:8000/docs"

npm start