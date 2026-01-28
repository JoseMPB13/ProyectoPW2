# 🌱 Base de Datos Poblada - Datos de Prueba

## ✅ Estado: Completado Exitosamente

La base de datos ha sido poblada con datos de prueba completos y realistas para todas las tablas del sistema.

---

## 📊 Datos Creados

### 1. **Roles** (3)

- `admin` - Administrador del sistema
- `mecanico` - Mecánicos/Técnicos
- `recepcionista` - Personal de recepción

### 2. **Estados de Orden** (4)

- Pendiente
- En Proceso
- Finalizado
- Entregado

### 3. **Usuarios** (6)

#### Administradores (1):

| Nombre            | Email            | Password |
| ----------------- | ---------------- | -------- |
| Juan Pérez García | admin@taller.com | admin123 |

#### Mecánicos (3):

| Nombre                   | Email                       | Password    |
| ------------------------ | --------------------------- | ----------- |
| Carlos Rodríguez López   | carlos.mecanico@taller.com  | mecanico123 |
| Miguel Fernández Sánchez | miguel.mecanico@taller.com  | mecanico123 |
| Roberto Martínez Gómez   | roberto.mecanico@taller.com | mecanico123 |

#### Recepcionistas (2):

| Nombre              | Email                      | Password     |
| ------------------- | -------------------------- | ------------ |
| Ana González Díaz   | ana.recepcion@taller.com   | recepcion123 |
| María López Ramírez | maria.recepcion@taller.com | recepcion123 |

### 4. **Clientes** (8)

| CI      | Nombre Completo       | Correo                    | Celular  | Dirección             |
| ------- | --------------------- | ------------------------- | -------- | --------------------- |
| 1234567 | Pedro Ramírez Torres  | pedro.ramirez@email.com   | 76789012 | Av. 6 de Agosto #1234 |
| 2345678 | Laura Morales Vega    | laura.morales@email.com   | 77890123 | Calle Comercio #567   |
| 3456789 | Jorge Castro Flores   | jorge.castro@email.com    | 78901234 | Av. Arce #890         |
| 4567890 | Carmen Vargas Ríos    | carmen.vargas@email.com   | 79012345 | Calle Potosí #234     |
| 5678901 | Ricardo Mendoza Silva | ricardo.mendoza@email.com | 70234567 | Av. Ballivián #456    |
| 6789012 | Sofía Herrera Ortiz   | sofia.herrera@email.com   | 71345678 | Calle Murillo #789    |
| 7890123 | Daniel Rojas Paz      | daniel.rojas@email.com    | 72456789 | Av. Camacho #123      |
| 8901234 | Valentina Cruz Luna   | valentina.cruz@email.com  | 73567890 | Calle Sucre #345      |

### 5. **Autos** (12-16)

Cada cliente tiene entre 1 y 2 vehículos asignados aleatoriamente.

**Marcas y Modelos incluidos:**

- Toyota (Corolla, Yaris)
- Honda (Civic, Fit)
- Nissan (Sentra)
- Chevrolet (Cruze)
- Hyundai (Elantra)
- Mazda (Mazda3)
- Ford (Focus)
- Volkswagen (Jetta)
- Kia (Forte)
- Suzuki (Swift)

**Placas**: ABC-1000, ABC-1001, ABC-1002, etc.
**Colores**: Blanco, Negro, Gris, Rojo, Azul, Plateado
**Años**: 2018-2022

### 6. **Servicios** (15)

| Servicio                         | Precio (Bs.) |
| -------------------------------- | ------------ |
| Cambio de Aceite                 | 150.00       |
| Alineación y Balanceo            | 200.00       |
| Revisión de Frenos               | 180.00       |
| Cambio de Filtros                | 120.00       |
| Diagnóstico Computarizado        | 250.00       |
| Cambio de Bujías                 | 100.00       |
| Revisión de Suspensión           | 220.00       |
| Cambio de Batería                | 80.00        |
| Lavado Completo                  | 60.00        |
| Pulido y Encerado                | 150.00       |
| Cambio de Correa de Distribución | 350.00       |
| Reparación de Motor              | 800.00       |
| Cambio de Embrague               | 600.00       |
| Reparación de Transmisión        | 900.00       |
| Pintura de Retoque               | 200.00       |

### 7. **Repuestos** (20)

| Repuesto                      | Marca    | Precio (Bs.) | Stock | Stock Mín. |
| ----------------------------- | -------- | ------------ | ----- | ---------- |
| Filtro de Aceite              | Mann     | 45.00        | 50    | 10         |
| Filtro de Aire                | Bosch    | 38.00        | 40    | 10         |
| Filtro de Combustible         | Mann     | 55.00        | 35    | 8          |
| Bujía NGK                     | NGK      | 28.00        | 80    | 20         |
| Pastillas de Freno Delanteras | Brembo   | 150.00       | 25    | 5          |
| Pastillas de Freno Traseras   | Brembo   | 130.00       | 25    | 5          |
| Disco de Freno Delantero      | Brembo   | 220.00       | 15    | 4          |
| Disco de Freno Trasero        | Brembo   | 180.00       | 15    | 4          |
| Aceite de Motor 5W-30         | Castrol  | 110.00       | 60    | 15         |
| Aceite de Motor 10W-40        | Shell    | 95.00        | 55    | 15         |
| Batería 12V 60Ah              | Bosch    | 450.00       | 12    | 3          |
| Correa de Distribución        | Gates    | 280.00       | 20    | 5          |
| Amortiguador Delantero        | Monroe   | 320.00       | 16    | 4          |
| Amortiguador Trasero          | Monroe   | 290.00       | 16    | 4          |
| Líquido de Frenos DOT 4       | Castrol  | 35.00        | 45    | 10         |
| Refrigerante                  | Prestone | 42.00        | 40    | 10         |
| Limpia Parabrisas             | Bosch    | 48.00        | 30    | 8          |
| Foco H4                       | Philips  | 25.00        | 50    | 15         |
| Foco LED H7                   | Osram    | 65.00        | 30    | 10         |
| Termostato                    | Wahler   | 75.00        | 20    | 5          |

### 8. **Órdenes de Trabajo** (15)

Cada orden incluye:

- **Auto asignado** (aleatorio)
- **Técnico asignado** (aleatorio entre mecánicos)
- **Estado** (aleatorio: Pendiente, En Proceso, Finalizado, Entregado)
- **Fecha de ingreso** (últimos 30 días)
- **Problema reportado** (15 problemas diferentes)
- **Diagnóstico** (15 diagnósticos diferentes, 70% de probabilidad)
- **1-3 servicios** asignados aleatoriamente
- **0-4 repuestos** asignados aleatoriamente
- **Total estimado** calculado automáticamente

#### Problemas Reportados (ejemplos):

- Motor hace ruido extraño al acelerar
- Frenos chirrían al frenar
- Luces delanteras no encienden
- Pérdida de potencia en subidas
- Vibración en el volante
- Aire acondicionado no enfría
- Consumo excesivo de combustible
- Humo negro del escape
- Batería se descarga rápidamente
- Transmisión patina
- Y más...

#### Diagnósticos (ejemplos):

- Requiere cambio de correa de distribución
- Pastillas de freno desgastadas
- Fusible quemado, reemplazar
- Filtro de aire sucio, afecta rendimiento
- Balanceo de ruedas necesario
- Compresor de A/C con falla
- Inyectores sucios, requiere limpieza
- Y más...

---

## 🔑 Credenciales de Acceso

### Para Pruebas:

**Administrador:**

```
Email: admin@taller.com
Password: admin123
```

**Mecánico:**

```
Email: carlos.mecanico@taller.com
Password: mecanico123
```

**Recepcionista:**

```
Email: ana.recepcion@taller.com
Password: recepcion123
```

---

## 🎯 Características de los Datos

### Realismo:

- ✅ Nombres y apellidos bolivianos
- ✅ Números de CI y celulares con formato correcto
- ✅ Direcciones de La Paz, Bolivia
- ✅ Marcas y modelos de autos comunes en Bolivia
- ✅ Servicios típicos de un taller mecánico
- ✅ Repuestos con marcas reconocidas
- ✅ Precios en Bolivianos (Bs.)

### Relaciones:

- ✅ Cada cliente tiene 1-2 autos
- ✅ Cada orden está asignada a un auto y un técnico
- ✅ Cada orden tiene 1-3 servicios
- ✅ Cada orden tiene 0-4 repuestos
- ✅ El stock de repuestos se descuenta al crear órdenes

### Variedad:

- ✅ Órdenes con diferentes estados
- ✅ Fechas de ingreso distribuidas en los últimos 30 días
- ✅ Problemas y diagnósticos variados
- ✅ Totales estimados calculados correctamente

---

## 🧪 Casos de Prueba Disponibles

Con estos datos puedes probar:

1. **Login** con diferentes roles
2. **Gestión de Clientes** (8 clientes con datos completos)
3. **Gestión de Vehículos** (12-16 autos asignados)
4. **Gestión de Servicios** (15 servicios disponibles)
5. **Gestión de Inventario** (20 repuestos con stock)
6. **Gestión de Órdenes**:
   - Ver órdenes existentes (15)
   - Crear nuevas órdenes
   - Editar órdenes existentes
   - Filtrar por estado
   - Buscar órdenes
7. **Validación de Stock** (algunos repuestos con stock bajo)
8. **Cálculo de Totales** (órdenes con servicios y repuestos)
9. **Sincronización de Detalles** (probar PUT con cambios)

---

## 📝 Notas Importantes

- El stock de repuestos **ya ha sido descontado** en las órdenes creadas
- Las órdenes tienen **totales calculados** correctamente
- Todos los usuarios tienen **contraseñas simples** para pruebas (admin123, mecanico123, recepcion123)
- Los datos son **completamente ficticios** pero realistas
- Puedes **ejecutar el script nuevamente** para resetear los datos (limpia y vuelve a poblar)

---

## 🔄 Cómo Volver a Poblar

Si necesitas resetear los datos:

```bash
cd backend
venv\Scripts\python.exe seed_database.py
```

Esto:

1. Limpiará todas las tablas
2. Creará nuevos datos de prueba
3. Generará órdenes aleatorias diferentes

---

## ✅ Verificación

Para verificar que los datos se crearon correctamente, puedes:

1. **Login** en la aplicación con cualquiera de las credenciales
2. Ir a **Órdenes** y ver las 15 órdenes creadas
3. Ir a **Clientes** y ver los 8 clientes
4. Ir a **Inventario** y ver los 20 repuestos con stock
5. Crear una **nueva orden** usando los datos existentes

---

¡La base de datos está lista para realizar pruebas completas del sistema! 🎉
