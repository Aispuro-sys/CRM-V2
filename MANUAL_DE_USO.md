# 📘 MANUAL DE USO
## Tablero de Rentabilidad de Rutas

---

## 📋 ÍNDICE

1. [Inicio Rápido](#1-inicio-rápido)
2. [Interfaz Principal](#2-interfaz-principal)
3. [Configuración de Costos](#3-configuración-de-costos)
4. [Viaje Sencillo](#4-viaje-sencillo)
5. [Vuelta Completa](#5-vuelta-completa)
6. [Reporte de Liquidación](#6-reporte-de-liquidación)
7. [Historial de Rutas](#7-historial-de-rutas)
8. [Conversiones de Unidades](#8-conversiones-de-unidades)
9. [Interpretación de Resultados](#9-interpretación-de-resultados)
10. [Preguntas Frecuentes](#10-preguntas-frecuentes)

---

## 1. INICIO RÁPIDO

### Acceder a la Aplicación
1. Abrir el navegador web
2. Ir a la dirección: `http://localhost:5174` (o la URL proporcionada)
3. La aplicación cargará automáticamente

### Flujo Básico de Uso
```
1. Configurar costos operativos (si es necesario)
2. Seleccionar tipo de viaje (Sencillo o Vuelta Completa)
3. Ingresar datos del viaje
4. Ver análisis de rentabilidad
5. Guardar en historial (opcional)
```

---

## 2. INTERFAZ PRINCIPAL

### Barra Superior (Header)
La barra superior contiene los controles principales:

| Control | Función |
|---------|---------|
| **🚛 Logo** | Título de la aplicación |
| **Millas / Km** | Alternar entre millas y kilómetros |
| **Ton / Lbs / Kg** | Cambiar unidad de peso |
| **USD / MXN** | Cambiar moneda de visualización |
| **Tipo de Cambio** | Muestra el TC actual (editable) |
| **⚙️ Configuración** | Abrir panel de configuración |
| **📋 Historial** | Ver historial de rutas |

### Panel Lateral (Sidebar)
- **Viaje Sencillo**: Análisis de un solo trayecto
- **Vuelta Completa**: Análisis de múltiples tramos
- **Reporte Liquidación**: Generar reporte detallado

---

## 3. CONFIGURACIÓN DE COSTOS

### Acceder a Configuración
1. Clic en el ícono ⚙️ (engranaje) en la barra superior
2. Se abrirá el panel de configuración

### Parámetros Configurables

#### Combustible
| Campo | Descripción | Valor Default |
|-------|-------------|---------------|
| **Precio Diésel** | Precio por galón en USD | $4.50 |
| **MPG** | Millas por galón (rendimiento) | 6.5 |

#### Costos por Milla
| Campo | Descripción | Valor Default |
|-------|-------------|---------------|
| **Nómina** | Costo de mano de obra | $0.55/mi |
| **Administrativos** | Gastos de oficina | $0.15/mi |
| **Operacionales** | Gastos operativos | $0.20/mi |
| **Talacha** | Mantenimiento general | $0.08/mi |
| **Llantas** | Desgaste de llantas | $0.05/mi |
| **Mantenimiento/Eje** | Por cada eje | $0.03/mi |

#### Vehículo
| Campo | Descripción |
|-------|-------------|
| **Tipo de Camión** | Day Cab, Sleeper, etc. |
| **Número de Ejes** | Afecta costo de mantenimiento |
| **Tipo de Caja** | 53' Dry Van, Reefer, etc. |
| **Zona de Operación** | California, Texas, México |

### Guardar Configuración
- Los cambios se aplican automáticamente
- La configuración se guarda en el navegador

---

## 4. VIAJE SENCILLO

### ¿Cuándo usar?
- Viajes de un solo trayecto (punto A a punto B)
- Análisis rápido de rentabilidad

### Pasos para Analizar

#### Paso 1: Seleccionar Ruta
1. Usar el selector **"Ruta STC"** para elegir una ruta predefinida
2. O escribir manualmente origen y destino

**Rutas Disponibles:**
- **USA**: Tijuana-LA, Tijuana-Dallas, Laredo-Houston, etc.
- **México**: Tijuana-CDMX, Monterrey-CDMX, Guadalajara-CDMX, etc.

#### Paso 2: Ingresar Datos
| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| **Origen** | Ciudad de partida | Tijuana, BC |
| **Destino** | Ciudad de llegada | Los Angeles, CA |
| **Millas** | Distancia del viaje | 135 |
| **Tarifa del Flete** | Precio cobrado al cliente | $450 |
| **Casetas** | Costo de peajes | $0 |
| **Toneladas** | Peso de la carga | 18 |

#### Paso 3: Ver Resultados
El sistema calcula automáticamente:
- **Costo Total**: Suma de todos los costos
- **Utilidad**: Tarifa - Costo
- **Margen %**: Porcentaje de ganancia
- **SPM**: Venta por milla
- **PPM**: Utilidad por milla
- **Tarifa Ideal**: Tarifa mínima recomendada

#### Paso 4: Guardar (Opcional)
- Clic en **"Guardar en Historial"** para registrar el análisis

---

## 5. VUELTA COMPLETA

### ¿Cuándo usar?
- Viajes con múltiples paradas
- Viajes redondos (ida y vuelta)
- Análisis de rutas complejas

### Estructura de Tramos
Cada tramo representa un segmento del viaje:

| Campo | Descripción |
|-------|-------------|
| **Tipo** | L (Cargado), E (Vacío), B (Bobtail) |
| **Origen** | Punto de partida del tramo |
| **Destino** | Punto de llegada del tramo |
| **Millas** | Distancia del tramo |
| **Tarifa** | Ingreso del tramo (si aplica) |
| **Casetas** | Peajes del tramo |
| **Toneladas** | Peso de carga |
| **Cruce por Tarifa** | ✓ Si es cruce fronterizo |
| **Pago Chofer Cruce** | Monto adicional para chofer |

### Agregar Tramos
1. Clic en **"+ Agregar Tramo"**
2. Completar los datos del tramo
3. Repetir para cada segmento del viaje

### Ejemplo de Vuelta Completa
```
Tramo 1: Tijuana → Los Angeles (Cargado) - 135 mi - $450
Tramo 2: Los Angeles → Phoenix (Vacío) - 370 mi - $0
Tramo 3: Phoenix → Tijuana (Cargado) - 355 mi - $380
```

### Ver Resumen
El sistema muestra:
- Total de millas
- Total de tarifas
- Total de casetas
- Pago chofer cruce (si aplica)
- Costo total
- Utilidad y margen

---

## 6. REPORTE DE LIQUIDACIÓN

### ¿Qué es?
Un reporte detallado del viaje dividido en secciones:
- **Tramo de Ida**: Viaje cargado inicial
- **Empty Miles**: Millas vacías para cargar
- **Tramo de Regreso**: Viaje cargado de regreso

### Generar Reporte
1. Seleccionar **"Reporte Liquidación"** en el menú
2. Completar los datos de cada sección
3. Clic en **"Generar PDF"**

### Datos del Reporte
| Sección | Campos |
|---------|--------|
| **Información General** | WO#, Cliente, Fechas |
| **Tramo Ida** | Origen, Destino, Millas, Tarifa |
| **Empty Miles** | Millas vacías, Ubicación |
| **Tramo Regreso** | Origen, Destino, Millas, Tarifa |

### Exportar PDF
- El reporte se descarga automáticamente
- Nombre: `Liquidacion_[WO#]_[Fecha].pdf`

---

## 7. HISTORIAL DE RUTAS

### Acceder al Historial
1. Clic en el ícono 📋 (historial) en la barra superior
2. Se muestra la lista de rutas guardadas

### Información Mostrada
| Campo | Descripción |
|-------|-------------|
| **Fecha** | Cuándo se guardó |
| **Tipo** | Sencillo o Vuelta Completa |
| **Ruta** | Origen → Destino |
| **Millas** | Distancia total |
| **Tarifa** | Ingreso total |
| **Utilidad** | Ganancia |
| **Margen** | Porcentaje |

### Acciones
- **Ver**: Cargar los datos del viaje
- **Eliminar**: Borrar del historial

---

## 8. CONVERSIONES DE UNIDADES

### Distancia
| Botón | Función |
|-------|---------|
| **mi** | Mostrar en millas |
| **km** | Mostrar en kilómetros |

*Factor: 1 milla = 1.60934 km*

### Peso
| Botón | Función |
|-------|---------|
| **ton** | Toneladas métricas |
| **lbs** | Libras |
| **kg** | Kilogramos |

*Factores:*
- 1 tonelada = 2,204.62 lbs
- 1 tonelada = 1,000 kg

### Moneda
| Botón | Función |
|-------|---------|
| **USD** | Dólares americanos |
| **MXN** | Pesos mexicanos |

*El tipo de cambio es editable en la barra superior*

---

## 9. INTERPRETACIÓN DE RESULTADOS

### Clasificación de Rentabilidad

| Estado | Margen | Color | Significado |
|--------|--------|-------|-------------|
| **IDEAL** | ≥ 25% | 🔵 Azul | Excelente rentabilidad |
| **ESTABLE** | ≥ 18% | 🟢 Verde | Rentabilidad aceptable |
| **COMODÍN** | ≥ 10% | 🟡 Amarillo | Rentabilidad marginal |
| **NO RENTABLE** | < 10% | 🔴 Rojo | Pérdida o muy baja |

### Métricas Clave

| Métrica | Fórmula | Interpretación |
|---------|---------|----------------|
| **SPM** | Tarifa ÷ Millas | Cuánto cobras por milla |
| **CPM** | Costo ÷ Millas | Cuánto te cuesta por milla |
| **PPM** | Utilidad ÷ Millas | Cuánto ganas por milla |
| **Margen %** | (Utilidad ÷ Tarifa) × 100 | % de ganancia |

### Tarifa Ideal
- Es la tarifa mínima para alcanzar el margen objetivo (18%)
- Fórmula: `Costo Total ÷ (1 - 0.18)`
- Si tu tarifa es menor, considera renegociar

### Alertas de Peso
- ⚠️ Se muestra cuando la carga excede el límite de la zona
- Límites por zona:
  - California/Federal USA: 80,000 lbs
  - Texas: 84,000 lbs
  - México: 75,000 lbs (local)

---

## 10. PREGUNTAS FRECUENTES

### ¿Cómo actualizo el tipo de cambio?
1. Clic en el campo de tipo de cambio en la barra superior
2. Ingresa el nuevo valor
3. Presiona Enter

### ¿Por qué mi viaje aparece en rojo?
El margen de utilidad es menor al 10%. Revisa:
- Si la tarifa es muy baja
- Si las millas son correctas
- Si hay costos adicionales no considerados

### ¿Cómo agrego una ruta personalizada?
1. Selecciona "Personalizada" en el selector de rutas
2. Escribe manualmente origen, destino y millas
3. Ingresa el costo de casetas si aplica

### ¿Los datos se guardan?
- La configuración se guarda en el navegador (localStorage)
- El historial se mantiene hasta 100 registros
- Al limpiar datos del navegador, se pierden

### ¿Cómo exporto a PDF?
- **Viaje Sencillo**: Usa la función de imprimir del navegador (Ctrl+P)
- **Liquidación**: Clic en "Generar PDF" para descarga automática

### ¿Puedo usar la app en móvil?
Sí, la aplicación es responsiva y funciona en:
- Tablets
- Teléfonos móviles
- Cualquier navegador moderno

---

## 📞 SOPORTE

Para dudas o problemas:
- Revisar este manual
- Contactar al administrador del sistema

---

*Manual de Usuario - Tablero de Rentabilidad de Rutas v1.0*
*Última actualización: Abril 2026*
