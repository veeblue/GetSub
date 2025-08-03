import os
import re
from typing import List, Dict, Optional
from pathlib import Path


def validate_file_type(filename: str, allowed_extensions: List[str]) -> bool:
    """验证文件类型"""
    file_ext = Path(filename).suffix.lower()
    return file_ext in allowed_extensions


def format_file_size(size_bytes: int) -> str:
    """格式化文件大小"""
    if size_bytes == 0:
        return "0 B"
    
    size_names = ["B", "KB", "MB", "GB"]
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024
        i += 1
    
    return f"{size_bytes:.1f} {size_names[i]}"


def validate_srt_format(content: str) -> bool:
    """验证SRT格式"""
    try:
        lines = content.strip().split('\n')
        if len(lines) < 3:
            return False
        
        # 检查基本SRT结构
        line_index = 0
        segment_count = 0
        
        while line_index < len(lines):
            # 序号行
            if not lines[line_index].strip().isdigit():
                return False
            line_index += 1
            
            # 时间戳行
            if line_index >= len(lines):
                return False
            
            time_line = lines[line_index].strip()
            if not re.match(r'\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}', time_line):
                return False
            line_index += 1
            
            # 文本行
            if line_index >= len(lines) or not lines[line_index].strip():
                return False
            
            # 读取所有文本行
            while line_index < len(lines) and lines[line_index].strip():
                line_index += 1
            
            # 空行
            if line_index < len(lines) and lines[line_index].strip():
                return False
            line_index += 1
            
            segment_count += 1
        
        return segment_count > 0
    except Exception:
        return False


def parse_srt_content(content: str) -> List[Dict]:
    """解析SRT内容"""
    segments = []
    lines = content.strip().split('\n')
    
    line_index = 0
    while line_index < len(lines):
        # 序号
        if not lines[line_index].strip().isdigit():
            line_index += 1
            continue
        
        segment_num = int(lines[line_index].strip())
        line_index += 1
        
        # 时间戳
        if line_index >= len(lines):
            break
        
        time_line = lines[line_index].strip()
        time_match = re.match(r'(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})', time_line)
        if not time_match:
            line_index += 1
            continue
        
        start_time = time_match.group(1)
        end_time = time_match.group(2)
        line_index += 1
        
        # 文本
        text_lines = []
        while line_index < len(lines) and lines[line_index].strip():
            text_lines.append(lines[line_index].strip())
            line_index += 1
        
        text = ' '.join(text_lines)
        
        segments.append({
            'index': segment_num,
            'start_time': start_time,
            'end_time': end_time,
            'text': text
        })
        
        # 跳过空行
        line_index += 1
    
    return segments


def generate_srt_content(segments: List[Dict]) -> str:
    """生成SRT内容"""
    srt_content = ""
    
    for i, segment in enumerate(segments, 1):
        srt_content += f"{i}\n"
        srt_content += f"{segment['start_time']} --> {segment['end_time']}\n"
        srt_content += f"{segment['text']}\n\n"
    
    return srt_content


def sanitize_filename(filename: str) -> str:
    """清理文件名"""
    # 移除或替换特殊字符
    filename = re.sub(r'[<>:"/\\|?*]', '', filename)
    filename = filename.strip()
    
    # 限制文件名长度
    if len(filename) > 200:
        name, ext = os.path.splitext(filename)
        filename = name[:200] + ext
    
    return filename


def get_file_mime_type(filename: str) -> str:
    """获取文件MIME类型"""
    ext = Path(filename).suffix.lower()
    mime_types = {
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.m4a': 'audio/mp4',
        '.flac': 'audio/flac',
        '.ogg': 'audio/ogg',
        '.mp4': 'video/mp4',
        '.avi': 'video/x-msvideo',
        '.mov': 'video/quicktime',
        '.mkv': 'video/x-matroska',
        '.wmv': 'video/x-ms-wmv',
        '.flv': 'video/x-flv',
        '.webm': 'video/webm'
    }
    
    return mime_types.get(ext, 'application/octet-stream')