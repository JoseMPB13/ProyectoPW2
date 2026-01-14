from app import create_app, db
from app.models import WorkOrder, OrderItem, Payment

app = create_app()

with app.app_context():
    try:
        print("Starting full cleanup of Work Orders...")
        
        # Delete using SQL alchemy queries for cascade safety (manual) or bulk delete
        # It's safer to delete children first
        
        # 1. Delete all Payments
        deleted_payments = db.session.query(Payment).delete()
        print(f"Deleted {deleted_payments} payments.")
        
        # 2. Delete all OrderItems
        deleted_items = db.session.query(OrderItem).delete()
        print(f"Deleted {deleted_items} order items.")
        
        # 3. Delete all WorkOrders
        deleted_orders = db.session.query(WorkOrder).delete()
        print(f"Deleted {deleted_orders} work orders.")
        
        db.session.commit()
        print("All work orders have been deleted successfully.")
            
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting orders: {e}")
