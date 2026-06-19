import json
import logging
from PIL import Image
from datetime import datetime
from google import genai
from app.schemas.submission import CategoryResult, Verdict
from app.core.database import policies_collection
from app.core.config import settings
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from google.genai.errors import ClientError

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize client
client = genai.Client(api_key=settings.GEMINI_API_KEY)

@retry(
    stop=stop_after_attempt(3), 
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(ClientError)
)
def analyze_image_with_gemini(image_path: str) -> dict:
    """Uses gemini-2.5-flash, the current stable standard."""
    prompt = """
    You are an expert object detection system. Your task is to detect specific items in the image.
    Ignore the context (e.g., kitchen, workshop) and focus purely on the objects present.
    
    Look for:
    1. Graphic Violence
    2. Hate Symbols
    3. Self-Harm
    4. Extremist Propaganda
    5. Weapons & Contraband (Detect blades, knives, firearms, etc.)
    6. Harassment & Humiliation
    
    If you detect an item related to a category, assign a score > 80.0.
    Output ONLY a JSON object. No markdown, no extra text.
    {"Graphic Violence": 0.0, "Hate Symbols": 0.0, "Self-Harm": 0.0, "Extremist Propaganda": 0.0, "Weapons & Contraband": 0.0, "Harassment & Humiliation": 0.0}
    """
    
    default_result = {
        "Graphic Violence": 0.0, "Hate Symbols": 0.0, "Self-Harm": 0.0, 
        "Extremist Propaganda": 0.0, "Weapons & Contraband": 0.0, 
        "Harassment & Humiliation": 0.0
    }

    try:
        img = Image.open(image_path).convert('RGB')
        
        # USE THE CURRENT STABLE MODEL: gemini-2.5-flash
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[prompt, img]
        )
        
        raw_text = response.text.replace("```json", "").replace("```", "").strip()
        logger.info(f"AI Raw Response: {raw_text}")
        return json.loads(raw_text)

    except Exception as e:
        logger.error(f"Gemini API Error: {str(e)}")
        # Return safe defaults if API fails entirely
        return default_result


def evaluate_submission(image_path: str) -> Verdict:
    """Evaluates scores against database policies."""
    raw_scores = analyze_image_with_gemini(image_path)
    ai_results = []
    overall_outcome = "Approved"
    
    policies = {p["category"]: p for p in policies_collection.find({})}
    
    for category, score in raw_scores.items():
        policy = policies.get(category)
        
        # Default fallback values if DB policy is missing
        threshold = policy.get("confidence_threshold", 80.0) if policy else 80.0
        is_enabled = policy.get("is_enabled", True) if policy else True
        behavior = policy.get("enforcement_behavior", "Flag for Review") if policy else "Flag for Review"
        
        if not is_enabled:
            continue
            
        is_detected = float(score) >= threshold
        
        ai_results.append(CategoryResult(
            category=category,
            is_detected=is_detected,
            confidence_score=float(score),
            reasoning=f"Confidence ({score}%) vs Threshold ({threshold}%)." if is_detected else "No concerns."
        ))
        
        if is_detected:
            if behavior == "Auto-Block":
                overall_outcome = "Blocked"
            elif behavior == "Flag for Review" and overall_outcome != "Blocked":
                overall_outcome = "Flagged for Review"
                
    return Verdict(
        overall_outcome=overall_outcome,
        category_breakdown=ai_results,
        timestamp=datetime.utcnow(),
        policy_reference="gemini_pro_hardened_v2"
    )