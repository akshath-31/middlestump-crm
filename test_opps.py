import asyncio
import os
import sys

sys.path.append('c:\\WORK\\Xeno\\MiddleStump-CRM\\middlestump-backend')

from services.gemini import generate_opportunities

import logging
logging.basicConfig(level=logging.INFO)

async def test():
    context = {
        "segment_sizes": {
            "lapsed_6m": 100,
            "high_value": 50,
            "churn_risk": 30,
            "ipl_buyers": 200,
            "first_timers": 60,
            "academy_coaches": 10
        }
    }
    await generate_opportunities(context)

if __name__ == "__main__":
    asyncio.run(test())
