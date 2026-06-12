import logging
from fastapi import APIRouter
from database import get_supabase_async
from models import ReceiptCallbackRequest

router = APIRouter(prefix="/api/communications", tags=["communications"])
logger = logging.getLogger(__name__)

STATUS_ORDER = { "sent": 0, "delivered": 1, "opened": 2, "clicked": 3, "converted": 4, "failed": 99 }

@router.post("/receipt")
async def receipt_callback(payload: ReceiptCallbackRequest):
    try:
        msg_id = payload.message_id
        new_status = payload.status
        ts = payload.timestamp
        
        db = await get_supabase_async()
        
        comm_res = await db.table("communications").select("*").eq("id", msg_id).execute()
        if not comm_res.data:
            logger.error(f"Communication {msg_id} not found")
            return {"status": "ok"}
            
        comm = comm_res.data[0]
        current_status = comm.get("status", "sent")
        
        curr_order = STATUS_ORDER.get(current_status, -1)
        new_order = STATUS_ORDER.get(new_status, -1)
        
        should_update = False
        if new_status == "failed":
            if current_status in ["sent", "delivered"]:
                should_update = True
        elif new_order > curr_order:
            should_update = True
            
        if not should_update:
            return {"status": "ok"}
            
        update_data = {"status": new_status}
        if new_status == "delivered":
            update_data["delivered_at"] = ts
        elif new_status == "opened":
            update_data["opened_at"] = ts
        elif new_status == "clicked":
            update_data["clicked_at"] = ts
        elif new_status == "converted":
            update_data["converted_at"] = ts
            
        await db.table("communications").update(update_data).eq("id", msg_id).execute()
        
        # Incremental logic
        camp_id = comm["campaign_id"]
        
        deltas = {
            "total_delivered": 0,
            "total_opened": 0,
            "total_clicked": 0,
            "total_converted": 0,
            "total_failed": 0
        }
        
        def has_milestone(status, milestone):
            if status in ["failed", "sent"]: return False
            if milestone == "delivered": return status in ["delivered", "opened", "clicked", "converted"]
            if milestone == "opened": return status in ["opened", "clicked", "converted"]
            if milestone == "clicked": return status in ["clicked", "converted"]
            if milestone == "converted": return status == "converted"
            return False

        if new_status == "failed":
            deltas["total_failed"] += 1
            if has_milestone(current_status, "delivered"): deltas["total_delivered"] -= 1
            if has_milestone(current_status, "opened"): deltas["total_opened"] -= 1
            if has_milestone(current_status, "clicked"): deltas["total_clicked"] -= 1
            if has_milestone(current_status, "converted"): deltas["total_converted"] -= 1
        else:
            for milestone in ["delivered", "opened", "clicked", "converted"]:
                if not has_milestone(current_status, milestone) and has_milestone(new_status, milestone):
                    deltas[f"total_{milestone}"] += 1
        
        has_changes = any(v != 0 for v in deltas.values())
        if has_changes:
            await db.rpc("increment_campaign_counters", {
                "camp_id": camp_id,
                "delivered_delta": deltas["total_delivered"],
                "opened_delta": deltas["total_opened"],
                "clicked_delta": deltas["total_clicked"],
                "converted_delta": deltas["total_converted"],
                "failed_delta": deltas["total_failed"]
            }).execute()
        
    except Exception as e:
        logger.error(f"Receipt callback error: {e}")
        
    return {"status": "ok"}

