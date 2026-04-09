from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from app.db import get_db
from app.models.restaurant import Restaurant
from app.models.review import Review
from app.models.history import History
from app.schemas.restaurant import (
    RestaurantCreateRequest,
    RestaurantUpdateRequest,
    RestaurantResponse,
)
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/restaurants", tags=["Restaurants"])


@router.post("", response_model=RestaurantResponse)
def create_restaurant(
    payload: RestaurantCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    restaurant = Restaurant(
        name=payload.name,
        cuisine_type=payload.cuisine_type,
        description=payload.description,
        address=payload.address,
        city=payload.city,
        zip=payload.zip,
        contact_info=payload.contact_info,
        hours=payload.hours,
        pricing_tier=payload.pricing_tier,
        amenities=payload.amenities,
        photos=payload.photos,
    )
    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)

    history = History(
        user_id=current_user.id,
        action_type="added",
        restaurant_id=restaurant.id,
        review_id=None,
    )
    db.add(history)
    db.commit()

    return restaurant


@router.put("/{restaurant_id}", response_model=RestaurantResponse)
def update_restaurant(
    restaurant_id: int,
    payload: RestaurantUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()

    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    update_data = payload.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(restaurant, field, value)

    db.commit()
    db.refresh(restaurant)
    return restaurant


@router.delete("/{restaurant_id}")
def delete_restaurant(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()

    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    db.delete(restaurant)
    db.commit()

    return {"message": "Restaurant deleted successfully"}


@router.get("", response_model=list[RestaurantResponse])
def list_restaurants(
    db: Session = Depends(get_db),
    name: str | None = Query(default=None),
    cuisine: str | None = Query(default=None),
    city: str | None = Query(default=None),
    keyword: str | None = Query(default=None),
):
    query = (
        db.query(
            Restaurant.id,
            Restaurant.owner_id,
            Restaurant.name,
            Restaurant.cuisine_type,
            Restaurant.description,
            Restaurant.address,
            Restaurant.city,
            Restaurant.zip,
            Restaurant.contact_info,
            Restaurant.hours,
            Restaurant.pricing_tier,
            Restaurant.amenities,
            Restaurant.photos,
            func.coalesce(func.avg(Review.rating), 0).label("rating"),
            func.count(Review.id).label("review_count"),
        )
        .outerjoin(Review, Review.restaurant_id == Restaurant.id)
    )

    if name:
        query = query.filter(Restaurant.name.ilike(f"%{name}%"))

    if cuisine:
        query = query.filter(Restaurant.cuisine_type.ilike(f"%{cuisine}%"))

    if city:
        query = query.filter(Restaurant.city.ilike(f"%{city}%"))

    if keyword:
        query = query.filter(
            or_(
                Restaurant.description.ilike(f"%{keyword}%"),
                Restaurant.amenities.ilike(f"%{keyword}%"),
                Restaurant.name.ilike(f"%{keyword}%"),
                Restaurant.cuisine_type.ilike(f"%{keyword}%"),
                Restaurant.city.ilike(f"%{keyword}%"),
            )
        )

    query = query.group_by(
        Restaurant.id,
        Restaurant.owner_id,
        Restaurant.name,
        Restaurant.cuisine_type,
        Restaurant.description,
        Restaurant.address,
        Restaurant.city,
        Restaurant.zip,
        Restaurant.contact_info,
        Restaurant.hours,
        Restaurant.pricing_tier,
        Restaurant.amenities,
        Restaurant.photos,
    )

    results = query.all()

    return [
        RestaurantResponse(
            id=r.id,
            owner_id=r.owner_id,
            name=r.name,
            cuisine_type=r.cuisine_type,
            description=r.description,
            address=r.address,
            city=r.city,
            zip=r.zip,
            contact_info=r.contact_info,
            hours=r.hours,
            pricing_tier=r.pricing_tier,
            amenities=r.amenities,
            photos=r.photos,
            rating=round(float(r.rating), 1) if r.rating else 0,
            review_count=r.review_count,
        )
        for r in results
    ]


@router.get("/{restaurant_id}", response_model=RestaurantResponse)
def get_restaurant_details(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()

    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    return restaurant