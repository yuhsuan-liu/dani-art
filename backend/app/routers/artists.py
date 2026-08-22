from fastapi import APIRouter, HTTPException
from typing import List
from ..models.schemas import Artist, ArtistCreate
from ..services.supabase import supabase

router = APIRouter(prefix="/artists", tags=["artists"])


@router.get("/", response_model=List[Artist])
async def get_artists():
    response = supabase.table("artists").select("*").execute()
    return response.data


@router.get("/{artist_id}", response_model=Artist)
async def get_artist(artist_id: str):
    response = supabase.table("artists").select("*").eq("id", artist_id).single().execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Artist not found")
    return response.data


@router.post("/", response_model=Artist)
async def create_artist(artist: ArtistCreate):
    response = supabase.table("artists").insert(artist.model_dump()).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to create artist")
    return response.data[0]


@router.get("/{artist_id}/rooms")
async def get_artist_rooms(artist_id: str):
    response = supabase.table("rooms").select("*").eq("artist_id", artist_id).order("order").execute()
    return response.data


@router.get("/{artist_id}/artwork")
async def get_artist_artwork(artist_id: str):
    response = supabase.table("artwork").select("*").eq("artist_id", artist_id).execute()
    return response.data
