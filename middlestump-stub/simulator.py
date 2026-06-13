import asyncio
import httpx
import logging
import random
import os
from datetime import datetime, timezone
from models import SendRequest

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")

DEMO_MODE = os.getenv("DEMO_MODE", "false").lower() == "true"
DEMO_SEED = int(os.getenv("DEMO_SEED", "42"))

if DEMO_MODE:
    random.seed(DEMO_SEED)
    logging.info("[STUB] Demo mode enabled — using fixed seed for deterministic outcomes")

MIN_DELIVERY_DELAY = float(os.getenv("MIN_DELIVERY_DELAY", "2"))
MAX_DELIVERY_DELAY = float(os.getenv("MAX_DELIVERY_DELAY", "6"))
FAILURE_RATE = float(os.getenv("FAILURE_RATE", "0.05"))
OPEN_RATE = float(os.getenv("OPEN_RATE", "0.65"))
CLICK_RATE = float(os.getenv("CLICK_RATE", "0.40"))
CONVERSION_RATE = float(os.getenv("CONVERSION_RATE", "0.20"))

CHANNEL_MODIFIERS = {
    "whatsapp": {"open_rate": 1.0,  "click_rate": 1.0},
    "sms":      {"open_rate": 0.85, "click_rate": 0.70},
    "email":    {"open_rate": 0.60, "click_rate": 0.80},
}

metrics = {
    "total_received": 0,
    "total_delivered": 0,
    "total_failed": 0,
    "total_opened": 0,
    "total_clicked": 0,
    "total_converted": 0,
    "total_callback_errors": 0,
}

async def fire_callback(url: str, message_id: str, status: str):
    payload = {
        "message_id": message_id,
        "status": status,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            await client.post(url, json=payload)
        
        if status == "delivered": metrics["total_delivered"] += 1
        elif status == "failed": metrics["total_failed"] += 1
        elif status == "opened": metrics["total_opened"] += 1
        elif status == "clicked": metrics["total_clicked"] += 1
        elif status == "converted": metrics["total_converted"] += 1
        
    except Exception as e:
        metrics["total_callback_errors"] += 1
        logging.error(f"[STUB] Callback error for message_id={message_id}: {e}")

async def simulate_delivery(request: SendRequest):
    try:
        channel = request.channel.lower()
        if channel not in CHANNEL_MODIFIERS:
            channel = "whatsapp"
            
        modifiers = CHANNEL_MODIFIERS[channel]
        open_prob = OPEN_RATE * modifiers["open_rate"]
        click_prob = CLICK_RATE * modifiers["click_rate"]
        
        will_fail = random.random() < FAILURE_RATE
        
        delay_deliver = random.uniform(MIN_DELIVERY_DELAY, MAX_DELIVERY_DELAY)
        await asyncio.sleep(delay_deliver)
        
        if will_fail:
            logging.info(f"[STUB] message_id={request.message_id} status=failed channel={channel} campaign_id={request.campaign_id}")
            await fire_callback(request.callback_url, request.message_id, "failed")
            return
            
        logging.info(f"[STUB] message_id={request.message_id} status=delivered channel={channel} campaign_id={request.campaign_id}")
        await fire_callback(request.callback_url, request.message_id, "delivered")
        
        if random.random() > open_prob:
            return
            
        delay_open = random.uniform(2, 5)
        await asyncio.sleep(delay_open)
        logging.info(f"[STUB] message_id={request.message_id} status=opened channel={channel} campaign_id={request.campaign_id}")
        await fire_callback(request.callback_url, request.message_id, "opened")
        
        if random.random() > click_prob:
            return
            
        delay_click = random.uniform(3, 8)
        await asyncio.sleep(delay_click)
        logging.info(f"[STUB] message_id={request.message_id} status=clicked channel={channel} campaign_id={request.campaign_id}")
        await fire_callback(request.callback_url, request.message_id, "clicked")
        
        if random.random() > CONVERSION_RATE:
            return
            
        delay_convert = random.uniform(5, 15)
        await asyncio.sleep(delay_convert)
        logging.info(f"[STUB] message_id={request.message_id} status=converted channel={channel} campaign_id={request.campaign_id}")
        await fire_callback(request.callback_url, request.message_id, "converted")

    except Exception as e:
        logging.error(f"[STUB] Unhandled error during simulation for message_id={request.message_id}: {e}")
