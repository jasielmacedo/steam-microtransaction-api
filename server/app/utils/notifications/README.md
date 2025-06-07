# Notification Service

A pluggable notification service for the Steam Microtransaction API.

## Architecture

```
app/utils/notifications/
├── __init__.py              # Exports main components
├── base.py                  # Base notification provider interface
├── email_provider.py        # Email notification implementation
├── push_provider.py         # Push notification implementation
├── manager.py               # Notification manager
├── exceptions.py            # Custom exceptions
└── models.py                # Data models for notifications
```

## Usage

```python
from app.utils.notifications import NotificationManager, NotificationType

# In an API endpoint
async def create_transaction(transaction_data):
    # Process transaction...
    
    # Send notification
    await NotificationManager.notify(
        notification_type=NotificationType.TRANSACTION_CREATED,
        data=transaction,
        recipients=["user@example.com"]
    )
```

## Adding New Providers

To add a new notification provider:

1. Create a new file `your_provider.py` in the notifications directory
2. Implement the `BaseNotificationProvider` interface
3. Register the provider in the `NotificationManager`

## Configuration

Providers can be enabled/disabled in the application settings.