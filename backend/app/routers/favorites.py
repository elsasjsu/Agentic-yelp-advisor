from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db import get_db
from app.models.favorite import Favorite
from app.models.restaurant import Restaurant
from app.models.review import Review
from app.models.history import History
from app.models.user import User
from app.schemas.favorite import FavoriteResponse
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/favorites", tags=["Favorites"])


@router.post("/{restaurant_id}", response_model=FavoriteResponse)
def add_favorite(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    existing_favorite = (
        db.query(Favorite)
        .filter(
            Favorite.user_id == current_user.id,
            Favorite.restaurant_id == restaurant_id
        )
        .first()
    )

    if existing_favorite:
        raise HTTPException(status_code=400, detail="Restaurant already in favorites")

    favorite = Favorite(user_id=current_user.id, restaurant_id=restaurant_id)
    db.add(favorite)
    db.commit()
    db.refresh(favorite)

    history = History(
        user_id=current_user.id,
        action_type="favorited",
        restaurant_id=restaurant_id,
        review_id=None,
    )
    db.add(history)
    db.commit()

    return favorite


@router.delete("/{restaurant_id}")
def remove_favorite(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    favorite = (
        db.query(Favorite)
        .filter(
            Favorite.user_id == current_user.id,
            Favorite.restaurant_id == restaurant_id
        )
        .first()
    )

    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite not found")

    db.delete(favorite)
    db.commit()

    return {"message": "Favorite removed successfully"}


@router.get("")
def get_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    favorites = db.query(Favorite).filter(Favorite.user_id == current_user.id).all()

    result = []
    for fav in favorites:
        restaurant = (
            db.query(Restaurant)
            .filter(Restaurant.id == fav.restaurant_id)
            .first()
        )

        if restaurant:
            avg_rating = (
                db.query(func.avg(Review.rating))
                .filter(Review.restaurant_id == restaurant.id)
                .scalar()
            )

            review_count = (
                db.query(func.count(Review.id))
                .filter(Review.restaurant_id == restaurant.id)
                .scalar()
            )

            result.append({
                "id": fav.id,
                "user_id": fav.user_id,
                "restaurant_id": restaurant.id,
                "name": restaurant.name,
                "cuisine": restaurant.cuisine_type,
                "city": restaurant.city,
                "price": restaurant.pricing_tier,
                "image_url": restaurant.photos,
                "rating": round(float(avg_rating), 1) if avg_rating else 0,
                "review_count": review_count or 0,
                "description": restaurant.description,
            })

    return result