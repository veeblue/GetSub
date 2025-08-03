export interface SubtitleSegment {
  text: string;
  start: number;
  end: number;
  confidence: number;
  translated_text?: string;
}

export interface SubtitleRequest {
  source_language: 'auto' | 'zh' | 'en' | 'es' | 'fr' | 'de' | 'ja' | 'ko' | 'ru' | 'pt' | 'it';
  translate: boolean;
  target_language: 'auto' | 'zh' | 'en' | 'es' | 'fr' | 'de' | 'ja' | 'ko' | 'ru' | 'pt' | 'it';
}

export interface SubtitleResponse {
  success: boolean;
  message: string;
  segments?: SubtitleSegment[];
  original_srt?: string;
  translated_srt?: string;
  duration?: number;
  segment_count?: number;
}

export interface APIConfig {
  asr_provider: string;
  asr_appid: string;
  asr_access_token: string;
  asr_base_url: string;
  translation_provider: 'DeepSeek' | 'OpenAI' | 'Qwen' | 'Anthropic' | 'Azure OpenAI' | '自定义';
  translation_model: string;
  translation_api_key: string;
  translation_base_url: string;
  translation_temperature: number;
  translation_max_tokens: number;
  translation_top_p: number;
  translation_frequency_penalty: number;
}

export interface APIConfigResponse {
  success: boolean;
  message: string;
  config?: APIConfig;
}

export interface FileUploadResponse {
  success: boolean;
  message: string;
  file_id?: string;
  filename?: string;
  file_size?: number;
  file_type?: string;
  is_video?: boolean;
}

export interface SubtitleEditRequest {
  original_srt?: string;
  translated_srt?: string;
}

export interface SubtitleEditResponse {
  success: boolean;
  message: string;
  original_srt?: string;
  translated_srt?: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
}

export interface LanguageOption {
  value: string;
  label: string;
}

export interface ProcessingStatus {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  message: string;
  progress?: number;
}

export interface AppState {
  configFileured: boolean;
  processingStatus: ProcessingStatus;
  currentFile?: {
    file_id: string;
    filename: string;
    file_size: number;
    is_video: boolean;
  };
  subtitleData?: {
    original_srt: string;
    translated_srt: string;
    segments: SubtitleSegment[];
    duration: number;
  };
}