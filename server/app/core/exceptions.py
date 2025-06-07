from typing import Any, Dict, Optional


class BaseAPIException(Exception):
    """Base exception for all API exceptions."""
    
    def __init__(
        self,
        message: str,
        status_code: int = 500,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(self.message)


class NotFoundException(BaseAPIException):
    """Exception raised when a resource is not found."""
    
    def __init__(self, message: str = "Resource not found", details: Optional[Dict[str, Any]] = None):
        super().__init__(message=message, status_code=404, details=details)


class BadRequestException(BaseAPIException):
    """Exception raised when the request is malformed."""
    
    def __init__(self, message: str = "Bad request", details: Optional[Dict[str, Any]] = None):
        super().__init__(message=message, status_code=400, details=details)


class UnauthorizedException(BaseAPIException):
    """Exception raised when the user is not authenticated."""
    
    def __init__(
        self, message: str = "Not authorized to access this route", details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message=message, status_code=401, details=details)


class ForbiddenException(BaseAPIException):
    """Exception raised when the user is not authorized."""
    
    def __init__(
        self, message: str = "Not authorized to perform this action", details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message=message, status_code=403, details=details)


class ConflictException(BaseAPIException):
    """Exception raised when there's a conflict with the current state."""
    
    def __init__(self, message: str = "Conflict", details: Optional[Dict[str, Any]] = None):
        super().__init__(message=message, status_code=409, details=details)


class RateLimitExceededException(BaseAPIException):
    """Exception raised when rate limit is exceeded."""
    
    def __init__(
        self, message: str = "Too many requests, please try again later", details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message=message, status_code=429, details=details)


class SteamAPIException(BaseAPIException):
    """Exception raised when Steam API returns an error."""
    
    def __init__(
        self, message: str = "Steam API error", status_code: int = 500, details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message=message, status_code=status_code, details=details)