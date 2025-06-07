from typing import TypeVar, Generic, Optional, Any, Dict, List

from pydantic import BaseModel

# Define a generic type for API responses
T = TypeVar('T')

class ApiResponse(BaseModel, Generic[T]):
    """Generic API response schema."""
    success: bool = True
    data: Optional[T] = None
    error: Optional[str] = None
    
    # Factory methods for easy creation
    @classmethod
    def success_response(cls, data: T) -> 'ApiResponse[T]':
        """Create a success response with data."""
        return cls(success=True, data=data)
    
    @classmethod
    def error_response(cls, error_message: str) -> 'ApiResponse[Any]':
        """Create an error response."""
        return cls(success=False, error=error_message)