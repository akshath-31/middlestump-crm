import os
import uuid
import random
from datetime import datetime, timedelta, date
from faker import Faker
from supabase import create_client, Client

fake = Faker('en_IN')

from dotenv import load_dotenv

load_dotenv()

URL = os.getenv("SUPABASE_URL", "")
KEY = os.getenv("SUPABASE_KEY", "")

supabase: Client = create_client(URL, KEY)

PRODUCTS = [
    {"name": "SG Cobra Classic", "category": "bat", "price": 2499},
    {"name": "SS Ton Elite", "category": "bat", "price": 3999},
    {"name": "MRF Genius Grand", "category": "bat", "price": 5499},
    {"name": "BDM Maestro", "category": "bat", "price": 1799},
    {"name": "Cosco Drive", "category": "bat", "price": 1299},
    {"name": "SG Test Batting Pads", "category": "pads", "price": 1299},
    {"name": "GM Original LE Pads", "category": "pads", "price": 2799},
    {"name": "Spartan Pro Guard Pads", "category": "pads", "price": 1599},
    {"name": "SG Aerotek Helmet", "category": "helmet", "price": 1999},
    {"name": "Masuri Vision Helmet", "category": "helmet", "price": 4499},
    {"name": "SS Dragon Helmet", "category": "helmet", "price": 2299},
    {"name": "SG Test Batting Gloves", "category": "gloves", "price": 899},
    {"name": "GM Purist Gloves", "category": "gloves", "price": 1499},
    {"name": "Adidas CricUp Shoes", "category": "shoes", "price": 3499},
    {"name": "Puma 22 FH Rubber Shoes", "category": "shoes", "price": 2999},
    {"name": "MiddleStump Match Jersey", "category": "apparel", "price": 799},
    {"name": "MiddleStump Training Tee", "category": "apparel", "price": 499},
    {"name": "MiddleStump Compression Tights", "category": "apparel", "price": 699},
    {"name": "SG Bat Grip (Pack of 3)", "category": "accessories", "price": 199},
    {"name": "Cricket Kit Bag - Club", "category": "accessories", "price": 2199},
    {"name": "Batting Tape Roll", "category": "accessories", "price": 99},
    {"name": "Thigh Guard Pro", "category": "accessories", "price": 599},
]

CITIES = ["Chennai", "Mumbai", "Delhi", "Bangalore", "Kolkata", "Hyderabad", "Pune", "Ahmedabad"]
TODAY = date.today()

def random_date_in_range(start_days_ago, end_days_ago):
    days_ago = random.randint(start_days_ago, end_days_ago)
    return TODAY - timedelta(days=days_ago)

def get_product(category=None):
    if category:
        prods = [p for p in PRODUCTS if p['category'] == category]
        return random.choice(prods) if prods else random.choice(PRODUCTS)
    return random.choice(PRODUCTS)

def generate_data():
    while True:
        shoppers = []
        orders = []
        order_items = []
        
        counts = {
            "club_player": 100,
            "school_player": 70,
            "academy_coach": 40,
            "recreational": 60,
            "gifter": 30
        }
        
        club_player_lapsed = 0
        recreational_1_order = 0
        
        for s_type, count in counts.items():
            for _ in range(count):
                s_id = str(uuid.uuid4())
                name = fake.name()
                phone = fake.phone_number()
                email = fake.email()
                city = random.choice(CITIES)
                
                if s_type == "club_player":
                    age_group = random.choice(["18_25", "26_35"])
                    preferred_channel = "whatsapp"
                    num_orders = random.randint(4, 8)
                    if club_player_lapsed < 45: # force exactly 45 to be lapsed
                        lapsed = True
                        club_player_lapsed += 1
                    else:
                        lapsed = False
                elif s_type == "school_player":
                    age_group = "under_18"
                    preferred_channel = random.choice(["whatsapp", "sms"])
                    num_orders = random.randint(2, 4)
                    lapsed = False
                elif s_type == "academy_coach":
                    age_group = random.choice(["26_35", "36_50"])
                    preferred_channel = random.choice(["email", "whatsapp"])
                    num_orders = random.randint(10, 14) 
                    lapsed = False
                elif s_type == "recreational":
                    age_group = random.choice(["26_35", "36_50", "50_plus"])
                    preferred_channel = random.choice(["sms", "whatsapp"])
                    if recreational_1_order < 55:
                        num_orders = 1
                        recreational_1_order += 1
                    else:
                        num_orders = random.randint(2, 3)
                    lapsed = random.random() < 0.7 
                elif s_type == "gifter":
                    age_group = random.choice(["26_35", "36_50"])
                    preferred_channel = "email"
                    num_orders = 1 if random.random() < 0.8 else 2
                    lapsed = True
                    
                shopper_orders = []
                total_spend = 0
                
                for o_idx in range(num_orders):
                    o_id = str(uuid.uuid4())
                    
                    ipl_season = False
                    if s_type == "club_player":
                        if lapsed:
                            # ALL orders must be > 185 days ago
                            if random.random() < 0.4:
                                # old ipl season
                                o_date = random_date_in_range(390, 450)
                                ipl_season = True
                            else:
                                o_date = random_date_in_range(185, 540)
                        else:
                            if random.random() < 0.4:
                                o_date = random_date_in_range(30, 90)
                                if o_date.month in [3, 4, 5]:
                                    ipl_season = True
                            else:
                                o_date = random_date_in_range(1, 90)
                    elif s_type == "school_player":
                        if random.random() < 0.5:
                            o_date = random_date_in_range(30, 60)
                        else:
                            o_date = random_date_in_range(200, 230)
                    elif s_type == "academy_coach":
                        if random.random() < 0.5:
                            o_date = random_date_in_range(30, 90)
                        else:
                            o_date = random_date_in_range(200, 230)
                    elif s_type == "recreational":
                        if lapsed:
                            o_date = random_date_in_range(185, 540)
                        else:
                            o_date = random_date_in_range(1, 180)
                    elif s_type == "gifter":
                        if random.random() < 0.5:
                            o_date = TODAY - timedelta(days=random.randint(180, 240))
                        else:
                            o_date = TODAY - timedelta(days=random.randint(360, 420))
                    
                    o_total = 0
                    o_items = []
                    
                    if s_type == "club_player":
                        for _ in range(random.randint(1, 2)):
                            cat = random.choice(["bat", "pads", "accessories"])
                            p = get_product(cat)
                            qty = 1
                            price = p['price']
                            o_total += price * qty
                            o_items.append({"id": str(uuid.uuid4()), "order_id": o_id, "product_name": p['name'], "category": p['category'], "price": price, "quantity": qty})
                    elif s_type == "school_player":
                        cats = ["bat", "pads", "gloves"]
                        for cat in cats:
                            p = get_product(cat)
                            qty = 1
                            price = p['price']
                            o_total += price * qty
                            o_items.append({"id": str(uuid.uuid4()), "order_id": o_id, "product_name": p['name'], "category": p['category'], "price": price, "quantity": qty})
                    elif s_type == "academy_coach":
                        for _ in range(random.randint(4, 10)):
                            p = get_product()
                            qty = random.randint(2, 5)
                            price = p['price']
                            o_total += price * qty
                            o_items.append({"id": str(uuid.uuid4()), "order_id": o_id, "product_name": p['name'], "category": p['category'], "price": price, "quantity": qty})
                    elif s_type == "recreational":
                        p = get_product(random.choice(["accessories", "apparel"]))
                        qty = 1
                        price = p['price']
                        o_total += price * qty
                        o_items.append({"id": str(uuid.uuid4()), "order_id": o_id, "product_name": p['name'], "category": p['category'], "price": price, "quantity": qty})
                    elif s_type == "gifter":
                        for _ in range(random.randint(1, 2)):
                            p = get_product()
                            qty = 1
                            price = p['price']
                            o_total += price * qty
                            o_items.append({"id": str(uuid.uuid4()), "order_id": o_id, "product_name": p['name'], "category": p['category'], "price": price, "quantity": qty})
                            
                    orders.append({
                        "id": o_id,
                        "shopper_id": s_id,
                        "order_date": o_date.isoformat(),
                        "total_amount": float(o_total),
                        "channel": "online",
                        "ipl_season": ipl_season
                    })
                    order_items.extend(o_items)
                    shopper_orders.append(o_date)
                    total_spend += o_total
                
                last_order_date = max(shopper_orders) if shopper_orders else None
                first_order_date = min(shopper_orders) if shopper_orders else None
                
                tags = []
                if last_order_date and (TODAY - last_order_date).days > 180:
                    tags.append("lapsed")
                if total_spend > 15000:
                    tags.append("high_value")
                
                ipl_buyer = any(o['ipl_season'] for o in orders if o['shopper_id'] == s_id)
                if ipl_buyer:
                    tags.append("ipl_buyer")
                    
                if num_orders == 1:
                    tags.append("first_timer")
                if num_orders >= 3 and last_order_date and (TODAY - last_order_date).days > 90:
                    tags.append("churn_risk")
                
                bulk_buyer = any(len([i for i in order_items if i['order_id'] == o['id']]) >= 4 for o in orders if o['shopper_id'] == s_id)
                if bulk_buyer:
                    tags.append("bulk_buyer")
                
                if s_type == "gifter":
                    tags.append("gifter")
                
                shoppers.append({
                    "id": s_id,
                    "name": name,
                    "phone": phone,
                    "email": email,
                    "city": city,
                    "age_group": age_group,
                    "shopper_type": s_type,
                    "total_orders": num_orders,
                    "total_spend": float(total_spend),
                    "last_order_date": last_order_date.isoformat() if last_order_date else None,
                    "first_order_date": first_order_date.isoformat() if first_order_date else None,
                    "preferred_channel": preferred_channel,
                    "tags": tags
                })

        cond1 = len([s for s in shoppers if s['last_order_date'] and (TODAY - date.fromisoformat(s['last_order_date'])).days > 180]) >= 80
        cond2 = len([s for s in shoppers if s['total_spend'] > 15000]) >= 40
        cond3 = len([s for s in shoppers if s['total_orders'] == 1]) >= 50
        cond4 = len([s for s in shoppers if s['total_orders'] >= 3 and s['last_order_date'] and (TODAY - date.fromisoformat(s['last_order_date'])).days > 90]) >= 30
        cond5 = len([s for s in shoppers if "ipl_buyer" in s['tags']]) >= 60
        cond6 = len([s for s in shoppers if s['shopper_type'] == 'academy_coach' and s['total_spend'] > 20000]) >= 35
        
        print("Verification stats:")
        print("older than 6 months:", len([s for s in shoppers if s['last_order_date'] and (TODAY - date.fromisoformat(s['last_order_date'])).days > 180]))
        print("spend > 15k:", len([s for s in shoppers if s['total_spend'] > 15000]))
        print("exactly 1 order:", len([s for s in shoppers if s['total_orders'] == 1]))
        print("3+ orders, last > 90 days:", len([s for s in shoppers if s['total_orders'] >= 3 and s['last_order_date'] and (TODAY - date.fromisoformat(s['last_order_date'])).days > 90]))
        print("ipl buyer:", len([s for s in shoppers if "ipl_buyer" in s['tags']]))
        print("academy coach > 20k:", len([s for s in shoppers if s['shopper_type'] == 'academy_coach' and s['total_spend'] > 20000]))

        if all([cond1, cond2, cond3, cond4, cond5, cond6]):
            print("All constraints met!")
            return shoppers, orders, order_items
        else:
            print("Constraints not met, retrying...")

def insert_in_batches(table_name, data, batch_size=50):
    for i in range(0, len(data), batch_size):
        batch = data[i:i+batch_size]
        supabase.table(table_name).insert(batch).execute()

if __name__ == "__main__":
    shoppers, orders, order_items = generate_data()
    print("Inserting shoppers...")
    insert_in_batches("shoppers", shoppers)
    print("Inserting orders...")
    insert_in_batches("orders", orders)
    print("Inserting order_items...")
    insert_in_batches("order_items", order_items)
    print("Done!")
