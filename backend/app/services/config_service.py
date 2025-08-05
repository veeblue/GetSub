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
        """从文件或环境变量加载配置"""
        try:
            # 首先尝试从文件加载
            file_config = self.load_from_file()
            if file_config:
                self.config = file_config
                return file_config
            
            # 如果文件不存在，尝试从环境变量加载
            env_config = self.load_from_env()
            if env_config:
                self.config = env_config
                return env_config
            
            return None
        except Exception as e:
            print(f"Error loading config: {e}")
            return None
    
    def load_from_file(self) -> Optional[APIConfig]:
        """从文件加载配置"""
        try:
            config_dir = Path(__file__).parent.parent.parent
            config_file = config_dir / "config.json"
            
            if not config_file.exists():
                return None
            
            with open(config_file, 'r', encoding='utf-8') as f:
                config_data = json.load(f)
            
            config = APIConfig(**config_data)
            return config
        except Exception as e:
            print(f"Error loading config from file: {e}")
            return None
    
    def save_config(self, config: APIConfig) -> bool:
        """保存配置到文件"""
        try:
            config_dir = Path(__file__).parent.parent.parent
            config_file = config_dir / "config.json"
            
            # 保存到文件
            with open(config_file, 'w', encoding='utf-8') as f:
                json.dump(config.dict(), f, ensure_ascii=False, indent=2)
            
            self.config = config
            print(f"Configuration saved to {config_file}")
            return True
        except Exception as e:
            print(f"Error saving config: {e}")
            return False
    
    def use_environment_config(self) -> bool:
        """切换到使用环境变量配置"""
        try:
            # 删除配置文件
            config_dir = Path(__file__).parent.parent.parent
            config_file = config_dir / "config.json"
            
            if config_file.exists():
                config_file.unlink()
                print(f"Configuration file {config_file} deleted")
            
            # 重置配置，下次加载时会从环境变量读取
            self.config = None
            return True
        except Exception as e:
            print(f"Error switching to environment config: {e}")
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
    
    def get_safe_config(self) -> Optional[APIConfig]:
        """获取安全的配置（隐藏环境变量中的敏感信息）"""
        config = self.get_config()
        if not config:
            return None
        
        # 检查配置是否来自环境变量
        env_config = self.load_from_env()
        if env_config and config.dict() == env_config.dict():
            # 如果配置来自环境变量，返回空值给前端
            return None
        
        return config
    
    def update_config(self, **kwargs) -> Optional[APIConfig]:
        """更新配置"""
        try:
            current_config = self.get_config()
            if not current_config:
                return None
            
            # 更新配置
            for key, value in kwargs.items():
                if hasattr(current_config, key):
                    setattr(current_config, key, value)
            
            # 保存更新后的配置
            if self.save_config(current_config):
                return current_config
            
            return None
        except Exception as e:
            print(f"Error updating config: {e}")
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
    
    def validate_config(self) -> dict:
        """验证API配置是否有效"""
        config = self.get_config()
        if not config:
            return {
                "valid": False,
                "message": "Configuration not found",
                "asr_valid": False,
                "translation_valid": False
            }
        
        # 验证ASR配置
        asr_valid = False
        asr_message = ""
        
        try:
            # 验证ASR配置格式和基本有效性
            if config.asr_appid and config.asr_access_token:
                # 检查是否为测试值或明显无效的值
                if config.asr_appid in ["1111", "test", "demo", ""]:
                    asr_valid = False
                    asr_message = "ASR AppID appears to be a test value"
                elif config.asr_access_token in ["111111", "test", "demo", ""]:
                    asr_valid = False
                    asr_message = "ASR Access Token appears to be a test value"
                elif len(config.asr_appid) < 5 or len(config.asr_access_token) < 10:
                    asr_valid = False
                    asr_message = "ASR credentials appear to be invalid (too short)"
                else:
                    asr_valid = True
                    asr_message = "ASR configuration appears valid"
            else:
                asr_message = "ASR configuration incomplete"
        except Exception as e:
            asr_message = f"ASR validation error: {str(e)}"
        
        # 验证翻译配置
        translation_valid = False
        translation_message = ""
        
        try:
            # 验证翻译配置格式和基本有效性
            if config.translation_api_key and config.translation_model:
                # 检查是否为测试值或明显无效的值
                if config.translation_api_key in ["11111", "test", "demo", ""]:
                    translation_valid = False
                    translation_message = "Translation API key appears to be a test value"
                elif len(config.translation_api_key) < 20:
                    translation_valid = False
                    translation_message = "Translation API key appears to be invalid (too short)"
                else:
                    translation_valid = True
                    translation_message = "Translation configuration appears valid"
            else:
                translation_message = "Translation configuration incomplete"
        except Exception as e:
            translation_message = f"Translation validation error: {str(e)}"
        
        return {
            "valid": asr_valid and translation_valid,
            "message": "All configurations valid" if (asr_valid and translation_valid) else "Some configurations invalid",
            "asr_valid": asr_valid,
            "translation_valid": translation_valid,
            "asr_message": asr_message,
            "translation_message": translation_message
        }