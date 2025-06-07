"""
Push notification provider.
"""

import logging
import aiohttp
from typing import Any, Dict, List, Optional, Union

from app.utils.notifications.base import BaseNotificationProvider
from app.utils.notifications.models import Notification, NotificationType
from app.utils.notifications.exceptions import NotificationError, ProviderNotConfiguredError, RecipientError


logger = logging.getLogger(__name__)


class PushNotificationProvider(BaseNotificationProvider):
    """
    Provider for sending push notifications.
    This implementation uses Firebase Cloud Messaging (FCM) as an example,
    but can be adapted to other push notification services.
    """
    
    name = "push"
    description = "Send push notifications via Firebase Cloud Messaging"
    
    def _validate_config(self) -> None:
        """Validate push notification provider configuration."""
        required_fields = ["fcm_api_key", "fcm_url"]
        missing_fields = [field for field in required_fields if field not in self.config]
        
        if missing_fields:
            missing_fields_str = ", ".join(missing_fields)
            raise ProviderNotConfiguredError(
                f"Push notification provider configuration is missing required fields: {missing_fields_str}"
            )
    
    def _format_push_content(self, notification: Notification) -> Dict[str, Any]:
        """
        Format the notification content for push notification.
        
        Args:
            notification: The notification to format
            
        Returns:
            A dictionary with push notification content
        """
        return {
            "title": notification.content.subject,
            "body": notification.content.body,
            "data": notification.content.data or {}
        }
    
    def _get_device_tokens(self, notification: Notification) -> List[str]:
        """
        Extract device tokens from notification recipients.
        
        Args:
            notification: The notification with recipients
            
        Returns:
            List of device tokens
            
        Raises:
            RecipientError: If no valid device tokens are found
        """
        device_tokens = []
        
        for recipient in notification.recipients:
            if isinstance(recipient, str) and recipient.startswith("device:"):
                # Extract token from "device:TOKEN" format
                device_tokens.append(recipient.split(":", 1)[1])
            elif getattr(recipient, "type", None) == "device":
                # Use the recipient ID for device type recipients
                device_tokens.append(recipient.id)
        
        if not device_tokens:
            raise RecipientError("No valid device tokens found in notification")
            
        return device_tokens
    
    async def send(self, notification: Notification) -> Dict[str, Any]:
        """
        Send a push notification.
        
        Args:
            notification: The notification to send
            
        Returns:
            Dictionary with send status and details
            
        Raises:
            NotificationError: If the push notification cannot be sent
        """
        if not self.enabled:
            logger.info("Push notification provider is disabled, skipping notification")
            return {"status": "skipped", "reason": "provider_disabled"}
        
        try:
            # Format push notification content
            push_content = self._format_push_content(notification)
            
            # Get device tokens
            device_tokens = self._get_device_tokens(notification)
            
            # FCM configuration
            fcm_api_key = self.config["fcm_api_key"]
            fcm_url = self.config["fcm_url"]
            
            # Send to each device token
            results = []
            sent_count = 0
            
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"key={fcm_api_key}",
                    "Content-Type": "application/json"
                }
                
                for token in device_tokens:
                    # Prepare FCM payload
                    payload = {
                        "to": token,
                        "notification": {
                            "title": push_content["title"],
                            "body": push_content["body"],
                        },
                        "data": push_content["data"]
                    }
                    
                    try:
                        async with session.post(fcm_url, json=payload, headers=headers) as response:
                            response_data = await response.json()
                            
                            if response.status == 200 and response_data.get("success") == 1:
                                sent_count += 1
                                results.append({
                                    "token": token,
                                    "status": "success",
                                    "response": response_data
                                })
                            else:
                                results.append({
                                    "token": token,
                                    "status": "error",
                                    "response": response_data
                                })
                    except Exception as e:
                        logger.warning(f"Failed to send push notification to token {token}: {str(e)}")
                        results.append({
                            "token": token,
                            "status": "error",
                            "error": str(e)
                        })
            
            return {
                "status": "success" if sent_count > 0 else "error",
                "sent_count": sent_count,
                "total_recipients": len(device_tokens),
                "results": results
            }
            
        except RecipientError as e:
            # This is expected in some cases, just log it
            logger.info(str(e))
            return {"status": "skipped", "reason": "no_recipients"}
            
        except Exception as e:
            error_msg = f"Failed to send push notification: {str(e)}"
            logger.error(error_msg)
            raise NotificationError(error_msg) from e
    
    def supports_notification_type(self, notification_type: NotificationType) -> bool:
        """Check if push notifications support this notification type."""
        # Push notifications are better suited for immediate notifications, 
        # not for weekly reports or similar
        if notification_type == NotificationType.WEEKLY_REPORT:
            return False
        return True