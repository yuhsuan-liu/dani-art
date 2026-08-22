from fastapi import APIRouter, HTTPException
from typing import List, Optional
from ..models.schemas import Artwork, ArtworkCreate, ArtworkUpdate
from ..services.supabase import supabase

router = APIRouter(prefix="/artwork", tags=["artwork"])


@router.get("/", response_model=List[Artwork])
async def get_all_artwork(user_id: Optional[str] = None, status: Optional[str] = None):
    query = supabase.table("artwork").select("*")
    if user_id:
        query = query.eq("user_id", user_id)
    if status:
        query = query.eq("status", status)
    response = query.execute()
    return response.data


@router.get("/{artwork_id}", response_model=Artwork)
async def get_artwork(artwork_id: str):
    response = supabase.table("artwork").select("*").eq("id", artwork_id).single().execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Artwork not found")
    return response.data


@router.post("/", response_model=Artwork)
async def create_artwork(artwork: ArtworkCreate):
    response = supabase.table("artwork").insert(artwork.model_dump()).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to create artwork")
    return response.data[0]


@router.patch("/{artwork_id}", response_model=Artwork)
async def update_artwork(artwork_id: str, artwork: ArtworkUpdate):
    update_data = {k: v for k, v in artwork.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    response = supabase.table("artwork").update(update_data).eq("id", artwork_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Artwork not found")
    return response.data[0]


@router.delete("/{artwork_id}")
async def delete_artwork(artwork_id: str):
    response = supabase.table("artwork").delete().eq("id", artwork_id).execute()
    return {"message": "Artwork deleted"}
