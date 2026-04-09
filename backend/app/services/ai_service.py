import json
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.preference import Preference
from app.models.restaurant import Restaurant
from app.models.chatbot_message import ChatbotMessage
from app.core.config import OPENAI_API_KEY

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate


def parse_user_query_rule_based(message: str) -> dict:
    message_lower = message.lower()

    filters = {
        "cuisine": None,
        "city": None,
        "keyword": None,
        "price_range": None,
        "dietary": None,
        "occasion": None,
        "ambiance": None,
    }

    cuisines = ["italian", "chinese", "mexican", "indian", "japanese", "american", "french"]
    prices = ["$", "$$", "$$$", "$$$$"]
    dietary_terms = ["vegan", "vegetarian", "halal", "gluten-free", "kosher"]
    ambiance_terms = ["romantic", "casual", "family-friendly", "fine dining"]
    occasion_terms = ["anniversary", "dinner tonight", "date night", "lunch", "dinner"]

    for cuisine in cuisines:
        if cuisine in message_lower:
            filters["cuisine"] = cuisine.title()

    for price in prices:
        if price in message:
            filters["price_range"] = price

    for dietary in dietary_terms:
        if dietary in message_lower:
            filters["dietary"] = dietary

    for ambiance in ambiance_terms:
        if ambiance in message_lower:
            filters["ambiance"] = ambiance

    for occasion in occasion_terms:
        if occasion in message_lower:
            filters["occasion"] = occasion

    if "wifi" in message_lower:
        filters["keyword"] = "wifi"
    elif "outdoor" in message_lower:
        filters["keyword"] = "outdoor"
    elif "quiet" in message_lower:
        filters["keyword"] = "quiet"

    return filters


def parse_user_query_langchain(message: str) -> dict:
    if not OPENAI_API_KEY:
        print("No OPENAI_API_KEY found, using rule-based parsing")
        return parse_user_query_rule_based(message)

    try:
        print("Using LangChain for parsing")

        llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0,
            api_key=OPENAI_API_KEY,
        )

        prompt = ChatPromptTemplate.from_template(
            """
            You are extracting restaurant search filters from a user's message.

            Return ONLY valid JSON.
            Use these exact keys:
            cuisine, city, keyword, price_range, dietary, occasion, ambiance

            Rules:
            - If a field is not mentioned, set it to null
            - Do not add extra keys
            - Keep cuisine, dietary, occasion, ambiance as simple strings
            - price_range should be one of $, $$, $$$, $$$$ when possible

            User message:
            {message}
            """
        )

        chain = prompt | llm
        result = chain.invoke({"message": message})

        print("LangChain raw response:", result.content)

        text = result.content.strip()

        # Handle markdown code block if model returns it
        if text.startswith("```"):
            text = text.replace("```json", "").replace("```", "").strip()

        parsed = json.loads(text)

        print("Parsed filters:", parsed)

        return {
            "cuisine": parsed.get("cuisine"),
            "city": parsed.get("city"),
            "keyword": parsed.get("keyword"),
            "price_range": parsed.get("price_range"),
            "dietary": parsed.get("dietary"),
            "occasion": parsed.get("occasion"),
            "ambiance": parsed.get("ambiance"),
        }

    except Exception as e:
        print("LangChain parsing failed:", e)
        print("Falling back to rule-based parsing")
        return parse_user_query_rule_based(message)


def merge_conversation_context(message: str, conversation_history: list[str] | None) -> dict:
    current_filters = parse_user_query_langchain(message)

    # If user gives a fresh/new request, do NOT carry old cuisine/price automatically
    if any([
        current_filters.get("cuisine"),
        current_filters.get("dietary"),
        current_filters.get("occasion"),
        current_filters.get("ambiance"),
        current_filters.get("keyword"),
        current_filters.get("city"),
        current_filters.get("price_range"),
    ]):
        return current_filters

    # Only use history for vague follow-ups like:
    # "something cheaper", "near me", "more casual"
    combined_filters = {
        "cuisine": None,
        "city": None,
        "keyword": None,
        "price_range": None,
        "dietary": None,
        "occasion": None,
        "ambiance": None,
    }

    history = conversation_history or []
    for msg in history:
        parsed = parse_user_query_langchain(msg)
        for key, value in parsed.items():
            if value:
                combined_filters[key] = value

    return combined_filters

def get_user_preferences(db: Session, user_id: int):
    return db.query(Preference).filter(Preference.user_id == user_id).first()


def search_restaurants(db: Session, filters: dict, preference: Preference | None):
    query = db.query(Restaurant)

    cuisine = filters.get("cuisine")
    city = filters.get("city")
    keyword = filters.get("keyword")
    price_range = filters.get("price_range")
    dietary = filters.get("dietary")
    ambiance = filters.get("ambiance")
    occasion = filters.get("occasion")

    # Cuisine filter
    if cuisine:
        query = query.filter(Restaurant.cuisine_type.ilike(f"%{cuisine}%"))
    elif preference and preference.cuisines and not dietary:
        pref_cuisines = [c.strip() for c in preference.cuisines.split(",") if c.strip()]
        if pref_cuisines:
            query = query.filter(
                or_(*[Restaurant.cuisine_type.ilike(f"%{c}%") for c in pref_cuisines])
            )

    # City filter
    if city:
        query = query.filter(Restaurant.city.ilike(f"%{city}%"))

    # Only apply saved price for vague queries
    if (
        not price_range
        and preference
        and preference.price_range
        and not dietary
        and not ambiance
        and not occasion
        and not keyword
    ):
        price_range = preference.price_range

    if price_range:
        query = query.filter(
            (Restaurant.pricing_tier == price_range) |
            (Restaurant.pricing_tier.is_(None))
        )

    # HARD dietary filter
    if dietary:
        query = query.filter(
            or_(
                Restaurant.description.ilike(f"%{dietary}%"),
                Restaurant.amenities.ilike(f"%{dietary}%"),
                Restaurant.cuisine_type.ilike(f"%{dietary}%"),
                Restaurant.name.ilike(f"%{dietary}%"),
            )
        )

    # Ambiance filter
    if ambiance:
        query = query.filter(
            or_(
                Restaurant.description.ilike(f"%{ambiance}%"),
                Restaurant.amenities.ilike(f"%{ambiance}%"),
            )
        )

    # Occasion filter
    if occasion:
        query = query.filter(
            or_(
                Restaurant.description.ilike(f"%{occasion}%"),
                Restaurant.amenities.ilike(f"%{occasion}%"),
            )
        )

    # Generic keyword filter
    if keyword:
        query = query.filter(
            or_(
                Restaurant.description.ilike(f"%{keyword}%"),
                Restaurant.amenities.ilike(f"%{keyword}%"),
                Restaurant.name.ilike(f"%{keyword}%"),
            )
        )

    results = query.all()

    # Dietary queries should not fall back to unrelated restaurants
    if not results and dietary:
        return []

    # Ambiance fallback
    if not results and ambiance:
        results = (
            db.query(Restaurant)
            .filter(
                or_(
                    Restaurant.description.ilike(f"%{ambiance}%"),
                    Restaurant.amenities.ilike(f"%{ambiance}%"),
                )
            )
            .limit(5)
            .all()
        )

    # Occasion fallback
    if not results and occasion:
        results = (
            db.query(Restaurant)
            .filter(
                or_(
                    Restaurant.description.ilike(f"%{occasion}%"),
                    Restaurant.amenities.ilike(f"%{occasion}%"),
                )
            )
            .limit(5)
            .all()
        )

    # Cuisine fallback
    if not results and cuisine:
        results = (
            db.query(Restaurant)
            .filter(Restaurant.cuisine_type.ilike(f"%{cuisine}%"))
            .limit(5)
            .all()
        )

    # City fallback
    if not results and city:
        results = (
            db.query(Restaurant)
            .filter(Restaurant.city.ilike(f"%{city}%"))
            .limit(5)
            .all()
        )

    # Final fallback only for vague/general requests
    if not results and not dietary:
        results = db.query(Restaurant).limit(5).all()

    return results

def score_restaurant(restaurant, filters: dict, preference: Preference | None) -> tuple[int, str]:
    score = 0
    reasons = []

    cuisine = filters.get("cuisine")
    city = filters.get("city")
    price_range = filters.get("price_range")
    dietary = filters.get("dietary")
    ambiance = filters.get("ambiance")
    occasion = filters.get("occasion")

    restaurant_text = " ".join([
        restaurant.description or "",
        restaurant.amenities or "",
        restaurant.name or "",
        restaurant.cuisine_type or "",
    ]).lower()

    if dietary:
        if dietary.lower() in restaurant_text:
            score += 5
            reasons.append(f"supports {dietary} preferences")
        else:
            return -999, "does not match dietary needs"

    if cuisine and restaurant.cuisine_type and cuisine.lower() in restaurant.cuisine_type.lower():
        score += 3
        reasons.append(f"matches your {cuisine} preference")

    if not cuisine and preference and preference.cuisines and not dietary:
        pref_cuisines = [c.strip().lower() for c in preference.cuisines.split(",") if c.strip()]
        restaurant_cuisine = (restaurant.cuisine_type or "").lower()
        if any(pc in restaurant_cuisine for pc in pref_cuisines):
            score += 2
            reasons.append("matches your saved cuisine preferences")

    if price_range and restaurant.pricing_tier == price_range:
        score += 2
        reasons.append(f"fits your {price_range} budget")
    elif not price_range and preference and preference.price_range and not dietary and restaurant.pricing_tier == preference.price_range:
        score += 1
        reasons.append("fits your saved price range")

    if city and restaurant.city and city.lower() in restaurant.city.lower():
        score += 1
        reasons.append(f"is in {restaurant.city}")

    if ambiance and ambiance.lower() in restaurant_text:
        score += 2
        reasons.append(f"has a {ambiance} atmosphere")

    if occasion and occasion.lower() in restaurant_text:
        score += 2
        reasons.append(f"is suitable for {occasion}")

    if not reasons:
        reasons.append("matches your request")

    return score, ", ".join(reasons)


def build_ranked_recommendations(restaurants, filters: dict, preference: Preference | None):
    ranked = []

    for restaurant in restaurants:
        score, reason = score_restaurant(restaurant, filters, preference)

        # skip hard mismatches
        if score < 0:
            continue

        ranked.append({
            "id": restaurant.id,
            "name": restaurant.name,
            "cuisine_type": restaurant.cuisine_type,
            "city": restaurant.city,
            "pricing_tier": restaurant.pricing_tier,
            "reason": reason,
            "score": score,
        })

    ranked.sort(key=lambda x: x["score"], reverse=True)
    return ranked[:5]


def save_chat_message(db: Session, user_id: int, role: str, message: str):
    chat = ChatbotMessage(
        user_id=user_id,
        role=role,
        message=message,
    )
    db.add(chat)
    db.commit()


def generate_ai_response(message: str, recommendations: list[dict], preference: Preference | None) -> str:
    if not recommendations:
        return "I could not find a strong match right now. Try changing cuisine, budget, or ambiance."

    lines = []
    for idx, item in enumerate(recommendations[:3], start=1):
        lines.append(
            f"{idx}. {item['name']} ({item['pricing_tier'] or 'N/A'}) - {item['reason']}"
        )

    # Check if preferences are actually used
    uses_pref_cuisine = False
    uses_pref_price = False

    if preference:
        for item in recommendations:
            if preference.cuisines and item["cuisine_type"] and preference.cuisines.lower() in item["cuisine_type"].lower():
                uses_pref_cuisine = True
            if preference.price_range and item["pricing_tier"] == preference.price_range:
                uses_pref_price = True

    # Build response
    if uses_pref_cuisine or uses_pref_price:
        pref_parts = []
        if uses_pref_cuisine:
            pref_parts.append(preference.cuisines)
        if uses_pref_price:
            pref_parts.append(preference.price_range)

        pref_text = " and ".join(pref_parts)
        return f"Based on your preferences for {pref_text}, here are some great options: " + " ".join(lines)

    return "Here are some great options for you: " + " ".join(lines)