from app.api.schemas.common import ApiResponse
from app.api.schemas.user import (
    UserCreate,
    UserResponse,
    UserUpdate,
    LoginRequest,
    LoginResponse,
    PasswordUpdate,
    UserWithApiKey,
    Token,
    TokenData
)
from app.api.schemas.steam import (
    GetReliableUserInfoRequest,
    CheckAppOwnershipRequest,
    InitPurchaseRequest,
    InitPurchaseResponse,
    FinalizePurchaseRequest,
    CheckPurchaseStatusRequest,
    PurchaseStatusResponse,
    SuccessResponse
)

# Aliasing the schemas for backward compatibility
AppOwnershipRequest = CheckAppOwnershipRequest
AppOwnershipResponse = SuccessResponse
MicroTxInitRequest = InitPurchaseRequest
MicroTxInitResponse = InitPurchaseResponse
MicroTxFinalizeRequest = FinalizePurchaseRequest
MicroTxFinalizeResponse = SuccessResponse
MicroTxStatusRequest = CheckPurchaseStatusRequest
MicroTxStatusResponse = PurchaseStatusResponse
UserInfoRequest = GetReliableUserInfoRequest
UserInfoResponse = SuccessResponse

__all__ = [
    'ApiResponse',
    'UserCreate',
    'UserResponse',
    'UserUpdate',
    'LoginRequest',
    'LoginResponse',
    'PasswordUpdate',
    'UserWithApiKey',
    'Token',
    'TokenData',
    # Original schema names
    'GetReliableUserInfoRequest',
    'CheckAppOwnershipRequest',
    'InitPurchaseRequest',
    'InitPurchaseResponse',
    'FinalizePurchaseRequest',
    'CheckPurchaseStatusRequest',
    'PurchaseStatusResponse',
    'SuccessResponse',
    # Aliases for backward compatibility
    'AppOwnershipRequest', 
    'AppOwnershipResponse',
    'MicroTxInitRequest',
    'MicroTxInitResponse',
    'MicroTxFinalizeRequest',
    'MicroTxFinalizeResponse',
    'MicroTxStatusRequest',
    'MicroTxStatusResponse',
    'UserInfoRequest',
    'UserInfoResponse'
]