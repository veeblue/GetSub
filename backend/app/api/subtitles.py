from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import Optional
import os
import tempfile
from pydantic import BaseModel

from ..models.schemas import (
    SubtitleRequest, 
    SubtitleResponse,
    SubtitleEditRequest,
    SubtitleEditResponse,
    FileUploadResponse
)
from ..services.subtitle_service import AudioSubtitleService
from ..services.config_service import ConfigService
from ..services.file_service import FileService


class URLRequest(BaseModel):
    url: str
    source_language: str = "auto"
    translate: bool = False
    target_language: str = "en"


class TranslationRequest(BaseModel):
    original_srt: str
    target_language: str


router = APIRouter()

# 初始化服务
config_service = ConfigService()
file_service = FileService()
subtitle_service: Optional[AudioSubtitleService] = None


def get_subtitle_service() -> AudioSubtitleService:
    """获取字幕服务实例"""
    global subtitle_service
    
    if subtitle_service is None:
        config = config_service.get_config()
        if not config:
            raise HTTPException(status_code=400, detail="API configuration not found")
        
        subtitle_service = AudioSubtitleService(config)
        print(f"Created new subtitle service, translation_client: {subtitle_service.translation_client is not None}")
    
    return subtitle_service


@router.post("/upload", response_model=FileUploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """上传文件"""
    result = await file_service.save_file(file)
    
    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)
    
    return result


@router.post("/generate-subtitles", response_model=SubtitleResponse)
async def generate_subtitles(
    request: SubtitleRequest,
    file_id: str
):
    """生成字幕"""
    # 获取文件路径
    file_path = file_service.get_file_path(file_id)
    if not file_path:
        raise HTTPException(status_code=404, detail="File not found")
    
    # 获取字幕服务
    service = get_subtitle_service()
    
    # 处理音频文件
    result = service.process_audio_file(str(file_path), request)
    
    if not result.success:
        raise HTTPException(status_code=500, detail=result.message)
    
    # 清理上传的文件
    file_service.delete_file(file_id)
    
    return result


@router.post("/edit-subtitles", response_model=SubtitleEditResponse)
async def edit_subtitles(request: SubtitleEditRequest):
    """编辑字幕"""
    try:
        service = get_subtitle_service()
        
        # 验证SRT格式
        if request.original_srt and not service.validate_srt_format(request.original_srt):
            return SubtitleEditResponse(
                success=False,
                message="Invalid SRT format for original subtitles",
                original_srt=None,
                translated_srt=None
            )
        
        if request.translated_srt and not service.validate_srt_format(request.translated_srt):
            return SubtitleEditResponse(
                success=False,
                message="Invalid SRT format for translated subtitles",
                original_srt=None,
                translated_srt=None
            )
        
        return SubtitleEditResponse(
            success=True,
            message="Subtitles updated successfully",
            original_srt=request.original_srt,
            translated_srt=request.translated_srt
        )
        
    except Exception as e:
        return SubtitleEditResponse(
            success=False,
            message=f"Error editing subtitles: {str(e)}",
            original_srt=None,
            translated_srt=None
        )


@router.get("/file/{file_id}")
async def get_file_info(file_id: str):
    """获取文件信息"""
    file_info = file_service.get_file_info(file_id)
    if not file_info:
        raise HTTPException(status_code=404, detail="File not found")
    
    return file_info


@router.delete("/file/{file_id}")
async def delete_file(file_id: str):
    """删除文件"""
    success = file_service.delete_file(file_id)
    if not success:
        raise HTTPException(status_code=404, detail="File not found")
    
    return {"message": "File deleted successfully"}


@router.post("/process-url", response_model=SubtitleResponse)
async def process_video_url(request: URLRequest):
    """处理在线视频URL"""
    try:
        # 获取字幕服务
        service = get_subtitle_service()
        
        # 转换为SubtitleRequest
        subtitle_request = SubtitleRequest(
            source_language=request.source_language,
            translate=request.translate,
            target_language=request.target_language
        )
        
        # 处理URL
        result = service.process_url(request.url, subtitle_request)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing URL: {str(e)}")


@router.post("/translate-subtitles", response_model=SubtitleEditResponse)
async def translate_subtitles(
    request: TranslationRequest
):
    """翻译字幕"""
    try:
        service = get_subtitle_service()
        
        # 验证SRT格式
        if not service.validate_srt_format(request.original_srt):
            return SubtitleEditResponse(
                success=False,
                message="Invalid SRT format",
                original_srt=None,
                translated_srt=None
            )
        
        # 解析SRT文件
        segments = service.parse_srt(request.original_srt)
        
        # 检查翻译服务是否可用
        if not service.translation_client:
            return SubtitleEditResponse(
                success=False,
                message="Translation service not configured. Please set up your translation API keys in the configuration.",
                original_srt=None,
                translated_srt=None
            )
        
        # 使用批量翻译提高效率
        translated_segments = []
        failed_segments = []
        
        try:
            # 批量翻译
            texts = [segment['text'] for segment in segments]
            translated_texts = service.translate_text_batch(texts, request.target_language)
            
            # 将翻译结果分配给对应的片段
            for i, (segment, translated_text) in enumerate(zip(segments, translated_texts)):
                translated_segments.append({
                    **segment,
                    'translated_text': translated_text
                })
                
        except Exception as e:
            print(f"Batch translation failed, falling back to individual translation: {e}")
            # 如果批量翻译失败，回退到单个翻译
            for i, segment in enumerate(segments):
                try:
                    translated_text = service.translate_text(segment['text'], request.target_language)
                    translated_segments.append({
                        **segment,
                        'translated_text': translated_text
                    })
                except Exception as e:
                    print(f"Failed to translate segment {i+1}: {e}")
                    failed_segments.append(i+1)
                    # 如果翻译失败，使用原文
                    translated_segments.append({
                        **segment,
                        'translated_text': f"[Translation failed] {segment['text']}"
                    })
        
        # 生成翻译后的SRT
        translated_srt = service.generate_srt_from_segments(translated_segments)
        
        # 如果有失败的片段，在消息中说明
        success_message = "Subtitles translated successfully"
        if failed_segments:
            success_message += f" (Note: {len(failed_segments)} segments failed to translate and were left in original language)"
        
        return SubtitleEditResponse(
            success=True,
            message=success_message,
            original_srt=request.original_srt,
            translated_srt=translated_srt
        )
        
    except Exception as e:
        return SubtitleEditResponse(
            success=False,
            message=f"Error translating subtitles: {str(e)}",
            original_srt=None,
            translated_srt=None
        )