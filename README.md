# GetSub - 音频字幕翻译器

基于React + FastAPI的现代化音频字幕翻译工具，支持音视频文件上传、语音识别、字幕翻译和预览。

## 项目结构

```
audio-subtitle-translator-separate/
├── backend/                 # FastAPI后端
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py         # 主应用入口
│   │   ├── api/            # API路由
│   │   ├── models/         # 数据模型
│   │   ├── services/       # 业务逻辑
│   │   └── utils/          # 工具函数
│   ├── requirements.txt    # Python依赖
│   └── .env.example       # 环境变量模板
└── frontend/               # React前端
    ├── src/
    │   ├── components/     # React组件
    │   ├── services/       # API服务
    │   ├── utils/          # 工具函数
    │   └── styles/         # 样式文件
    ├── package.json
    └── public/             # 静态资源
```

## 功能特性

- 🎵 **音频/视频上传**: 支持拖拽上传音频和视频文件
- 🎬 **视频处理**: 自动从视频中提取音频
- 📝 **字幕预览**: 完整的字幕内容预览和编辑
- 🌐 **多语言翻译**: 支持多种语言的字幕翻译
- ⚙️ **API配置**: 灵活的API配置管理
- 💾 **文件下载**: 支持SRT格式字幕文件下载

## 技术栈

### 后端
- **FastAPI**: 现代Python Web框架
- **SQLite**: 轻量级数据库
- **Pydantic**: 数据验证
- **Uvicorn**: ASGI服务器
- **LangChain + OpenAI**: AI翻译服务
- **ByteDance**: 语音识别服务

### 前端
- **React 18**: 现代前端框架
- **TypeScript**: 类型安全
- **Ant Design**: UI组件库
- **Axios**: HTTP客户端
- **React Hook Form**: 表单处理
- **React Query**: 数据获取和缓存

## 快速开始

### 方法一：使用启动脚本（推荐）

```bash
# 克隆项目
git clone <repository-url>
cd audio-subtitle-translator-separate

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入您的API密钥

# 启动应用
./start.sh
```

### 方法二：分别启动

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

### 方法三：Docker部署

```bash
# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入您的API密钥

# 启动服务
docker-compose up -d
```

访问 http://localhost:3000 查看应用

## API文档

后端API文档: http://localhost:8000/docs

## 环境配置

复制 `.env.example` 为 `.env` 并配置相关API密钥

```env
# 语音识别配置
BYTEDANCE_APPID=your_appid
BYTEDANCE_ACCESS_TOKEN=your_access_token

# 翻译服务配置
DEEPSEEK_API_KEY=your_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
```

## 开发指南

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

## 部署

### Docker部署
```bash
docker-compose up -d
```

### 手动部署
1. 构建前端: `npm run build`
2. 启动后端: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
3. 配置Nginx反向代理

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 发起Pull Request

## 许可证

MIT License
