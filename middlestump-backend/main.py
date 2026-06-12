import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import shoppers, campaigns, communications, ai

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")

app = FastAPI(title="MiddleStump CRM API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(shoppers.router)
app.include_router(campaigns.router)
app.include_router(communications.router)
app.include_router(ai.router)

@app.get("/")
async def root():
    return { "status": "ok", "service": "middlestump-crm-backend" }
