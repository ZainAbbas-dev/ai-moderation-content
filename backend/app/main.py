from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, submissions, admin, appeals, analytics
from app.api.admin import seed_default_policies
from app.core.database import users_collection
from app.core.security import get_password_hash

def seed_demo_accounts():
    """Seeds default testing accounts for the evaluator."""
    if users_collection.count_documents({}) == 0:
        admin_user = {
            "email": "admin@test.com",
            "password": get_password_hash("admin123"),
            "role": "admin"
        }
        standard_user = {
            "email": "user@test.com",
            "password": get_password_hash("user123"),
            "role": "user"
        }
        users_collection.insert_many([admin_user, standard_user])

@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_default_policies()
    seed_demo_accounts() # Auto-creates the accounts!
    yield

app = FastAPI(title="AI Content Moderation API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(submissions.router, prefix="/api/submissions", tags=["Submissions"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(appeals.router, prefix="/api/appeals", tags=["Appeals"]) 
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])

@app.get("/")
def root():
    return {"message": "API is running", "status": "healthy"}