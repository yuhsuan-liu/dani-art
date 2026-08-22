from fastapi import APIRouter, HTTPException
from typing import List
from ..models.schemas import Order, OrderCreate, OrderUpdate
from ..services.supabase import supabase

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("/", response_model=List[Order])
async def get_all_orders():
    response = supabase.table("orders").select("*, artwork(*), furniture(*)").order("created_at", desc=True).execute()
    return response.data


@router.get("/{order_id}", response_model=Order)
async def get_order(order_id: str):
    response = supabase.table("orders").select("*, artwork(*), furniture(*)").eq("id", order_id).single().execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Order not found")
    return response.data


@router.post("/", response_model=Order)
async def create_order(order: OrderCreate):
    order_data = order.model_dump()
    if order_data.get("shipping_address"):
        order_data["shipping_address"] = dict(order_data["shipping_address"])
    
    response = supabase.table("orders").insert(order_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to create order")
    
    # Update artwork and furniture status to reserved
    supabase.table("artwork").update({"status": "reserved"}).eq("id", order.artwork_id).execute()
    supabase.table("furniture").update({"status": "reserved"}).eq("id", order.furniture_id).execute()
    
    return response.data[0]


@router.patch("/{order_id}", response_model=Order)
async def update_order(order_id: str, order: OrderUpdate):
    update_data = {k: v for k, v in order.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    response = supabase.table("orders").update(update_data).eq("id", order_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # If status changed to confirmed or completed, update artwork/furniture
    if update_data.get("status") == "confirmed":
        order_data = response.data[0]
        supabase.table("artwork").update({"status": "sold"}).eq("id", order_data["artwork_id"]).execute()
        supabase.table("furniture").update({"status": "purchased"}).eq("id", order_data["furniture_id"]).execute()
    elif update_data.get("status") == "cancelled":
        order_data = response.data[0]
        supabase.table("artwork").update({"status": "available"}).eq("id", order_data["artwork_id"]).execute()
        supabase.table("furniture").update({"status": "available"}).eq("id", order_data["furniture_id"]).execute()
    
    return response.data[0]
