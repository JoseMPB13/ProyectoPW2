from app import create_app, db
from app.models import User, WorkOrder, OrderItem, Payment

app = create_app()

with app.app_context():
    try:
        users_to_delete = User.query.filter(User.email != 'test@example.com').all()
        count = len(users_to_delete)
        
        if count > 0:
            print(f"Found {count} users to delete.")
            for user in users_to_delete:
                print(f"Processing user: {user.email}")
                
                # Delete related WorkOrders
                # Note: We need to handle OrderItems and Payments first if cascade isn't set
                orders = WorkOrder.query.filter_by(user_id=user.id).all()
                for order in orders:
                    print(f"  Deleting Order #{order.id} and related items/payments...")
                    
                    # Delete Payments
                    Payment.query.filter_by(work_order_id=order.id).delete()
                    
                    # Delete OrderItems
                    OrderItem.query.filter_by(work_order_id=order.id).delete()
                    
                    # Delete WorkOrder
                    db.session.delete(order)
                
                # Now delete user
                print(f"  Deleting User {user.username}...")
                db.session.delete(user)
            
            db.session.commit()
            print("Deletion successful.")
        else:
            print("No users found to delete (excluding test@example.com).")
            
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting users: {e}")
        import traceback
        traceback.print_exc()
