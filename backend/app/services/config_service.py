import os
import json
from typing import Dict, Optional
from pathlib import Path
from dotenv import load_dotenv

from ..models.schemas import APIConfig, TranslationProvider


class ConfigService:
    """配置管理服务 - 仅使用环境变量"""
    
    def __init__(self):
        self.config: Optional[APIConfig] = None
        # 加载环境变量
        load_dotenv()
    
    def load_config(self) -> Optional[APIConfig]:
        """从环境变量加载配置"""
        try:
            env_config = self.load_from_env()
            if env_config:
                self.config = env_config
                return env_config
            return None
        except Exception as e:
            print(f"Error loading config: {e}")
            return None
    
    def save_config(self, config: APIConfig) -> bool:
        """保存配置 - 已禁用"""
        print("Configuration saving is disabled. Using environment variables only.")
        return False
    
    def load_from_env(self) -> Optional[APIConfig]:
        """从环境变量加载配置"""
        try:
            config = APIConfig(
                asr_appid=os.getenv("BYTEDANCE_APPID", ""),
                asr_access_token=os.getenv("BYTEDANCE_ACCESS_TOKEN", ""),
                asr_base_url=os.getenv("BYTEDANCE_BASE_URL", "https://openspeech.bytedance.com/api/v1/vc"),
                translation_provider=TranslationProvider(os.getenv("TRANSLATION_PROVIDER", "DeepSeek")),
                translation_model=os.getenv("TRANSLATION_MODEL", "deepseek-chat"),
                translation_api_key=os.getenv("DEEPSEEK_API_KEY", ""),
                translation_base_url=os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com/v1"),
                translation_temperature=float(os.getenv("TRANSLATION_TEMPERATURE", "0.3")),
                translation_max_tokens=int(os.getenv("TRANSLATION_MAX_TOKENS", "1000")),
                translation_top_p=float(os.getenv("TRANSLATION_TOP_P", "1.0")),
                translation_frequency_penalty=float(os.getenv("TRANSLATION_FREQUENCY_PENALTY", "0.0"))
            )
            
            # 验证必要配置
            if not config.asr_appid or not config.asr_access_token:
                return None
            
            if not config.translation_api_key:
                return None
            
            self.config = config
            return config
        except Exception as e:
            print(f"Error loading config from env: {e}")
            return None
    
    def get_config(self) -> Optional[APIConfig]:
        """获取当前配置"""
        if not self.config:
            return self.load_config()
        return self.config
    
    def update_config(self, **kwargs) -> Optional[APIConfig]:
        """更新配置 - 已禁用"""
        print("Configuration updating is disabled. Using environment variables only.")
        return None
    
    def is_configured(self) -> bool:
        """检查是否已配置"""
        config = self.get_config()
        if not config:
            return False
        
        return bool(
            config.asr_appid and 
            config.asr_access_token and
            config.translation_api_key
        )