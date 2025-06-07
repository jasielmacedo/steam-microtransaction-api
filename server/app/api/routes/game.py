from fastapi import APIRouter

from app.api.controllers.game import (
    create_game,
    get_games,
    get_game,
    update_game,
    delete_game
)
from app.api.schemas.game import (
    GameCreate,
    GameUpdate,
    GameResponse,
    GamesResponse
)

router = APIRouter()

router.add_api_route(
    "/",
    create_game,
    methods=["POST"],
    response_model=GameResponse,
    summary="Create a new game",
    description="Create a new game with Steam App ID",
)

router.add_api_route(
    "/",
    get_games,
    methods=["GET"],
    response_model=GamesResponse,
    summary="Get games",
    description="Get a list of games with pagination",
)

router.add_api_route(
    "/{game_id}",
    get_game,
    methods=["GET"],
    response_model=GameResponse,
    summary="Get a game",
    description="Get a specific game by ID",
)

router.add_api_route(
    "/{game_id}",
    update_game,
    methods=["PATCH"],
    response_model=GameResponse,
    summary="Update a game",
    description="Update an existing game",
)

router.add_api_route(
    "/{game_id}",
    delete_game,
    methods=["DELETE"],
    summary="Delete a game",
    description="Delete a game by ID",
)