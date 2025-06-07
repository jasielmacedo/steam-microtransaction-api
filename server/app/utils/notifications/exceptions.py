"""
Exceptions for the notification service.
"""

class NotificationError(Exception):
    """Base exception for notification errors."""
    pass

class ProviderNotConfiguredError(NotificationError):
    """Raised when a provider is not properly configured."""
    pass

class ProviderNotAvailableError(NotificationError):
    """Raised when a provider is not available."""
    pass

class RecipientError(NotificationError):
    """Raised when there's an issue with the notification recipient."""
    pass