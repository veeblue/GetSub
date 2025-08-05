# 🎬 得到字幕 - 前后端分离版本

## ✅ 项目完成状态

本项目已成功完成，提供了一个基于React + FastAPI的现代化前后端分离音视频字幕提取工具。

## 🎯 核心功能实现

### ✅ 1. 字幕预览完整显示功能
- 添加了完整的字幕预览区域，用户可以查看所有生成的字幕内容
- 支持标签页切换原始字幕和翻译字幕
- 提供了大文本框显示完整的SRT格式字幕
- 字幕片段预览，显示前5条字幕内容

### ✅ 2. 字幕编辑功能
- 用户可以直接在预览区域编辑字幕内容
- 支持分别编辑原始字幕和翻译字幕
- 提供保存按钮，编辑后的内容会自动更新到下载文件
- 包含SRT格式验证，确保字幕格式正确
- 编辑状态提示和错误处理

### ✅ 3. 视频文件支持
- 扩展支持视频文件上传（MP4、AVI、MOV、MKV、WMV、FLV、WEBM）
- 自动使用FFmpeg从视频中提取音频
- 支持多种音频格式（MP3、WAV、M4A、FLAC、OGG）
- 文件类型和大小验证
- 拖拽上传支持

### ✅ 4. 中文提示词
- 将翻译API的提示词改为中文
- 提高了中文到其他语言的翻译质量
- 提示词更加自然和准确

### ✅ 5. Apple News风格UI
- 完整的Apple News风格界面设计
- 简洁的排版和优雅的间距
- 现代化的Apple设计语言
- 完全响应式设计，支持移动端

### ✅ 6. 在线音频URL支持
- 支持直接音频文件链接处理
- 支持格式：MP3、WAV、M4A、FLAC、OGG、AAC、WMA
- 仅支持公开可访问的直接音频文件URL
- 自动验证URL格式和文件扩展名

### ✅ 7. API配置管理
- 完整的API配置界面
- 支持字节跳动语音识别和多种翻译服务
- 配置状态检查和验证
- 环境变量支持

## 🛠️ 技术栈

### 后端 (FastAPI)
- **FastAPI**: 现代Python Web框架
- **Pydantic**: 数据验证和序列化
- **Uvicorn**: ASGI服务器
- **SQLite**: 配置存储
- **OpenAI/DeepSeek**: AI翻译服务
- **ByteDance**: 语音识别服务
- **FFmpeg**: 视频音频处理

### 前端 (React)
- **React 18**: 现代前端框架
- **TypeScript**: 类型安全
- **Ant Design**: UI组件库
- **React Query**: 数据获取和缓存
- **React Hook Form**: 表单处理
- **Axios**: HTTP客户端
- **Zod**: 数据验证

### 部署
- **Docker**: 容器化部署
- **Docker Compose**: 多容器编排
- **Nginx**: 反向代理和静态文件服务

## 📁 项目结构

```
audio-subtitle-translator-separate/
├── backend/                    # FastAPI后端
│   ├── app/
│   │   ├── main.py            # 主应用入口
│   │   ├── api/               # API路由
│   │   │   ├── subtitles.py   # 字幕相关API
│   │   │   ├── config.py      # 配置管理API
│   │   │   └── health.py      # 健康检查API
│   │   ├── models/            # 数据模型
│   │   ├── services/          # 业务逻辑
│   │   └── utils/             # 工具函数
│   ├── requirements.txt       # Python依赖
│   └── start.sh              # 后端启动脚本
├── frontend/                  # React前端
│   ├── src/
│   │   ├── components/        # React组件
│   │   │   ├── FileUpload.tsx     # 文件上传组件
│   │   │   ├── ConfigModal.tsx    # 配置弹窗组件
│   │   │   └── SubtitlePreview.tsx # 字幕预览组件
│   │   ├── hooks/             # 自定义Hooks
│   │   ├── services/          # API服务
│   │   ├── types/             # TypeScript类型定义
│   │   └── utils/             # 工具函数
│   ├── package.json          # 前端依赖
│   └── start.sh              # 前端启动脚本
├── docker-compose.yml         # Docker编排
├── Dockerfile                # Docker镜像
├── nginx.conf               # Nginx配置
├── start.sh                 # 完整启动脚本
└── test_project.py          # 项目测试脚本
```

## 🚀 使用方法

### 快速启动（推荐）

```bash
# 进入项目目录
cd audio-subtitle-translator-separate

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入您的API密钥

# 启动应用
./start.sh
```

### 分别启动

#### 后端启动
```bash
cd backend
cp .env.example .env
# 编辑 .env 文件，填入您的API密钥
./start.sh
```

#### 前端启动
```bash
cd frontend
npm start
```

### Docker部署
```bash
# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入您的API密钥

# 启动服务
docker-compose up -d
```

## 🔧 API配置

### 语音识别配置
- **提供商**: 字节跳动语音识别
- **需要**: AppID 和 Access Token
- **支持语言**: 中文、英文

#### 支持的格式
**本地文件：**
- 音频格式：MP3、WAV、M4A、FLAC、OGG、AAC、WMA
- 视频格式：MP4、AVI、MOV、MKV、WMV、FLV、WEBM（自动提取音频）

**在线URL：**
- 仅支持直接音频文件链接，必须以音频扩展名结尾
- 支持格式：.mp3、.wav、.m4a、.flac、.ogg、.aac、.wma
- 不支持视频平台URL（如B站、YouTube等）

### 翻译服务配置
- **支持提供商**: DeepSeek、OpenAI、Qwen、Anthropic
- **需要**: API密钥和基础URL
- **支持语言**: 英语、中文、西班牙语、法语、德语、日语、韩语、俄语、葡萄牙语、意大利语

## 🌐 访问地址

- **前端应用**: http://localhost:3000
- **后端API**: http://localhost:8000
- **API文档**: http://localhost:8000/docs
- **健康检查**: http://localhost:8000/health

## 🎨 界面功能

### 主要特性
1. **Apple News风格设计**: 简洁、现代、优雅的用户界面
2. **文件上传**: 支持拖拽上传音频和视频文件
3. **在线音频URL**: 支持直接音频文件链接处理
4. **语言选择**: 支持多种源语言和目标语言
5. **实时处理**: 显示处理进度和状态
6. **字幕预览**: 完整的字幕内容预览和编辑
7. **文件下载**: 分别下载原始和翻译后的SRT文件
8. **API配置**: 可视化的API配置管理

### 支持的语言
- **自动检测** (auto)
- **中文** (zh)
- **英语** (en)
- **西班牙语** (es)
- **法语** (fr)
- **德语** (de)
- **日语** (ja)
- **韩语** (ko)
- **俄语** (ru)
- **葡萄牙语** (pt)
- **意大利语** (it)

## 📊 性能特点

- **处理速度**: 依赖网络和音频长度
- **文件大小**: 最大支持100MB
- **语言支持**: 覆盖主要世界语言
- **并发处理**: 支持多用户同时使用
- **响应式设计**: 支持桌面和移动设备

## 🔧 技术实现亮点

### 1. 前后端分离架构
- RESTful API设计
- 独立部署和扩展
- 清晰的职责分离

### 2. 现代化技术栈
- React 18 + TypeScript确保类型安全
- FastAPI提供高性能API
- Ant Design提供美观的UI组件

### 3. 完整的错误处理
- 前端错误边界和错误提示
- 后端异常处理和日志记录
- 网络请求重试机制

### 4. 数据管理
- React Query进行状态管理
- 自定义Hooks封装业务逻辑
- 缓存策略优化性能

### 5. 用户体验优化
- Apple News风格的简洁界面
- 拖拽上传文件
- 实时处理进度显示
- 响应式设计适配移动端

## 🎉 项目成就

1. **✅ 完整实现需求**: 所有功能都已实现并测试通过
2. **✅ 技术栈现代化**: 使用最新的前后端技术
3. **✅ 代码质量高**: 结构清晰，易于维护
4. **✅ 用户体验优秀**: 界面美观，操作流畅
5. **✅ 部署方式灵活**: 支持多种部署方式
6. **✅ 文档完整**: 提供详细的使用说明和配置指南

## 🚀 未来扩展

1. **批量处理**: 支持多个文件同时处理
2. **云存储集成**: 支持OSS、S3等云存储
3. **用户系统**: 添加用户认证和历史记录
4. **更多格式**: 支持更多音频视频格式
5. **API限流**: 添加请求限制和安全防护
6. **性能优化**: 大文件处理优化和缓存策略

---

**总结**: 本项目成功实现了一个功能完整、技术先进的音视频字幕提取工具「得到字幕」，采用前后端分离架构，提供了优秀的用户体验和可扩展性。项目已通过完整测试，可以立即投入使用。