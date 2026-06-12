import os
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from models import SendRequest
import simulator

app = FastAPI(title="MiddleStump Stub Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/send")
async def send_message(request: SendRequest, background_tasks: BackgroundTasks):
    simulator.metrics["total_received"] += 1
    background_tasks.add_task(simulator.simulate_delivery, request)
    return { "accepted": True, "message_id": request.message_id }

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "middlestump-stub",
        "demo_mode": simulator.DEMO_MODE
    }

@app.get("/config")
async def config():
    return {
        "failure_rate": simulator.FAILURE_RATE,
        "open_rate": simulator.OPEN_RATE,
        "click_rate": simulator.CLICK_RATE,
        "conversion_rate": simulator.CONVERSION_RATE,
        "delivery_delay_range": [simulator.MIN_DELIVERY_DELAY, simulator.MAX_DELIVERY_DELAY],
        "demo_mode": simulator.DEMO_MODE,
        "channel_modifiers": simulator.CHANNEL_MODIFIERS
    }

@app.get("/metrics")
async def get_metrics():
    m = simulator.metrics
    delivered = m["total_delivered"]
    opened = m["total_opened"]
    clicked = m["total_clicked"]
    
    open_rate_actual = opened / delivered if delivered > 0 else 0.0
    click_rate_actual = clicked / opened if opened > 0 else 0.0
    conversion_rate_actual = m["total_converted"] / clicked if clicked > 0 else 0.0
    
    return {
        **m,
        "open_rate_actual": open_rate_actual,
        "click_rate_actual": click_rate_actual,
        "conversion_rate_actual": conversion_rate_actual
    }

@app.post("/reset")
async def reset_metrics():
    simulator.metrics = {
        "total_received": 0,
        "total_delivered": 0,
        "total_failed": 0,
        "total_opened": 0,
        "total_clicked": 0,
        "total_converted": 0,
        "total_callback_errors": 0,
    }
    return { "reset": True }
