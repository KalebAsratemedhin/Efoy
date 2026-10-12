from app.core.config import get_settings
from app.db.models.user import User
from jose import jwt
from typing import Optional
import requests
import urllib.parse

settings = get_settings()

class GoogleOAuthService:
    def __init__(self):
        self.client_id = settings.GOOGLE_CLIENT_ID
        self.client_secret = settings.GOOGLE_CLIENT_SECRET
        self.redirect_uri = settings.google_callback_url
    
    def get_authorization_url(self) -> str:
        """Generate Google OAuth authorization URL"""
        if not self.client_id:
            raise ValueError("Google OAuth not configured")
        
        params = {
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'scope': 'openid email profile',
            'response_type': 'code',
            'access_type': 'offline',
            'prompt': 'consent'
        }
        
        query_string = urllib.parse.urlencode(params)
        return f"https://accounts.google.com/o/oauth2/v2/auth?{query_string}"
    
    async def handle_callback(self, request) -> dict:
        """Handle Google OAuth callback and return user data"""
        try:
            # Get the authorization code from the request
            code = request.query_params.get('code')
            if not code:
                raise ValueError("No authorization code received")
            
            # Exchange code for tokens
            token_data = await self._exchange_code_for_tokens(code)
            
            # Get user info from Google
            user_info = await self._get_user_info(token_data['access_token'])
            
            return {
                'email': user_info.get('email'),
                'fullName': user_info.get('name'),
                'googleId': user_info.get('sub'),
                'profilePic': user_info.get('picture')
            }
        except Exception as e:
            raise ValueError(f"Google OAuth callback failed: {str(e)}")
    
    async def _exchange_code_for_tokens(self, code: str) -> dict:
        """Exchange authorization code for access token"""
        token_url = "https://oauth2.googleapis.com/token"
        data = {
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': self.redirect_uri
        }
        
        response = requests.post(token_url, data=data)
        if response.status_code != 200:
            raise ValueError(f"Token exchange failed: {response.text}")
        
        return response.json()
    
    async def _get_user_info(self, access_token: str) -> dict:
        """Get user information from Google"""
        user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
        headers = {'Authorization': f'Bearer {access_token}'}
        
        response = requests.get(user_info_url, headers=headers)
        if response.status_code != 200:
            raise ValueError(f"Failed to get user info: {response.text}")
        
        return response.json()
    
    @staticmethod
    async def find_or_create_user(google_data: dict) -> User:
        """Find existing user by Google ID or email, or create new user"""
        # First try to find by Google ID
        if google_data.get('googleId'):
            user = await User.find_one({"googleId": google_data['googleId']})
            if user:
                return user
        
        # Then try to find by email
        if google_data.get('email'):
            user = await User.find_one({"email": google_data['email']})
            if user:
                # Update existing user with Google ID if not present
                if not user.googleId and google_data.get('googleId'):
                    user.googleId = google_data['googleId']
                    await user.save()
                return user
        
        # Create new user
        user = User(
            fullName=google_data.get('fullName', ''),
            email=google_data.get('email', ''),
            googleId=google_data.get('googleId'),
            profilePic=google_data.get('profilePic'),
            isVerified=True,
            role='patient'  # Default role for Google OAuth users
        )
        await user.insert()
        return user
    
    @staticmethod
    def create_auth_response(user: User) -> str:
        """Create JWT token and redirect URL for authenticated user"""
        if getattr(user, "isRestricted", False):
            from fastapi import HTTPException
            raise HTTPException(
                status_code=403,
                detail="Your account has been restricted. Contact support for help.",
            )
        payload = {"id": str(user.id), "role": user.role}
        token = jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")
        
        redirect_url = f"{settings.CLIENT_URL}/google-auth?id={user.id}&role={user.role}&token={token}"
        return redirect_url 