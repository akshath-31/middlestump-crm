from pydantic import BaseModel

class SendRequest(BaseModel):
    message_id: str
    shopper_id: str
    campaign_id: str
    channel: str        # whatsapp / sms / email
    message: str
    callback_url: str   # the CRM receipt endpoint to call back

class CallbackPayload(BaseModel):
    message_id: str
    status: str
    timestamp: str
