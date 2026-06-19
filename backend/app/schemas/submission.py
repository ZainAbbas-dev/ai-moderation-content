from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

class CategoryResult(BaseModel):
    category: str
    is_detected: bool
    confidence_score: float
    reasoning: str

class Verdict(BaseModel):
    overall_outcome: str # "Approved", "Flagged for Review", or "Blocked"
    category_breakdown: List[CategoryResult]
    timestamp: datetime
    policy_reference: str

class SubmissionResponse(BaseModel):
    id: str
    user_id: str
    image_path: str
    verdict: Verdict
    status: str # "Clean", "Appealed", etc.
    created_at: datetime