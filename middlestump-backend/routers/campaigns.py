import logging
from fastapi import APIRouter, HTTPException
from database import supabase

router = APIRouter(prefix="/api/campaigns", tags=["campaigns"])
logger = logging.getLogger(__name__)

@router.get("")
async def get_campaigns():
    try:
        res = supabase.table("campaigns").select("*").order("created_at", desc=True).execute()
        return res.data
    except Exception as e:
        logger.error(f"Error fetching campaigns: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{campaign_id}")
async def get_campaign(campaign_id: str):
    try:
        res = supabase.table("campaigns").select("*").eq("id", campaign_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Campaign not found")
        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching campaign: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{campaign_id}/communications")
async def get_campaign_communications(campaign_id: str):
    try:
        res = supabase.table("communications").select("*, shoppers(name, phone)").eq("campaign_id", campaign_id).execute()
        return res.data
    except Exception as e:
        logger.error(f"Error fetching communications: {e}")
        raise HTTPException(status_code=500, detail=str(e))
