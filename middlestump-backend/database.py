import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

_supabase_async = None
import asyncio
_async_lock = asyncio.Lock()

async def get_supabase_async():
    global _supabase_async
    if _supabase_async is None:
        async with _async_lock:
            if _supabase_async is None:
                from supabase import create_async_client
                _supabase_async = await create_async_client(SUPABASE_URL, SUPABASE_KEY)
    return _supabase_async
