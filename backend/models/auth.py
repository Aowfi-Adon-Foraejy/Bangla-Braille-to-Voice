from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import hashlib
import secrets
import json
from pathlib import Path

# Simple email validation without external dependency
def validate_email(email: str) -> str:
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        raise ValueError('Invalid email format')
    return email

class User(BaseModel):
    id: str
    username: str
    email: str
    password_hash: str
    created_at: datetime
    last_login: Optional[datetime] = None

class UserLogin(BaseModel):
    username: str
    password: str

class UserRegister(BaseModel):
    username: str
    email: str
    password: str

    def validate_email_format(self):
        validate_email(self.email)
        return self

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    created_at: datetime
    last_login: Optional[datetime] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class SimpleAuth:
    def __init__(self):
        self.users_file = Path("backend/users.json")
        self.sessions_file = Path("backend/sessions.json")
        self.users = self._load_users()
        self.sessions = self._load_sessions()
    
    def _load_users(self) -> dict:
        if self.users_file.exists():
            with open(self.users_file, 'r') as f:
                data = json.load(f)
                return {user['id']: user for user in data}
        return {}
    
    def _load_sessions(self) -> dict:
        if self.sessions_file.exists():
            with open(self.sessions_file, 'r') as f:
                return json.load(f)
        return {}
    
    def _save_users(self):
        self.users_file.parent.mkdir(exist_ok=True)
        with open(self.users_file, 'w') as f:
            json.dump(list(self.users.values()), f, indent=2, default=str)
    
    def _save_sessions(self):
        self.sessions_file.parent.mkdir(exist_ok=True)
        with open(self.sessions_file, 'w') as f:
            json.dump(self.sessions, f, indent=2, default=str)
    
    def _hash_password(self, password: str) -> str:
        salt = secrets.token_hex(16)
        password_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
        return f"{salt}:{password_hash.hex()}"
    
    def _verify_password(self, password: str, stored_hash: str) -> bool:
        try:
            salt, hash_hex = stored_hash.split(':')
            password_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
            return password_hash.hex() == hash_hex
        except:
            return False
    
    def create_user(self, username: str, email: str, password: str) -> User:
        user_id = secrets.token_hex(8)
        password_hash = self._hash_password(password)
        
        user = User(
            id=user_id,
            username=username,
            email=email,
            password_hash=password_hash,
            created_at=datetime.now()
        )
        
        self.users[user_id] = user.dict()
        self._save_users()
        return user
    
    def authenticate_user(self, username: str, password: str) -> Optional[User]:
        for user_data in self.users.values():
            if user_data['username'] == username:
                if self._verify_password(password, user_data['password_hash']):
                    user_data['last_login'] = datetime.now()
                    self._save_users()
                    return User(**user_data)
        return None
    
    def create_session(self, user: User) -> str:
        session_token = secrets.token_urlsafe(32)
        expiry = datetime.now() + timedelta(days=7)
        
        self.sessions[session_token] = {
            'user_id': user.id,
            'expires_at': expiry.isoformat()
        }
        self._save_sessions()
        return session_token
    
    def validate_session(self, token: str) -> Optional[User]:
        if token not in self.sessions:
            return None
        
        session_data = self.sessions[token]
        expiry = datetime.fromisoformat(session_data['expires_at'])
        
        if datetime.now() > expiry:
            del self.sessions[token]
            self._save_sessions()
            return None
        
        user_id = session_data['user_id']
        if user_id in self.users:
            return User(**self.users[user_id])
        return None
    
    def revoke_session(self, token: str):
        if token in self.sessions:
            del self.sessions[token]
            self._save_sessions()

auth = SimpleAuth()