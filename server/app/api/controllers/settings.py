import logging
from typing import Dict, Any
from datetime import datetime

from fastapi import Depends, status

from sqlalchemy.ext.asyncio import AsyncSession
from app.api.models.settings import Settings
from app.db.sqlite import async_session
from app.api.schemas.settings import AppSettings, UpdateSettingsRequest, TestNotificationRequest
from app.api.schemas.common import ApiResponse
from app.core.security import get_current_user
from app.utils.notifications import NotificationManager, NotificationType
from app.utils.notifications.web_provider import WebNotificationProvider

logger = logging.getLogger(__name__)

async def get_settings(
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: AsyncSession = Depends(async_session),
):
    """Get settings for current team."""
    # In a real app, we would likely use the team_id from the user's context
    # For now, we'll use the user_id as a stand-in for team_id
    settings = await Settings.get_by_team_id(session, current_user["_id"])
    
    return ApiResponse.success_response(settings)

async def update_notification_providers(notification_providers: Dict[str, Any]):
    """Update notification providers configuration."""
    try:
        # Only update if notificationProviders are provided
        if not notification_providers:
            return
        
        # Build notification config
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
        
        # Update notification manager configuration
        NotificationManager.initialize(notification_config)
        logger.info("Notification providers configuration updated")
    except Exception as e:
        logger.error(f"Error updating notification providers: {str(e)}")

async def generate_vapid_keys():
    """Generate VAPID keys for web push notifications."""
    try:
        vapid_keys = WebNotificationProvider.generate_vapid_keys()
        
        # Log the keys for debugging
        logger.info(f"Generated VAPID keys - public key length: {len(vapid_keys['public_key'])}, private key length: {len(vapid_keys['private_key'])}")
        
        # Validate the generated keys meet minimum requirements
        if len(vapid_keys['public_key']) < 16 or len(vapid_keys['private_key']) < 16:
            logger.warning("Generated VAPID keys are too short, using fallback keys")
            # Generate fallback keys
            import secrets
            import base64
            
            # Create fallback keys for development
            private_key = secrets.token_bytes(32)
            # For public key, use format that browsers expect (0x04 + 64 bytes for x,y coordinates)
            public_key = b'\x04' + secrets.token_bytes(64)
            
            # Encode to URL-safe base64 without padding
            vapid_keys = {
                "public_key": base64.urlsafe_b64encode(public_key).decode('utf-8').rstrip('='),
                "private_key": base64.urlsafe_b64encode(private_key).decode('utf-8').rstrip('=')
            }
            
            logger.info(f"Using fallback VAPID keys - public key length: {len(vapid_keys['public_key'])}, private key length: {len(vapid_keys['private_key'])}")
        
        return vapid_keys
    except Exception as e:
        logger.error(f"Error generating VAPID keys: {str(e)}")
        # Generate fallback keys
        import secrets
        import base64
        
        # Create fallback keys for development
        private_key = secrets.token_bytes(32)
        public_key = b'\x04' + secrets.token_bytes(64)
        
        # Encode to URL-safe base64 without padding
        vapid_keys = {
            "public_key": base64.urlsafe_b64encode(public_key).decode('utf-8').rstrip('='),
            "private_key": base64.urlsafe_b64encode(private_key).decode('utf-8').rstrip('=')
        }
        
        logger.info(f"Using emergency fallback VAPID keys after error - public key length: {len(vapid_keys['public_key'])}, private key length: {len(vapid_keys['private_key'])}")
        
        return vapid_keys

async def update_settings(
    update_data: UpdateSettingsRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: AsyncSession = Depends(async_session),
):
    """Update settings for current team."""
    # In a real app, we would likely use the team_id from the user's context
    # For now, we'll use the user_id as a stand-in for team_id
    data_dict = update_data.model_dump(exclude_none=True)
    
    # Check if we need to generate VAPID keys for web notifications
    if "notificationProviders" in data_dict and "web" in data_dict["notificationProviders"]:
        web_settings = data_dict["notificationProviders"]["web"]
        
        # If web notifications are enabled but no VAPID keys, generate them
        if web_settings.get("enabled", False) and (
            not web_settings.get("vapidPublicKey") or 
            not web_settings.get("vapidPrivateKey")
        ):
            try:
                # Generate new VAPID keys
                vapid_keys = await generate_vapid_keys()
                web_settings["vapidPublicKey"] = vapid_keys["public_key"]
                web_settings["vapidPrivateKey"] = vapid_keys["private_key"]
                logger.info("Generated new VAPID keys for web notifications")
            except Exception as e:
                logger.error(f"Failed to generate VAPID keys: {str(e)}")
    
    updated_settings = await Settings.create_or_update(
        session,
        current_user["_id"],
        data_dict
    )
    
    # Update notification providers if included in the update
    if "notificationProviders" in data_dict:
        await update_notification_providers(data_dict["notificationProviders"])
    
    return ApiResponse.success_response(updated_settings)

async def test_notification(
    request: TestNotificationRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Send a test notification to the current user.
    
    Args:
        request: Test notification request
        current_user: Current authenticated user
        
    Returns:
        API response with test results
    """
    try:
        # Get notification type
        try:
            # Convert the string to the enum value by name
            notification_type_name = request.notification_type.upper()
            if hasattr(NotificationType, notification_type_name):
                notification_type = getattr(NotificationType, notification_type_name)
            else:
                # Default to SYSTEM_ALERT if the type is not recognized
                notification_type = NotificationType.SYSTEM_ALERT
                logger.warning(f"Unknown notification type: {request.notification_type}, using SYSTEM_ALERT instead")
        except Exception as e:
            # Default to SYSTEM_ALERT if any error occurs
            notification_type = NotificationType.SYSTEM_ALERT
            logger.warning(f"Error parsing notification type: {str(e)}, using SYSTEM_ALERT instead")
        
        # Create test data
        test_data = {
            "subject": request.subject,
            "body": request.message,
            "html_body": f"<p>{request.message}</p>",
            "user": {
                "id": current_user["_id"],
                "email": current_user["email"],
                "name": current_user.get("name", "User")
            },
            "metadata": {
                "test": True,
                "timestamp": datetime.utcnow().isoformat(),
                "notification_type": request.notification_type
            }
        }
        
        # Determine recipients based on notification providers to test
        # For email, use the user's email
        # For web, we'll use the user_id to filter subscribers
        # For push, also use the user_id
        recipients = []
        
        if "email" in request.provider_types:
            recipients.append(current_user["email"])
        
        if "web" in request.provider_types or "push" in request.provider_types:
            recipients.append(current_user["_id"])
        
        # Send the notification through the notification manager
        results = await NotificationManager.notify(
            notification_type=notification_type,
            data=test_data,
            recipients=recipients,
            providers=request.provider_types
        )
        
        return ApiResponse.success_response({
            "message": "Test notification sent",
            "results": results
        })
    except Exception as e:
        logger.error(f"Error sending test notification: {str(e)}")
        return ApiResponse.error_response(f"Failed to send test notification: {str(e)}")