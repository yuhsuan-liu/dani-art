from fastapi import APIRouter, HTTPException
from typing import List
from ..models.schemas import Furniture, FurnitureCreate, FurnitureUpdate
from ..services.supabase import supabase

router = APIRouter(prefix="/furniture", tags=["furniture"])


@router.get("/{furniture_id}", response_model=Furniture)
async def get_furniture(furniture_id: str):
    response = supabase.table("furniture").select("*, artwork(*)").eq("id", furniture_id).single().execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Furniture not found")
    return response.data


@router.post("/", response_model=Furniture)
async def create_furniture(furniture: FurnitureCreate):
    response = supabase.table("furniture").insert(furniture.model_dump()).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to create furniture")
    return response.data[0]


@router.patch("/{furniture_id}", response_model=Furniture)
async def update_furniture(furniture_id: str, furniture: FurnitureUpdate):
    update_data = {k: v for k, v in furniture.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    response = supabase.table("furniture").update(update_data).eq("id", furniture_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Furniture not found")
    return response.data[0]


@router.delete("/{furniture_id}")
async def delete_furniture(furniture_id: str):
    response = supabase.table("furniture").delete().eq("id", furniture_id).execute()
    return {"message": "Furniture deleted"}


@router.patch("/{furniture_id}/position")
async def update_furniture_position(furniture_id: str, position_x: int, position_y: int):
    """Quick endpoint for drag-and-drop position updates"""
    response = supabase.table("furniture").update({
        "position_x": position_x,
        "position_y": position_y
    }).eq("id", furniture_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Furniture not found")
    return response.data[0]
