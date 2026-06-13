import logging
from datetime import date, timedelta
from fastapi import APIRouter, HTTPException, BackgroundTasks
from database import supabase
from models import CampaignGoalRequest, CampaignConfirmRequest, SummaryRequest
from services.context import get_business_context
from services.gemini import process_campaign_goal, generate_campaign_summary, generate_opportunities
from services.channel import send_campaign_to_stub

router = APIRouter(prefix="/api/ai", tags=["ai"])
logger = logging.getLogger(__name__)

@router.get("/context")
async def get_context():
    return await get_business_context()

@router.get("/opportunities")
async def get_opportunities():
    try:
        context = await get_business_context()
        opportunities = await generate_opportunities(context)
        return opportunities
    except Exception as e:
        logger.error(f"Error in /opportunities: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze")
async def analyze_goal(payload: CampaignGoalRequest):
    try:
        context = await get_business_context()
        ai_res = await process_campaign_goal(payload.goal, context)
        segment = ai_res.get("segment", {})
        
        logger.info(f"Gemini segment filter: {segment}")
        
        query = supabase.table("shoppers").select("*")
        
        filter_tags = segment.get("filter_tags") or []
        shopper_types = segment.get("shopper_types") or []
        min_spend = segment.get("min_spend")
        min_days = segment.get("min_days_since_order")
        max_days = segment.get("max_days_since_order")
        
        if filter_tags:
            query = query.contains("tags", filter_tags)
        if shopper_types:
            query = query.in_("shopper_type", shopper_types)
        if min_spend is not None:
            query = query.gte("total_spend", min_spend)
            
        today = date.today()
        if min_days is not None:
            max_date = today - timedelta(days=min_days)
            query = query.lte("last_order_date", max_date.isoformat())
        if max_days is not None:
            min_date = today - timedelta(days=max_days)
            query = query.gte("last_order_date", min_date.isoformat())
            
        logger.info(f"Supabase query parameters: filter_tags={filter_tags}, shopper_types={shopper_types}, min_spend={min_spend}, min_days={min_days}, max_days={max_days}")
            
        shoppers = query.execute().data
        actual_reach = len(shoppers)
        logger.info(f"Actual reach returned: {actual_reach}")
        
        if actual_reach == 0:
            logger.info("Applying fallback segment filter (lapsed tag) due to 0 reach")
            segment = {"filter_tags": ["lapsed"]}
            query = supabase.table("shoppers").select("*").contains("tags", ["lapsed"])
            shoppers = query.execute().data
            actual_reach = len(shoppers)
            logger.info(f"Fallback actual reach: {actual_reach}")
            
        target_segment_name = ai_res.get("target_segment_name")
        if not target_segment_name or target_segment_name.upper() == "UNKNOWN":
            filter_tags_fallback = segment.get("filter_tags") or []
            if filter_tags_fallback:
                target_segment_name = filter_tags_fallback[0].capitalize()
            else:
                target_segment_name = "All Shoppers"

        channel = (ai_res.get("channel") or "email").lower()
        
        DEFAULT_PREDICTIONS = {
            "whatsapp": {"open_rate": 0.45, "click_rate": 0.20, "conversion_rate": 0.08},
            "sms":      {"open_rate": 0.38, "click_rate": 0.14, "conversion_rate": 0.05},
            "email":    {"open_rate": 0.28, "click_rate": 0.12, "conversion_rate": 0.04},
        }
        
        pred_open = ai_res.get("predicted_open_rate")
        pred_click = ai_res.get("predicted_click_rate")
        pred_conv = ai_res.get("predicted_conversions")
        pred_rev = ai_res.get("predicted_revenue")
        
        logger.info(f"Raw Gemini predictions: open={pred_open}, click={pred_click}, conv={pred_conv}, rev={pred_rev}")
        
        defaults = DEFAULT_PREDICTIONS.get(channel, DEFAULT_PREDICTIONS["email"])
        
        if not pred_open or float(pred_open) == 0:
            pred_open = defaults["open_rate"] * 100
        if not pred_click or float(pred_click) == 0:
            pred_click = defaults["click_rate"] * 100
            
        if not pred_conv or float(pred_conv) == 0:
            pred_conv = int(actual_reach * defaults["conversion_rate"])
            
        if not pred_rev or float(pred_rev) == 0:
            pred_rev = pred_conv * 3500

        campaign_data = {
            "name": ai_res.get("campaign_name", "Untitled Campaign"),
            "goal": payload.goal,
            "prompt": payload.goal,
            "target_segment_name": target_segment_name,
            "segment_filter": segment,
            "message_template": ai_res.get("message_template"),
            "channel": channel,
            "status": "draft",
            "ai_reasoning": ai_res.get("reasoning"),
            "predicted_open_rate": pred_open,
            "predicted_click_rate": pred_click,
            "predicted_conversions": pred_conv,
            "predicted_revenue": pred_rev,
        }
        
        camp_res = supabase.table("campaigns").insert(campaign_data).execute()
        campaign_id = camp_res.data[0]["id"]
        
        message_preview = ai_res.get("message_template", "")
        if shoppers:
            sample = shoppers[0]
            name = sample.get("name", "")
            
            last_product = "your recent purchase"
            days_since = "a while"
            if sample.get("last_order_date"):
                orders_res = supabase.table("orders").select("id").eq("shopper_id", sample["id"]).order("order_date", desc=True).limit(1).execute()
                if orders_res.data:
                    o_id = orders_res.data[0]["id"]
                    items_res = supabase.table("order_items").select("product_name").eq("order_id", o_id).limit(1).execute()
                    if items_res.data:
                        last_product = items_res.data[0]["product_name"]
                        
                # Fix: Handle ISO formats safely by slicing up to 10 chars (YYYY-MM-DD)
                last_d = date.fromisoformat(sample["last_order_date"][:10])
                days_since = str((today - last_d).days)
                
            message_preview = message_preview.replace("{name}", name).replace("{last_product}", last_product).replace("{days_since_order}", days_since)

        return {
            "campaign_id": campaign_id,
            "campaign_name": ai_res.get("campaign_name"),
            "target_segment_name": target_segment_name,
            "opportunity": ai_res.get("opportunity"),
            "why_it_matters": ai_res.get("why_it_matters"),
            "actual_reach": actual_reach,
            "reasoning": ai_res.get("reasoning"),
            "message_template": ai_res.get("message_template"),
            "message_preview": message_preview,
            "channel": channel,
            "channel_reasoning": ai_res.get("channel_reasoning"),
            "predicted_open_rate": pred_open,
            "predicted_click_rate": pred_click,
            "predicted_conversions": pred_conv,
            "predicted_revenue": pred_rev,
            "follow_up_suggestion": ai_res.get("follow_up_suggestion")
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in /analyze: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/confirm")
async def confirm_campaign(payload: CampaignConfirmRequest, background_tasks: BackgroundTasks):
    try:
        camp_res = supabase.table("campaigns").select("*").eq("id", payload.campaign_id).execute()
        if not camp_res.data:
            raise HTTPException(status_code=404, detail="Campaign not found")
            
        campaign = camp_res.data[0]
        if campaign.get("status") != "draft":
            raise HTTPException(status_code=409, detail="Campaign already confirmed")
            
        segment = campaign.get("segment_filter", {})
        
        query = supabase.table("shoppers").select("*")
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
        
        shopper_ids = [s["id"] for s in shoppers]
        
        shopper_latest_order = {}
        if shopper_ids:
            orders_res = supabase.table("orders").select("id, shopper_id, order_date").in_("shopper_id", shopper_ids).execute()
            for o in orders_res.data:
                sid = o["shopper_id"]
                if sid not in shopper_latest_order or o["order_date"] > shopper_latest_order[sid]["order_date"]:
                    shopper_latest_order[sid] = o
            
        order_ids = [o["id"] for o in shopper_latest_order.values()]
        item_map = {}
        if order_ids:
            order_items_res = supabase.table("order_items").select("order_id, product_name").in_("order_id", order_ids).execute().data
            for item in order_items_res:
                item_map[item["order_id"]] = item["product_name"]
                
        comms_to_insert = []
        for s in shoppers:
            name = s.get("name", "")
            last_product = "your recent purchase"
            days_since = "a while"
            sid = s["id"]
            
            if sid in shopper_latest_order:
                oid = shopper_latest_order[sid]["id"]
                if oid in item_map:
                    last_product = item_map[oid]
            
            if s.get("last_order_date"):
                last_d = date.fromisoformat(s["last_order_date"])
                days_since = str((today - last_d).days)
                
            msg = campaign["message_template"].replace("{name}", name).replace("{last_product}", last_product).replace("{days_since_order}", days_since)
            
            comms_to_insert.append({
                "campaign_id": campaign["id"],
                "shopper_id": sid,
                "message": msg,
                "channel": campaign["channel"],
                "status": "sent"
            })
                
        inserted_comms = []
        batch_size = 500
        for i in range(0, len(comms_to_insert), batch_size):
            batch = comms_to_insert[i:i+batch_size]
            res = supabase.table("communications").insert(batch).execute()
            inserted_comms.extend(res.data)
            
        supabase.table("campaigns").update({
            "total_sent": len(inserted_comms),
            "status": "confirmed"
        }).eq("id", campaign["id"]).execute()
        
        background_tasks.add_task(send_campaign_to_stub, campaign["id"], inserted_comms)
        
        return {
            "campaign_id": campaign["id"],
            "total_sent": len(inserted_comms),
            "status": "confirmed"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in /confirm: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/summary/{campaign_id}")
async def get_summary(campaign_id: str):
    try:
        camp_res = supabase.table("campaigns").select("*").eq("id", campaign_id).execute()
        if not camp_res.data:
            raise HTTPException(status_code=404, detail="Campaign not found")
        campaign = camp_res.data[0]
        
        actual_stats = {
            "total_sent": campaign.get("total_sent", 0),
            "total_delivered": campaign.get("total_delivered", 0),
            "total_opened": campaign.get("total_opened", 0),
            "total_clicked": campaign.get("total_clicked", 0),
            "total_converted": campaign.get("total_converted", 0),
            "total_failed": campaign.get("total_failed", 0)
        }
        
        summary = await generate_campaign_summary(campaign, actual_stats)
        return {"summary": summary}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in /summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))
