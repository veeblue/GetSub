import os
import json
import tempfile
import time
import subprocess
from typing import List, Dict, Optional, Tuple
from datetime import datetime
import requests
import soundfile as sf
from pathlib import Path
import urllib.parse
import re

from ..models.schemas import (
    SubtitleSegment, 
    SubtitleRequest, 
    SubtitleResponse,
    APIConfig,
    LanguageCode
)


class AudioSubtitleService:
    """音频字幕翻译服务"""
    
    def __init__(self, config: APIConfig):
        self.config = config
        self.translation_client = None
        self._initialize_translation_client()
    
    def _initialize_translation_client(self):
        """初始化翻译客户端"""
        try:
            from langchain_openai import ChatOpenAI
            
            # 检查API密钥是否有效
            if not self.config.translation_api_key or self.config.translation_api_key in ["test", ""]:
                print("Translation API key is not configured or is invalid")
                self.translation_client = None
                self.llm = None
                return
            
            print(f"Initializing translation client with:")
            print(f"  Provider: {self.config.translation_provider}")
            print(f"  Model: {self.config.translation_model}")
            print(f"  Base URL: {self.config.translation_base_url}")
            print(f"  API Key length: {len(self.config.translation_api_key)}")
            
            # 确保base_url格式正确
            base_url = self.config.translation_base_url
            if base_url and not base_url.endswith('/v1'):
                if base_url.endswith('/'):
                    base_url += 'v1'
                else:
                    base_url += '/v1'
            
            # 初始化OpenAI客户端（用于测试）
            try:
                # 临时移除代理环境变量，避免兼容性问题
                old_http_proxy = os.environ.pop('HTTP_PROXY', None)
                old_https_proxy = os.environ.pop('HTTPS_PROXY', None)
                
                try:
                    # 使用LangChain ChatOpenAI初始化客户端
                    self.translation_client = ChatOpenAI(
                        model=self.config.translation_model,
                        api_key=self.config.translation_api_key,
                        base_url=base_url,
                        timeout=25,  # 25秒超时，比前端30秒超时稍短
                        temperature=0.1,  # 降低温度以提高响应速度
                        request_timeout=25
                    )
                    print("LangChain ChatOpenAI client initialized successfully")
                finally:
                    # 恢复代理环境变量
                    if old_http_proxy:
                        os.environ['HTTP_PROXY'] = old_http_proxy
                    if old_https_proxy:
                        os.environ['HTTPS_PROXY'] = old_https_proxy
                        
            except Exception as e:
                print(f"Failed to initialize OpenAI client: {e}")
                self.translation_client = None
                return
            
            # 测试连接
            try:
                test_response = self.translation_client.invoke("Hello")
                print("Translation client initialized and tested successfully")
            except Exception as test_error:
                print(f"Translation client test failed: {test_error}")
                self.translation_client = None
                self.llm = None
                return
            
            # 使用LangChain进行翻译
            self.llm = self.translation_client
            print("Using LangChain ChatOpenAI for translation")
                
        except Exception as e:
            print(f"Failed to initialize translation client: {e}")
            self.translation_client = None
            self.llm = None
    
    def is_video_file(self, file_path: str) -> bool:
        """检查是否为视频文件"""
        video_extensions = ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm']
        return any(file_path.lower().endswith(ext) for ext in video_extensions)
    
    def extract_audio_from_video(self, video_path: str) -> str:
        """从视频文件中提取音频"""
        try:
            # 创建临时音频文件
            audio_path = video_path.rsplit('.', 1)[0] + '_extracted.wav'
            
            # 使用ffmpeg提取音频
            cmd = [
                'ffmpeg', '-i', video_path, '-vn', '-acodec', 'pcm_s16le',
                '-ar', '16000', '-ac', '1', audio_path, '-y'
            ]
            
            process = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            if os.path.exists(audio_path):
                return audio_path
            else:
                raise Exception("Failed to extract audio from video")
                
        except subprocess.CalledProcessError as e:
            raise Exception(f"FFmpeg error: {e.stderr}")
        except FileNotFoundError:
            raise Exception("FFmpeg not found. Please install FFmpeg to process video files.")
        except Exception as e:
            raise Exception(f"Audio extraction failed: {str(e)}")
    
    def transcribe_audio_from_url(self, audio_url: str, source_language: LanguageCode = LanguageCode.AUTO) -> List[SubtitleSegment]:
        """使用字节跳动API进行在线音频URL转录"""
        try:
            print(f"Transcribing audio from URL with language: {source_language}")
            
            # 设置语言参数
            language_map = {
                LanguageCode.ZH: "zh-CN",
                LanguageCode.EN: "en-US",
                LanguageCode.AUTO: "zh-CN"
            }
            language = language_map.get(source_language, "zh-CN")
            
            # 提交音频URL进行识别
            response = requests.post(
                f'{self.config.asr_base_url}/submit',
                params=dict(
                    appid=self.config.asr_appid,
                    language=language,
                    use_itn='True',
                    use_capitalize='True',
                    max_lines=1,
                    words_per_line=15,
                ),
                json={
                    "url": audio_url
                },
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer; {self.config.asr_access_token}'
                }
            )
            
            if response.status_code != 200:
                raise Exception(f"ByteDance API submit failed: {response.text}")
            
            result = response.json()
            if result.get('code') != 0:
                raise Exception(f"ByteDance API error: {result.get('message', 'Unknown error')}")
            
            job_id = result.get('id')
            if not job_id:
                raise Exception("ByteDance API did not return job ID")
            
            # 轮询查询结果
            print(f"Job ID: {job_id}, waiting for completion...")
            
            max_wait_time = 120  # 最大等待时间（秒）
            poll_interval = 2   # 轮询间隔（秒）
            elapsed_time = 0
            
            while elapsed_time < max_wait_time:
                response = requests.get(
                    f'{self.config.asr_base_url}/query',
                    params=dict(
                        appid=self.config.asr_appid,
                        id=job_id,
                    ),
                    headers={
                        'Authorization': f'Bearer; {self.config.asr_access_token}'
                    }
                )
                
                if response.status_code != 200:
                    raise Exception(f"ByteDance API query failed: {response.text}")
                
                result = response.json()
                
                if result.get('code') == 0 and result.get('utterances'):
                    # 识别完成
                    utterances = result.get('utterances', [])
                    segments = []
                    
                    for utterance in utterances:
                        if utterance.get('attribute', {}).get('event') == 'speech':
                            segments.append(SubtitleSegment(
                                text=utterance.get('text', ''),
                                start=utterance.get('start_time', 0) / 1000.0,
                                end=utterance.get('end_time', 0) / 1000.0,
                                confidence=0.95
                            ))
                    
                    print(f"Transcription completed with {len(segments)} segments")
                    return segments
                
                # 如果还在处理中，继续等待
                time.sleep(poll_interval)
                elapsed_time += poll_interval
            
            # 超时
            raise Exception(f"ByteDance API timeout after {max_wait_time} seconds")
            
        except Exception as e:
            print(f"URL transcription error: {e}")
            raise Exception(f"Audio URL transcription failed: {str(e)}")

    def transcribe_audio(self, audio_file_path: str, source_language: LanguageCode = LanguageCode.AUTO) -> List[SubtitleSegment]:
        """使用字节跳动API进行音频转录"""
        try:
            print(f"Transcribing audio with language: {source_language}")
            
            # 设置语言参数
            language_map = {
                LanguageCode.ZH: "zh-CN",
                LanguageCode.EN: "en-US",
                LanguageCode.AUTO: "zh-CN"
            }
            language = language_map.get(source_language, "zh-CN")
            
            # 提交音频文件进行识别
            with open(audio_file_path, 'rb') as audio_file:
                audio_data = audio_file.read()
                
                # 检测音频格式并设置正确的Content-Type
                if audio_file_path.lower().endswith('.mp3'):
                    content_type = 'audio/mpeg'
                elif audio_file_path.lower().endswith('.wav'):
                    content_type = 'audio/wav'
                elif audio_file_path.lower().endswith('.m4a'):
                    content_type = 'audio/mp4'
                else:
                    content_type = 'audio/mpeg'
                
                response = requests.post(
                    f'{self.config.asr_base_url}/submit',
                    params=dict(
                        appid=self.config.asr_appid,
                        language=language,
                        use_itn='True',
                        use_capitalize='True',
                        max_lines=1,
                        words_per_line=15,
                    ),
                    data=audio_data,
                    headers={
                        'Content-Type': content_type,
                        'Authorization': f'Bearer; {self.config.asr_access_token}'
                    }
                )
                
                if response.status_code != 200:
                    raise Exception(f"ByteDance API submit failed: {response.text}")
                
                result = response.json()
                if result.get('code') != 0:
                    raise Exception(f"ByteDance API error: {result.get('message', 'Unknown error')}")
                
                job_id = result.get('id')
                if not job_id:
                    raise Exception("ByteDance API did not return job ID")
                
                # 轮询查询结果
                print(f"Job ID: {job_id}, waiting for completion...")
                
                max_wait_time = 120  # 最大等待时间（秒）
                poll_interval = 2   # 轮询间隔（秒）
                elapsed_time = 0
                
                while elapsed_time < max_wait_time:
                    response = requests.get(
                        f'{self.config.asr_base_url}/query',
                        params=dict(
                            appid=self.config.asr_appid,
                            id=job_id,
                        ),
                        headers={
                            'Authorization': f'Bearer; {self.config.asr_access_token}'
                        }
                    )
                    
                    if response.status_code != 200:
                        raise Exception(f"ByteDance API query failed: {response.text}")
                    
                    result = response.json()
                    
                    if result.get('code') == 0 and result.get('utterances'):
                        # 识别完成
                        utterances = result.get('utterances', [])
                        segments = []
                        
                        for utterance in utterances:
                            if utterance.get('attribute', {}).get('event') == 'speech':
                                segments.append(SubtitleSegment(
                                    text=utterance.get('text', ''),
                                    start=utterance.get('start_time', 0) / 1000.0,
                                    end=utterance.get('end_time', 0) / 1000.0,
                                    confidence=0.95
                                ))
                        
                        print(f"Transcription completed with {len(segments)} segments")
                        return segments
                    
                    # 如果还在处理中，继续等待
                    time.sleep(poll_interval)
                    elapsed_time += poll_interval
                
                # 超时
                raise Exception(f"ByteDance API timeout after {max_wait_time} seconds")
                
        except Exception as e:
            print(f"Transcription error: {e}")
            raise Exception(f"Audio transcription failed: {str(e)}")
    
    def translate_text(self, text: str, target_language: str) -> str:
        """翻译文本"""
        if not self.translation_client:
            raise ValueError("Translation client not initialized. Please check your translation API configuration.")
        
        language_names = {
            "en": "英语",
            "zh": "中文", 
            "es": "西班牙语",
            "fr": "法语",
            "de": "德语",
            "ja": "日语",
            "ko": "韩语",
            "ru": "俄语",
            "pt": "葡萄牙语",
            "it": "意大利语",
            "ar": "阿拉伯语",
            "hi": "印地语",
            "th": "泰语",
            "vi": "越南语",
            "tr": "土耳其语"
        }
        
        target_lang_name = language_names.get(target_language, target_language)
        
        prompt = f"将以下文本翻译为{target_lang_name}，只返回翻译结果：{text}"
        
        try:
            # 使用LangChain ChatOpenAI进行翻译
            if self.llm:
                response = self.llm.invoke(prompt)
                translated_text = response.content.strip()
            else:
                raise ValueError("Translation client not available")
            
            # 检查翻译结果是否有效
            if not translated_text or translated_text == text:
                raise ValueError("Translation failed or returned empty result")
            
            return translated_text
        except Exception as e:
            raise RuntimeError(f"Translation API call failed: {str(e)}")
    
    def translate_text_batch(self, texts: List[str], target_language: str) -> List[str]:
        """批量翻译文本，提高效率"""
        if not self.translation_client:
            raise ValueError("Translation client not initialized. Please check your translation API configuration.")
        
        language_names = {
            "en": "英语",
            "zh": "中文", 
            "es": "西班牙语",
            "fr": "法语",
            "de": "德语",
            "ja": "日语",
            "ko": "韩语",
            "ru": "俄语",
            "pt": "葡萄牙语",
            "it": "意大利语",
            "ar": "阿拉伯语",
            "hi": "印地语",
            "th": "泰语",
            "vi": "越南语",
            "tr": "土耳其语"
        }
        
        target_lang_name = language_names.get(target_language, target_language)
        
        # 将多个文本合并为一个请求，减少API调用次数
        combined_text = "\n".join([f"{i+1}. {text}" for i, text in enumerate(texts)])
        
        prompt = f"将以下编号的文本批量翻译为{target_lang_name}，保持编号格式，只返回翻译结果：\n{combined_text}"
        
        try:
            # 使用LangChain ChatOpenAI进行批量翻译
            if self.llm:
                response = self.llm.invoke(prompt)
                translated_content = response.content.strip()
                
                # 解析翻译结果，提取编号的翻译
                translated_texts = []
                lines = translated_content.split('\n')
                
                for line in lines:
                    line = line.strip()
                    # 匹配编号格式 "1. 翻译结果" 或 "1翻译结果"
                    match = re.match(r'^\d+[\.\:]\s*(.+)', line)
                    if match:
                        translated_texts.append(match.group(1))
                    elif line and not translated_texts:
                        # 如果没有编号但还有内容，可能是第一个翻译
                        translated_texts.append(line)
                
                # 如果解析失败，返回原文
                if len(translated_texts) != len(texts):
                    print(f"Batch translation parsing failed, expected {len(texts)} got {len(translated_texts)}")
                    return texts
                
                return translated_texts
            else:
                raise ValueError("Translation client not available")
            
        except Exception as e:
            print(f"Batch translation failed: {e}")
            # 如果批量翻译失败，回退到单个翻译
            return [self.translate_text(text, target_language) for text in texts]
    
    def generate_srt(self, segments: List[SubtitleSegment], is_translation: bool = False) -> str:
        """生成SRT格式字幕"""
        srt_content = ""
        
        for i, segment in enumerate(segments, 1):
            start_time = self.format_timestamp(segment.start)
            end_time = self.format_timestamp(segment.end)
            text = segment.translated_text if is_translation and segment.translated_text else segment.text
            
            srt_content += f"{i}\n"
            srt_content += f"{start_time} --> {end_time}\n"
            srt_content += f"{text}\n\n"
        
        return srt_content
    
    def format_timestamp(self, seconds: float) -> str:
        """格式化时间戳为SRT格式"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        milliseconds = int((seconds % 1) * 1000)
        
        return f"{hours:02d}:{minutes:02d}:{secs:02d},{milliseconds:03d}"
    
    def process_audio_file(self, audio_file_path: str, request: SubtitleRequest) -> SubtitleResponse:
        """处理音频文件"""
        try:
            # 检查是否为视频文件并提取音频
            if self.is_video_file(audio_file_path):
                print(f"Detected video file, extracting audio...")
                audio_file_path = self.extract_audio_from_video(audio_file_path)
            
            # 转录音频
            segments = self.transcribe_audio(audio_file_path, request.source_language)
            
            if not segments:
                return SubtitleResponse(
                    success=False,
                    message="No speech detected in the audio file.",
                    segments=[],
                    original_srt=None,
                    translated_srt=None
                )
            
            # 生成原始字幕
            original_srt = self.generate_srt(segments, is_translation=False)
            
            # 翻译字幕
            translated_srt = None
            if request.translate and request.target_language != request.source_language:
                for segment in segments:
                    translated_text = self.translate_text(segment.text, request.target_language)
                    segment.translated_text = translated_text
                
                translated_srt = self.generate_srt(segments, is_translation=True)
            
            # 计算时长和片段数量
            duration = segments[-1].end - segments[0].start if segments else 0
            segment_count = len(segments)
            
            return SubtitleResponse(
                success=True,
                message="Audio processing completed successfully.",
                segments=segments,
                original_srt=original_srt,
                translated_srt=translated_srt,
                duration=duration,
                segment_count=segment_count
            )
            
        except Exception as e:
            return SubtitleResponse(
                success=False,
                message=f"Error processing audio: {str(e)}",
                segments=[],
                original_srt=None,
                translated_srt=None
            )
    
    def validate_url(self, url: str) -> bool:
        """验证URL格式"""
        try:
            result = urllib.parse.urlparse(url)
            if not all([result.scheme, result.netloc]):
                return False
            
            # 检查是否为直接音频文件URL
            if not self.is_direct_audio_url(url):
                print(f"URL is not a direct audio file: {url}")
                print("ByteDance API may not support this URL format. Please use direct audio file URLs.")
            
            return True
        except Exception:
            return False
    
    def is_direct_audio_url(self, url: str) -> bool:
        """检查是否为直接音频文件URL"""
        # 支持的音频文件扩展名
        audio_extensions = ['.mp3', '.wav', '.m4a', '.flac', '.ogg', '.aac', '.wma']
        
        # 检查URL是否以音频扩展名结尾
        return any(url.lower().endswith(ext) for ext in audio_extensions)
    
    def process_url(self, url: str, request: SubtitleRequest) -> SubtitleResponse:
        """处理在线URL音视频"""
        try:
            # 验证URL
            if not self.validate_url(url):
                return SubtitleResponse(
                    success=False,
                    message="Invalid URL format",
                    segments=[],
                    original_srt=None,
                    translated_srt=None
                )
            
            # 检查是否为直接音频文件URL
            if not self.is_direct_audio_url(url):
                return SubtitleResponse(
                    success=False,
                    message="URL must be a direct audio file link (ending with .mp3, .wav, .m4a, etc.). Video platform URLs like Bilibili, YouTube are not supported.",
                    segments=[],
                    original_srt=None,
                    translated_srt=None
                )
            
            print(f"Processing audio from URL: {url}")
            
            # 直接使用URL进行音频转录
            segments = self.transcribe_audio_from_url(url, request.source_language)
            
            if not segments:
                return SubtitleResponse(
                    success=False,
                    message="No speech detected in the audio.",
                    segments=[],
                    original_srt=None,
                    translated_srt=None
                )
            
            # 生成原始字幕
            original_srt = self.generate_srt(segments, is_translation=False)
            
            # 翻译字幕
            translated_srt = None
            if request.translate and request.target_language != request.source_language:
                for segment in segments:
                    translated_text = self.translate_text(segment.text, request.target_language)
                    segment.translated_text = translated_text
                
                translated_srt = self.generate_srt(segments, is_translation=True)
            
            # 计算时长和片段数量
            duration = segments[-1].end - segments[0].start if segments else 0
            segment_count = len(segments)
            
            return SubtitleResponse(
                success=True,
                message="URL processing completed successfully.",
                segments=segments,
                original_srt=original_srt,
                translated_srt=translated_srt,
                duration=duration,
                segment_count=segment_count
            )
                
        except Exception as e:
            return SubtitleResponse(
                success=False,
                message=f"Error processing URL: {str(e)}",
                segments=[],
                original_srt=None,
                translated_srt=None
            )
    
    def validate_srt_format(self, srt_content: str) -> bool:
        """验证SRT格式"""
        try:
            lines = srt_content.strip().split('\n')
            if len(lines) < 3:
                return False
            
            # 检查基本SRT结构
            line_index = 0
            while line_index < len(lines):
                # 序号行
                if not lines[line_index].strip().isdigit():
                    return False
                line_index += 1
                
                # 时间戳行
                if line_index >= len(lines) or ' --> ' not in lines[line_index]:
                    return False
                line_index += 1
                
                # 文本行
                if line_index >= len(lines) or not lines[line_index].strip():
                    return False
                line_index += 1
                
                # 空行
                if line_index < len(lines) and lines[line_index].strip():
                    return False
                line_index += 1
            
            return True
        except Exception:
            return False
    
    def parse_srt(self, srt_content: str) -> List[Dict]:
        """解析SRT文件"""
        segments = []
        lines = srt_content.strip().split('\n')
        
        i = 0
        while i < len(lines):
            # 序号行
            if not lines[i].strip().isdigit():
                i += 1
                continue
            
            # 时间戳行
            if i + 1 >= len(lines):
                break
            
            time_line = lines[i + 1]
            if ' --> ' not in time_line:
                i += 1
                continue
            
            # 解析时间戳
            time_parts = time_line.split(' --> ')
            if len(time_parts) != 2:
                i += 1
                continue
            
            start_time = self.parse_timestamp(time_parts[0].strip())
            end_time = self.parse_timestamp(time_parts[1].strip())
            
            # 文本行
            text_lines = []
            i += 2
            while i < len(lines) and lines[i].strip():
                text_lines.append(lines[i].strip())
                i += 1
            
            if text_lines:
                segments.append({
                    'text': ' '.join(text_lines),
                    'start': start_time,
                    'end': end_time
                })
            
            i += 1
        
        return segments
    
    def parse_timestamp(self, timestamp: str) -> float:
        """解析SRT时间戳"""
        # 格式: HH:MM:SS,mmm 或 HH:MM:SS.mmm
        if ',' in timestamp:
            time_part, ms_part = timestamp.split(',')
        else:
            time_part, ms_part = timestamp.split('.')
        
        h, m, s = time_part.split(':')
        return int(h) * 3600 + int(m) * 60 + int(s) + int(ms_part) / 1000.0
    
    def generate_srt_from_segments(self, segments: List[Dict]) -> str:
        """从片段生成SRT格式"""
        srt_content = ""
        
        for i, segment in enumerate(segments, 1):
            start_time = self.format_timestamp(segment['start'])
            end_time = self.format_timestamp(segment['end'])
            text = segment.get('translated_text', segment['text'])
            
            srt_content += f"{i}\n"
            srt_content += f"{start_time} --> {end_time}\n"
            srt_content += f"{text}\n\n"
        
        return srt_content