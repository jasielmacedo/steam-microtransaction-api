"""
Web notification provider.
"""

import json
import logging
import secrets
import base64
import time
from typing import Any, Dict, List, Optional, Union
import httpx

# Make pywebpush import optional to avoid crashing the server
try:
    from pywebpush import webpush, WebPushException
    PYWEBPUSH_AVAILABLE = True
except ImportError:
    logging.warning("pywebpush module not found. Web push notifications will not be available.")
    PYWEBPUSH_AVAILABLE = False
    # Define dummy class for type checking
    class WebPushException(Exception):
        pass

from app.utils.notifications.base import BaseNotificationProvider
from app.utils.notifications.models import Notification, NotificationType
from app.utils.notifications.exceptions import NotificationError, ProviderNotConfiguredError, RecipientError


logger = logging.getLogger(__name__)


class WebNotificationProvider(BaseNotificationProvider):
    """
    Provider for sending notifications via web push API.
    This implementation uses pywebpush for web push notifications.
    """
    
    name = "web"
    description = "Send notifications via Web Push API"
    
    def _validate_config(self) -> None:
        """Validate web notification provider configuration."""
        # Check if pywebpush is available
        if not PYWEBPUSH_AVAILABLE:
            if self.config.get("enabled", False):
                logger.warning("Web notifications are enabled but pywebpush module is not installed.")
                # Disable provider if pywebpush is not available
                self.enabled = False
            return
        
        required_fields = ["vapid_public_key", "vapid_private_key"]
        missing_fields = [field for field in required_fields if field not in self.config]
        
        if missing_fields:
            missing_fields_str = ", ".join(missing_fields)
            raise ProviderNotConfiguredError(
                f"Web notification provider configuration is missing required fields: {missing_fields_str}"
            )
        
        # If enabled but no subscribers, log a warning but don't fail
        if self.config.get("enabled", False) and not self.config.get("subscribers", []):
            logger.warning("Web notification provider is enabled but has no subscribers")
    
    def _format_web_notification(self, notification: Notification) -> Dict[str, Any]:
        """
        Format the notification content for web push notification.
        
        Args:
            notification: The notification to format
            
        Returns:
            A dictionary with web notification content
        """
        # Web notifications require a specific format according to the Push API spec
        # Add a timestamp to make the tag unique
        tag = f"microtrax-notification-{int(time.time())}"
        
        # If it's a test notification, indicate that in the tag
        if notification.metadata.get("test"):
            tag = f"test-{tag}"
            
        return {
            "title": notification.content.subject,
            "body": notification.content.body,
            "icon": "/static/img/notification-icon.png",  # Add an icon path for your application
            "badge": "/static/img/notification-badge.png",  # Add a badge path for your application
            "data": notification.content.data or {},
            "tag": tag,
            "requireInteraction": True,  # Notification will stay until user interacts with it
            "actions": []  # Optional buttons that can be added to the notification
        }
    
    def _get_web_subscribers(self, notification: Notification) -> List[Dict[str, Any]]:
        """
        Get subscriber data for notification recipients.
        
        Args:
            notification: The notification with recipients
            
        Returns:
            List of subscriber data dictionaries
            
        Raises:
            RecipientError: If no valid subscribers are found
        """
        subscribers = []
        
        # Get subscribers from configuration
        subscribers_data = self.config.get("subscribers", [])
        if not subscribers_data:
            raise RecipientError("No web notification subscribers configured")
        
        # If specific recipients are targeted, filter subscribers accordingly
        if notification.recipients:
            recipient_ids = []
            for recipient in notification.recipients:
                if isinstance(recipient, str):
                    # This could be a user ID or an email address
                    # For test notifications, we identify by user ID
                    recipient_ids.append(recipient)
                elif getattr(recipient, "id", None):
                    recipient_ids.append(recipient.id)
            
            # Filter subscribers based on recipient IDs
            if recipient_ids:
                # For each subscriber, check if their user_id matches any recipient ID
                filtered_subscribers = []
                for sub in subscribers_data:
                    sub_user_id = sub.get("user_id", "")
                    # For test notifications, also check if the current_user ID matches
                    if sub_user_id in recipient_ids:
                        filtered_subscribers.append(sub)
                
                subscribers = filtered_subscribers
            else:
                subscribers = subscribers_data
        else:
            # If no specific recipients, use all subscribers
            subscribers = subscribers_data
        
        if not subscribers:
            # For test notifications, just log a warning but don't raise an error
            if notification.metadata.get("test", False):
                logger.warning("No matching web notification subscribers found for test notification")
                return []
            
            raise RecipientError("No matching web notification subscribers found")
            
        return subscribers
    
    async def send(self, notification: Notification) -> Dict[str, Any]:
        """
        Send a web notification.
        
        Args:
            notification: The notification to send
            
        Returns:
            Dictionary with send status and details
            
        Raises:
            NotificationError: If the web notification cannot be sent
        """
        if not self.enabled:
            logger.info("Web notification provider is disabled, skipping notification")
            return {"status": "skipped", "reason": "provider_disabled"}
        
        # Check if pywebpush is available
        if not PYWEBPUSH_AVAILABLE:
            logger.warning("Web notifications are enabled but pywebpush module is not installed")
            return {"status": "skipped", "reason": "pywebpush_not_available"}
        
        try:
            # Format web notification content
            notification_data = self._format_web_notification(notification)
            
            # Get subscribers
            subscribers = self._get_web_subscribers(notification)
            
            # Get VAPID keys
            vapid_public_key = self.config["vapid_public_key"]
            vapid_private_key = self.config["vapid_private_key"]
            vapid_claims = {
                "sub": "mailto:admin@example.com"  # This should be a contact email for your application
            }
            
            # Send to each subscriber
            results = []
            sent_count = 0
            
            for subscriber in subscribers:
                subscription_info = subscriber.get("subscription_info")
                if not subscription_info:
                    continue
                
                try:
                    # Send push notification
                    response = webpush(
                        subscription_info=subscription_info,
                        data=json.dumps(notification_data),
                        vapid_private_key=vapid_private_key,
                        vapid_claims=vapid_claims
                    )
                    
                    if response.status_code >= 200 and response.status_code < 300:
                        sent_count += 1
                        results.append({
                            "user_id": subscriber.get("user_id"),
                            "status": "success",
                        })
                    else:
                        results.append({
                            "user_id": subscriber.get("user_id"),
                            "status": "error",
                            "error": f"HTTP {response.status_code}: {response.text}"
                        })
                except WebPushException as e:
                    logger.warning(f"Failed to send web notification to subscriber: {str(e)}")
                    results.append({
                        "user_id": subscriber.get("user_id"),
                        "status": "error",
                        "error": str(e)
                    })
                except Exception as e:
                    logger.warning(f"Failed to send web notification to subscriber: {str(e)}")
                    results.append({
                        "user_id": subscriber.get("user_id"),
                        "status": "error",
                        "error": str(e)
                    })
            
            return {
                "status": "success" if sent_count > 0 else "error",
                "sent_count": sent_count,
                "total_recipients": len(subscribers),
                "results": results
            }
            
        except RecipientError as e:
            # This is expected in some cases, just log it
            logger.info(str(e))
            return {"status": "skipped", "reason": "no_recipients"}
            
        except Exception as e:
            error_msg = f"Failed to send web notification: {str(e)}"
            logger.error(error_msg)
            raise NotificationError(error_msg) from e
    
    @classmethod
    def generate_vapid_keys(cls) -> Dict[str, str]:
        """
        Generate VAPID keys for web push notifications.
        
        Returns:
            Dictionary with public and private keys
        """
        # Check if pywebpush is available
        if not PYWEBPUSH_AVAILABLE:
            logger.warning("Cannot generate proper VAPID keys: pywebpush module not installed")
            
            # Generate random strings that conform to VAPID key requirements
            private_key = secrets.token_bytes(32)
            public_key = secrets.token_bytes(65)  # Public key needs to be 65 bytes for P-256
            
            private_key_b64 = base64.urlsafe_b64encode(private_key).decode('utf-8').rstrip('=')
            public_key_b64 = base64.urlsafe_b64encode(public_key).decode('utf-8').rstrip('=')
            
            logger.info(f"Generated mock VAPID keys: public_key length: {len(public_key_b64)}, private_key length: {len(private_key_b64)}")
            
            return {
                "public_key": public_key_b64,
                "private_key": private_key_b64,
            }
        
        try:
            # Try to use py_vapid if available (part of pywebpush dependencies)
            try:
                from py_vapid import Vapid
                
                vapid = Vapid()
                vapid.generate_keys()
                
                # Get the keys and log their values for debugging
                public_key = vapid.public_key.decode()
                private_key = vapid.private_key.decode()
                
                logger.info(f"Generated VAPID keys with py_vapid: public_key length: {len(public_key)}, private_key length: {len(private_key)}")
                
                return {
                    "public_key": public_key,
                    "private_key": private_key,
                }
            except ImportError:
                # If py_vapid is not available, use pywebpush to generate keys properly
                try:
                    from pywebpush import WebPushException, webpush  # noqa
                    import http_ece
                    from cryptography.hazmat.primitives.asymmetric import ec
                    from cryptography.hazmat.backends import default_backend
                    
                    # Generate a proper P-256 curve for VAPID
                    private_key = ec.generate_private_key(
                        ec.SECP256R1(),  # This is the P-256 curve used by VAPID
                        backend=default_backend()
                    )
                    
                    # Export the keys in the right format
                    private_numbers = private_key.private_numbers()
                    private_key_int = private_numbers.private_value
                    private_key_bytes = private_key_int.to_bytes(32, byteorder='big')
                    
                    public_key = private_key.public_key()
                    public_numbers = public_key.public_numbers()
                    
                    # Create uncompressed EC point format: 0x04 + x_coord + y_coord
                    x_bytes = public_numbers.x.to_bytes(32, byteorder='big')
                    y_bytes = public_numbers.y.to_bytes(32, byteorder='big')
                    public_key_bytes = b'\x04' + x_bytes + y_bytes
                    
                    # Encode to URL-safe base64 without padding
                    private_key_b64 = base64.urlsafe_b64encode(private_key_bytes).decode('utf-8').rstrip('=')
                    public_key_b64 = base64.urlsafe_b64encode(public_key_bytes).decode('utf-8').rstrip('=')
                    
                    logger.info(f"Generated VAPID keys with cryptography: public_key length: {len(public_key_b64)}, private_key length: {len(private_key_b64)}")
                    
                    return {
                        "public_key": public_key_b64,
                        "private_key": private_key_b64,
                    }
                except ImportError:
                    # Fall back to a simpler approach if neither py_vapid nor cryptography are available
                    logger.warning("Neither py_vapid nor cryptography are available, using simplified key generation")
                    
                    # Generate keys with appropriate length for VAPID
                    private_key = secrets.token_bytes(32)
                    
                    # For public key, ensure it matches the P-256 format (65 bytes: 0x04 + 32 bytes X + 32 bytes Y)
                    # Start with 0x04 to indicate uncompressed point format
                    public_key = b'\x04' + secrets.token_bytes(64)
                    
                    # Encode to URL-safe base64 without padding (VAPID keys should not have padding)
                    private_key_b64 = base64.urlsafe_b64encode(private_key).decode('utf-8').rstrip('=')
                    public_key_b64 = base64.urlsafe_b64encode(public_key).decode('utf-8').rstrip('=')
                    
                    logger.info(f"Generated mock VAPID keys: public_key length: {len(public_key_b64)}, private_key length: {len(private_key_b64)}")
                    
                    return {
                        "public_key": public_key_b64,
                        "private_key": private_key_b64,
                    }
            
        except Exception as e:
            logger.error(f"Error generating VAPID keys: {str(e)}")
            
            # Generate safer fallback keys for development use
            # These won't work for actual push notifications but won't crash the browser either
            private_key = secrets.token_bytes(32)
            public_key = b'\x04' + secrets.token_bytes(64)  # Uncompressed EC point format
            
            private_key_b64 = base64.urlsafe_b64encode(private_key).decode('utf-8').rstrip('=')
            public_key_b64 = base64.urlsafe_b64encode(public_key).decode('utf-8').rstrip('=')
            
            logger.info(f"Generated fallback VAPID keys after error: public_key length: {len(public_key_b64)}, private_key length: {len(private_key_b64)}")
            
            return {
                "public_key": public_key_b64,
                "private_key": private_key_b64,
            }