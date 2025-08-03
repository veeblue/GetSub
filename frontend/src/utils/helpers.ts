export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

export const formatTimestamp = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
};

export const validateFileType = (file: File): boolean => {
  const allowedTypes = [
    'audio/mp3',
    'audio/wav',
    'audio/m4a',
    'audio/flac',
    'audio/ogg',
    'video/mp4',
    'video/avi',
    'video/quicktime',
    'video/x-matroska',
    'video/x-msvideo',
    'video/x-ms-wmv',
    'video/x-flv',
    'video/webm'
  ];
  
  const allowedExtensions = ['.mp3', '.wav', '.m4a', '.flac', '.ogg', '.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm'];
  
  return allowedTypes.includes(file.type) || 
         allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
};

export const isVideoFile = (file: File): boolean => {
  const videoTypes = [
    'video/mp4',
    'video/avi',
    'video/quicktime',
    'video/x-matroska',
    'video/x-msvideo',
    'video/x-ms-wmv',
    'video/x-flv',
    'video/webm'
  ];
  
  const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm'];
  
  return videoTypes.includes(file.type) || 
         videoExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
};

export const validateFileSize = (file: File, maxSize: number = 100 * 1024 * 1024): boolean => {
  return file.size <= maxSize;
};

export const parseSRT = (content: string): Array<{
  index: number;
  start_time: string;
  end_time: string;
  text: string;
}> => {
  const segments = [];
  const lines = content.trim().split('\n');
  
  let i = 0;
  while (i < lines.length) {
    // 解析序号
    const index = parseInt(lines[i]);
    if (isNaN(index)) {
      i++;
      continue;
    }
    i++;
    
    // 解析时间戳
    if (i >= lines.length) break;
    const timeLine = lines[i];
    const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
    if (!timeMatch) {
      i++;
      continue;
    }
    
    const start_time = timeMatch[1];
    const end_time = timeMatch[2];
    i++;
    
    // 解析文本
    let text = '';
    while (i < lines.length && lines[i].trim() !== '') {
      text += lines[i] + '\n';
      i++;
    }
    
    segments.push({
      index,
      start_time,
      end_time,
      text: text.trim()
    });
    
    // 跳过空行
    i++;
  }
  
  return segments;
};

export const generateSRT = (segments: Array<{
  index: number;
  start_time: string;
  end_time: string;
  text: string;
}>): string => {
  return segments.map(segment => 
    `${segment.index}\n${segment.start_time} --> ${segment.end_time}\n${segment.text}\n`
  ).join('\n');
};

export const downloadFile = (content: string, filename: string, mimeType: string = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};