"""
StorePilot Demo Data Seed Script
Run: cd backend && python -m app.seed

Creates realistic Indian retail demo data:
- Admin user
- Categories, suppliers, customers
- 70+ products with realistic Indian brands
- Historical sales and purchases over 60 days
- Inventory transactions
- Various stock conditions

Idempotent: skips if data already exists.
"""
import sys
import random
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Ensure app is importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db.session import SessionLocal
from app.db.base import Base
from app.models import *
from app.core.security import hash_password


def seed():
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(User).first():
            print("Database already has data. Skipping seed.")
            return

        print("🌱 Seeding StorePilot demo data...")

        # 1. Admin User
        admin = User(
            email="admin@storepilot.com",
            full_name="Store Admin",
            hashed_password=hash_password("storepilot123"),
            role="admin",
            onboarding_completed=True,
        )
        db.add(admin)
        db.flush()
        print("  ✓ Admin user created (admin@storepilot.com / storepilot123)")

        # 2. Store
        store = Store(
            name="Demo Store",
            address="123, MG Road, Bengaluru, Karnataka",
            phone="+91 9876543210",
            email="store@storepilot.com",
        )
        db.add(store)

        # 3. Categories
        category_data = [
            ("Dairy", "Milk, curd, paneer, butter, cheese"),
            ("Grocery", "Rice, atta, dal, oil, sugar, salt"),
            ("Snacks", "Biscuits, chips, namkeen, chocolates"),
            ("Beverages", "Soft drinks, juices, water, tea, coffee"),
            ("Personal Care", "Soap, shampoo, detergent, toothpaste"),
            ("Household", "Cleaning supplies, utensils, bags"),
            ("Frozen", "Ice cream, frozen vegetables, ready meals"),
            ("Baby Care", "Diapers, baby food, baby products"),
        ]
        categories = {}
        for name, desc in category_data:
            cat = Category(name=name, description=desc)
            db.add(cat)
            db.flush()
            categories[name] = cat
        print(f"  ✓ {len(categories)} categories created")

        # 4. Suppliers
        supplier_data = [
            ("Amul India Distributors", "Rajesh Mehta", "rajesh@amuldist.com", "+91 9812345678", "Anand, Gujarat"),
            ("Tata Consumer Wholesale", "Priya Singh", "priya@tatawholesale.com", "+91 9823456789", "Mumbai, Maharashtra"),
            ("ITC Foods Distribution", "Amit Sharma", "amit@itcfoods.com", "+91 9834567890", "Kolkata, West Bengal"),
            ("Hindustan Unilever Supply", "Neha Gupta", "neha@hulsupply.com", "+91 9845678901", "Mumbai, Maharashtra"),
            ("Parle Products Agency", "Vikram Patel", "vikram@parleagency.com", "+91 9856789012", "Mumbai, Maharashtra"),
            ("Coca-Cola Beverages India", "Sanjay Kumar", "sanjay@cocacolaindia.com", "+91 9867890123", "Gurugram, Haryana"),
            ("Nestlé India Distributors", "Meera Joshi", "meera@nestledist.com", "+91 9878901234", "Gurugram, Haryana"),
            ("P&G India Wholesale", "Arjun Reddy", "arjun@pgwholesale.com", "+91 9889012345", "Hyderabad, Telangana"),
        ]
        suppliers = {}
        for name, contact, email, phone, addr in supplier_data:
            sup = Supplier(name=name, contact_person=contact, email=email, phone=phone, address=addr)
            db.add(sup)
            db.flush()
            suppliers[name] = sup
        print(f"  ✓ {len(suppliers)} suppliers created")

        # 5. Products
        product_data = [
            # (name, sku, category, supplier_key, selling, cost, stock, reorder)
            ("Amul Taaza Milk 500ml", "AMU-MLK-500", "Dairy", "Amul India Distributors", 27, 22, 45, 20),
            ("Amul Gold Milk 1L", "AMU-GLD-1L", "Dairy", "Amul India Distributors", 68, 58, 30, 15),
            ("Amul Butter 500g", "AMU-BTR-500", "Dairy", "Amul India Distributors", 270, 230, 22, 10),
            ("Amul Paneer 200g", "AMU-PNR-200", "Dairy", "Amul India Distributors", 90, 72, 15, 10),
            ("Amul Cheese Slices 200g", "AMU-CHS-200", "Dairy", "Amul India Distributors", 120, 95, 12, 8),
            ("Mother Dairy Curd 400g", "MDY-CRD-400", "Dairy", "Amul India Distributors", 35, 28, 25, 15),
            ("Tata Salt 1kg", "TAT-SLT-1KG", "Grocery", "Tata Consumer Wholesale", 28, 20, 80, 25),
            ("Tata Sampann Dal 1kg", "TAT-DAL-1KG", "Grocery", "Tata Consumer Wholesale", 165, 135, 35, 15),
            ("Tata Tea Gold 500g", "TAT-TEA-500", "Beverages", "Tata Consumer Wholesale", 290, 240, 18, 10),
            ("Tata Tea Premium 250g", "TAT-TEA-250", "Beverages", "Tata Consumer Wholesale", 145, 118, 20, 10),
            ("Aashirvaad Atta 5kg", "ASH-ATA-5KG", "Grocery", "ITC Foods Distribution", 310, 260, 28, 12),
            ("Aashirvaad Atta 1kg", "ASH-ATA-1KG", "Grocery", "ITC Foods Distribution", 68, 55, 42, 20),
            ("Sunfeast Marie Light 200g", "SNF-MRL-200", "Snacks", "ITC Foods Distribution", 30, 22, 55, 20),
            ("Bingo Mad Angles 66g", "BNG-MAG-66", "Snacks", "ITC Foods Distribution", 20, 14, 65, 25),
            ("Yippee Noodles 70g", "YIP-NDL-70", "Snacks", "ITC Foods Distribution", 15, 10, 90, 30),
            ("Maggi 2-Minute Noodles 70g", "MGI-NDL-70", "Snacks", "Nestlé India Distributors", 14, 10, 95, 30),
            ("Maggi Hot & Sweet Sauce 500g", "MGI-SOS-500", "Grocery", "Nestlé India Distributors", 110, 88, 20, 10),
            ("Nescafé Classic 200g", "NSC-CLS-200", "Beverages", "Nestlé India Distributors", 480, 400, 12, 8),
            ("Nescafé Sunrise 200g", "NSC-SNR-200", "Beverages", "Nestlé India Distributors", 320, 265, 10, 8),
            ("KitKat 37.3g", "KTK-CHO-37", "Snacks", "Nestlé India Distributors", 40, 30, 50, 20),
            ("Nestlé Everyday Dairy Whitener 200g", "NST-DWH-200", "Dairy", "Nestlé India Distributors", 115, 92, 15, 8),
            ("Parle-G Biscuit 250g", "PLG-BSC-250", "Snacks", "Parle Products Agency", 20, 14, 110, 30),
            ("Parle-G Biscuit 800g", "PLG-BSC-800", "Snacks", "Parle Products Agency", 55, 42, 40, 15),
            ("Parle Monaco 200g", "PLM-BSC-200", "Snacks", "Parle Products Agency", 40, 30, 48, 20),
            ("Hide & Seek Choco Chips 200g", "HNS-CHO-200", "Snacks", "Parle Products Agency", 55, 40, 35, 15),
            ("Frooti Mango Drink 250ml", "FRT-MNG-250", "Beverages", "Parle Products Agency", 12, 8, 75, 30),
            ("Coca-Cola 750ml", "COK-750", "Beverages", "Coca-Cola Beverages India", 45, 35, 40, 20),
            ("Coca-Cola 2L", "COK-2L", "Beverages", "Coca-Cola Beverages India", 95, 78, 18, 10),
            ("Sprite 750ml", "SPR-750", "Beverages", "Coca-Cola Beverages India", 45, 35, 38, 20),
            ("Thums Up 750ml", "THU-750", "Beverages", "Coca-Cola Beverages India", 45, 35, 35, 20),
            ("Fanta Orange 750ml", "FNT-750", "Beverages", "Coca-Cola Beverages India", 45, 35, 30, 20),
            ("Minute Maid Juice 1L", "MMD-JCE-1L", "Beverages", "Coca-Cola Beverages India", 90, 72, 15, 10),
            ("Kinley Water 1L", "KNL-WTR-1L", "Beverages", "Coca-Cola Beverages India", 22, 16, 60, 25),
            ("Surf Excel Easy Wash 1kg", "SRF-EZW-1KG", "Personal Care", "Hindustan Unilever Supply", 125, 100, 25, 12),
            ("Surf Excel Matic 1kg", "SRF-MTC-1KG", "Personal Care", "Hindustan Unilever Supply", 210, 170, 15, 8),
            ("Vim Dishwash Bar 200g", "VIM-DSH-200", "Household", "Hindustan Unilever Supply", 18, 12, 50, 20),
            ("Vim Liquid 500ml", "VIM-LQD-500", "Household", "Hindustan Unilever Supply", 115, 90, 18, 10),
            ("Lux Soap 150g", "LUX-SOP-150", "Personal Care", "Hindustan Unilever Supply", 55, 42, 35, 15),
            ("Dove Soap 100g", "DOV-SOP-100", "Personal Care", "Hindustan Unilever Supply", 62, 48, 28, 12),
            ("Lifebuoy Soap 125g", "LFB-SOP-125", "Personal Care", "Hindustan Unilever Supply", 38, 28, 40, 15),
            ("Clinic Plus Shampoo 175ml", "CLP-SHP-175", "Personal Care", "Hindustan Unilever Supply", 95, 75, 20, 10),
            ("Sunsilk Shampoo 180ml", "SNS-SHP-180", "Personal Care", "Hindustan Unilever Supply", 115, 90, 18, 10),
            ("Close Up Toothpaste 150g", "CLU-THP-150", "Personal Care", "Hindustan Unilever Supply", 88, 68, 22, 10),
            ("Pepsodent Toothpaste 200g", "PSD-THP-200", "Personal Care", "Hindustan Unilever Supply", 98, 78, 20, 10),
            ("Brooke Bond Red Label 500g", "BBR-TEA-500", "Beverages", "Hindustan Unilever Supply", 240, 195, 14, 8),
            ("Fortune Sunflower Oil 1L", "FOR-OIL-1L", "Grocery", "ITC Foods Distribution", 145, 118, 28, 12),
            ("Fortune Rice Bran Oil 1L", "FOR-RBO-1L", "Grocery", "ITC Foods Distribution", 165, 135, 20, 10),
            ("India Gate Basmati Rice 1kg", "IGR-BSM-1KG", "Grocery", "Tata Consumer Wholesale", 195, 160, 22, 10),
            ("Daawat Basmati Rice 1kg", "DWT-BSM-1KG", "Grocery", "Tata Consumer Wholesale", 175, 142, 18, 10),
            ("Sugar (loose) 1kg", "SGR-LOS-1KG", "Grocery", "Tata Consumer Wholesale", 48, 40, 50, 20),
            ("Britannia Milk Bikis 200g", "BRT-MBK-200", "Snacks", "Parle Products Agency", 30, 22, 42, 15),
            ("Britannia Good Day 250g", "BRT-GDY-250", "Snacks", "Parle Products Agency", 45, 34, 38, 15),
            ("Lay's Classic Salted 52g", "LAY-CLS-52", "Snacks", "ITC Foods Distribution", 20, 14, 60, 25),
            ("Kurkure Masala Munch 95g", "KRK-MSL-95", "Snacks", "ITC Foods Distribution", 20, 14, 55, 25),
            ("Haldiram Namkeen Aloo Bhujia 200g", "HLD-ALB-200", "Snacks", "ITC Foods Distribution", 65, 50, 30, 12),
            ("Dettol Soap 125g", "DTL-SOP-125", "Personal Care", "P&G India Wholesale", 58, 45, 30, 12),
            ("Dettol Handwash 200ml", "DTL-HWS-200", "Personal Care", "P&G India Wholesale", 75, 58, 22, 10),
            ("Whisper Ultra 8 pads", "WSP-ULT-8", "Personal Care", "P&G India Wholesale", 45, 32, 25, 10),
            ("Gillette Guard Razor", "GLT-GRD-1", "Personal Care", "P&G India Wholesale", 50, 35, 18, 10),
            ("Head & Shoulders 180ml", "HNS-SHP-180", "Personal Care", "P&G India Wholesale", 210, 168, 15, 8),
            ("Ariel Matic 1kg", "ARL-MTC-1KG", "Household", "P&G India Wholesale", 250, 200, 12, 8),
            ("Tide Plus 1kg", "TDE-PLS-1KG", "Household", "P&G India Wholesale", 140, 112, 20, 10),
            ("Harpic Power Plus 500ml", "HPC-PWR-500", "Household", "P&G India Wholesale", 115, 90, 15, 8),
            ("Lizol Floor Cleaner 500ml", "LZL-FLC-500", "Household", "P&G India Wholesale", 120, 95, 12, 8),
            ("Kwality Walls Cornetto", "KWL-CRN-1", "Frozen", "Hindustan Unilever Supply", 40, 28, 8, 10),
            ("Amul Ice Cream 500ml", "AMU-ICE-500", "Frozen", "Amul India Distributors", 150, 115, 5, 8),
            ("MTR Ready Meal Poha 180g", "MTR-POH-180", "Frozen", "ITC Foods Distribution", 55, 42, 20, 10),
            ("Cerelac Stage 1 300g", "CRL-ST1-300", "Baby Care", "Nestlé India Distributors", 320, 260, 8, 5),
            ("Pampers Active Baby Diapers S", "PMP-ABD-S", "Baby Care", "P&G India Wholesale", 450, 360, 6, 5),
            ("Johnson's Baby Soap 100g", "JNS-BSP-100", "Baby Care", "P&G India Wholesale", 65, 48, 10, 5),
        ]

        products = {}
        for name, sku, cat_name, sup_key, selling, cost, stock, reorder in product_data:
            p = Product(
                name=name,
                sku=sku,
                category_id=categories[cat_name].id,
                supplier_id=suppliers[sup_key].id,
                selling_price=selling,
                cost_price=cost,
                current_stock=stock,
                reorder_level=reorder,
            )
            db.add(p)
            db.flush()
            products[sku] = p
        print(f"  ✓ {len(products)} products created")

        # Make some products low/critical stock for realism
        low_stock_skus = ["KWL-CRN-1", "AMU-ICE-500", "PMP-ABD-S", "CRL-ST1-300"]
        for sku in low_stock_skus:
            if sku in products:
                products[sku].current_stock = random.randint(2, 5)

        # 6. Customers
        customer_names = [
            "Walk-in Customer", "Rajesh Kumar", "Priya Sharma", "Amit Patel",
            "Sneha Reddy", "Vikram Singh", "Ananya Gupta", "Rohit Verma",
            "Kavita Joshi", "Suresh Nair", "Divya Menon", "Arun Iyer",
            "Meena Das", "Siddharth Rao", "Pooja Malhotra", "Deepak Mishra",
            "Ritu Agarwal", "Manish Tiwari", "Swati Kulkarni", "Nitin Deshmukh",
        ]
        customers = {}
        for name in customer_names:
            c = Customer(name=name)
            db.add(c)
            db.flush()
            customers[name] = c
        print(f"  ✓ {len(customers)} customers created")

        # 7. Historical Purchases (over last 60 days)
        product_list = list(products.values())
        supplier_list = list(suppliers.values())
        now = datetime.now(timezone.utc)

        purchase_count = 0
        for day_offset in range(60, 0, -3):  # Every ~3 days
            purchase_date = now - timedelta(days=day_offset, hours=random.randint(8, 18))
            sup = random.choice(supplier_list)

            # Pick 3-8 products from this supplier
            sup_products = [p for p in product_list if p.supplier_id == sup.id]
            if not sup_products:
                sup_products = random.sample(product_list, min(5, len(product_list)))
            items = random.sample(sup_products, min(random.randint(3, 6), len(sup_products)))

            purchase = Purchase(
                supplier_id=sup.id,
                status="completed",
                created_at=purchase_date,
            )
            db.add(purchase)
            db.flush()

            total = 0
            for prod in items:
                qty = random.randint(10, 50)
                cost = float(prod.cost_price)
                subtotal = round(qty * cost, 2)
                total += subtotal

                pi = PurchaseItem(
                    purchase_id=purchase.id,
                    product_id=prod.id,
                    quantity=qty,
                    unit_cost=cost,
                    subtotal=subtotal,
                )
                db.add(pi)

                # Inventory transaction
                txn = InventoryTransaction(
                    product_id=prod.id,
                    transaction_type="stock_in",
                    quantity=qty,
                    reference_type="purchase",
                    reference_id=purchase.id,
                    notes=f"Purchase #{purchase.id}",
                    created_at=purchase_date,
                )
                db.add(txn)

            purchase.total = round(total, 2)
            purchase_count += 1

        print(f"  ✓ {purchase_count} historical purchases created")

        # 8. Historical Sales (over last 60 days)
        customer_list = list(customers.values())
        payment_methods = ["Cash", "UPI", "Card", "Cash", "UPI", "Cash"]  # Weighted towards Cash/UPI
        sale_count = 0
        invoice_num = 1000

        for day_offset in range(60, -1, -1):
            # 3-8 sales per day
            num_sales = random.randint(3, 8)
            for _ in range(num_sales):
                sale_date = now - timedelta(
                    days=day_offset,
                    hours=random.randint(8, 20),
                    minutes=random.randint(0, 59),
                )
                invoice_num += 1
                customer = random.choice(customer_list)

                sale = Sale(
                    invoice_number=f"INV-{invoice_num}",
                    customer_id=customer.id,
                    payment_method=random.choice(payment_methods),
                    status="completed",
                    created_at=sale_date,
                )
                db.add(sale)
                db.flush()

                # 1-5 items per sale
                num_items = random.randint(1, 5)
                sale_products = random.sample(product_list, min(num_items, len(product_list)))

                total = 0
                for prod in sale_products:
                    qty = random.randint(1, 4)
                    price = float(prod.selling_price)
                    subtotal = round(qty * price, 2)
                    total += subtotal

                    si = SaleItem(
                        sale_id=sale.id,
                        product_id=prod.id,
                        quantity=qty,
                        unit_price=price,
                        subtotal=subtotal,
                    )
                    db.add(si)

                    txn = InventoryTransaction(
                        product_id=prod.id,
                        transaction_type="stock_out",
                        quantity=qty,
                        reference_type="sale",
                        reference_id=sale.id,
                        notes=f"Sale {sale.invoice_number}",
                        created_at=sale_date,
                    )
                    db.add(txn)

                sale.total = round(total, 2)
                sale_count += 1

        print(f"  ✓ {sale_count} historical sales created")

        # 9. Some notifications
        notifications = [
            ("Low stock alert", "Amul Ice Cream 500ml stock is critically low at 5 units.", "warning"),
            ("Purchase completed", "Purchase #1 completed. Inventory restocked.", "success"),
            ("Welcome to StorePilot", "Your store management system is ready to use!", "info"),
        ]
        for title, msg, ntype in notifications:
            db.add(Notification(title=title, message=msg, type=ntype))

        db.commit()
        print("\n✅ StorePilot demo data seeded successfully!")
        print(f"   Products: {len(products)}")
        print(f"   Categories: {len(categories)}")
        print(f"   Suppliers: {len(suppliers)}")
        print(f"   Customers: {len(customers)}")
        print(f"   Purchases: {purchase_count}")
        print(f"   Sales: {sale_count}")
        print(f"\n   Login: admin@storepilot.com / storepilot123")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
