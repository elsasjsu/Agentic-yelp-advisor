from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.user import User
from app.models.owner import Owner
from app.schemas.auth import UserSignupRequest, OwnerSignupRequest, LoginRequest, TokenResponse
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/user/signup")
def user_signup(payload: UserSignupRequest, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=payload.name,
        email=email,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"message": "User created successfully", "user_id": user.id}


@router.post("/user/login", response_model=TokenResponse)
def user_login(payload: LoginRequest, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()

    print("----- USER LOGIN DEBUG -----")
    print("Incoming email:", repr(payload.email))
    print("Normalized email:", repr(email))

    user = db.query(User).filter(User.email == email).first()
    print("User found:", user is not None)

    if user:
        print("DB email:", repr(user.email))
        print("Stored hash:", repr(user.password_hash))
        try:
            password_ok = verify_password(payload.password, user.password_hash)
            print("Password match:", password_ok)
        except Exception as e:
            print("Password verify error:", str(e))
            password_ok = False
    else:
        password_ok = False

    if not user or not password_ok:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(user.id), "role": "user"})
    return TokenResponse(access_token=token)


@router.post("/owner/signup")
def owner_signup(payload: OwnerSignupRequest, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    existing_owner = db.query(Owner).filter(Owner.email == payload.email).first()
    if existing_owner:
        raise HTTPException(status_code=400, detail="Email already registered")

    owner = Owner(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        location=payload.location,
    )
    db.add(owner)
    db.commit()
    db.refresh(owner)

    return {"message": "Owner created successfully", "owner_id": owner.id}


@router.post("/owner/login", response_model=TokenResponse)
def owner_login(payload: LoginRequest, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    owner = db.query(Owner).filter(Owner.email == payload.email).first()
    if not owner or not verify_password(payload.password, owner.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(owner.id), "role": "owner"})
    return TokenResponse(access_token=token)