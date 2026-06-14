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

@router.get("/{campaign_id}/audience")
async def get_campaign_audience(campaign_id: str):
    from datetime import date, timedelta
    try:
        camp_res = supabase.table("campaigns").select("segment_filter").eq("id", campaign_id).execute()
        if not camp_res.data:
            raise HTTPException(status_code=404, detail="Campaign not found")
            
        segment = camp_res.data[0].get("segment_filter", {})
        
        query = supabase.table("shoppers").select("id, name, city, shopper_type, total_spend, last_order_date, tags")
        filter_tags = segment.get("filter_tags") or []
        shopper_types = segment.get("shopper_types") or []
        min_spend = segment.get("min_spend")
        min_days = segment.get("min_days_since_order")
        max_days = segment.get("max_days_since_order")
        
        if filter_tags: query = query.contains("tags", filter_tags)
        if shopper_types: query = query.in_("shopper_type", shopper_types)
        if min_spend is not None: query = query.gte("total_spend", min_spend)
            
        today = date.today()
        if min_days is not None:
            max_date = today - timedelta(days=min_days)
            query = query.lte("last_order_date", max_date.isoformat())
        if max_days is not None:
            min_date = today - timedelta(days=max_days)
            query = query.gte("last_order_date", min_date.isoformat())
            
        shoppers = query.execute().data
        return shoppers
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching campaign audience: {e}")
        raise HTTPException(status_code=500, detail=str(e))
