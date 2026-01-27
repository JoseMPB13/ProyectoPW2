from app import db
from app.models import Orden, EstadoOrden
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
        # Query: COUNT(id) WHERE fecha_ingreso.month = current_month AND fecha_ingreso.year = current_year
        total_orders_month = db.session.query(func.count(Orden.id))\
            .filter(extract('month', Orden.fecha_ingreso) == current_month)\
            .filter(extract('year', Orden.fecha_ingreso) == current_year)\
            .scalar()

        # 2. Ingreso estimado (Suma de total_estimado de órdenes finalizadas/entregadas)
        # Asumimos que el estado final es 'Entregado' o 'Finalizado'.
        # Buscamos por nombre de estado.
        estimated_income = db.session.query(func.sum(Orden.total_estimado))\
            .join(EstadoOrden)\
            .filter(EstadoOrden.nombre_estado.in_(['Finalizado', 'Entregado', 'Completado']))\
            .scalar()
        
        # Si no hay ventas, sum devuelve None, convertimos a 0.0
        if estimated_income is None:
            estimated_income = 0.0

        # 3. Conteo de órdenes por estado
        # Query: SELECT nombre_estado, COUNT(*) FROM Orden JOIN EstadoOrden GROUP BY nombre_estado
        orders_by_status_query = db.session.query(EstadoOrden.nombre_estado, func.count(Orden.id))\
            .join(Orden)\
            .group_by(EstadoOrden.nombre_estado)\
            .all()
        
        # Transformamos la lista de tuplas [('pendiente', 5), ...] a diccionario {'pendiente': 5, ...}
        orders_by_status = {status: count for status, count in orders_by_status_query}

        return {
            "total_orders_month": total_orders_month,
            "estimated_income": estimated_income,
            "orders_by_status": orders_by_status
        }
