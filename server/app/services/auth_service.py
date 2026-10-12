from app.db.models.user import User
from app.schemas.auth import AuthSignup, AuthLogin, AuthResponse
from fastapi import HTTPException, status
from jose import jwt
from app.core.config import get_settings
from beanie import PydanticObjectId
from typing import Optional
from app.core.security import pwd_context
from app.services.email_service import EmailService
from datetime import datetime

settings = get_settings()

class AuthService:
    @staticmethod
    async def signup(data: AuthSignup) -> dict:
        # Check for duplicate
        existing = await User.find_one({"email": data.email})
        if existing:
            raise HTTPException(status_code=409, detail="Duplicate account found.")
        
        hashed_password = pwd_context.hash(data.password)

        if not settings.EMAIL_VERIFICATION_ENABLED:
            user = User(
                fullName=data.fullName,
                email=data.email,
                password=hashed_password,
                phoneNumber=data.phoneNumber,
                role=data.role,
                isVerified=True,
            )
            await user.insert()
            return {
                "message": "Account created successfully.",
                "id": str(user.id),
                "email": data.email,
            }

        # Generate verification token
        verification_token = EmailService.generate_verification_token()
        verification_expires = EmailService.get_verification_expiry()
        
        user = User(
            fullName=data.fullName,
            email=data.email,
            password=hashed_password,
            phoneNumber=data.phoneNumber,
            role=data.role,
            isVerified=False,
            verificationToken=verification_token,
            verificationExpires=verification_expires
        )
        await user.insert()
        
        # Send verification email
        email_sent = await EmailService.send_verification_email(
            email=data.email,
            token=verification_token,
            full_name=data.fullName
        )
        
        if not email_sent:
            # If email fails, still create user but notify about email issue
            return {
                "message": "Account created successfully. Please check your email for verification link. If you don't receive the email, please contact support.",
                "id": str(user.id),
                "email": data.email
            }
        
        return {
            "message": "Account created successfully. Please check your email for verification link.",
            "id": str(user.id),
            "email": data.email
        }

    @staticmethod
    async def verify_email(token: str) -> AuthResponse:
        """Verify user email with token"""
        user = await User.find_one({"verificationToken": token})
        
        if not user:
            raise HTTPException(status_code=400, detail="Invalid verification token.")
        
        if user.verificationExpires and user.verificationExpires < datetime.utcnow():
            raise HTTPException(status_code=400, detail="Verification token has expired.")
        
        # If user is already verified, just return auth response
        if user.isVerified:
            # Generate JWT token and return (user is already verified)
            payload = {"id": str(user.id), "role": user.role}
            token = jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")
            return AuthResponse(accessToken=token, id=str(user.id), role=user.role)
        
        # Update user as verified
        user.isVerified = True
        user.verificationToken = None
        user.verificationExpires = None
        await user.save()
        
        # Generate JWT token and return (user will be automatically logged in and redirected to dashboard)
        payload = {"id": str(user.id), "role": user.role}
        token = jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")
        
        return AuthResponse(accessToken=token, id=str(user.id), role=user.role)

    @staticmethod
    async def resend_verification_email(email: str) -> dict:
        """Resend verification email"""
        if not settings.EMAIL_VERIFICATION_ENABLED:
            return {"message": "Email verification is disabled."}

        user = await User.find_one({"email": email})
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")
        
        if user.isVerified:
            raise HTTPException(status_code=400, detail="Email already verified.")
        
        # Generate new verification token
        verification_token = EmailService.generate_verification_token()
        verification_expires = EmailService.get_verification_expiry()
        
        user.verificationToken = verification_token
        user.verificationExpires = verification_expires
        await user.save()
        
        # Send verification email
        email_sent = await EmailService.send_verification_email(
            email=user.email,
            token=verification_token,
            full_name=user.fullName
        )
        
        if not email_sent:
            raise HTTPException(status_code=500, detail="Failed to send verification email.")
        
        return {"message": "Verification email sent successfully."}

    @staticmethod
    async def login(data: AuthLogin) -> AuthResponse:
        user = await User.find_one({"email": data.email})
        if not user or not user.password or not pwd_context.verify(data.password, user.password):
            raise HTTPException(status_code=400, detail="Invalid email or password.")

        if getattr(user, "isRestricted", False):
            raise HTTPException(
                status_code=403,
                detail="Your account has been restricted. Contact support for help.",
            )
        
        # Check if email is verified (only for non-Google users)
        if (
            settings.EMAIL_VERIFICATION_ENABLED
            and not user.isVerified
            and not user.googleId
        ):
            raise HTTPException(
                status_code=401, 
                detail="Please verify your email address before logging in. Check your email for the verification link."
            )
        
        payload = {"id": str(user.id), "role": user.role}
        token = jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")
        return AuthResponse(accessToken=token, id=str(user.id), role=user.role)

    @staticmethod
    async def logout() -> dict:
        # Stateless JWT: just return success
        return {"success": True, "message": "User logged out successfully"}

    @staticmethod
    async def google_auth_success(user: User) -> str:
        payload = {"id": str(user.id), "role": user.role}
        return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256") 