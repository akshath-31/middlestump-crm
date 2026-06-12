from pydantic import BaseModel

class CampaignGoalRequest(BaseModel):
    goal: str

class CampaignConfirmRequest(BaseModel):
    campaign_id: str

class ReceiptCallbackRequest(BaseModel):
    message_id: str
    status: str
    timestamp: str

class SummaryRequest(BaseModel):
    campaign_id: str
