from app import db
from app.models import WorkOrder, OrderItem
from sqlalchemy import func, extract
from datetime import datetime

class ReportService:
    """
    Servicio de Reportes y Métricas.
    Encapsula consultas complejas de agregación para el dashboard.
    """

    @staticmethod
    def get_monthly_metrics():
        """
        Calcula métricas clave del mes actual para el dashboard de administración.

        Returns:
            dict: Diccionario con total_orders, estimated_income, orders_by_status.
        """
        now = datetime.utcnow()
        current_month = now.month
        current_year = now.year

        # 1. Total de órdenes del mes actual
        # Query: COUNT(id) WHERE created_at.month = current_month AND created_at.year = current_year
        total_orders_month = db.session.query(func.count(WorkOrder.id))\
            .filter(extract('month', WorkOrder.created_at) == current_month)\
            .filter(extract('year', WorkOrder.created_at) == current_year)\
            .scalar()

        # 2. Ingreso estimado (Suma de items de órdenes finalizadas)
        # Query: SUM(price_at_moment) FROM OrderItem JOIN WorkOrder WHERE status = 'finalizado'
        estimated_income = db.session.query(func.sum(OrderItem.price_at_moment))\
            .join(WorkOrder)\
            .filter(WorkOrder.status == 'finalizado')\
            .scalar()
        
        # Si no hay ventas, sum devuelve None, convertimos a 0.0
        if estimated_income is None:
            estimated_income = 0.0

        # 3. Conteo de órdenes por estado
        # Query: SELECT status, COUNT(*) FROM WorkOrder GROUP BY status
        orders_by_status_query = db.session.query(WorkOrder.status, func.count(WorkOrder.status))\
            .group_by(WorkOrder.status)\
            .all()
        
        # Transformamos la lista de tuplas [('pendiente', 5), ...] a diccionario {'pendiente': 5, ...}
        orders_by_status = {status: count for status, count in orders_by_status_query}

        return {
            "total_orders_month": total_orders_month,
            "estimated_income": estimated_income,
            "orders_by_status": orders_by_status
        }
