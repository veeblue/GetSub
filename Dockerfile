FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

# 复制package.json和package-lock.json
COPY frontend/package*.json ./

# 安装依赖
RUN npm ci --legacy-peer-deps

# 复制源代码
COPY frontend/ ./

# 构建前端
RUN npm run build

# 后端构建
FROM python:3.11-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# 复制requirements.txt
COPY backend/requirements.txt .

# 安装Python依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制后端代码
COPY backend/ ./

# 从前端构建阶段复制构建结果
COPY --from=frontend-build /app/frontend/build ./static

# 创建必要的目录
RUN mkdir -p uploads logs

# 暴露端口
EXPOSE 8000

# 设置环境变量
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# 启动命令
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]