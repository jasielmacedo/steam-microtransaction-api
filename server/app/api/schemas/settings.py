from typing import Optional, Dict, Any, List
from pydantic import BaseModel, HttpUrl, EmailStr, Field

class CompanySettings(BaseModel):
    """Company settings schema."""
    name: str
    email: EmailStr
    website: str

class WebhookSettings(BaseModel):
    """Webhook settings schema."""
    purchaseSuccess: str
    purchaseFailed: str

class NotificationSettings(BaseModel):
    """Email notification settings schema."""
    purchaseConfirmation: bool
    failedTransactions: bool
    weeklyReports: bool
    newProductReleases: bool

class EmailProviderSettings(BaseModel):
    """Email provider configuration."""
    enabled: bool = False
    smtpHost: str = ""
    smtpPort: int = 587
    smtpUser: str = ""
    smtpPassword: str = ""
    fromEmail: str = ""
    useTls: bool = True

class PushProviderSettings(BaseModel):
    """Push notification provider configuration."""
    enabled: bool = False
    fcmApiKey: str = ""
    fcmUrl: str = "https://fcm.googleapis.com/fcm/send"

class WebProviderSettings(BaseModel):
    """Web notification provider configuration."""
    enabled: bool = False
    subscribers: list[str] = Field(default_factory=list)
    vapidPublicKey: str = ""
    vapidPrivateKey: str = ""

class NotificationProviderSettings(BaseModel):
    """Notification providers configuration."""
    email: EmailProviderSettings = Field(default_factory=EmailProviderSettings)
    push: PushProviderSettings = Field(default_factory=PushProviderSettings)
    web: WebProviderSettings = Field(default_factory=WebProviderSettings)

class AppSettings(BaseModel):
    """Application settings schema."""
    company: CompanySettings
    webhooks: WebhookSettings
    notifications: NotificationSettings
    notificationProviders: NotificationProviderSettings = Field(default_factory=NotificationProviderSettings)

class UpdateSettingsRequest(BaseModel):
    """Settings update request schema."""
    company: Optional[CompanySettings] = None
    webhooks: Optional[WebhookSettings] = None
    notifications: Optional[NotificationSettings] = None
    notificationProviders: Optional[NotificationProviderSettings] = None

class TestNotificationRequest(BaseModel):
    """Test notification request schema."""
    subject: str
    message: str
    notification_type: str
    provider_types: List[str]