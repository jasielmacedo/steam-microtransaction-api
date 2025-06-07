from typing import Dict, Any, List
from fastapi import Depends, Query, status, HTTPException

from app.api.models.user import UserRole, User
from app.core.security import get_current_user, authorize_user
from app.core.exceptions import ForbiddenException
from app.schemas.team import (
    TeamMemberInvite,
    TeamMemberResponse,
    TeamMemberListResponse,
    TeamMemberSingleResponse,
    TeamMemberDeleteResponse,
    TeamMemberUpdate,
)
from app.models.team import (
    TeamMember,
    get_team_members,
    get_team_member,
    add_team_member,
    delete_team_member,
)


async def get_team(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Get all team members.
    Only team admins can access this endpoint.
    """
    # Ensure user is admin
    if current_user["role"] != UserRole.ADMIN:
        raise ForbiddenException("Only admins can access this endpoint")

    # Get users (except current admin)
    users = await User.get_all(skip=skip, limit=limit)
    team_members = [user for user in users if user["_id"] != current_user["_id"]]

    # Convert to response model
    team_member_responses = [
        TeamMemberResponse(
            id=member["_id"],
            name=member["name"],
            email=member["email"],
            role=member["role"],
            status="active" if member.get("role") else "pending",
            created_at=member["created_at"],
            updated_at=member.get("updated_at", member["created_at"]),
        )
        for member in team_members
    ]

    return {
        "success": True,
        "count": len(team_member_responses),
        "data": team_member_responses,
    }


async def invite_team_member(
    invite_data: TeamMemberInvite,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Invite a new team member.
    Only team admins can invite new members.
    """
    # Ensure user is admin
    if current_user["role"] != UserRole.ADMIN:
        raise ForbiddenException("Only admins can invite team members")

    # Check if user with this email already exists
    existing_user = await User.get_by_email(invite_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    # Generate a temporary password
    import secrets
    import string

    alphabet = string.ascii_letters + string.digits
    temp_password = "".join(secrets.choice(alphabet) for _ in range(12))

    # Create user with provided role
    new_user = await User.create(
        {
            "name": f"Invited User ({invite_data.email})",
            "email": invite_data.email,
            "password": temp_password,
            "role": invite_data.role,
        }
    )

    # TODO: Send invitation email with temporary password (not implemented in this version)

    # Convert to response model
    member_response = TeamMemberResponse(
        id=new_user["_id"],
        name=new_user["name"],
        email=new_user["email"],
        role=new_user["role"],
        status="pending",  # Pending until they log in and set their own details
        created_at=new_user["created_at"],
        updated_at=new_user["updated_at"],
    )

    return {
        "success": True,
        "data": member_response,
        "temp_password": temp_password,  # For demo purposes, would not include in production
    }


async def update_team_member(
    member_id: str,
    update_data: TeamMemberUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """Update an existing team member (role or name)."""
    if current_user["role"] != UserRole.ADMIN:
        raise ForbiddenException("Only admins can update team members")

    try:
        updated_user = await User.update(
            member_id, update_data.model_dump(exclude_unset=True)
        )

        member_response = TeamMemberResponse(
            id=updated_user["_id"],
            name=updated_user.get("name", ""),
            email=updated_user.get("email", ""),
            role=updated_user.get("role", "viewer"),
            status="active",
            created_at=updated_user["created_at"],
            updated_at=updated_user["updated_at"],
        )

        return {
            "success": True,
            "data": member_response,
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


async def remove_team_member(
    member_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Remove a team member.
    Only team admins can remove members.
    """
    # Ensure user is admin
    if current_user["role"] != UserRole.ADMIN:
        raise ForbiddenException("Only admins can remove team members")

    # Prevent removing yourself
    if member_id == current_user["_id"]:
        raise ForbiddenException("Cannot remove yourself from the team")

    try:
        # Get the user to ensure it exists
        user = await User.get_by_id(member_id)

        # Delete the user
        await User.delete(member_id)

        return {
            "success": True,
            "message": f"Team member '{user['name']}' removed successfully",
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Team member not found or could not be removed: {str(e)}",
        )
