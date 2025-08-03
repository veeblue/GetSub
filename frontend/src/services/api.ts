import axios from 'axios';
import {
  SubtitleRequest,
  SubtitleResponse,
  APIConfig,
  APIConfigResponse,
  FileUploadResponse,
  SubtitleEditRequest,
  SubtitleEditResponse,
  HealthResponse
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,  // 增加到120秒，以适应LangChain翻译
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    if (error.response) {
      console.error('Error Data:', error.response.data);
      console.error('Error Status:', error.response.status);
    }
    return Promise.reject(error);
  }
);

// 健康检查
export const healthCheck = async (): Promise<HealthResponse> => {
  const response = await api.get('/health');
  return response.data;
};

// 配置管理
export const getConfig = async (): Promise<APIConfigResponse> => {
  const response = await api.get('/config');
  return response.data;
};

export const saveConfig = async (config: APIConfig): Promise<APIConfigResponse> => {
  const response = await api.post('/config', config);
  return response.data;
};

export const updateConfig = async (config: Partial<APIConfig>): Promise<APIConfigResponse> => {
  const response = await api.put('/config', config);
  return response.data;
};

export const getConfigStatus = async () => {
  const response = await api.get('/config/status');
  return response.data;
};

// 文件上传
export const uploadFile = async (file: File): Promise<FileUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// 处理URL音视频
export const processUrl = async (
  url: string,
  request: SubtitleRequest
): Promise<SubtitleResponse> => {
  const response = await api.post('/process-url', {
    url,
    ...request
  });
  return response.data;
};

// 字幕生成
export const generateSubtitles = async (
  file_id: string,
  request: SubtitleRequest
): Promise<SubtitleResponse> => {
  const response = await api.post(`/generate-subtitles`, request, {
    params: { file_id },
  });
  return response.data;
};

// 字幕编辑
export const editSubtitles = async (
  request: SubtitleEditRequest
): Promise<SubtitleEditResponse> => {
  const response = await api.post('/edit-subtitles', request);
  return response.data;
};

// 字幕翻译
export const translateSubtitles = async (
  originalSrt: string,
  targetLanguage: string
): Promise<SubtitleEditResponse> => {
  const response = await api.post('/translate-subtitles', {
    original_srt: originalSrt,
    target_language: targetLanguage
  });
  return response.data;
};

// 文件信息
export const getFileInfo = async (file_id: string) => {
  const response = await api.get(`/file/${file_id}`);
  return response.data;
};

export const deleteFile = async (file_id: string) => {
  const response = await api.delete(`/file/${file_id}`);
  return response.data;
};

export default api;