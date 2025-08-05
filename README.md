# 🎵 GetSub - 音频字幕翻译器

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.68+-009688.svg)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.5+-3178C6.svg)](https://www.typescriptlang.org/)

基于 React + FastAPI 的现代化音频字幕翻译工具，支持音视频文件上传、语音识别、字幕翻译和预览。

## ✨ 功能特性

- 🎵 **音频/视频上传** - 支持拖拽上传音频和视频文件
- 🎬 **视频处理** - 自动从视频中提取音频
- 🔗 **在线音频URL** - 支持直接音频文件链接处理
- 📝 **字幕预览** - 完整的字幕内容预览和编辑
- 🌐 **多语言翻译** - 支持多种语言的字幕翻译
- ⚙️ **API配置** - 灵活的API配置管理，支持界面化设置
- 💾 **文件下载** - 支持SRT格式字幕文件下载
- 🚀 **一键启动** - Windows/macOS/Linux 一键启动脚本
- 🐳 **Docker支持** - 容器化部署

## 🏗️ 项目结构

```
GetSub/
├── backend/                 # FastAPI 后端
│   ├── app/
│   │   ├── main.py         # 主应用入口
│   │   ├── api/            # API 路由
│   │   ├── models/         # 数据模型
│   │   ├── services/       # 业务逻辑
│   │   └── utils/          # 工具函数
│   ├── requirements.txt    # Python 依赖
│   └── .env.example       # 环境变量模板
├── frontend/               # React 前端
│   ├── src/
│   │   ├── components/     # React 组件
│   │   ├── services/       # API 服务
│   │   ├── utils/          # 工具函数
│   │   └── styles/         # 样式文件
│   ├── package.json
│   └── public/             # 静态资源
├── start.sh               # macOS/Linux 启动脚本
├── start.bat              # Windows 启动脚本
└── docker-compose.yml     # Docker 编排文件
```

## 🛠️ 技术栈

### 后端
- **[FastAPI](https://fastapi.tiangolo.com/)** - 现代Python Web框架
- **[Pydantic](https://pydantic-docs.helpmanual.io/)** - 数据验证
- **[Uvicorn](https://www.uvicorn.org/)** - ASGI服务器
- **[LangChain](https://langchain.com/)** - AI翻译服务
- **ByteDance** - 语音识别服务

### 前端
- **[React 18](https://reactjs.org/)** - 现代前端框架
- **[TypeScript](https://www.typescriptlang.org/)** - 类型安全
- **[Ant Design](https://ant.design/)** - UI组件库
- **[Axios](https://axios-http.com/)** - HTTP客户端
- **[React Hook Form](https://react-hook-form.com/)** - 表单处理
- **[React Query](https://react-query.tanstack.com/)** - 数据获取和缓存

## 🚀 快速开始

### Windows 用户（推荐）

```batch
# 双击运行启动脚本
start.bat
```

### macOS/Linux 用户（推荐）

```bash
# 克隆项目
git clone <repository-url>
cd GetSub

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入您的API密钥

# 启动应用
./start.sh
```

### Docker 部署

```bash
# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入您的API密钥

# 启动服务
docker-compose up -d
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用

## ⚙️ API 配置

### 方式一：界面化配置（推荐）

1. 启动应用后，点击页面右上角的 **API设置** 按钮
2. 在弹出的配置界面中：
   - **语音识别配置**：配置字节跳动的语音识别API
     - AppID：您的字节跳动应用ID
     - Access Token：您的字节跳动访问令牌
     - API URL：默认为 `https://openspeech.bytedance.com/api/v1/vc`
   - **翻译配置**：配置大语言模型的翻译API
     - 模型提供商：支持 DeepSeek、OpenAI、Qwen、Anthropic 等
     - 模型名称：如 `deepseek-chat`、`gpt-4` 等
     - API 密钥：对应服务的API密钥
     - API 基础URL：各服务的API地址
3. 点击 **保存配置** 即可生效

### 方式二：环境变量配置

复制 `.env.example` 为 `.env` 并配置相关API密钥

```env
# 语音识别配置
BYTEDANCE_APPID=your_appid
BYTEDANCE_ACCESS_TOKEN=your_access_token
BYTEDANCE_BASE_URL=https://openspeech.bytedance.com/api/v1/vc

# 翻译服务配置
TRANSLATION_PROVIDER=DeepSeek
TRANSLATION_MODEL=deepseek-chat
DEEPSEEK_API_KEY=your_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
TRANSLATION_TEMPERATURE=0.3
TRANSLATION_MAX_TOKENS=1000
TRANSLATION_TOP_P=1.0
TRANSLATION_FREQUENCY_PENALTY=0.0
```

### 🔑 API 密钥获取

#### 字节跳动语音识别API
1. 访问 [字节跳动火山引擎](https://www.volcengine.com/)
2. 注册并开通语音识别服务
3. 创建应用获取 AppID 和 Access Token

#### 📋 支持的音频格式
**本地文件上传：**
- 音频格式：MP3、WAV、M4A、FLAC、OGG、AAC、WMA
- 视频格式：MP4、AVI、MOV、MKV、WMV、FLV、WEBM（自动提取音频）

**在线URL处理：**
- **仅支持直接音频文件链接**，URL必须以支持的音频扩展名结尾
- 支持的格式：`.mp3`、`.wav`、`.m4a`、`.flac`、`.ogg`、`.aac`、`.wma`
- **示例**：
  - ✅ `https://example.com/audio.mp3`
  - ✅ `https://cdn.example.com/sounds.wav`
  - ❌ `https://www.bilibili.com/video/BV1xx411c7mu`（不支持视频平台）
  - ❌ `https://example.com/page-with-audio`（非直接文件链接）

#### ⚠️ 重要限制
- URL必须是公开可访问的直接音频文件链接
- 不支持需要登录或包含重定向的链接
- 不支持B站、YouTube等视频平台URL
- 仅支持上述列出的音频格式

#### 大语言模型API
- **DeepSeek**: [https://platform.deepseek.com/](https://platform.deepseek.com/)
- **OpenAI**: [https://platform.openai.com/](https://platform.openai.com/)
- **Qwen**: [https://dashscope.aliyun.com/](https://dashscope.aliyun.com/)
- **Anthropic**: [https://console.anthropic.com/](https://console.anthropic.com/)

## 📖 API 文档

后端API文档: [http://localhost:8000/docs](http://localhost:8000/docs)

## 🔧 开发指南

### 后端开发
- 遵循RESTful API设计原则
- 使用Pydantic进行数据验证
- 实现适当的错误处理
- 编写单元测试

### 前端开发
- 使用TypeScript确保类型安全
- 组件化开发，提高复用性
- 实现响应式设计
- 添加适当的加载状态和错误处理
- API配置模态框支持实时配置和管理多个API服务

## 🚀 部署

### Docker 部署

```bash
docker-compose up -d
```

### 手动部署

1. 构建前端: `npm run build`
2. 启动后端: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
3. 配置Nginx反向代理

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 发起Pull Request

## 📄 许可证

本项目采用 [MIT 许可证](https://opensource.org/licenses/MIT) - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [FastAPI](https://fastapi.tiangolo.com/) - 现代快速的Python Web框架
- [React](https://reactjs.org/) - 用于构建用户界面的JavaScript库
- [Ant Design](https://ant.design/) - 企业级UI设计语言
- [字节跳动](https://www.volcengine.com/) - 语音识别服务

---

⭐ 如果这个项目对你有帮助，请考虑给我们一个星标！