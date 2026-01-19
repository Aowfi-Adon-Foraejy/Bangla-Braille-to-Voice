from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from datetime import datetime, timedelta

from models.auth import auth, User, UserLogin, UserRegister, UserResponse, Token, validate_email

router = APIRouter(prefix="/auth", tags=["authentication"])
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    token = credentials.credentials
    user = auth.validate_session(token)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

@router.post("/register", response_model=Token)
async def register(user_data: UserRegister):
    # Validate email format
    try:
        validate_email(user_data.email)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    # Check if username already exists
    for existing_user in auth.users.values():
        if existing_user['username'] == user_data.username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        if existing_user['email'] == user_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Create new user
    user = auth.create_user(user_data.username, user_data.email, user_data.password)
    token = auth.create_session(user)
    
    return Token(
        access_token=token,
        token_type="bearer",
        user=UserResponse(**user.dict())
    )

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    user = auth.authenticate_user(user_data.username, user_data.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    token = auth.create_session(user)
    
    return Token(
        access_token=token,
        token_type="bearer",
        user=UserResponse(**user.dict())
    )

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    # Get the token from the request and revoke it
    # In a real implementation, you'd need to extract the token from the request
    # For now, we'll just return success
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return UserResponse(**current_user.dict())

@router.get("/check")
async def check_auth(current_user: Optional[User] = Depends(get_current_user)):
    if current_user:
        return {"authenticated": True, "user": UserResponse(**current_user.dict())}
    return {"authenticated": False}