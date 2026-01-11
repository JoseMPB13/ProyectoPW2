from app import db
from app.models import WorkOrder, OrderItem
from sqlalchemy import func, extract
from datetime import datetime

class ReportService:
    @staticmethod
    def get_monthly_metrics():
        now = datetime.utcnow()
        current_month = now.month
        current_year = now.year

        # 1. Total de órdenes del mes actual
        total_orders_month = db.session.query(func.count(WorkOrder.id))\
            .filter(extract('month', WorkOrder.created_at) == current_month)\
            .filter(extract('year', WorkOrder.created_at) == current_year)\
            .scalar()

        # 2. Ingreso estimado (Suma de items de órdenes finalizadas)
        estimated_income = db.session.query(func.sum(OrderItem.price_at_moment))\
            .join(WorkOrder)\
            .filter(WorkOrder.status == 'finalizado')\
            .scalar()
        
        if estimated_income is None:
            estimated_income = 0.0

        # 3. Conteo de órdenes por estado
        orders_by_status_query = db.session.query(WorkOrder.status, func.count(WorkOrder.status))\
            .group_by(WorkOrder.status)\
            .all()
        
        orders_by_status = {status: count for status, count in orders_by_status_query}

        return {
            "total_orders_month": total_orders_month,
            "estimated_income": estimated_income,
            "orders_by_status": orders_by_status
        }
