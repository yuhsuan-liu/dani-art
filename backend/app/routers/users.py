from fastapi import APIRouter, HTTPException
from typing import List
from ..models.schemas import User, UserCreate, UserUpdate
from ..services.supabase import supabase

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=List[User])
async def get_users():
    response = supabase.table("users").select("*").execute()
    return response.data


@router.get("/artists", response_model=List[User])
async def get_artists():
    """Get all users with artist role"""
    response = supabase.table("users").select("*").eq("role", "artist").execute()
    return response.data


@router.get("/{user_id}", response_model=User)
async def get_user(user_id: str):
    response = supabase.table("users").select("*").eq("id", user_id).single().execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="User not found")
    return response.data


@router.get("/email/{email}", response_model=User)
async def get_user_by_email(email: str):
    response = supabase.table("users").select("*").eq("email", email).single().execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="User not found")
    return response.data


@router.post("/", response_model=User)
async def create_user(user: UserCreate):
    response = supabase.table("users").insert(user.model_dump()).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to create user")
    return response.data[0]


@router.patch("/{user_id}", response_model=User)
async def update_user(user_id: str, user: UserUpdate):
    update_data = {k: v for k, v in user.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    response = supabase.table("users").update(update_data).eq("id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="User not found")
    return response.data[0]


@router.get("/{user_id}/rooms")
async def get_user_rooms(user_id: str):
    response = supabase.table("rooms").select("*").eq("user_id", user_id).order("order").execute()
    return response.data


@router.get("/{user_id}/artwork")
async def get_user_artwork(user_id: str):
    response = supabase.table("artwork").select("*").eq("user_id", user_id).execute()
    return response.data
