import io
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT

class InvoiceGenerator:
    @staticmethod
    def generate(order_data):
        """
        Genera un PDF en memoria para una orden dada.
        Retorna un objeto BytesIO con el contenido del PDF.
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter,
                                rightMargin=40, leftMargin=40,
                                topMargin=40, bottomMargin=40)
        
        elements = []
        styles = getSampleStyleSheet()
        
        # --- Estilos Personalizados ---
        title_style = ParagraphStyle(
            'InvoiceTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor("#2c3e50"),
            alignment=TA_RIGHT,
            spaceAfter=20
        )
        
        workshop_style = ParagraphStyle(
            'WorkshopInfo',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor("#7f8c8d"),
            alignment=TA_LEFT,
            leading=14
        )
        
        header_table_style = TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
        ])

        # --- Datos del Taller (Hardcoded por ahora, idealmente config) ---
        workshop_info = """
        <b>TALLER AUTOMOTRIZ APP</b><br/>
        Av. Principal #123<br/>
        La Paz, Bolivia<br/>
        Tel: (591) 2-1234567<br/>
        Email: contacto@tallerapp.com
        """

        # --- Encabezado ---
        # Izquierda: Datos Taller, Derecha: Título Factura e ID
        header_data = [
            [Paragraph(workshop_info, workshop_style), Paragraph(f"ORDEN DE SERVICIO<br/>#{order_data.get('id')}", title_style)]
        ]
        
        header_table = Table(header_data, colWidths=[4*inch, 3*inch])
        header_table.setStyle(header_table_style)
        elements.append(header_table)
        elements.append(Spacer(1, 0.5*inch))
        
        # --- Información Cliente y Vehículo ---
        # Se asume que order_data ya viene 'aplanado' o con dicts anidados
        # Ajustar según como venga del to_dict() del modelo
        
        client_info = f"""
        <b>CLIENTE:</b><br/>
        {order_data.get('cliente_nombre', 'N/A')}<br/>
        CI/NIT: {order_data.get('cliente_ci', 'N/A')}
        """
        
        vehicle_info = f"""
        <b>VEHÍCULO:</b><br/>
        {order_data.get('marca', '')} {order_data.get('modelo', '')} {order_data.get('anio', '')}<br/>
        Placa: {order_data.get('placa', 'N/A')}<br/>
        VIN: {order_data.get('vin', 'N/A')}
        """
        
        info_data = [
            [Paragraph(client_info, styles['Normal']), Paragraph(vehicle_info, styles['Normal'])]
        ]
        
        info_table = Table(info_data, colWidths=[3.5*inch, 3.5*inch])
        info_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('LINEBELOW', (0,0), (-1,-1), 1, colors.HexColor("#ecf0f1")),
            ('PADDING', (0,0), (-1,-1), 12),
        ]))
        elements.append(info_table)
        elements.append(Spacer(1, 0.3*inch))
        
        # --- Detalle de Servicios y Repuestos ---
        # Columnas: Descripción, Cantidad, P.Unit, Subtotal
        
        # Estilo de Tabla de Items
        items_style = TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#f8f9fa")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor("#2c3e50")),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'), # Default left
            ('ALIGN', (1, 0), (1, -1), 'CENTER'), # Cantidad center
            ('ALIGN', (2, 0), (-1, -1), 'RIGHT'), # Precios right
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#ecf0f1")),
        ])
        
        table_data = [['DESCRIPCIÓN', 'CANT.', 'P. UNIT (Bs)', 'SUBTOTAL (Bs)']]
        
        # Servicios
        servicios = order_data.get('detalles_servicios', [])
        if servicios:
            table_data.append([Paragraph("<b>SERVICIOS</b>", styles['Normal']), "", "", ""])
            for s in servicios:
                nombre = s.get('servicio_nombre') or (s.get('servicio') or {}).get('nombre', 'Servicio')
                precio = float(s.get('precio_aplicado') or s.get('precio') or 0)
                table_data.append([
                    Paragraph(nombre, styles['Normal']),
                    "1",
                    f"{precio:,.2f}",
                    f"{precio:,.2f}"
                ])
                
        # Repuestos
        repuestos = order_data.get('detalles_repuestos', [])
        if repuestos:
            table_data.append([Paragraph("<b>REPUESTOS</b>", styles['Normal']), "", "", ""])
            for r in repuestos:
                nombre = r.get('repuesto_nombre') or (r.get('repuesto') or {}).get('nombre', 'Repuesto')
                cantidad = int(r.get('cantidad', 0))
                precio = float(r.get('precio_unitario_aplicado') or r.get('precio') or 0)
                subtotal = cantidad * precio
                table_data.append([
                    Paragraph(nombre, styles['Normal']),
                    str(cantidad),
                    f"{precio:,.2f}",
                    f"{subtotal:,.2f}"
                ])

        # Totales
        total_estimado = float(order_data.get('total_estimado', 0))
        total_pagado = float(order_data.get('total_pagado', 0))
        saldo = float(order_data.get('saldo_pendiente', 0))
        
        # Rows de totales
        table_data.append(["", "", "TOTAL:", f"{total_estimado:,.2f}"])
        table_data.append(["", "", "PAGADO:", f"{total_pagado:,.2f}"])
        table_data.append(["", "", "SALDO:", f"{saldo:,.2f}"])
        
        items_table = Table(table_data, colWidths=[4*inch, 1*inch, 1*inch, 1*inch])
        items_table.setStyle(items_style)
        
        # Estilos específicos para las filas de totales (las últimas 3)
        num_rows = len(table_data)
        items_table.setStyle(TableStyle([
            ('FONTNAME', (-2, -3), (-1, -1), 'Helvetica-Bold'), # Bold labels and values for totals
            ('LINEABOVE', (-2, -3), (-1, -3), 1, colors.black), # Line above Total
        ]))
        
        elements.append(items_table)
        
        # --- Build PDF ---
        doc.build(elements)
        buffer.seek(0)
        return buffer
