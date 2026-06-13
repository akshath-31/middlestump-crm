import os
import json
import logging
import google.generativeai as genai
from fastapi import HTTPException

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

FALLBACK_OPPORTUNITIES = [
    {
        "title": "Win Back Lapsed Players",
        "segment_name": "Lapsed Shoppers",
        "priority": "high",
        "estimated_reach": 89,
        "why_it_matters": "89 shoppers haven't ordered in 6+ months representing significant lost revenue",
        "suggested_goal": "Re-engage lapsed shoppers who haven't ordered in over 6 months with a comeback discount",
        "suggested_channel": "whatsapp",
        "estimated_revenue": 18000.0
    },
    {
        "title": "VIP High Value Campaign",
        "segment_name": "High Value Shoppers",
        "priority": "high",
        "estimated_reach": 43,
        "why_it_matters": "Top spenders with LTV over 15000 INR deserve exclusive early access",
        "suggested_goal": "Reward high value shoppers with exclusive early access to new season gear",
        "suggested_channel": "whatsapp",
        "estimated_revenue": 25000.0
    },
    {
        "title": "Save Churning Shoppers",
        "segment_name": "Churn Risk",
        "priority": "high",
        "estimated_reach": 34,
        "why_it_matters": "34 previously active shoppers showing disengagement signals",
        "suggested_goal": "Re-engage churn risk shoppers who were buying regularly but have gone silent",
        "suggested_channel": "sms",
        "estimated_revenue": 12000.0
    },
    {
        "title": "IPL Season Activation",
        "segment_name": "IPL Buyers",
        "priority": "medium",
        "estimated_reach": 112,
        "why_it_matters": "112 shoppers who bought during IPL season are primed for repeat purchase",
        "suggested_goal": "Target IPL season buyers with new season gear recommendations",
        "suggested_channel": "whatsapp",
        "estimated_revenue": 32000.0
    },
    {
        "title": "Convert First Timers",
        "segment_name": "First Timers",
        "priority": "medium",
        "estimated_reach": 51,
        "why_it_matters": "51 shoppers made exactly one purchase and need nurturing into loyal buyers",
        "suggested_goal": "Nudge first time buyers to make their second purchase with a loyalty discount",
        "suggested_channel": "email",
        "estimated_revenue": 9000.0
    },
    {
        "title": "Academy Restock Campaign",
        "segment_name": "Academy Coaches",
        "priority": "medium",
        "estimated_reach": 38,
        "why_it_matters": "Academy coaches are bulk buyers with high order values due for seasonal restock",
        "suggested_goal": "Reach academy coaches with bulk restock offers ahead of tournament season",
        "suggested_channel": "email",
        "estimated_revenue": 45000.0
    }
]

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

    model = genai.GenerativeModel(GEMINI_MODEL)
    
    try:
        response = await model.generate_content_async(prompt, request_options={"timeout": 30})
        return parse_json_response(response.text)
    except (json.JSONDecodeError, ValueError) as e:
        logger.warning(f"First Gemini call failed JSON parse. Retrying: {e}")
        retry_prompt = prompt + "\n\nYour previous response was not valid JSON. Respond with valid JSON only."
        try:
            response = await model.generate_content_async(retry_prompt, request_options={"timeout": 30})
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
    model = genai.GenerativeModel(GEMINI_MODEL)
    try:
        response = await model.generate_content_async(prompt, request_options={"timeout": 30})
        return response.text.strip()
    except Exception as e:
        logger.error(f"Gemini summary call failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate summary")

async def generate_opportunities(context: dict) -> list:
    prompt = f"""You are the AI marketing strategist for MiddleStump, a D2C cricket equipment brand in India.
Analyze the business context provided and identify exactly 6 campaign opportunities.
Each opportunity must be specific, actionable, and justified by the data.
Always respond in valid JSON only. No markdown. No explanation outside JSON.

Current Business Context:
{json.dumps(context, indent=2)}

Identify exactly 6 campaign opportunities right now for this cricket brand.
Respond with exactly this JSON structure — an array of exactly 6 objects:
[
  {{
    "title": "string - short punchy opportunity name e.g. Win Back Lapsed Club Players",
    "segment_name": "string - human readable segment e.g. Lapsed Club Players",
    "priority": "high or medium or low",
    "estimated_reach": int,
    "why_it_matters": "string - one sentence on business impact",
    "suggested_goal": "string - the exact goal text to pre-fill in the campaign chat e.g. Re-engage lapsed club players who havent ordered in 6 months with a pre-season discount",
    "suggested_channel": "whatsapp or sms or email",
    "estimated_revenue": float
  }}
]

Rules:
- Return exactly 6 opportunities, no more no less
- Each opportunity must target a different segment
- Priority must reflect actual business urgency based on the context data
- estimated_reach must be realistic based on segment_health counts in the context
- suggested_goal must be a complete natural language sentence ready to paste into a campaign chat
- All monetary values in INR
"""
    model = genai.GenerativeModel(GEMINI_MODEL)
    try:
        response = await model.generate_content_async(prompt, request_options={"timeout": 30})
        data = parse_json_response(response.text)
        if isinstance(data, list) and len(data) == 6:
            return data
        else:
            raise ValueError("Response was not an array of 6 opportunities")
    except (json.JSONDecodeError, ValueError) as e:
        logger.warning(f"First Gemini opportunities call failed. Retrying: {e}")
        retry_prompt = prompt + "\n\nYour previous response was not valid JSON or didn't contain exactly 6 items. Respond with valid JSON array of exactly 6 objects only."
        try:
            response = await model.generate_content_async(retry_prompt, request_options={"timeout": 30})
            data = parse_json_response(response.text)
            if isinstance(data, list) and len(data) == 6:
                return data
            else:
                raise ValueError("Response was not an array of 6 opportunities")
        except Exception as e2:
            logger.error(f"Second Gemini opportunities call failed: {e2}. Using fallback.")
            return FALLBACK_OPPORTUNITIES
    except Exception as e:
        logger.error(f"Gemini opportunities call failed: {e}. Using fallback.")
        return FALLBACK_OPPORTUNITIES
