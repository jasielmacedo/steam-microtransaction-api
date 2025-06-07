from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel, Field

from app.db.mongodb import get_database

# Team member model
class TeamMember(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    name: str
    email: str
    role: str  # "admin", "manager", "viewer"
    status: str = "pending"  # "pending", "active"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = {
        "from_attributes": True
    }

# Database functions for team members
async def get_team_members():
    """Get all team members"""
    database = get_database()
    team_members = await database["team_members"].find().to_list(100)
    return team_members

async def get_team_member(member_id: str):
    """Get a team member by ID"""
    database = get_database()
    team_member = await database["team_members"].find_one({"id": member_id})
    return team_member

async def add_team_member(team_member: TeamMember):
    """Add a new team member"""
    database = get_database()
    team_member_dict = team_member.model_dump()
    await database["team_members"].insert_one(team_member_dict)
    return team_member

async def update_team_member(member_id: str, update_data: dict):
    """Update a team member"""
    database = get_database()
    update_data["updated_at"] = datetime.utcnow()
    await database["team_members"].update_one(
        {"id": member_id}, {"$set": update_data}
    )
    return await get_team_member(member_id)

async def delete_team_member(member_id: str):
    """Delete a team member"""
    database = get_database()
    await database["team_members"].delete_one({"id": member_id})
    return True