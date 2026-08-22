from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ArtistBase(BaseModel):
    name: str
    bio: Optional[str] = None
    profile_pic_url: Optional[str] = None


class ArtistCreate(ArtistBase):
    email: str


class Artist(ArtistBase):
    id: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


class RoomBase(BaseModel):
    name: str
    order: int = 0
    background_url: Optional[str] = None
    width: int = 800
    height: int = 600


class RoomCreate(RoomBase):
    artist_id: str


class Room(RoomBase):
    id: str
    artist_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class ArtworkBase(BaseModel):
    title: str
    description: Optional[str] = None
    price: float
    image_url: str
    medium: Optional[str] = None
    dimensions: Optional[str] = None
    status: str = "available"


class ArtworkCreate(ArtworkBase):
    artist_id: str


class ArtworkUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    medium: Optional[str] = None
    dimensions: Optional[str] = None
    status: Optional[str] = None


class Artwork(ArtworkBase):
    id: str
    artist_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FurnitureBase(BaseModel):
    name: str
    image_url: str
    price: float
    position_x: int = 0
    position_y: int = 0
    width: Optional[int] = None
    height: Optional[int] = None
    rotation: int = 0
    z_index: int = 0
    external_url: Optional[str] = None
    artwork_id: Optional[str] = None
    status: str = "available"


class FurnitureCreate(FurnitureBase):
    room_id: str


class FurnitureUpdate(BaseModel):
    name: Optional[str] = None
    image_url: Optional[str] = None
    price: Optional[float] = None
    position_x: Optional[int] = None
    position_y: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None
    rotation: Optional[int] = None
    z_index: Optional[int] = None
    external_url: Optional[str] = None
    artwork_id: Optional[str] = None
    status: Optional[str] = None


class Furniture(FurnitureBase):
    id: str
    room_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ShippingAddress(BaseModel):
    street: str
    city: str
    state: str
    zip: str


class OrderBase(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: Optional[str] = None
    delivery_type: str
    shipping_address: Optional[ShippingAddress] = None
    special_instructions: Optional[str] = None
    total_amount: Optional[float] = None
    shipping_fee: float = 0
    payment_method: Optional[str] = None


class OrderCreate(OrderBase):
    artwork_id: str
    furniture_id: str


class OrderUpdate(BaseModel):
    status: Optional[str] = None
    payment_reference: Optional[str] = None


class Order(OrderBase):
    id: str
    artwork_id: str
    furniture_id: str
    status: str
    payment_reference: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
