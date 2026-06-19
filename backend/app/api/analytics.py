from fastapi import APIRouter, Depends
from app.api.deps import get_current_admin
from app.core.database import submissions_collection, appeals_collection

router = APIRouter()

@router.get("/dashboard")
def get_analytics_dashboard(current_admin: dict = Depends(get_current_admin)):
    """Fulfills PDF Requirement 4.5: Admin Analytics Dashboard."""
    
    total_submissions = submissions_collection.count_documents({})
    
    # Verdict Distribution Pipeline
    verdict_distribution = list(submissions_collection.aggregate([
        {"$group": {"_id": "$verdict.overall_outcome", "count": {"$sum": 1}}}
    ]))

    # Appeal Metrics
    total_appeals = appeals_collection.count_documents({})
    accepted_appeals = appeals_collection.count_documents({"status": "Accepted"})
    rejected_appeals = appeals_collection.count_documents({"status": "Rejected"})
    
    # Ranked Users by Violation (Blocked or Flagged)
    top_violators = list(submissions_collection.aggregate([
        {"$match": {"verdict.overall_outcome": {"$in": ["Blocked", "Flagged for Review"]}}},
        {"$group": {"_id": "$user_id", "violation_count": {"$sum": 1}}},
        {"$sort": {"violation_count": -1}},
        {"$limit": 5}
    ]))

    return {
        "total_submissions": total_submissions,
        "verdict_distribution": {item["_id"]: item["count"] for item in verdict_distribution},
        "appeals": {
            "total": total_appeals,
            "accepted": accepted_appeals,
            "rejected": rejected_appeals,
            "resolution_rate": round((accepted_appeals + rejected_appeals) / total_appeals * 100, 2) if total_appeals > 0 else 0
        },
        "top_violators": top_violators
    }