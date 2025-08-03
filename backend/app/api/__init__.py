from .subtitles import router as subtitles_router
from .config import router as config_router
from .health import router as health_router


__all__ = [
    "subtitles_router",
    "config_router", 
    "health_router"
]