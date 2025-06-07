from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime


# Request and response schemas
class TeamMemberBase(BaseModel):
    name: str
    email: EmailStr
    role: str  # "admin", "manager", "viewer"


class TeamMemberCreate(TeamMemberBase):
    """Schema for creating a team member"""

    pass


class TeamMemberInvite(BaseModel):
    """Schema for inviting a team member"""

    email: EmailStr
    role: str  # "admin", "manager", "viewer"


class TeamMemberResponse(TeamMemberBase):
    """Response schema for team member"""

    id: str
    status: str  # "pending", "active"
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TeamMemberListResponse(BaseModel):
    """Response schema for list of team members"""

    success: bool = True
    data: List[TeamMemberResponse]


class TeamMemberSingleResponse(BaseModel):
    """Response schema for single team member"""

    success: bool = True
    data: TeamMemberResponse


class TeamMemberDeleteResponse(BaseModel):
    """Response schema for delete operation"""

    success: bool = True
    message: str = "Team member removed successfully"


class TeamMemberUpdate(BaseModel):
    """Schema for updating a team member"""

    name: Optional[str] = None
    role: Optional[str] = None  # "admin", "manager", "viewer"
    status: Optional[str] = None  # "pending", "active"
