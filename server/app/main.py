from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.staticfiles import StaticFiles
import logging

from app.api.routes import api_router
from app.core.config import settings
from app.core.exceptions import BaseAPIException
from app.db.sqlite import connect_to_db, close_db, AsyncSessionLocal
from app.db.init_db import import_all_models
from app.core.init_data import init_data
from app.utils.notifications import NotificationManager
from app.utils.notifications.email_provider import EmailNotificationProvider
from app.utils.notifications.push_provider import PushNotificationProvider
from app.utils.notifications.web_provider import WebNotificationProvider

# Set up logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.VERSION,
    docs_url=None,  # Disable default docs
    redoc_url=None,  # Disable default redoc
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all API routes
app.include_router(api_router, prefix=settings.API_PREFIX)

# Add event handlers for database connection
@app.on_event("startup")
async def startup_db_client():
    # Import all models first to ensure tables are registered
    logger.info("Importing database models...")
    import_all_models()
    
    logger.info("Connecting to SQLite DB...")
    await connect_to_db()
    
    # Initialize data after database connection
    logger.info("Initializing data...")
    from app.db.sqlite import AsyncSessionLocal
    await init_data(AsyncSessionLocal)
    
    # Initialize notification providers
    logger.info("Initializing notification service...")
    
    # Register notification providers
    NotificationManager.register_provider(EmailNotificationProvider())
    NotificationManager.register_provider(PushNotificationProvider())
    NotificationManager.register_provider(WebNotificationProvider())
    
    try:
        # Get notification settings from the database (admin settings)
        from app.api.models.settings import Settings as SettingsModel
        admin_id = settings.ADMIN_EMAIL  # Use admin email as team_id for now
        async with AsyncSessionLocal() as session:
            app_settings = await SettingsModel.get_by_team_id(session, admin_id)
        
        # Configure notification providers from settings
        if app_settings and "notificationProviders" in app_settings:
            notification_providers = app_settings["notificationProviders"]
            notification_config = {
                "providers": {
                    "email": {
                        "enabled": notification_providers.get("email", {}).get("enabled", False),
                        "smtp_host": notification_providers.get("email", {}).get("smtpHost", ""),
                        "smtp_port": notification_providers.get("email", {}).get("smtpPort", 587),
                        "smtp_user": notification_providers.get("email", {}).get("smtpUser", ""),
                        "smtp_password": notification_providers.get("email", {}).get("smtpPassword", ""),
                        "from_email": notification_providers.get("email", {}).get("fromEmail", ""),
                        "use_tls": notification_providers.get("email", {}).get("useTls", True),
                    },
                    "push": {
                        "enabled": notification_providers.get("push", {}).get("enabled", False),
                        "fcm_api_key": notification_providers.get("push", {}).get("fcmApiKey", ""),
                        "fcm_url": notification_providers.get("push", {}).get("fcmUrl", "https://fcm.googleapis.com/fcm/send"),
                    },
                    "web": {
                        "enabled": notification_providers.get("web", {}).get("enabled", False),
                        "subscribers": notification_providers.get("web", {}).get("subscribers", []),
                        "vapid_public_key": notification_providers.get("web", {}).get("vapidPublicKey", ""),
                        "vapid_private_key": notification_providers.get("web", {}).get("vapidPrivateKey", ""),
                    }
                }
            }
        else:
            # Fallback to environment variables if no settings found
            notification_config = {
                "providers": {
                    "email": {
                        "enabled": settings.EMAIL_NOTIFICATIONS_ENABLED if hasattr(settings, "EMAIL_NOTIFICATIONS_ENABLED") else False,
                        "smtp_host": settings.EMAIL_SMTP_HOST if hasattr(settings, "EMAIL_SMTP_HOST") else "",
                        "smtp_port": settings.EMAIL_SMTP_PORT if hasattr(settings, "EMAIL_SMTP_PORT") else 587,
                        "smtp_user": settings.EMAIL_SMTP_USER if hasattr(settings, "EMAIL_SMTP_USER") else "",
                        "smtp_password": settings.EMAIL_SMTP_PASSWORD if hasattr(settings, "EMAIL_SMTP_PASSWORD") else "",
                        "from_email": settings.EMAIL_FROM if hasattr(settings, "EMAIL_FROM") else "",
                        "use_tls": settings.EMAIL_USE_TLS if hasattr(settings, "EMAIL_USE_TLS") else True,
                    },
                    "push": {
                        "enabled": settings.PUSH_NOTIFICATIONS_ENABLED if hasattr(settings, "PUSH_NOTIFICATIONS_ENABLED") else False,
                        "fcm_api_key": settings.FCM_API_KEY if hasattr(settings, "FCM_API_KEY") else "",
                        "fcm_url": "https://fcm.googleapis.com/fcm/send",
                    },
                    "web": {
                        "enabled": settings.WEB_NOTIFICATIONS_ENABLED if hasattr(settings, "WEB_NOTIFICATIONS_ENABLED") else False,
                        "subscribers": [],
                        "vapid_public_key": settings.VAPID_PUBLIC_KEY if hasattr(settings, "VAPID_PUBLIC_KEY") else "",
                        "vapid_private_key": settings.VAPID_PRIVATE_KEY if hasattr(settings, "VAPID_PRIVATE_KEY") else "",
                    }
                }
            }
        
        # Initialize notification manager with configuration
        NotificationManager.initialize(notification_config)
        logger.info("Notification service initialized")
    except Exception as e:
        logger.error(f"Error initializing notification service: {str(e)}")
        # Continue without notifications if there's an error
    
    logger.info("Startup completed")


@app.on_event("shutdown")
async def shutdown_db_client():
    logger.info("Closing SQLite connection...")
    await close_db()
    logger.info("Shutdown completed")


# Custom exception handler
@app.exception_handler(BaseAPIException)
async def handle_api_exception(request: Request, exc: BaseAPIException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "error": exc.message},
    )


# Root endpoint
@app.get("/", include_in_schema=False)
async def root():
    return {"status": True}


# Custom Swagger UI
@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url=f"{settings.API_PREFIX}/openapi.json",
        title=f"{settings.PROJECT_NAME} API",
        swagger_js_url="/static/swagger-ui-bundle.js",
        swagger_css_url="/static/swagger-ui.css",
    )