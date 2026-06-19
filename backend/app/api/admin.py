from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.api.deps import get_current_admin
from app.core.database import policies_collection
from app.schemas.policy import CategoryPolicy

router = APIRouter()

CATEGORIES = [
    "Graphic Violence", "Hate Symbols", "Self-Harm", 
    "Extremist Propaganda", "Weapons & Contraband", "Harassment & Humiliation"
]

def seed_default_policies():
    """Seeds the database with default policies if none exist."""
    if policies_collection.count_documents({}) == 0:
        defaults = []
        for cat in CATEGORIES:
            defaults.append({
                "category": cat,
                "is_enabled": True,
                "confidence_threshold": 80.0,
                "enforcement_behavior": "Auto-Block" if cat in ["Graphic Violence", "Self-Harm"] else "Flag for Review"
            })
        policies_collection.insert_many(defaults)

@router.get("/policies", response_model=List[CategoryPolicy])
def get_policies(current_admin: dict = Depends(get_current_admin)):
    """Fetch all active policy configurations."""
    return list(policies_collection.find({}, {"_id": 0}))

@router.put("/policies/{category}", response_model=CategoryPolicy)
def update_policy(category: str, policy_update: CategoryPolicy, current_admin: dict = Depends(get_current_admin)):
    """Update a specific category's policy."""
    if category not in CATEGORIES:
        raise HTTPException(status_code=400, detail="Invalid category")
        
    updated = policies_collection.find_one_and_update(
        {"category": category},
        {"$set": policy_update.model_dump()},
        return_document=True
    )
    
    if not updated:
        raise HTTPException(status_code=404, detail="Category policy not found")
        
    # Remove _id from response
    updated.pop("_id", None)
    return updated