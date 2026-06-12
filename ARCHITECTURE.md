# MiddleStump CRM — Architecture Notes

## Scale Assumptions
This system is designed for demo scale:
- 300 shoppers
- ~2000 orders
- ~5000 communications max per campaign batch
- Single marketer, no authentication required
- No message queue (BackgroundTasks used instead of Celery/Redis)
- No caching layer (direct Supabase queries acceptable at this volume)

## What Would Change at 1M Shoppers

### Database
- communications table would need an append-only communication_events 
  table instead of overwriting status fields
- Aggregate stats on campaigns would be computed by async rollup workers,
  not inline UPDATE queries
- Read replicas needed for context/analytics queries

### Campaign Broadcasting
- POST /confirm would return 202 Accepted immediately
- Campaign broadcast would be placed on a Kafka/Celery queue
- Workers would chunk inserts and dispatches in batches of 1000

### AI Integration
- Context payload would be pre-computed and cached (Redis, 60s TTL)
  instead of computed fresh on every request
- LLM calls would be async jobs, not blocking request handlers

### Channel Service
- Stub would be replaced with real provider integrations (Twilio, MSG91)
- Webhook callbacks would go through a queue with exponential backoff retries
- Dead Letter Queue for persistently failing callbacks

## Key Technical Decisions

### Why FastAPI BackgroundTasks over Celery
Celery requires Redis infrastructure. At demo scale, BackgroundTasks 
handles async broadcast cleanly. At scale, Celery + Redis is required.

### Why overwrite communications.status instead of event log
At 5000 rows, direct updates are fast and aggregations are simple.
At scale, append-only event log with async rollup is strictly required
to avoid write contention and deadlocks.

### Why asyncio.Semaphore(50) on broadcast
Prevents socket exhaustion when firing concurrent HTTP requests to stub.
At scale, this is replaced by a proper queue with worker concurrency limits.

### Why Supabase direct queries over ORM
At demo scale, direct Supabase Python client queries are fast to write
and easy to debug. At scale, connection pooling via pgBouncer becomes
critical and an ORM with connection pool management is preferred.
