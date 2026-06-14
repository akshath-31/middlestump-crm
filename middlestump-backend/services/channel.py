import os
import asyncio
import httpx
import logging
from database import supabase

logger = logging.getLogger(__name__)

STUB_SERVICE_URL = os.getenv("STUB_SERVICE_URL", "http://localhost:8001")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

async def send_single_communication(client: httpx.AsyncClient, semaphore: asyncio.Semaphore, comm: dict):
    async with semaphore:
        payload = {
            "message_id": comm["id"],
            "shopper_id": comm["shopper_id"],
            "campaign_id": comm["campaign_id"],
            "channel": comm.get("channel", "whatsapp"),
            "message": comm["message"],
            "callback_url": f"{BACKEND_URL}/api/communications/receipt"
        }
        try:
            response = await client.post(f"{STUB_SERVICE_URL}/send", json=payload)
            logger.info(f"Sent message {comm['id']} to stub, response: {response.status_code}")
            response.raise_for_status()
        except Exception as e:
            logger.error(f"Failed to send communication {comm['id']}: {e}")
            try:
                supabase.table("communications").update({"status": "failed"}).eq("id", comm["id"]).execute()
            except Exception as db_e:
                logger.error(f"Failed to update communication status to failed: {db_e}")

async def send_campaign_to_stub(campaign_id: str, communications: list):
    logger.info(f"STUB_SERVICE_URL environment variable is: {STUB_SERVICE_URL}")
    logger.info(f"Sending {len(communications)} messages to stub at {STUB_SERVICE_URL}")
    semaphore = asyncio.Semaphore(50)
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        tasks = [send_single_communication(client, semaphore, comm) for comm in communications]
        await asyncio.gather(*tasks)

    try:
        supabase.table("campaigns").update({"status": "sending"}).eq("id", campaign_id).execute()
    except Exception as e:
        logger.error(f"Failed to update campaign {campaign_id} status to sending: {e}")
