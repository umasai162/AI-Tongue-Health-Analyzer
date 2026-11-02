import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.consent import ConsentRecord
from app.schemas.auth import UserRegister, UserLogin, UserResponse, Token, UserProfileUpdate
from app.utils.security import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    """Register a new user account with consent tracking."""
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=hash_password(user_in.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Record User Consents
    if user_in.consent_disclaimer:
        consent1 = ConsentRecord(user_id=user.id, consent_type="educational_disclaimer", granted=True)
        db.add(consent1)
    if user_in.consent_retention:
        consent2 = ConsentRecord(user_id=user.id, consent_type="image_retention", granted=True)
        db.add(consent2)
    db.commit()

    token = create_access_token(data={"sub": str(user.id), "email": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate existing user and issue JWT."""
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    token = create_access_token(data={"sub": str(user.id), "email": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Retrieve profile of currently authenticated user."""
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_profile(
    profile_in: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update profile details."""
    if profile_in.name:
        current_user.name = profile_in.name
    db.commit()
    db.refresh(current_user)
    return current_user

@router.delete("/account", status_code=status.HTTP_200_OK)
def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete user account and all associated images and analyses."""
    db.delete(current_user)
    db.commit()
    return {"message": "Account and associated health data have been successfully deleted."}
