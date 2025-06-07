"""
Data models for the notification service.
"""

from enum import Enum
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field


class NotificationType(str, Enum):
    """Types of notifications that can be sent."""
    TRANSACTION_CREATED = "transaction_created"
    TRANSACTION_COMPLETED = "transaction_completed"
    TRANSACTION_FAILED = "transaction_failed"
    PRODUCT_CREATED = "product_created"
    PRODUCT_UPDATED = "product_updated"
    PRODUCT_DELETED = "product_deleted"
    WEEKLY_REPORT = "weekly_report"
    SYSTEM_ALERT = "system_alert"


class NotificationRecipient(BaseModel):
    """
    A recipient of a notification.
    Could be an email address, device token, phone number, etc.
    """
    id: str
    type: str = "email"  # email, device, phone, etc.
    data: Optional[Dict[str, Any]] = None


class NotificationContent(BaseModel):
    """Content of a notification."""
    subject: str
    body: str
    html_body: Optional[str] = None
    data: Optional[Dict[str, Any]] = None


class Notification(BaseModel):
    """A notification to be sent."""
    id: Optional[str] = None
    type: NotificationType
    content: NotificationContent
    recipients: List[Union[str, NotificationRecipient]]
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        use_enum_values = True