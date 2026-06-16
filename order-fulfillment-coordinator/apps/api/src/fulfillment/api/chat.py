from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from fulfillment.api.deps import get_current_user, get_db
from fulfillment.models.order import Order, OrderStatus
from fulfillment.schemas.order import OrderCreate, OrderRead
from fulfillment.services.order_service import OrderService

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatMessage(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str
    action: str | None = None
    data: dict | None = None


def extract_email(text: str) -> str | None:
    match = re.search(r"[\w.+-]+@[\w-]+\.[\w.]+", text)
    return match.group(0) if match else None


def extract_phone(text: str) -> str | None:
    match = re.search(r"[\d\-\+\(\) ]{7,15}", text)
    return match.group(0).strip() if match else None


def extract_zip(text: str) -> str | None:
    match = re.search(r"\b\d{5,6}\b", text)
    return match.group(0) if match else None


def extract_weight(text: str) -> float | None:
    match = re.search(r"(\d+(?:\.\d+)?)\s*(?:kg|kilo|kilogram)", text, re.IGNORECASE)
    return float(match.group(1)) if match else None


STATES_MAP = {
    "sindh": "Sindh",
    "punjab": "Punjab",
    "kpk": "KPK",
    "khyber": "KPK",
    "balochistan": "Balochistan",
    "islamabad": "Islamabad",
    "ny": "NY",
    "new york": "NY",
    "california": "CA",
    "ca": "CA",
    "texas": "TX",
    "tx": "TX",
    "florida": "FL",
    "fl": "FL",
    "illinois": "IL",
    "il": "IL",
    "pennsylvania": "PA",
    "pa": "PA",
    "ohio": "OH",
    "oh": "OH",
    "georgia": "GA",
    "ga": "GA",
    "north carolina": "NC",
    "nc": "NC",
    "michigan": "MI",
    "mi": "MI",
    "new jersey": "NJ",
    "nj": "NJ",
    "virginia": "VA",
    "va": "VA",
    "washington": "WA",
    "wa": "WA",
    "arizona": "AZ",
    "az": "AZ",
    "massachusetts": "MA",
    "ma": "MA",
    "tennessee": "TN",
    "tn": "TN",
    "indiana": "IN",
    "in": "IN",
    "maryland": "MD",
    "md": "MD",
    "missouri": "MO",
    "mo": "MO",
    "wisconsin": "WI",
    "wi": "WI",
    "colorado": "CO",
    "co": "CO",
    "minnesota": "MN",
    "mn": "MN",
    "south carolina": "SC",
    "sc": "SC",
    "alabama": "AL",
    "al": "AL",
    "louisiana": "LA",
    "la": "LA",
    "kentucky": "KY",
    "ky": "KY",
    "oregon": "OR",
    "or": "OR",
    "oklahoma": "OK",
    "ok": "OK",
    "connecticut": "CT",
    "ct": "CT",
    "utah": "UT",
    "ut": "UT",
    "iowa": "IA",
    "ia": "IA",
    "nevada": "NV",
    "nv": "NV",
    "arkansas": "AR",
    "ar": "AR",
    "mississippi": "MS",
    "ms": "MS",
    "kansas": "KS",
    "ks": "KS",
    "new mexico": "NM",
    "nm": "NM",
    "nebraska": "NE",
    "ne": "NE",
    "idaho": "ID",
    "id": "ID",
    "west virginia": "WV",
    "wv": "WV",
    "hawaii": "HI",
    "hi": "HI",
    "new hampshire": "NH",
    "nh": "NH",
    "maine": "ME",
    "me": "ME",
    "montana": "MT",
    "mt": "MT",
    "rhode island": "RI",
    "ri": "RI",
    "delaware": "DE",
    "de": "DE",
    "south dakota": "SD",
    "sd": "SD",
    "north dakota": "ND",
    "nd": "ND",
    "alaska": "AK",
    "ak": "AK",
    "vermont": "VT",
    "vt": "VT",
    "wyoming": "WY",
    "wy": "WY",
    "guam": "GU",
    "puerto rico": "PR",
    "pr": "PR",
}


def extract_state(text: str) -> str | None:
    lower = text.lower()
    for key, value in sorted(STATES_MAP.items(), key=lambda x: -len(x[0])):
        if len(key) <= 2:
            if re.search(rf"\b{key}\b", lower):
                return value
        elif key in lower:
            return value
    return None


def extract_address(text: str, city: str | None = None) -> str | None:
    patterns = [
        r"(?:address|located at|at|ship to|deliver to|send to)[:\s]+(.+?)(?:\.|,|\n|$)",
        r"(?:\d+\s+(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln|court|ct|way|place|pl|circle|cir)\s+(?:#?\s*\d+[a-z]*)?)",
        r"(?:house\s*\d+|h\s*#\s*\d+|plot\s*\d+|house\s*no\.?\s*\d+)[^.!?\n]*",
        r"(?:ship to|deliver to|send to)\s+(.+?)(?:,|\n|$)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            addr = match.group(0).strip()
            addr = re.sub(r"^(?:address|located at|at|ship to|deliver to|send to)[:\s]+", "", addr, flags=re.IGNORECASE)
            return addr.strip()
    return None


CITY_KEYWORDS = ["karachi", "lahore", "islamabad", "rawalpindi", "faisalabad", "multan", "hyderabad", "gujranwala", "peshawar", "quetta", "sialkot", "bahawalpur", "sargodha", "sukkur", "larkana", "sheikhupura", "mirpur", "muzaffarabad", "gujrat", "mardan", "sahiwal", "new york", "los angeles", "chicago", "houston", "phoenix", "san antonio", "san diego", "dallas", "san jose", "austin", "jacksonville", "fort worth", "columbus", "charlotte", "indianapolis", "san francisco", "seattle", "denver", "nashville", "oklahoma city", "el paso", "washington", "boston", "las vegas", "portland", "memphis", "louisville", "baltimore", "milwaukee", "albuquerque", "tucson", "fresno", "sacramento", "mesa", "kansas city", "atlanta", "omaha", "colorado springs", "raleigh", "long beach", "virginia beach", "miami", "oakland", "minneapolis", "tampa", "tulsa", "arlington", "new orleans"]

def extract_city(text: str) -> str | None:
    lower = text.lower()
    for kw in CITY_KEYWORDS:
        if kw in lower:
            return kw.title()
    patterns = [
        r"(?:city|town|in|from|to|mein|main|ma)[:\s]+([A-Za-z\s]+?)(?:\.|,|\n|$)",
        r"(?:ship to|deliver to|send to|address)[:\s]+[^,]+,\s*([A-Za-z\s]+?)(?:\s*,|\s*\d{5,6})",
        r"(?:ship to|deliver to|send to)\s+[^,]+,\s*[^,]+,\s*([A-Za-z\s]+?)(?:\s*,|\s*\d{5,6})",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            city = match.group(1).strip()
            if 2 < len(city) < 50:
                return city.title()
    return None


def extract_notes(text: str) -> str | None:
    patterns = [
        r"(?:note|instruction|remark|special|important|fragile|urgent|please)[:\s]+(.+?)(?:\.|!|\n|$)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    return None


def detect_intent(text: str) -> str:
    lower = text.lower()
    create_keywords = ["create order", "place order", "new order", "make order", "add order", "order karo", "order place", "bhejo", "ship", "send package", "order banao", "banao"]
    list_keywords = ["list orders", "show orders", "all orders", "my orders", "orders dikhao", "orders list", "get orders"]
    status_keywords = ["status", "track", "where is", "kahan hai", "update", "tracking"]
    help_keywords = ["help", "what can you do", "kya kar sakte", "commands", "options"]

    for kw in create_keywords:
        if kw in lower:
            return "create_order"
    for kw in list_keywords:
        if kw in lower:
            return "list_orders"
    for kw in status_keywords:
        if kw in lower:
            return "check_status"
    for kw in help_keywords:
        if kw in lower:
            return "help"
    return "create_order"


@router.post("/", response_model=ChatResponse)
async def chat(
    body: ChatMessage,
    db: AsyncSession = Depends(get_db),
    _user: dict[str, str] = Depends(get_current_user),
) -> ChatResponse:
    message = body.message.strip()
    intent = detect_intent(message)
    service = OrderService(db)

    if intent == "help":
        return ChatResponse(
            reply=(
                "Mujhe yeh commands samajh aate hain:\n\n"
                "**Create Order** - Example: \"Create order for ahmed@gmail.com, ship to House 5, Karachi, Sindh 75300, weight 2kg\"\n"
                "**List Orders** - Example: \"Show all orders\" or \"List orders\"\n"
                "**Check Status** - Example: \"What is the status of my orders?\"\n\n"
                "Aap naturally baat kar sakte hain, main order details khud samajh jaunga!"
            ),
            action="help",
        )

    if intent == "list_orders":
        orders = await service.list_orders(skip=0, limit=10)
        total = await service.count_orders()
        if not orders:
            return ChatResponse(
                reply="Abhi koi orders nahi hain. Naya order create karne ke liye bolna jaise: \"Create order for test@email.com, ship to New York, NY 10001\"",
                action="list_orders",
                data={"orders": [], "total": 0},
            )
        order_list = "\n".join(
            f"- **#{o.id[:8]}** | {o.customer_email} | {o.shipping_city}, {o.shipping_state} | {o.status}"
            for o in orders[:5]
        )
        return ChatResponse(
            reply=f"Yeh rahahe tumhare **{total} orders**:\n\n{order_list}\n\nAur details ke liye kisi specific order ka status poochho.",
            action="list_orders",
            data={"total": total, "orders": [OrderRead.model_validate(o).model_dump(mode="json") for o in orders[:5]]},
        )

    if intent == "check_status":
        orders = await service.list_orders(skip=0, limit=5)
        if not orders:
            return ChatResponse(
                reply="Abhi koi orders nahi hain. Pehle order create karo!",
                action="check_status",
            )
        order_list = "\n".join(
            f"- **#{o.id[:8]}** | {o.customer_email} | Status: **{o.status}**"
            for o in orders
        )
        return ChatResponse(
            reply=f"Yeh rahahe tumhare recent orders ka status:\n\n{order_list}",
            action="check_status",
        )

    email = extract_email(message)
    if not email:
        return ChatResponse(
            reply=(
                "Mujhe order create karna hai, lekin **email** missing hai. "
                "Dobara try karo jaise:\n\n"
                "\"Create order for **ahmed@gmail.com**, ship to House 5, Street 2, Karachi, Sindh 75300, weight 2kg\""
            ),
            action="create_order",
        )

    zip_code = extract_zip(message)
    city = extract_city(message)
    state = extract_state(message)
    phone = extract_phone(message)
    weight = extract_weight(message)
    notes = extract_notes(message)
    address = extract_address(message) or f"Main Street, {city or 'Karleton'}, {state or 'Punjab'} {zip_code or '54000'}"

    if not city:
        city = "Karleton"
    if not state:
        state = "Punjab"
    if not zip_code:
        zip_code = "54000"
    if not address:
        address = f"Main Street, {city}, {state} {zip_code}"

    payload = OrderCreate(
        customer_email=email,
        customer_phone=phone,
        shipping_address=address,
        shipping_zip=zip_code,
        shipping_city=city,
        shipping_state=state,
        shipping_country="US",
        total_weight_kg=weight or 1.0,
        notes=notes,
    )

    order = await service.create_order(payload)

    return ChatResponse(
        reply=(
            f"Order successfully create ho gaya!\n\n"
            f"- **Order ID:** #{order.id[:8]}\n"
            f"- **Customer:** {order.customer_email}\n"
            f"- **Ship to:** {order.shipping_address}, {order.shipping_city}, {order.shipping_state} {order.shipping_zip}\n"
            f"- **Weight:** {order.total_weight_kg} kg\n"
            f"- **Status:** {order.status}\n\n"
            f"Ab order automatically route aur ship ho jayega!"
        ),
        action="create_order_created",
        data=OrderRead.model_validate(order).model_dump(mode="json"),
    )
