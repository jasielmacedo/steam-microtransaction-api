from fastapi import APIRouter, Depends

from app.api.controllers.team import (
    get_team,
    invite_team_member,
    update_team_member,
    remove_team_member,
)
from app.api.models.user import UserRole
from app.core.security import authorize_user
from app.schemas.team import (
    TeamMemberInvite,
    TeamMemberListResponse,
    TeamMemberSingleResponse,
    TeamMemberDeleteResponse,
)

# Router configuration with admin-only access
router = APIRouter(dependencies=[Depends(authorize_user([UserRole.ADMIN]))])

# Route registration
router.add_api_route(
    "",
    get_team,
    methods=["GET"],
    response_model=TeamMemberListResponse,
    summary="Get all team members",
    description="Returns a list of all team members",
)

router.add_api_route(
    "/invite",
    invite_team_member,
    methods=["POST"],
    response_model=TeamMemberSingleResponse,
    status_code=201,
    summary="Invite team member",
    description="Invites a new team member by email",
)

router.add_api_route(
    "/{member_id}",
    update_team_member,
    methods=["PUT"],
    response_model=TeamMemberSingleResponse,
    summary="Update team member",
    description="Updates an existing team member",
)

router.add_api_route(
    "/{member_id}",
    remove_team_member,
    methods=["DELETE"],
    response_model=TeamMemberDeleteResponse,
    summary="Remove team member",
    description="Removes a team member from the team",
)
