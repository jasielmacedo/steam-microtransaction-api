"""
Email notification provider.
"""

import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any, Dict, List, Optional, Union

from app.utils.notifications.base import BaseNotificationProvider
from app.utils.notifications.models import Notification, NotificationType
from app.utils.notifications.exceptions import NotificationError, ProviderNotConfiguredError, RecipientError


logger = logging.getLogger(__name__)


class EmailNotificationProvider(BaseNotificationProvider):
    """
    Provider for sending notifications via email.
    """
    
    name = "email"
    description = "Send notifications via email"
    
    def _validate_config(self) -> None:
        """Validate email provider configuration."""
        required_fields = ["smtp_host", "smtp_port", "from_email"]
        missing_fields = [field for field in required_fields if field not in self.config]
        
        if missing_fields:
            missing_fields_str = ", ".join(missing_fields)
            raise ProviderNotConfiguredError(
                f"Email provider configuration is missing required fields: {missing_fields_str}"
            )
    
    def _format_email_content(self, notification: Notification) -> Dict[str, Any]:
        """
        Format the notification content for email.
        
        Args:
            notification: The notification to format
            
        Returns:
            A dictionary with email content
        """
        subject = notification.content.subject
        
        # If it's a test notification, prefix the subject
        if notification.metadata.get("test", False):
            subject = f"[TEST] {subject}"
        
        # Use HTML body if available, otherwise use plain text
        if notification.content.html_body:
            body = notification.content.html_body
            content_type = "html"
        else:
            body = notification.content.body
            content_type = "plain"
            
        return {
            "subject": subject,
            "body": body,
            "content_type": content_type
        }
    
    def _get_email_recipients(self, notification: Notification) -> List[str]:
        """
        Extract email addresses from notification recipients.
        
        Args:
            notification: The notification with recipients
            
        Returns:
            List of email addresses
            
        Raises:
            RecipientError: If no valid email recipients are found
        """
        email_recipients = []
        
        for recipient in notification.recipients:
            if isinstance(recipient, str):
                # Check if this looks like an email address
                if "@" in recipient:
                    email_recipients.append(recipient)
            elif getattr(recipient, "type", None) == "email":
                # Use the recipient ID for email type recipients
                email_recipients.append(recipient.id)
        
        # If notification contains user data with an email, consider using it for test notifications
        if not email_recipients and notification.metadata.get("test", False):
            user_data = notification.content.data.get("user", {}) if notification.content.data else {}
            if isinstance(user_data, dict) and user_data.get("email"):
                email_recipients.append(user_data["email"])
        
        if not email_recipients:
            # For test notifications, log a warning instead of raising an error
            if notification.metadata.get("test", False):
                logger.warning("No valid email recipients found for test notification")
                return []
            
            raise RecipientError("No valid email recipients found in notification")
            
        return email_recipients
    
    async def send(self, notification: Notification) -> Dict[str, Any]:
        """
        Send an email notification.
        
        Args:
            notification: The notification to send
            
        Returns:
            Dictionary with send status and details
            
        Raises:
            NotificationError: If the email cannot be sent
        """
        if not self.enabled:
            logger.info("Email provider is disabled, skipping notification")
            return {"status": "skipped", "reason": "provider_disabled"}
        
        try:
            # Format email content
            email_content = self._format_email_content(notification)
            
            # Get email recipients
            recipients = self._get_email_recipients(notification)
            
            # Prepare email message
            smtp_host = self.config["smtp_host"]
            smtp_port = int(self.config["smtp_port"])
            from_email = self.config["from_email"]
            
            # SMTP authentication if provided
            smtp_user = self.config.get("smtp_user")
            smtp_password = self.config.get("smtp_password")
            
            # TLS/SSL settings
            use_tls = self.config.get("use_tls", False)
            use_ssl = self.config.get("use_ssl", False)
            
            # Create connection
            if use_ssl:
                server = smtplib.SMTP_SSL(smtp_host, smtp_port)
            else:
                server = smtplib.SMTP(smtp_host, smtp_port)
                
                if use_tls:
                    server.starttls()
            
            # Login if credentials are provided
            if smtp_user and smtp_password:
                server.login(smtp_user, smtp_password)
            
            # Send to each recipient individually
            sent_count = 0
            for recipient in recipients:
                try:
                    # Create message
                    msg = MIMEMultipart()
                    msg["From"] = from_email
                    msg["To"] = recipient
                    msg["Subject"] = email_content["subject"]
                    
                    # Attach body
                    msg.attach(MIMEText(
                        email_content["body"], 
                        email_content["content_type"]
                    ))
                    
                    # Send message
                    server.sendmail(from_email, recipient, msg.as_string())
                    sent_count += 1
                except Exception as e:
                    logger.warning(f"Failed to send email to {recipient}: {str(e)}")
            
            # Close connection
            server.quit()
            
            return {
                "status": "success",
                "sent_count": sent_count,
                "total_recipients": len(recipients)
            }
            
        except RecipientError as e:
            # This is expected in some cases, just log it
            logger.info(str(e))
            return {"status": "skipped", "reason": "no_recipients"}
            
        except Exception as e:
            error_msg = f"Failed to send email notification: {str(e)}"
            logger.error(error_msg)
            raise NotificationError(error_msg) from e