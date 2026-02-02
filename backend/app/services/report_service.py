from app import db
from app.models import Orden, EstadoOrden
from sqlalchemy import func, extract
from datetime import datetime

# ==============================================================================
# ENCABEZADO DEL ARCHIVO (Visión Macro)
# ==============================================================================
# Propósito:
#   Servicio centralizado para la generación de Reportes y Métricas (KPIs).
#   Se encarga de las consultas analíticas pesadas (Aggregations) para no sobrecargar
#   los controladores.
#
# Flujo Lógico:
#   1. Agregación de datos por períodos (mes actual).
#   2. Filtrado complejo (por estado, fechas).
#   3. Transformación de datos crudos SQL a estructuras JSON-friendly para el Dashboard.
#
# Interacciones:
#   - Interactúa con Modelos: Orden, EstadoOrden.
#   - Llamado por: `routes/reports.py`.
# ==============================================================================

class ReportService:
    """
    Servicio de Analytics y Reportes.
    Provee métodos estáticos puros para extracción de métricas.
    """

    @staticmethod
    def get_monthly_metrics():
        """
        Calcula las métricas clave (KPIs) del mes en curso para el Dashboard.

        Lógica de Cálculo:
        - Total Ordenes: Conteo simple.
        - Ingresos Estimados: Suma de `total_estimado` para ordenes activas (En Proceso, Finalizadas, etc.).
        - Distribución: Agrupación (Group By) por estado.

        Returns:
            dict: {
                "total_orders_month": int,
                "estimated_income": float,
                "orders_by_status": dict {estado: count}
            }
        """
        now = datetime.utcnow()
        current_month = now.month
        current_year = now.year

        # 1. Total de órdenes del mes actual
        # Query: COUNT(id) WHERE mes = actual AND año = actual
        total_orders_month = db.session.query(func.count(Orden.id))\
            .filter(extract('month', Orden.fecha_ingreso) == current_month)\
            .filter(extract('year', Orden.fecha_ingreso) == current_year)\
            .scalar()

        # 2. Ingreso estimado (Pipeline de Ventas)
        # Sumamos el potencial de todas las órdenes en curso o cerradas.
        # FIX: Incluimos 'En Proceso' porque representa trabajo ya comprometido/en ejecución.
        estimated_income = db.session.query(func.sum(Orden.total_estimado))\
            .join(EstadoOrden)\
            .filter(EstadoOrden.nombre_estado.in_(['En Proceso', 'Finalizado', 'Entregado', 'Completado']))\
            .scalar()
        
        # Manejo de nulos (Si no hay registros, sum() retorna None en SQL)
        if estimated_income is None:
            estimated_income = 0.0

        # 3. Distribución de carga de trabajo
        # Query: SELECT estado, COUNT(*) FROM orden GROUP BY estado
        orders_by_status_query = db.session.query(EstadoOrden.nombre_estado, func.count(Orden.id))\
            .join(Orden)\
            .group_by(EstadoOrden.nombre_estado)\
            .all()
        
        # Transformación de datos: [('Pendiente', 5)] -> {'Pendiente': 5}
        orders_by_status = {status: count for status, count in orders_by_status_query}

        return {
            "total_orders_month": total_orders_month,
            "estimated_income": estimated_income,
            "orders_by_status": orders_by_status
        }
