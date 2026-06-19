from pydantic import BaseModel, Field

class CategoryPolicy(BaseModel):
    category: str
    is_enabled: bool = True
    confidence_threshold: float = Field(default=80.0, ge=0.0, le=100.0)
    enforcement_behavior: str = Field(default="Flag for Review", pattern="^(Auto-Block|Flag for Review)$")