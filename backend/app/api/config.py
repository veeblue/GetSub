from fastapi import APIRouter, HTTPException
from typing import Optional

from ..models.schemas import (
    APIConfig,
    APIConfigResponse
)
from ..services.config_service import ConfigService


router = APIRouter()

config_service = ConfigService()


@router.get("/config", response_model=APIConfigResponse)
async def get_config():
    """获取API配置"""
    try:
        # 使用安全配置获取，隐藏环境变量配置
        config = config_service.get_safe_config()
        is_configured = config_service.is_configured()
        
        if not config:
            return APIConfigResponse(
                success=True,
                message="Configuration loaded from environment variables",
                config=None
            )
        
        return APIConfigResponse(
            success=True,
            message="Configuration loaded successfully" if is_configured else "Configuration incomplete",
            config=config
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading configuration: {str(e)}")


@router.post("/config", response_model=APIConfigResponse)
async def save_config(config: APIConfig):
    """保存API配置"""
    try:
        success = config_service.save_config(config)
        
        if success:
            return APIConfigResponse(
                success=True,
                message="Configuration saved successfully",
                config=config
            )
        else:
            return APIConfigResponse(
                success=False,
                message="Failed to save configuration",
                config=None
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving configuration: {str(e)}")


@router.put("/config", response_model=APIConfigResponse)
async def update_config(
    asr_appid: Optional[str] = None,
    asr_access_token: Optional[str] = None,
    asr_base_url: Optional[str] = None,
    translation_provider: Optional[str] = None,
    translation_model: Optional[str] = None,
    translation_api_key: Optional[str] = None,
    translation_base_url: Optional[str] = None,
    translation_temperature: Optional[float] = None,
    translation_max_tokens: Optional[int] = None,
    translation_top_p: Optional[float] = None,
    translation_frequency_penalty: Optional[float] = None
):
    """更新API配置"""
    try:
        current_config = config_service.get_config()
        if not current_config:
            raise HTTPException(status_code=404, detail="Configuration not found")
        
        # 构建更新参数
        update_params = {}
        if asr_appid is not None:
            update_params["asr_appid"] = asr_appid
        if asr_access_token is not None:
            update_params["asr_access_token"] = asr_access_token
        if asr_base_url is not None:
            update_params["asr_base_url"] = asr_base_url
        if translation_provider is not None:
            update_params["translation_provider"] = translation_provider
        if translation_model is not None:
            update_params["translation_model"] = translation_model
        if translation_api_key is not None:
            update_params["translation_api_key"] = translation_api_key
        if translation_base_url is not None:
            update_params["translation_base_url"] = translation_base_url
        if translation_temperature is not None:
            update_params["translation_temperature"] = translation_temperature
        if translation_max_tokens is not None:
            update_params["translation_max_tokens"] = translation_max_tokens
        if translation_top_p is not None:
            update_params["translation_top_p"] = translation_top_p
        if translation_frequency_penalty is not None:
            update_params["translation_frequency_penalty"] = translation_frequency_penalty
        
        # 更新配置
        new_config = config_service.update_config(**update_params)
        
        if new_config:
            return APIConfigResponse(
                success=True,
                message="Configuration updated successfully",
                config=new_config
            )
        else:
            return APIConfigResponse(
                success=False,
                message="Failed to update configuration",
                config=None
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating configuration: {str(e)}")


@router.get("/config/status")
async def get_config_status():
    """获取配置状态"""
    try:
        is_configured = config_service.is_configured()
        config = config_service.get_config()
        safe_config = config_service.get_safe_config()
        
        return {
            "configured": is_configured,
            "has_asr_config": bool(config and config.asr_appid and config.asr_access_token),
            "has_translation_config": bool(config and config.translation_api_key),
            "asr_provider": config.asr_provider if config else None,
            "translation_provider": config.translation_provider.value if config else None,
            "config_from_file": bool(safe_config),
            "config_from_env": bool(config) and not bool(safe_config)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking configuration status: {str(e)}")


@router.get("/config/validate")
async def validate_config():
    """验证API配置"""
    try:
        validation_result = config_service.validate_config()
        return validation_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error validating configuration: {str(e)}")


@router.post("/config/use-environment")
async def use_environment_config():
    """切换到使用环境变量配置"""
    try:
        success = config_service.use_environment_config()
        
        if success:
            return {
                "success": True,
                "message": "Successfully switched to environment configuration"
            }
        else:
            return {
                "success": False,
                "message": "Failed to switch to environment configuration"
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error switching to environment configuration: {str(e)}")