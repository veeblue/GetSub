import os
import uuid
import aiofiles
from typing import List, Optional
from pathlib import Path
from fastapi import UploadFile, HTTPException
from ..models.schemas import FileUploadResponse


class FileService:
    """文件服务"""
    
    def __init__(self, upload_dir: str = "uploads"):
        self.upload_dir = Path(upload_dir)
        self.upload_dir.mkdir(exist_ok=True)
        
        # 支持的文件扩展名
        self.allowed_audio_extensions = {'.mp3', '.wav', '.m4a', '.flac', '.ogg'}
        self.allowed_video_extensions = {'.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm'}
        self.max_file_size = 100 * 1024 * 1024  # 100MB
    
    def is_allowed_file(self, filename: str) -> bool:
        """检查文件是否允许上传"""
        file_ext = Path(filename).suffix.lower()
        return (
            file_ext in self.allowed_audio_extensions or
            file_ext in self.allowed_video_extensions
        )
    
    def is_video_file(self, filename: str) -> bool:
        """检查是否为视频文件"""
        file_ext = Path(filename).suffix.lower()
        return file_ext in self.allowed_video_extensions
    
    async def save_file(self, file: UploadFile) -> FileUploadResponse:
        """保存上传的文件"""
        try:
            # 检查文件大小
            file.file.seek(0, 2)  # 移动到文件末尾
            file_size = file.file.tell()
            file.file.seek(0)  # 重置到文件开头
            
            if file_size > self.max_file_size:
                return FileUploadResponse(
                    success=False,
                    message=f"File size exceeds maximum limit of {self.max_file_size // (1024 * 1024)}MB"
                )
            
            # 检查文件扩展名
            if not self.is_allowed_file(file.filename):
                return FileUploadResponse(
                    success=False,
                    message="File type not allowed. Supported formats: MP3, WAV, M4A, FLAC, OGG, MP4, AVI, MOV, MKV, WMV, FLV, WEBM"
                )
            
            # 生成唯一文件名
            file_id = str(uuid.uuid4())
            file_ext = Path(file.filename).suffix
            safe_filename = f"{file_id}{file_ext}"
            file_path = self.upload_dir / safe_filename
            
            # 保存文件
            async with aiofiles.open(file_path, 'wb') as buffer:
                content = await file.read()
                await buffer.write(content)
            
            return FileUploadResponse(
                success=True,
                message="File uploaded successfully",
                file_id=file_id,
                filename=file.filename,
                file_size=file_size,
                file_type=file.content_type,
                is_video=self.is_video_file(file.filename)
            )
            
        except Exception as e:
            return FileUploadResponse(
                success=False,
                message=f"Error saving file: {str(e)}"
            )
    
    def get_file_path(self, file_id: str) -> Optional[Path]:
        """获取文件路径"""
        # 查找文件
        for file_path in self.upload_dir.glob(f"{file_id}.*"):
            if file_path.exists():
                return file_path
        return None
    
    def delete_file(self, file_id: str) -> bool:
        """删除文件"""
        file_path = self.get_file_path(file_id)
        if file_path and file_path.exists():
            try:
                file_path.unlink()
                return True
            except Exception:
                return False
        return False
    
    def cleanup_temp_files(self):
        """清理临时文件"""
        try:
            # 删除超过1小时的文件
            import time
            current_time = time.time()
            
            for file_path in self.upload_dir.glob("*"):
                if file_path.is_file():
                    file_age = current_time - file_path.stat().st_mtime
                    if file_age > 3600:  # 1小时
                        try:
                            file_path.unlink()
                            print(f"Deleted old file: {file_path}")
                        except Exception as e:
                            print(f"Error deleting file {file_path}: {e}")
        except Exception as e:
            print(f"Error during cleanup: {e}")
    
    def get_file_info(self, file_id: str) -> Optional[dict]:
        """获取文件信息"""
        file_path = self.get_file_path(file_id)
        if not file_path or not file_path.exists():
            return None
        
        stat = file_path.stat()
        return {
            'file_id': file_id,
            'filename': file_path.name,
            'file_size': stat.st_size,
            'created_time': stat.st_ctime,
            'modified_time': stat.st_mtime,
            'is_video': self.is_video_file(file_path.name)
        }