import os
import json
import logging
import asyncio
import google.generativeai as genai
from fastapi import HTTPException

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

async def call_gemini_with_fallback(prompt, generation_config=None, request_options=None):
    keys = [os.getenv("GEMINI_API_KEY"), os.getenv("GEMINI_API_KEY_BACKUP")]
    keys = [k for k in keys if k]
    last_error = None
    for key in keys:
        try:
            genai.configure(api_key=key)
            model = genai.GenerativeModel(os.getenv("GEMINI_MODEL", "gemini-2.5-flash"))
            # We use asyncio.to_thread with the synchronous generate_content
            response = await asyncio.to_thread(
                model.generate_content,
                prompt,
                generation_config=generation_config,
                request_options=request_options
            )
            return response
        except Exception as e:
            if "429" in str(e) or "quota" in str(e).lower():
                logger.warning(f"Gemini key ending ...{key[-4:] if key else ''} hit quota, trying next")
                last_error = e
                continue
            raise e
    raise last_error

FALLBACK_OPPORTUNITIES = [
    {
        "title": "Win Back VIPs",
        "segment_name": "Lapsed High Value",
        "priority": "high",
        "estimated_reach": 150,
        "why_it_matters": "They spend big but haven't bought in 6+ months",
        "suggested_goal": "Re-engage lapsed high value shoppers",
        "suggested_channel": "whatsapp",
        "estimated_revenue": 150000
    },
    {
        "title": "IPL Pre-Season Push",
        "segment_name": "IPL Season Buyers",
        "priority": "medium",
        "estimated_reach": 850,
        "why_it_matters": "Capitalize on upcoming cricket season hype",
        "suggested_goal": "Target previous IPL buyers with new gear",
        "suggested_channel": "email",
        "estimated_revenue": 200000
    },
    {
        "title": "Upgrade First Timers",
        "segment_name": "First Timers",
        "priority": "medium",
        "estimated_reach": 400,
        "why_it_matters": "Drive second purchase to build loyalty",
        "suggested_goal": "Cross-sell to recent first time buyers",
        "suggested_channel": "sms",
        "estimated_revenue": 80000
    },
    {
        "title": "Coach Bulk Deals",
        "segment_name": "Academy Coaches",
        "priority": "high",
        "estimated_reach": 45,
        "why_it_matters": "High volume, recurring revenue potential",
        "suggested_goal": "Offer bulk discounts to academy coaches",
        "suggested_channel": "whatsapp",
        "estimated_revenue": 300000
    },
    {
        "title": "Save At-Risk Shoppers",
        "segment_name": "Churn Risk",
        "priority": "high",
        "estimated_reach": 300,
        "why_it_matters": "Prevent loss of previously active customers",
        "suggested_goal": "Send win-back offers to churn risk segment",
        "suggested_channel": "email",
        "estimated_revenue": 100000
    },
    {
        "title": "Gifter Re-engagement",
        "segment_name": "Gift Buyers",
        "priority": "low",
        "estimated_reach": 120,
        "why_it_matters": "Target seasonal gifting occasions",
        "suggested_goal": "Remind past gift buyers of new arrivals",
        "suggested_channel": "email",
        "estimated_revenue": 45000
    }
]

import re

async def generate_opportunities(context: dict) -> list:
    context_summary = f"""
Total shoppers: {context.get('total_shoppers', 0)}
Lapsed 6m: {context.get('segment_sizes', {}).get('lapsed_6m', 0)}
High value: {context.get('segment_sizes', {}).get('high_value', 0)}
Churn risk: {context.get('segment_sizes', {}).get('churn_risk', 0)}
IPL buyers: {context.get('segment_sizes', {}).get('ipl_buyers', 0)}
First timers: {context.get('segment_sizes', {}).get('first_timers', 0)}
Academy coaches: {context.get('segment_sizes', {}).get('academy_coaches', 0)}
Revenue trend: {context.get('revenue', {}).get('trend', 'stable')}
"""
    prompt = f"""You are a cricket brand CRM strategist. Given these shopper segments, identify 6 DIFFERENT campaign opportunities. Vary your selection each time — consider different angles like urgency, seasonality, channel mix, and segment combinations. Return a raw JSON array. No markdown. No backticks. Start with [ and end with ].

Segments:
{context_summary}

Each object must have: title (max 5 words), segment_name, priority (high/medium/low), estimated_reach (int), why_it_matters (max 12 words), suggested_goal (one sentence), suggested_channel (whatsapp/sms/email), estimated_revenue (float).
Be brief. Keep all text short. Be creative and vary the framing each time."""

    generation_config = genai.types.GenerationConfig(max_output_tokens=600, temperature=0.9)

    try:
        response = await call_gemini_with_fallback(prompt, generation_config)
        raw = response.text.strip()
        raw = re.sub(r'^```json\s*|^```\s*|```$', '', raw, flags=re.MULTILINE).strip()
        result = json.loads(raw)
        if isinstance(result, list) and len(result) > 0:
            return result
        raise ValueError("Empty or invalid response")
    except Exception as e:
        logger.error(f"Opportunities generation failed: {e}")
        return FALLBACK_OPPORTUNITIES

async def process_campaign_goal(goal: str, context: dict) -> dict:
    prompt = f"""You are the AI marketing strategist for MiddleStump, a D2C cricket equipment brand in India.
You think like a senior marketing manager. When given a business goal, you analyze real business
data and make specific, justified recommendations.

Every recommendation you make must follow this exact structure:
1. Opportunity: What specific opportunity exists in the data right now
2. Why it matters: The business impact of acting on this opportunity
3. Recommended action: Exactly who to target, what to say, which channel
4. Predicted outcome: Specific numbers — open rate, clicks, conversions, revenue

You may only target shoppers using these segment identifiers:
- Tags: lapsed, high_value, churn_risk, ipl_buyer, first_timer, bulk_buyer, gifter
- Shopper types: club_player, school_player, academy_coach, recreational, gifter
- Filters: min_spend (INR), min_days_since_order, max_days_since_order

Always respond in valid JSON only. No markdown. No explanation outside JSON.
PREDICTION RULES — YOU MUST FOLLOW THESE EXACTLY. NO EXCEPTIONS.

You are predicting campaign performance for an Indian D2C cricket brand.
These are hard ceilings. Never exceed them under any circumstance:

WhatsApp: open rate 40-55%, click rate 15-25%
SMS: open rate 30-45%, click rate 10-18%
Email: open rate 20-35%, click rate 8-15%

predicted_open_rate must be a decimal between 0 and 1. Example: 0.42 not 42.
predicted_click_rate must be a decimal between 0 and 1. Example: 0.18 not 18.
predicted_conversions must be between 1 and 10% of the segment size. Never more.
predicted_revenue = predicted_conversions multiplied by average order value of 3500 INR.

If you return any open rate above 0.55 or any click rate above 0.25 your response is wrong.
Double check your prediction numbers before responding.

User message format:
Business Goal: {goal}

Current Business Context:
{json.dumps(context, indent=2)}

Respond with exactly this JSON structure:
{{
    "campaign_name": "string",
    "target_segment_name": "string - human readable e.g. Lapsed High Value Players",
    "opportunity": "string - what opportunity exists in the data",
    "why_it_matters": "string - business impact",
    "segment": {{
        "filter_tags": [],
        "shopper_types": [],
        "min_spend": null,
        "min_days_since_order": null,
        "max_days_since_order": null
    }},
    "reasoning": "string - 2-3 sentences justifying this segment choice using the context data",
    "message_template": "string - use {{name}}, {{last_product}}, {{days_since_order}} as variables. Conversational, cricket-specific, max 160 chars for SMS compatibility",
    "channel": "whatsapp or sms or email",
    "channel_reasoning": "string",
    "predicted_open_rate": float,
    "predicted_click_rate": float,
    "predicted_conversions": int,
    "predicted_revenue": float,
    "follow_up_suggestion": "string"
}}"""

    try:
        response = await call_gemini_with_fallback(prompt, request_options={"timeout": 30})
        return parse_json_response(response.text)
    except (json.JSONDecodeError, ValueError) as e:
        logger.warning(f"First Gemini call failed JSON parse. Retrying: {e}")
        retry_prompt = prompt + "\n\nYour previous response was not valid JSON. Respond with valid JSON only."
        try:
            response = await call_gemini_with_fallback(retry_prompt, request_options={"timeout": 30})
            return parse_json_response(response.text)
        except Exception as e2:
            logger.error(f"Second Gemini call failed: {e2}")
            raise HTTPException(status_code=500, detail="AI failed to return valid JSON.")
    except Exception as e:
        logger.error(f"Gemini call failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def parse_json_response(text: str) -> dict:
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return json.loads(text.strip())

async def generate_campaign_summary(campaign: dict, actual_stats: dict) -> str:
    prompt = f"""You are the AI marketing strategist for MiddleStump.
Original Goal: {campaign.get('goal')}
Predicted Stats: 
- Open Rate: {campaign.get('predicted_open_rate')}
- Click Rate: {campaign.get('predicted_click_rate')}
- Conversions: {campaign.get('predicted_conversions')}

Actual Stats:
{json.dumps(actual_stats, indent=2)}

Write a plain English paragraph (3-4 sentences) that:
1. States whether the campaign met, exceeded, or missed predictions
2. Highlights the most interesting metric
3. Suggests one specific follow-up action based on results.
"""
    try:
        response = await call_gemini_with_fallback(prompt, request_options={"timeout": 30})
        return response.text.strip()
    except Exception as e:
        logger.error(f"Gemini summary call failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate summary")
