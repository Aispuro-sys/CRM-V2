# MANUAL TÉCNICO - TABLERO DE RENTABILIDAD DE RUTAS
## Sistema de Análisis de Costos y Utilidades para Transporte de Carga

**Versión:** 1.0  
**Ubicación:** Tijuana, Baja California  
**Fecha:** Abril 2026

---

## ÍNDICE

1. [Descripción General](#1-descripción-general)
2. [Configuración de Costos](#2-configuración-de-costos)
3. [Cálculos Principales](#3-cálculos-principales)
4. [Métricas de Rentabilidad](#4-métricas-de-rentabilidad)
5. [Módulo de Viaje Sencillo](#5-módulo-de-viaje-sencillo)
6. [Módulo de Vuelta Completa](#6-módulo-de-vuelta-completa)
7. [Reporte de Liquidación](#7-reporte-de-liquidación)
8. [Conversiones de Unidades](#8-conversiones-de-unidades)
9. [Clasificación de Rentabilidad](#9-clasificación-de-rentabilidad)
10. [Límites de Peso por Zona](#10-límites-de-peso-por-zona)

---

## 1. DESCRIPCIÓN GENERAL

El Tablero de Rentabilidad de Rutas es una aplicación web diseñada para calcular y analizar la rentabilidad de viajes de transporte de carga. Permite evaluar costos operativos, tarifas de flete y márgenes de utilidad.

### Funcionalidades Principales:
- Análisis de viajes sencillos (punto a punto)
- Análisis de vueltas completas (múltiples tramos)
- Reporte de liquidación de viaje
- Historial de rutas ejecutadas
- Conversión de monedas (USD/MXN)
- Conversión de unidades (millas/km, ton/lbs/kg)
- Exportación a PDF

---

## 2. CONFIGURACIÓN DE COSTOS

### 2.1 Parámetros Base

| Parámetro | Valor Default | Descripción |
|-----------|---------------|-------------|
| MPG (Millas por Galón) | 6.5 | Rendimiento de combustible del vehículo |
| Precio Diésel | $4.50 USD/galón | Precio del combustible |
| Nómina por Milla | $0.55 USD | Costo de mano de obra por milla |
| Administrativos por Milla | $0.15 USD | Gastos administrativos por milla |
| Operacionales por Milla | $0.20 USD | Gastos operacionales por milla |
| Talacha por Milla | $0.08 USD | Mantenimiento general por milla |
| Llantas por Milla | $0.05 USD | Desgaste de llantas por milla |
| Mantenimiento por Eje | $0.03 USD | Mantenimiento por eje por milla |

### 2.2 Configuración de Vehículo

| Tipo de Camión | Ejes | Tanques | MPG |
|----------------|------|---------|-----|
| Tractocamión Estándar | 5 | 2 | 6.5 |
| Tractocamión Aerodinámico | 5 | 2 | 7.0 |
| Camión Torton | 3 | 1 | 8.0 |
| Rabón | 2 | 1 | 10.0 |

---

## 3. CÁLCULOS PRINCIPALES

### 3.1 Costo por Milla (CPM)

**Fórmula:**
```
CPM = Costo_Combustible + Nómina + Administrativos + Operacionales + Talacha + Llantas

Donde:
- Costo_Combustible = Precio_Diésel / MPG
- Talacha_Total = Talacha_Base + (Mantenimiento_Eje × Número_Ejes)
```

**Ejemplo con valores default:**
```
Costo_Combustible = $4.50 / 6.5 = $0.6923/milla
Talacha_Total = $0.08 + ($0.03 × 5) = $0.23/milla

CPM = $0.6923 + $0.55 + $0.15 + $0.20 + $0.23 + $0.05
CPM = $1.8723/milla
```

### 3.2 Costo Total del Viaje

**Fórmula:**
```
Costo_Total = (Millas × CPM) + Casetas
```

**Ejemplo:**
```
Millas = 500
CPM = $1.8723
Casetas = $150

Costo_Total = (500 × $1.8723) + $150 = $1,086.15
```

### 3.3 Utilidad (Profit)

**Fórmula:**
```
Utilidad = Tarifa_Flete - Costo_Total
```

**Ejemplo:**
```
Tarifa_Flete = $1,500
Costo_Total = $1,086.15

Utilidad = $1,500 - $1,086.15 = $413.85
```

### 3.4 Porcentaje de Utilidad (Margen)

**Fórmula:**
```
Margen_% = (Utilidad / Tarifa_Flete) × 100
```

**Ejemplo:**
```
Utilidad = $413.85
Tarifa_Flete = $1,500

Margen_% = ($413.85 / $1,500) × 100 = 27.59%
```

---

## 4. MÉTRICAS DE RENTABILIDAD

### 4.1 SPM (Sales Per Mile) - Venta por Milla

**Fórmula:**
```
SPM = Tarifa_Flete / Millas
```

**Interpretación:** Indica cuánto se cobra por cada milla recorrida.

### 4.2 CPM (Cost Per Mile) - Costo por Milla

**Fórmula:**
```
CPM = Costo_Total / Millas
```

**Interpretación:** Indica cuánto cuesta operar cada milla.

### 4.3 PPM (Profit Per Mile) - Utilidad por Milla

**Fórmula:**
```
PPM = (Tarifa_Flete - Costo_Total) / Millas
```

**Interpretación:** Indica la ganancia neta por cada milla recorrida.

### 4.4 Profit % - Porcentaje de Utilidad

**Fórmula:**
```
Profit_% = ((Tarifa_Flete - Costo_Total) / Tarifa_Flete) × 100
```

**Interpretación:** Indica el porcentaje de la tarifa que queda como ganancia.

---

## 5. MÓDULO DE VIAJE SENCILLO

### 5.1 Datos de Entrada

| Campo | Descripción |
|-------|-------------|
| Origen | Ciudad/ubicación de partida |
| Destino | Ciudad/ubicación de llegada |
| Millas | Distancia del recorrido |
| Tarifa del Flete | Precio cobrado al cliente (USD) |
| Casetas | Costo de peajes (USD) |
| Toneladas de Carga | Peso de la mercancía |

### 5.2 Cálculos Realizados

```javascript
// Costo base (sin casetas)
baseCost = millas × CPM

// Costo total
totalCost = baseCost + casetas

// Ingresos
revenue = tarifa_flete
revenuePerMile = revenue / millas

// Utilidad
profit = revenue - totalCost
profitPercent = (profit / revenue) × 100
profitPerMile = profit / millas

// Desglose de costos
fuelCost = (dieselPrice / mpg) × millas
payrollCost = payrollPerMile × millas
adminCost = adminPerMile × millas
operationalCost = operationalPerMile × millas
talachaCost = (talachaPerMile + mantenimientoEje × ejes) × millas
llantasCost = llantasPerMile × millas
```

### 5.3 Tarifa Ideal

Calcula la tarifa mínima necesaria para alcanzar un margen objetivo.

**Fórmula:**
```
Tarifa_Ideal = Costo_Total / (1 - Margen_Objetivo / 100)
```

**Ejemplo (para 18% de margen):**
```
Costo_Total = $1,086.15
Margen_Objetivo = 18%

Tarifa_Ideal = $1,086.15 / (1 - 0.18) = $1,324.57
```

---

## 6. MÓDULO DE VUELTA COMPLETA

### 6.1 Estructura de Tramos

Cada tramo contiene:
- Tipo de movimiento (Cargado/Vacío)
- Origen y Destino
- Millas
- Tarifa
- Casetas
- Toneladas
- Cruce por tarifa (checkbox)
- Pago chofer cruce (si aplica)

### 6.2 Cálculo de Totales

```javascript
// Suma de todos los tramos
totalMillas = Σ(millas de cada tramo)
totalTarifa = Σ(tarifa de cada tramo)
totalCasetas = Σ(casetas de cada tramo)

// Costo total del viaje
totalCosto = (totalMillas × CPM) + totalCasetas

// Utilidad del viaje completo
utilidad = totalTarifa - totalCosto

// Margen del viaje
margen = (utilidad / totalTarifa) × 100
```

### 6.3 Tipos de Movimiento

| Código | Tipo | Descripción |
|--------|------|-------------|
| L | Loaded | Cargado - genera tarifa |
| E | Empty | Vacío - solo genera costo |
| D | Deadhead | Reposicionamiento |
| B | Bobtail | Sin remolque |

---

## 7. REPORTE DE LIQUIDACIÓN

### 7.1 Estructura del Reporte

El reporte divide el viaje en tres secciones:

1. **TRAMO DE IDA** - Viaje cargado de origen a destino
2. **EMPTY MILES TO LOAD** - Millas vacías para cargar
3. **TRAMO DE REGRESO** - Viaje cargado de regreso

### 7.2 Cálculos por Tramo

```javascript
// Para cada tramo (IDA/REGRESO):
costo = millas × CPM
diesel = millas × (dieselPrice / mpg)
spm = tarifa / millas
cpm = CPM (constante)
ppm = (tarifa - costo) / millas
profit = ((tarifa - costo) / tarifa) × 100

// Para VACÍO:
costo = millas × CPM
// No genera tarifa, solo costo
```

### 7.3 Cálculos Totales

```javascript
// Millas totales (incluyendo vacío)
totalMillas = millasIda + millasVacio + millasRegreso

// Tarifa total (solo tramos cargados)
totalTarifa = tarifaIda + tarifaRegreso

// Costo total
totalCosto = totalMillas × CPM

// Métricas totales
spmTotal = totalTarifa / (millasIda + millasRegreso)  // Solo millas productivas
cpmTotal = CPM
ppmTotal = (totalTarifa - totalCosto) / totalMillas
profitTotal = ((totalTarifa - totalCosto) / totalTarifa) × 100
```

### 7.4 Utilidad Neta

```javascript
utilidadNeta = totalTarifa - totalCosto
```

---

## 8. CONVERSIONES DE UNIDADES

### 8.1 Distancia

| De | A | Factor |
|----|---|--------|
| Millas | Kilómetros | × 1.60934 |
| Kilómetros | Millas | × 0.621371 |

### 8.2 Peso

| De | A | Factor |
|----|---|--------|
| Toneladas | Libras | × 2,204.62 |
| Toneladas | Kilogramos | × 1,000 |
| Libras | Toneladas | ÷ 2,204.62 |
| Kilogramos | Toneladas | ÷ 1,000 |

### 8.3 Moneda

```javascript
// USD a MXN
valorMXN = valorUSD × tipoCambio

// MXN a USD
valorUSD = valorMXN / tipoCambio
```

---

## 9. CLASIFICACIÓN DE RENTABILIDAD

### 9.1 Niveles de Rentabilidad

| Estado | Margen Mínimo | Color | Descripción |
|--------|---------------|-------|-------------|
| IDEAL | ≥ 25% | Azul | Excelente rentabilidad |
| ESTABLE | ≥ 18% | Verde | Rentabilidad aceptable |
| COMODÍN | ≥ 10% | Amarillo | Rentabilidad marginal |
| NO RENTABLE | < 10% | Rojo | Pérdida o muy baja rentabilidad |

### 9.2 Lógica de Clasificación

```javascript
function getStatus(profitPercent) {
  if (profitPercent >= 25) return 'ideal'      // Azul
  if (profitPercent >= 18) return 'stable'     // Verde
  if (profitPercent >= 10) return 'comodin'    // Amarillo
  return 'danger'                               // Rojo
}
```

---

## 10. LÍMITES DE PESO POR ZONA

### 10.1 Zonas de Operación

| Zona | Peso Máximo (lbs) | Descripción |
|------|-------------------|-------------|
| Federal USA | 80,000 | Carreteras federales de Estados Unidos |
| California | 80,000 | Estado de California |
| Texas | 84,000 | Estado de Texas (con permisos) |
| México Federal | 75,000 | Carreteras federales de México |
| México Local | 66,000 | Carreteras locales de México |

### 10.2 Validación de Peso

```javascript
// Convertir toneladas a libras
pesoEnLbs = toneladas × 2204.62

// Verificar si excede el límite
excedePeso = pesoEnLbs > limiteZona

// Si excede, mostrar advertencia
if (excedePeso) {
  mostrarAdvertencia("¡Excede límite de peso!")
}
```

---

## APÉNDICE A: RUTAS PREDEFINIDAS (STC)

### Rutas Disponibles

| Ruta | Millas | Casetas USD | Origen ZIP | Destino ZIP |
|------|--------|-------------|------------|-------------|
| Tijuana - Los Angeles | 135 | $0 | 22000 | 90001 |
| Tijuana - San Diego | 20 | $0 | 22000 | 92101 |
| Tijuana - Phoenix | 350 | $0 | 22000 | 85001 |
| Tijuana - Dallas | 1,450 | $25 | 22000 | 75201 |
| Tijuana - Houston | 1,550 | $20 | 22000 | 77001 |
| Tijuana - Chicago | 2,050 | $45 | 22000 | 60601 |
| Tijuana - Atlanta | 2,200 | $35 | 22000 | 30301 |
| Tijuana - Miami | 2,750 | $40 | 22000 | 33101 |
| Tijuana - New York | 2,800 | $120 | 22000 | 10001 |
| Tijuana - Laredo | 1,275 | $0 | 22000 | 78040 |
| Los Angeles - Houston | 1,550 | $15 | 90001 | 77001 |
| Laredo - Dallas | 440 | $10 | 78040 | 75201 |
| Laredo - Houston | 320 | $8 | 78040 | 77001 |
| Laredo - San Antonio | 157 | $5 | 78040 | 78201 |

---

## APÉNDICE B: FÓRMULAS RESUMEN

### Fórmulas Clave

```
┌─────────────────────────────────────────────────────────────┐
│ COSTO POR MILLA (CPM)                                       │
│ CPM = (Diesel/MPG) + Nómina + Admin + Operacional +         │
│       Talacha + (Mant.Eje × Ejes) + Llantas                 │
├─────────────────────────────────────────────────────────────┤
│ COSTO TOTAL                                                 │
│ Costo = (Millas × CPM) + Casetas                            │
├─────────────────────────────────────────────────────────────┤
│ UTILIDAD                                                    │
│ Utilidad = Tarifa - Costo                                   │
├─────────────────────────────────────────────────────────────┤
│ MARGEN DE UTILIDAD                                          │
│ Margen% = (Utilidad / Tarifa) × 100                         │
├─────────────────────────────────────────────────────────────┤
│ TARIFA IDEAL (para margen objetivo)                         │
│ Tarifa = Costo / (1 - Margen% / 100)                        │
├─────────────────────────────────────────────────────────────┤
│ SPM (Venta por Milla)                                       │
│ SPM = Tarifa / Millas                                       │
├─────────────────────────────────────────────────────────────┤
│ PPM (Utilidad por Milla)                                    │
│ PPM = Utilidad / Millas                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## APÉNDICE C: EJEMPLO COMPLETO

### Escenario: Viaje Tijuana → Los Angeles

**Datos de entrada:**
- Millas: 135
- Tarifa: $450 USD
- Casetas: $0
- Toneladas: 18

**Configuración:**
- MPG: 6.5
- Diesel: $4.50/galón
- Nómina: $0.55/milla
- Admin: $0.15/milla
- Operacional: $0.20/milla
- Talacha: $0.08/milla
- Llantas: $0.05/milla
- Mant. Eje: $0.03/milla
- Ejes: 5

**Cálculos:**

```
1. Costo de combustible por milla:
   $4.50 / 6.5 = $0.6923/milla

2. Talacha total:
   $0.08 + ($0.03 × 5) = $0.23/milla

3. CPM Total:
   $0.6923 + $0.55 + $0.15 + $0.20 + $0.23 + $0.05 = $1.8723/milla

4. Costo total del viaje:
   135 × $1.8723 + $0 = $252.76

5. Utilidad:
   $450 - $252.76 = $197.24

6. Margen de utilidad:
   ($197.24 / $450) × 100 = 43.83%

7. SPM:
   $450 / 135 = $3.33/milla

8. PPM:
   $197.24 / 135 = $1.46/milla
```

**Resultado:** ✅ IDEAL (43.83% > 25%)

---

**Documento generado por:** Tablero de Rentabilidad de Rutas  
**Contacto:** Tijuana, Baja California
