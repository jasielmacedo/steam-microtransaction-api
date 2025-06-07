"""
Notification manager for coordinating notification providers.
"""

import logging
import uuid
from typing import Any, Dict, List, Optional, Set, Type, Union

from app.utils.notifications.base import BaseNotificationProvider
from app.utils.notifications.models import Notification, NotificationContent, NotificationType, NotificationRecipient
from app.utils.notifications.exceptions import NotificationError, ProviderNotAvailableError


logger = logging.getLogger(__name__)


class NotificationManager:
    """
    Manager for sending notifications through one or more providers.
    
    The NotificationManager is responsible for:
    1. Registering and configuring notification providers
    2. Sending notifications through appropriate providers
    3. Handling errors and fallbacks
    """
    
    # Registry of available notification providers
    _providers: Dict[str, BaseNotificationProvider] = {}
    
    # Flag to indicate if the manager has been initialized
    _initialized = False
    
    @classmethod
    def register_provider(cls, provider: BaseNotificationProvider) -> None:
        """
        Register a notification provider.
        
        Args:
            provider: The provider instance to register
        """
        cls._providers[provider.name] = provider
        logger.info(f"Registered notification provider: {provider.name}")
    
    @classmethod
    def get_provider(cls, provider_name: str) -> BaseNotificationProvider:
        """
        Get a notification provider by name.
        
        Args:
            provider_name: The name of the provider to get
            
        Returns:
            The provider instance
            
        Raises:
            ProviderNotAvailableError: If the provider is not registered
        """
        if provider_name not in cls._providers:
            raise ProviderNotAvailableError(f"Notification provider '{provider_name}' is not registered")
        return cls._providers[provider_name]
    
    @classmethod
    def initialize(cls, config: Dict[str, Any]) -> None:
        """
        Initialize all registered providers with the given configuration.
        
        Args:
            config: Configuration dictionary with provider-specific settings
        """
        provider_configs = config.get("providers", {})
        
        for provider_name, provider in cls._providers.items():
            provider_config = provider_configs.get(provider_name, {})
            provider.configure(provider_config)
            
            if provider.enabled:
                logger.info(f"Enabled notification provider: {provider_name}")
            else:
                logger.info(f"Notification provider not enabled: {provider_name}")
        
        cls._initialized = True
        logger.info("Notification manager initialized")
    
    @classmethod
    def get_enabled_providers(cls) -> List[BaseNotificationProvider]:
        """
        Get all enabled notification providers.
        
        Returns:
            List of enabled provider instances
        """
        return [p for p in cls._providers.values() if p.enabled]
    
    @classmethod
    def get_providers_for_type(cls, notification_type: NotificationType) -> List[BaseNotificationProvider]:
        """
        Get all enabled providers that support the given notification type.
        
        Args:
            notification_type: The type of notification
            
        Returns:
            List of provider instances
        """
        return [
            p for p in cls.get_enabled_providers() 
            if p.supports_notification_type(notification_type)
        ]
    
    @classmethod
    async def notify(
        cls, 
        notification_type: NotificationType, 
        data: Any, 
        recipients: List[Union[str, NotificationRecipient]],
        providers: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Send a notification to the specified recipients.
        
        Args:
            notification_type: The type of notification
            data: The data to include in the notification
            recipients: List of recipient identifiers or NotificationRecipient objects
            providers: Optional list of specific providers to use
            metadata: Optional additional metadata for the notification
            
        Returns:
            Dictionary of results per provider
            
        Raises:
            NotificationError: If no suitable providers are available
        """
        if not cls._initialized:
            logger.warning("Notification manager not initialized, skipping notification")
            return {}
        
        # Select providers
        if providers:
            selected_providers = [
                cls.get_provider(p) for p in providers
                if p in cls._providers and cls._providers[p].enabled
            ]
        else:
            selected_providers = cls.get_providers_for_type(notification_type)
        
        if not selected_providers:
            logger.info(f"No enabled providers for notification type {notification_type}")
            return {}
        
        # Prepare the notification object
        notification_id = str(uuid.uuid4())
        
        # Let the first provider format the notification
        content = selected_providers[0].format_notification(notification_type, data)
        
        notification = Notification(
            id=notification_id,
            type=notification_type,
            content=content,
            recipients=recipients,
            metadata=metadata or {}
        )
        
        # Send through each provider
        results = {}
        errors = []
        
        for provider in selected_providers:
            try:
                logger.debug(f"Sending notification {notification_id} via {provider.name}")
                result = await provider.send(notification)
                results[provider.name] = result
                logger.info(f"Notification {notification_id} sent via {provider.name}")
            except Exception as e:
                error_msg = f"Error sending notification via {provider.name}: {str(e)}"
                logger.error(error_msg)
                errors.append(error_msg)
                results[provider.name] = {"error": str(e)}
        
        if errors and len(errors) == len(selected_providers):
            # All providers failed
            logger.error(f"All notification providers failed for notification {notification_id}")
        
        return results