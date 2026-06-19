from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class AppealCreate(BaseModel):
    submission_id: str
    justification: str = Field(..., min_length=10)

class AppealResolve(BaseModel):
    status: str = Field(..., pattern="^(Accepted|Rejected)$")
    admin_response: Optional[str] = None

class AppealResponse(BaseModel):
    id: str
    submission_id: str
    user_id: str
    justification: str
    status: str  # "Pending", "Accepted", "Rejected"
    admin_response: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None