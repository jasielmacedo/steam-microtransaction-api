"""
Base classes for notification providers.
"""

import abc
import logging
from enum import Enum
from typing import Any, Dict, List, Optional, Union

from app.utils.notifications.models import NotificationType, Notification, NotificationContent, NotificationRecipient
from app.utils.notifications.exceptions import NotificationError, ProviderNotConfiguredError


logger = logging.getLogger(__name__)


class BaseNotificationProvider(abc.ABC):
    """
    Base class for all notification providers.
    
    Providers are responsible for sending notifications through
    a specific channel (email, push notification, etc.)
    """
    
    # Provider metadata
    name: str = "base"
    description: str = "Base notification provider"
    
    def __init__(self):
        """Initialize the provider."""
        self.enabled = False
        self.config: Dict[str, Any] = {}
    
    def configure(self, config: Dict[str, Any]) -> None:
        """
        Configure the provider with the given settings.
        
        Args:
            config: Provider-specific configuration settings
        """
        self.config = config
        self.enabled = config.get("enabled", False)
        self._validate_config()
        
    def _validate_config(self) -> None:
        """
        Validate that the provider is properly configured.
        
        Raises:
            ProviderNotConfiguredError: If the provider is not properly configured
        """
        # Base implementation does nothing, subclasses should override
        pass
    
    @abc.abstractmethod
    async def send(self, notification: Notification) -> Dict[str, Any]:
        """
        Send a notification.
        
        Args:
            notification: The notification to send
            
        Returns:
            A dictionary with provider-specific response data
            
        Raises:
            NotificationError: If the notification cannot be sent
        """
        pass
    
    def supports_notification_type(self, notification_type: NotificationType) -> bool:
        """
        Check if this provider supports the given notification type.
        
        Args:
            notification_type: The type of notification
            
        Returns:
            True if supported, False otherwise
        """
        # By default, all providers support all notification types
        return True
    
    def format_notification(self, notification_type: NotificationType, data: Any) -> NotificationContent:
        """
        Format notification data into a human-readable notification.
        
        Args:
            notification_type: The type of notification
            data: The data to format
            
        Returns:
            A NotificationContent object
        """
        # Default implementation just uses generic templates
        templates = {
            NotificationType.TRANSACTION_CREATED: {
                "subject": "New Transaction Created",
                "body": "A new transaction has been created."
            },
            NotificationType.TRANSACTION_COMPLETED: {
                "subject": "Transaction Completed",
                "body": "Your transaction has been completed successfully."
            },
            NotificationType.TRANSACTION_FAILED: {
                "subject": "Transaction Failed",
                "body": "There was an issue with your transaction."
            },
            NotificationType.PRODUCT_CREATED: {
                "subject": "New Product Created",
                "body": "A new product has been added to your account."
            },
            NotificationType.PRODUCT_UPDATED: {
                "subject": "Product Updated",
                "body": "A product has been updated in your account."
            },
            NotificationType.PRODUCT_DELETED: {
                "subject": "Product Deleted",
                "body": "A product has been removed from your account."
            },
            NotificationType.WEEKLY_REPORT: {
                "subject": "Your Weekly Report",
                "body": "Here is your weekly report."
            },
            NotificationType.SYSTEM_ALERT: {
                "subject": "System Alert",
                "body": "There is an important system alert."
            }
        }
        
        template = templates.get(notification_type, {
            "subject": f"Notification: {notification_type.value}",
            "body": f"You have a new notification of type {notification_type.value}"
        })
        
        return NotificationContent(
            subject=template["subject"],
            body=template["body"],
            data=data
        )