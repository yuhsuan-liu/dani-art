from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title="Dani's Art Registry API",
    description="Backend API for Dani's Art Registry - an art marketplace with floor map visualization",
    version="0.1.0"
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    os.getenv("FRONTEND_URL", "https://yourusername.github.io"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Welcome to Dani's Art Registry API", "status": "healthy"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "0.1.0"}
