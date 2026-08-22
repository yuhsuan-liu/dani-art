from fastapi import APIRouter, HTTPException
from typing import List
from ..models.schemas import Room, RoomCreate
from ..services.supabase import supabase

router = APIRouter(prefix="/rooms", tags=["rooms"])


@router.get("/{room_id}", response_model=Room)
async def get_room(room_id: str):
    response = supabase.table("rooms").select("*").eq("id", room_id).single().execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Room not found")
    return response.data


@router.post("/", response_model=Room)
async def create_room(room: RoomCreate):
    response = supabase.table("rooms").insert(room.model_dump()).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to create room")
    return response.data[0]


@router.patch("/{room_id}", response_model=Room)
async def update_room(room_id: str, room: RoomCreate):
    response = supabase.table("rooms").update(room.model_dump()).eq("id", room_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Room not found")
    return response.data[0]


@router.delete("/{room_id}")
async def delete_room(room_id: str):
    response = supabase.table("rooms").delete().eq("id", room_id).execute()
    return {"message": "Room deleted"}


@router.get("/{room_id}/furniture")
async def get_room_furniture(room_id: str):
    response = supabase.table("furniture").select("*, artwork(*)").eq("room_id", room_id).execute()
    return response.data
