from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum


class LanguageCode(str, Enum):
    """支持的语言代码"""
    AUTO = "auto"
    ZH = "zh"
    EN = "en"
    ES = "es"
    FR = "fr"
    DE = "de"
    JA = "ja"
    KO = "ko"
    RU = "ru"
    PT = "pt"
    IT = "it"
    AR = "ar"
    HI = "hi"
    TH = "th"
    VI = "vi"
    TR = "tr"


class TranslationProvider(str, Enum):
    """翻译服务提供商"""
    DEEPSEEK = "DeepSeek"
    OPENAI = "OpenAI"
    QWEN = "Qwen"
    ANTHROPIC = "Anthropic"
    AZURE_OPENAI = "Azure OpenAI"
    CUSTOM = "自定义"


class SubtitleSegment(BaseModel):
    """字幕片段"""
    text: str = Field(..., description="字幕文本")
    start: float = Field(..., description="开始时间（秒）")
    end: float = Field(..., description="结束时间（秒）")
    confidence: float = Field(0.95, description="置信度")
    translated_text: Optional[str] = Field(None, description="翻译后的文本")


class SubtitleRequest(BaseModel):
    """字幕生成请求"""
    source_language: LanguageCode = Field(LanguageCode.AUTO, description="源语言")
    translate: bool = Field(False, description="是否翻译")
    target_language: LanguageCode = Field(LanguageCode.EN, description="目标语言")


class SubtitleResponse(BaseModel):
    """字幕生成响应"""
    success: bool = Field(..., description="是否成功")
    message: str = Field(..., description="响应消息")
    segments: Optional[List[SubtitleSegment]] = Field(None, description="字幕片段")
    original_srt: Optional[str] = Field(None, description="原始SRT内容")
    translated_srt: Optional[str] = Field(None, description="翻译SRT内容")
    duration: Optional[float] = Field(None, description="音频时长")
    segment_count: Optional[int] = Field(None, description="字幕片段数量")


class APIConfig(BaseModel):
    """API配置"""
    asr_provider: str = Field("ByteDance", description="语音识别提供商")
    asr_appid: str = Field(..., description="ASR AppID")
    asr_access_token: str = Field(..., description="ASR Access Token")
    asr_base_url: str = Field("https://openspeech.bytedance.com/api/v1/vc", description="ASR API URL")
    
    translation_provider: TranslationProvider = Field(TranslationProvider.DEEPSEEK, description="翻译提供商")
    translation_model: str = Field("deepseek-chat", description="翻译模型")
    translation_api_key: str = Field(..., description="翻译API密钥")
    translation_base_url: str = Field("https://api.deepseek.com/v1", description="翻译API URL")
    translation_temperature: float = Field(0.3, description="温度参数")
    translation_max_tokens: int = Field(1000, description="最大令牌数")
    translation_top_p: float = Field(1.0, description="顶部P值")
    translation_frequency_penalty: float = Field(0.0, description="频率惩罚")


class APIConfigResponse(BaseModel):
    """API配置响应"""
    success: bool = Field(..., description="是否成功")
    message: str = Field(..., description="响应消息")
    config: Optional[APIConfig] = Field(None, description="API配置")


class FileUploadResponse(BaseModel):
    """文件上传响应"""
    success: bool = Field(..., description="是否成功")
    message: str = Field(..., description="响应消息")
    file_id: Optional[str] = Field(None, description="文件ID")
    filename: Optional[str] = Field(None, description="文件名")
    file_size: Optional[int] = Field(None, description="文件大小")
    file_type: Optional[str] = Field(None, description="文件类型")
    is_video: Optional[bool] = Field(None, description="是否为视频文件")


class SubtitleEditRequest(BaseModel):
    """字幕编辑请求"""
    original_srt: Optional[str] = Field(None, description="原始SRT内容")
    translated_srt: Optional[str] = Field(None, description="翻译SRT内容")


class SubtitleEditResponse(BaseModel):
    """字幕编辑响应"""
    success: bool = Field(..., description="是否成功")
    message: str = Field(..., description="响应消息")
    original_srt: Optional[str] = Field(None, description="编辑后的原始SRT")
    translated_srt: Optional[str] = Field(None, description="编辑后的翻译SRT")


class HealthResponse(BaseModel):
    """健康检查响应"""
    status: str = Field(..., description="服务状态")
    timestamp: datetime = Field(..., description="检查时间")
    version: str = Field(..., description="版本信息")