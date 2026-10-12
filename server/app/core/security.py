from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from app.core.config import get_settings
from app.db.models.user import User
from beanie import PydanticObjectId
from passlib.context import CryptContext

settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
optional_oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
    auto_error=False,
)

# Shared password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        user_id: str = payload.get("id")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = await User.get(PydanticObjectId(user_id))
    if user is None:
        raise credentials_exception
    if getattr(user, "isRestricted", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been restricted. Contact support for help.",
        )
    return user

async def get_optional_current_user(
    token: Optional[str] = Depends(optional_oauth2_scheme),
) -> Optional[User]:
    """Return the user when a valid Bearer token is present; otherwise None."""
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        user_id: str = payload.get("id")
        if user_id is None:
            return None
        user = await User.get(PydanticObjectId(user_id))
        if user is None or getattr(user, "isRestricted", False):
            return None
        return user
    except JWTError:
        return None

async def admin_required(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Admins only.")
    return current_user 