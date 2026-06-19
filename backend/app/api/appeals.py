from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime
from bson import ObjectId
from app.api.deps import get_current_user, get_current_admin
from app.core.database import appeals_collection, submissions_collection
from app.schemas.appeal import AppealCreate, AppealResolve, AppealResponse

router = APIRouter()

@router.post("/", response_model=AppealResponse)
def create_appeal(appeal: AppealCreate, current_user: dict = Depends(get_current_user)):
    """Users can file an appeal for Flagged or Blocked submissions."""
    
    # Verify the submission exists and belongs to the user
    submission = submissions_collection.find_one({
        "_id": ObjectId(appeal.submission_id),
        "user_id": current_user["_id"]
    })
    
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
        
    if submission["verdict"]["overall_outcome"] == "Approved":
        raise HTTPException(status_code=400, detail="Cannot appeal an approved submission")
        
    if appeals_collection.find_one({"submission_id": appeal.submission_id, "status": "Pending"}):
        raise HTTPException(status_code=400, detail="An appeal is already pending for this submission")

    appeal_doc = {
        "submission_id": appeal.submission_id,
        "user_id": current_user["_id"],
        "justification": appeal.justification,
        "status": "Pending",
        "admin_response": None,
        "created_at": datetime.utcnow(),
        "resolved_at": None
    }
    
    result = appeals_collection.insert_one(appeal_doc)
    
    # Update the original submission to show it is under appeal
    submissions_collection.update_one(
        {"_id": ObjectId(appeal.submission_id)},
        {"$set": {"status": "Appealed"}}
    )
    
    return AppealResponse(id=str(result.inserted_id), **appeal_doc)

@router.get("/queue", response_model=List[AppealResponse])
def get_appeal_queue(current_admin: dict = Depends(get_current_admin)):
    """Admin only: View all pending appeals."""
    cursor = appeals_collection.find({"status": "Pending"}).sort("created_at", 1)
    return [AppealResponse(id=str(doc["_id"]), **doc) for doc in cursor]

@router.put("/{appeal_id}/resolve", response_model=AppealResponse)
def resolve_appeal(appeal_id: str, resolution: AppealResolve, current_admin: dict = Depends(get_current_admin)):
    """Admin only: Accept or reject an appeal, potentially overriding the verdict."""
    appeal = appeals_collection.find_one({"_id": ObjectId(appeal_id)})
    
    if not appeal:
        raise HTTPException(status_code=404, detail="Appeal not found")
        
    if appeal["status"] != "Pending":
        raise HTTPException(status_code=400, detail="Appeal is already resolved")

    update_data = {
        "status": resolution.status,
        "admin_response": resolution.admin_response,
        "resolved_at": datetime.utcnow()
    }
    
    appeals_collection.update_one(
        {"_id": ObjectId(appeal_id)},
        {"$set": update_data}
    )
    
    # If accepted, override the original submission verdict
    if resolution.status == "Accepted":
        submissions_collection.update_one(
            {"_id": ObjectId(appeal["submission_id"])},
            {
                "$set": {
                    "verdict.overall_outcome": "Approved",
                    "status": "Clean (Overridden)"
                }
            }
        )
    else:
        # If rejected, mark the submission so the user knows
        submissions_collection.update_one(
            {"_id": ObjectId(appeal["submission_id"])},
            {"$set": {"status": "Appeal Rejected"}}
        )

    updated_appeal = appeals_collection.find_one({"_id": ObjectId(appeal_id)})
    return AppealResponse(id=str(updated_appeal["_id"]), **updated_appeal)