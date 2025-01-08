from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.models import User
from ..schemas.user import UserCreate, UserResponse, UserLogin
from ..services.auth import (
    get_password_hash, 
    create_access_token, 
    authenticate_user,
    get_current_user
)
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """Register a regular user"""
    # Check if user already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new regular user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        is_admin=False,  # Regular user
        is_approved=False  # Needs admin approval
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return {
        "id": db_user.id,
        "email": db_user.email,
        "is_admin": db_user.is_admin,
        "is_active": db_user.is_active,
        "created_at": db_user.created_at,
        "message": "Registration successful! Your account is pending administrator approval. You will be able to log in once your account is approved."
    }

@router.post("/register/admin", response_model=UserResponse)
async def register_admin(
    user: UserCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Register an admin user (only existing admins can create new admins)"""
    # Check if current user is admin
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create new admin users"
        )

    # Check if user already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new admin user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        is_admin=True,  # Admin user
        is_approved=True  # Admin users are automatically approved
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return UserResponse.model_validate({
        "id": db_user.id,
        "email": db_user.email,
        "is_admin": db_user.is_admin,
        "is_active": db_user.is_active,
        "created_at": db_user.created_at
    })

@router.post("/register/first-admin", response_model=UserResponse)
async def register_first_admin(user: UserCreate, db: Session = Depends(get_db)):
    """Register the first admin user (only works if no users exist in the system)"""
    # Check if any users exist
    if db.query(User).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot create first admin - users already exist"
        )
    
    # Create first admin user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        is_admin=True,  # First admin user
        is_approved=True  # Admin users are automatically approved
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return UserResponse.model_validate({
        "id": db_user.id,
        "email": db_user.email,
        "is_admin": db_user.is_admin,
        "is_active": db_user.is_active,
        "created_at": db_user.created_at
    })

@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    try:
        user = authenticate_user(db, form_data.username, form_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create access token using user ID instead of email
        access_token = create_access_token(
            data={"sub": str(user.id)}  # Convert ID to string for JWT
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "is_admin": user.is_admin
            }
        }
    except HTTPException as e:
        if e.status_code == status.HTTP_403_FORBIDDEN and "pending approval" in str(e.detail):
            # Customize the message for pending approval
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account is pending administrator approval. You will be notified once your account is approved."
            )
        raise e

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate({
        "id": current_user.id,
        "email": current_user.email,
        "is_admin": current_user.is_admin,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at
    })

@router.put("/toggle-admin/{user_id}", response_model=UserResponse)
async def toggle_admin_status(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Toggle admin status of a user (only admins can do this)"""
    # Check if current user is admin
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can modify admin status"
        )
    
    # Prevent admin from modifying their own status
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify your own admin status"
        )
    
    # Get the target user
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Toggle admin status
    target_user.is_admin = not target_user.is_admin
    if target_user.is_admin:
        target_user.is_approved = True  # Automatically approve admin users
    db.commit()
    db.refresh(target_user)
    
    return UserResponse.model_validate({
        "id": target_user.id,
        "email": target_user.email,
        "is_admin": target_user.is_admin,
        "is_active": target_user.is_active,
        "created_at": target_user.created_at
    })

@router.get("/all", response_model=List[UserResponse])
async def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all users (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view all users"
        )
    
    users = db.query(User).all()
    return [UserResponse.model_validate({
        "id": user.id,
        "email": user.email,
        "is_admin": user.is_admin,
        "is_active": user.is_active,
        "created_at": user.created_at
    }) for user in users]

@router.put("/toggle-active/{user_id}", response_model=UserResponse)
async def toggle_active_status(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Toggle active status of a user (only admins can do this)"""
    # Check if current user is admin
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can modify user status"
        )
    
    # Get the target user
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Toggle active status
    target_user.is_active = not target_user.is_active
    if not target_user.is_active:
        target_user.is_approved = False  # Automatically unapprove inactive users
    db.commit()
    db.refresh(target_user)
    
    return UserResponse.model_validate({
        "id": target_user.id,
        "email": target_user.email,
        "is_admin": target_user.is_admin,
        "is_active": target_user.is_active,
        "created_at": target_user.created_at
    })