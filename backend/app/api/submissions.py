import os
import shutil
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from typing import List
from datetime import datetime
from app.api.deps import get_current_user
from app.core.database import submissions_collection
from app.services.moderation import evaluate_submission
from app.schemas.submission import SubmissionResponse

router = APIRouter()

# Ensure uploads directory exists
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=SubmissionResponse)
async def submit_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, detail="File must be an image")

    # 1. Save the file locally
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{current_user['_id']}_{datetime.utcnow().timestamp()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 2 & 3. Run Screening and Determine Verdict dynamically
    verdict = evaluate_submission(file_path)

    # 4. Save to Database
    submission_doc = {
        "user_id": current_user["_id"],
        "image_path": file_path,
        "verdict": verdict.model_dump(),
        "status": "Clean" if verdict.overall_outcome == "Approved" else "Pending",
        "created_at": datetime.utcnow()
    }
    
    result = submissions_collection.insert_one(submission_doc)
    
    return SubmissionResponse(
        id=str(result.inserted_id),
        **submission_doc
    )

@router.get("/history", response_model=List[SubmissionResponse])
async def get_submission_history(current_user: dict = Depends(get_current_user)):
    """Fetch the logged-in user's submission history."""
    cursor = submissions_collection.find({"user_id": current_user["_id"]}).sort("created_at", -1)
    submissions = []
    
    for doc in cursor:
        doc["id"] = str(doc["_id"])
        submissions.append(SubmissionResponse(**doc))
        
    return submissions