from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db import get_db
from app.models.owner import Owner
from app.models.restaurant import Restaurant
from app.models.review import Review
from app.models.claimed_restaurant import ClaimedRestaurant
from app.core.dependencies import get_current_owner
from app.schemas.owner import OwnerDashboardResponse, RestaurantAnalyticsResponse
from app.schemas.restaurant import (
    RestaurantCreateRequest,
    RestaurantUpdateRequest,
    RestaurantResponse
)

router = APIRouter(prefix="/owners", tags=["Owners"])


@router.get("/dashboard", response_model=OwnerDashboardResponse)
def owner_dashboard(
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
):
    claimed_restaurant_ids = (
        db.query(ClaimedRestaurant.restaurant_id)
        .filter(ClaimedRestaurant.owner_id == current_owner.id)
        .subquery()
    )

    total_restaurants = db.query(Restaurant).filter(
        Restaurant.id.in_(claimed_restaurant_ids)
    ).count()

    total_reviews = db.query(Review).filter(
        Review.restaurant_id.in_(claimed_restaurant_ids)
    ).count()

    recent_reviews_count = db.query(Review).filter(
        Review.restaurant_id.in_(claimed_restaurant_ids)
    ).count()

    return OwnerDashboardResponse(
        total_restaurants=total_restaurants,
        total_reviews=total_reviews,
        recent_reviews_count=recent_reviews_count,
    )

@router.post("/restaurants", response_model=RestaurantResponse)
def create_owner_restaurant(
    payload: RestaurantCreateRequest,
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
):
    restaurant = Restaurant(
        owner_id=current_owner.id,
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

    claim = ClaimedRestaurant(
        owner_id=current_owner.id,
        restaurant_id=restaurant.id,
    )
    db.add(claim)
    db.commit()
    db.refresh(claim)

    return restaurant

@router.post("/restaurants/{restaurant_id}/claim")
def claim_restaurant(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    existing_claim = db.query(ClaimedRestaurant).filter(
        ClaimedRestaurant.restaurant_id == restaurant_id
    ).first()

    if existing_claim:
        raise HTTPException(status_code=400, detail="Restaurant already claimed")

    claim = ClaimedRestaurant(
        owner_id=current_owner.id,
        restaurant_id=restaurant_id,
    )
    db.add(claim)
    db.commit()
    db.refresh(claim)

    return {"message": "Restaurant claimed successfully", "claim_id": claim.id}


@router.put("/restaurants/{restaurant_id}/manage", response_model=RestaurantResponse)
def manage_restaurant(
    restaurant_id: int,
    payload: RestaurantUpdateRequest,
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
):
    claim = db.query(ClaimedRestaurant).filter(
        ClaimedRestaurant.restaurant_id == restaurant_id,
        ClaimedRestaurant.owner_id == current_owner.id,
    ).first()

    if not claim:
        raise HTTPException(status_code=403, detail="You can only manage your claimed restaurant")

    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(restaurant, field, value)

    db.commit()
    db.refresh(restaurant)
    return restaurant


@router.get("/restaurants/{restaurant_id}/analytics", response_model=RestaurantAnalyticsResponse)
def restaurant_analytics(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
):
    claim = db.query(ClaimedRestaurant).filter(
        ClaimedRestaurant.restaurant_id == restaurant_id,
        ClaimedRestaurant.owner_id == current_owner.id,
    ).first()

    if not claim:
        raise HTTPException(status_code=403, detail="You can only view analytics for your claimed restaurant")

    total_reviews = db.query(Review).filter(
        Review.restaurant_id == restaurant_id
    ).count()

    average_rating = db.query(func.avg(Review.rating)).filter(
        Review.restaurant_id == restaurant_id
    ).scalar()

    return RestaurantAnalyticsResponse(
        restaurant_id=restaurant_id,
        total_reviews=total_reviews,
        average_rating=float(average_rating or 0.0),
    )