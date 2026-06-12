import logging
from datetime import date, timedelta
from database import supabase

logger = logging.getLogger(__name__)

async def get_business_context() -> dict:
    try:
        shoppers_res = supabase.table("shoppers").select("id", count="exact").execute()
        total_shoppers = shoppers_res.count or 0

        all_shoppers = supabase.table("shoppers").select("*").execute().data

        today = date.today()
        six_months_ago = today - timedelta(days=180)

        lapsed_6m = 0
        high_value = 0
        churn_risk = 0
        ipl_buyers = 0
        first_timers = 0
        academy_coaches = 0
        lapsed_high_value = 0

        for s in all_shoppers:
            is_lapsed = False
            if s.get("last_order_date"):
                last_d = date.fromisoformat(s["last_order_date"])
                if last_d < six_months_ago:
                    is_lapsed = True
                    lapsed_6m += 1

            is_high_value = False
            if float(s.get("total_spend") or 0) > 15000:
                is_high_value = True
                high_value += 1

            if is_lapsed and is_high_value:
                lapsed_high_value += 1

            tags = s.get("tags", [])
            if "churn_risk" in tags:
                churn_risk += 1
            if "ipl_buyer" in tags:
                ipl_buyers += 1
            if "first_timer" in tags:
                first_timers += 1

            if s.get("shopper_type") == "academy_coach":
                academy_coaches += 1

        thirty_days_ago = today - timedelta(days=30)
        sixty_days_ago = today - timedelta(days=60)

        orders_res = supabase.table("orders").select("order_date, total_amount").gte("order_date", sixty_days_ago.isoformat()).execute().data
        
        last_30 = 0.0
        prev_30 = 0.0
        for o in orders_res:
            odate = date.fromisoformat(o["order_date"])
            amt = float(o["total_amount"])
            if odate >= thirty_days_ago:
                last_30 += amt
            else:
                prev_30 += amt

        if prev_30 == 0:
            change_percent = 100.0 if last_30 > 0 else 0.0
        else:
            change_percent = ((last_30 - prev_30) / prev_30) * 100

        if last_30 > prev_30:
            trend = "up"
        elif last_30 < prev_30:
            trend = "down"
        else:
            trend = "flat"

        items_res = supabase.table("order_items").select("category").execute().data
        cat_counts = {}
        for item in items_res:
            c = item.get("category")
            if c:
                cat_counts[c] = cat_counts.get(c, 0) + 1
        
        top_categories = [k for k, v in sorted(cat_counts.items(), key=lambda x: x[1], reverse=True)[:3]]

        campaigns_res = supabase.table("campaigns").select("name, predicted_open_rate, predicted_click_rate, predicted_conversions").order("created_at", desc=True).limit(3).execute().data
        recent_campaigns = []
        for c in campaigns_res:
            recent_campaigns.append({
                "name": c.get("name"),
                "open_rate": c.get("predicted_open_rate"),
                "click_rate": c.get("predicted_click_rate"),
                "conversions": c.get("predicted_conversions")
            })

        channel_counts = {}
        orders_all = supabase.table("orders").select("channel").execute().data
        for o in orders_all:
            ch = o.get("channel")
            if ch:
                channel_counts[ch] = channel_counts.get(ch, 0) + 1
        best_performing_channel = max(channel_counts.items(), key=lambda x: x[1])[0] if channel_counts else "whatsapp"

        total_campaigns = supabase.table("campaigns").select("id", count="exact").execute().count or 0

        return {
            "total_shoppers": total_shoppers,
            "segment_health": {
                "lapsed_6m": lapsed_6m,
                "high_value": high_value,
                "churn_risk": churn_risk,
                "ipl_buyers": ipl_buyers,
                "first_timers": first_timers,
                "academy_coaches": academy_coaches,
                "lapsed_high_value": lapsed_high_value
            },
            "revenue": {
                "last_30_days": last_30,
                "prev_30_days": prev_30,
                "trend": trend,
                "change_percent": round(change_percent, 2)
            },
            "top_categories": top_categories,
            "recent_campaigns": recent_campaigns,
            "best_performing_channel": best_performing_channel,
            "total_campaigns_fired": total_campaigns
        }
    except Exception as e:
        logger.error(f"Error getting business context: {e}")
        raise
