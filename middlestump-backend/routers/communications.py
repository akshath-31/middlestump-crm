import logging
from fastapi import APIRouter
from database import supabase
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
        
        comm_res = supabase.table("communications").select("*").eq("id", msg_id).execute()
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
            
        supabase.table("communications").update(update_data).eq("id", msg_id).execute()
        
        camp_id = comm["campaign_id"]
        
        all_comms = supabase.table("communications").select("status").eq("campaign_id", camp_id).execute().data
        
        delivered = 0
        opened = 0
        clicked = 0
        converted = 0
        failed = 0
        
        for c in all_comms:
            st = c.get("status")
            if st == "delivered": delivered += 1
            elif st == "opened": opened += 1
            elif st == "clicked": clicked += 1
            elif st == "converted": converted += 1
            elif st == "failed": failed += 1
        
        total_delivered = delivered + opened + clicked + converted
        total_opened = opened + clicked + converted
        total_clicked = clicked + converted
        total_converted = converted
        total_failed = failed

        supabase.table("campaigns").update({
            "total_delivered": total_delivered,
            "total_opened": total_opened,
            "total_clicked": total_clicked,
            "total_converted": total_converted,
            "total_failed": total_failed
        }).eq("id", camp_id).execute()
        
    except Exception as e:
        logger.error(f"Receipt callback error: {e}")
        
    return {"status": "ok"}
