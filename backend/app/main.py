from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi

from app.db import Base, engine
from app import models
from app.routers.auth import router as auth_router
from app.routers.users import router as user_router
from app.routers.restaurants import router as restaurant_router
from app.routers.reviews import router as review_router
from app.routers.favorites import router as favorite_router
from app.routers.history import router as history_router
from app.routers.owners import router as owner_router
from app.routers.ai import router as ai_router
from fastapi.middleware.cors import CORSMiddleware
    
app = FastAPI(
    title="Yelp Prototype API",
    version="1.0.0",
    description="FastAPI backend for Yelp prototype with JWT authentication",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


app.include_router(auth_router)
app.include_router(user_router)
app.include_router(restaurant_router)
app.include_router(review_router)
app.include_router(favorite_router)
app.include_router(history_router)
app.include_router(owner_router)
app.include_router(ai_router)


@app.get("/")
def read_root():
    return {"message": "Backend is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi