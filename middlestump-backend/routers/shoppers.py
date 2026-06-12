import logging
from fastapi import APIRouter, HTTPException
from database import supabase

router = APIRouter(prefix="/api/shoppers", tags=["shoppers"])
logger = logging.getLogger(__name__)

@router.get("")
async def get_shoppers(page: int = 1, limit: int = 50, search: str = None, shopper_type: str = None, tag: str = None):
    try:
        query = supabase.table("shoppers").select("*", count="exact")
        if search:
            query = query.ilike("name", f"%{search}%")
        if shopper_type:
            query = query.eq("shopper_type", shopper_type)
        if tag:
            query = query.contains("tags", [tag])
            
        start = (page - 1) * limit
        end = start + limit - 1
        query = query.range(start, end).order("created_at", desc=True)
        
        response = query.execute()
        return {
            "data": response.data,
            "total_count": response.count,
            "page": page,
            "limit": limit
        }
    except Exception as e:
        logger.error(f"Error fetching shoppers: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/segments/summary")
async def get_segments_summary():
    try:
        shoppers = supabase.table("shoppers").select("shopper_type, tags").execute().data
        
        type_counts = {}
        tag_counts = {}
        
        for s in shoppers:
            stype = s.get("shopper_type")
            if stype:
                type_counts[stype] = type_counts.get(stype, 0) + 1
                
            tags = s.get("tags", [])
            if tags:
                for t in tags:
                    tag_counts[t] = tag_counts.get(t, 0) + 1
                
        return {
            "shopper_types": type_counts,
            "tags": tag_counts
        }
    except Exception as e:
        logger.error(f"Error fetching segment summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{shopper_id}")
async def get_shopper(shopper_id: str):
    try:
        shopper_res = supabase.table("shoppers").select("*").eq("id", shopper_id).execute()
        if not shopper_res.data:
            raise HTTPException(status_code=404, detail="Shopper not found")
            
        shopper = shopper_res.data[0]
        
        orders_res = supabase.table("orders").select("*, order_items(*)").eq("shopper_id", shopper_id).order("order_date", desc=True).execute()
        shopper["orders"] = orders_res.data
        
        return shopper
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching shopper: {e}")
        raise HTTPException(status_code=500, detail=str(e))
