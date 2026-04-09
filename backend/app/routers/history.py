from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.history import History
from app.models.user import User
from app.models.restaurant import Restaurant
from app.models.review import Review
from app.core.dependencies import get_current_user
from app.schemas.history import HistoryCreateRequest

router = APIRouter(prefix="/users/history", tags=["History"])


@router.post("")
def save_history(
    payload: HistoryCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    history_item = History(
        user_id=current_user.id,
        action_type=payload.action_type,
        restaurant_id=payload.restaurant_id,
        review_id=payload.review_id,
    )
    db.add(history_item)
    db.commit()
    db.refresh(history_item)
    return history_item


@router.get("")
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    history_items = (
        db.query(History)
        .filter(History.user_id == current_user.id)
        .order_by(History.created_at.desc())
        .all()
    )

    result = []

    for item in history_items:
        restaurant = None
        review = None

        if item.restaurant_id:
            restaurant = db.query(Restaurant).filter(Restaurant.id == item.restaurant_id).first()

        if item.review_id:
            review = db.query(Review).filter(Review.id == item.review_id).first()

        result.append({
            "id": item.id,
            "action_type": item.action_type,
            "created_at": item.created_at,
            "restaurant_id": item.restaurant_id,
            "review_id": item.review_id,
            "restaurant_name": restaurant.name if restaurant else None,
            "restaurant_city": restaurant.city if restaurant else None,
            "restaurant_image": restaurant.photos if restaurant else None,
            "restaurant_cuisine": restaurant.cuisine_type if restaurant else None,
            "review_comment": review.comment if review else None,
            "review_rating": review.rating if review else None,
        })

    return result