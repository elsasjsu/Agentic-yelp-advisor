from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.user import User
from app.models.preference import Preference
from app.core.dependencies import get_current_user
from app.schemas.user import UserProfileResponse, UserProfileUpdateRequest
from app.schemas.preference import PreferenceResponse, PreferenceUpdateRequest

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserProfileResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserProfileResponse)
def update_my_profile(
    payload: UserProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    update_data = payload.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/me/preferences", response_model=PreferenceResponse | None)
def get_my_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    preference = db.query(Preference).filter(Preference.user_id == current_user.id).first()
    return preference


@router.put("/me/preferences", response_model=PreferenceResponse)
def update_my_preferences(
    payload: PreferenceUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    preference = db.query(Preference).filter(Preference.user_id == current_user.id).first()

    if not preference:
        preference = Preference(user_id=current_user.id)
        db.add(preference)

    update_data = payload.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(preference, field, value)

    db.commit()
    db.refresh(preference)
    return preference