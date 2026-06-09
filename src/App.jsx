import { useState, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Analytics } from '@vercel/analytics/react'
import { 
  Truck, 
  Settings, 
  TrendingUp, 
  DollarSign, 
  MapPin, 
  ArrowRight, 
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Fuel,
  Users,
  Building2,
  Wrench,
  Calculator,
  RotateCcw,
  Navigation,
  Box,
  Weight,
  Gauge,
  Route,
  CircleDollarSign,
  Cog,
  Package,
  Scale,
  Plus,
  Trash2,
  UserCircle,
  Warehouse,
  MoveHorizontal,
  Edit3,
  Save,
  X,
  Map,
  History,
  FileText,
  Lock,
  Unlock,
  ClipboardList,
  Download,
  Eye
} from 'lucide-react'

import './App.css'

const TIPOS_MOVIMIENTO = [
  { id: 'B', nombre: 'Botado', descripcion: 'Drop off - Dejar contenedor', color: '#f59e0b' },
  { id: 'E', nombre: 'Empty (Vacío)', descripcion: 'Movimiento sin carga', color: '#6b7280' },
  { id: 'L', nombre: 'Loaded (Cargado)', descripcion: 'Movimiento con carga', color: '#10b981' },
]

const UBICACIONES_YARDA = [
  { id: 'custom', nombre: '-- Escribir ubicación --', tipo: 'custom', lat: null, lng: null },
  { id: 'yarda_tj', nombre: 'Yarda Tijuana', tipo: 'yarda', ciudad: 'Tijuana, BC', lat: 32.5149, lng: -117.0382 },
  { id: 'yarda_otay', nombre: 'Yarda Otay', tipo: 'yarda', ciudad: 'Tijuana, BC', lat: 32.5522, lng: -116.9719 },
  { id: 'yarda_la', nombre: 'Yarda Los Angeles', tipo: 'yarda', ciudad: 'Los Angeles, CA', lat: 33.9425, lng: -118.2551 },
  { id: 'yarda_sd', nombre: 'Yarda San Diego', tipo: 'yarda', ciudad: 'San Diego, CA', lat: 32.7157, lng: -117.1611 },
  { id: 'puerto_la', nombre: 'Puerto Los Angeles', tipo: 'puerto', ciudad: 'Los Angeles, CA', lat: 33.7361, lng: -118.2642 },
  { id: 'puerto_lb', nombre: 'Puerto Long Beach', tipo: 'puerto', ciudad: 'Long Beach, CA', lat: 33.7544, lng: -118.2166 },
  { id: 'puerto_sd', nombre: 'Puerto San Diego', tipo: 'puerto', ciudad: 'San Diego, CA', lat: 32.6871, lng: -117.1442 },
  { id: 'puerto_ensenada', nombre: 'Puerto Ensenada', tipo: 'puerto', ciudad: 'Ensenada, BC', lat: 31.8667, lng: -116.6167 },
  { id: 'bodega_tj', nombre: 'Bodega Tijuana', tipo: 'bodega', ciudad: 'Tijuana, BC', lat: 32.5027, lng: -117.0037 },
  { id: 'bodega_la', nombre: 'Bodega Los Angeles', tipo: 'bodega', ciudad: 'Los Angeles, CA', lat: 33.9850, lng: -118.3017 },
  { id: 'cliente_pickup', nombre: 'Pickup Cliente', tipo: 'cliente', ciudad: '', lat: null, lng: null },
  { id: 'cliente_delivery', nombre: 'Delivery Cliente', tipo: 'cliente', ciudad: '', lat: null, lng: null },
  { id: 'aduana_otay', nombre: 'Aduana Otay', tipo: 'aduana', ciudad: 'Tijuana, BC', lat: 32.5530, lng: -116.9386 },
  { id: 'aduana_tecate', nombre: 'Aduana Tecate', tipo: 'aduana', ciudad: 'Tecate, BC', lat: 32.5722, lng: -116.6267 },
  { id: 'rail_la', nombre: 'Rail Yard LA', tipo: 'rail', ciudad: 'Los Angeles, CA', lat: 33.9772, lng: -118.2372 },
  { id: 'laredo', nombre: 'Laredo, TX', tipo: 'ciudad', ciudad: 'Laredo, TX', lat: 27.5036, lng: -99.5075 },
  { id: 'houston', nombre: 'Houston, TX', tipo: 'ciudad', ciudad: 'Houston, TX', lat: 29.7604, lng: -95.3698 },
  { id: 'dallas', nombre: 'Dallas, TX', tipo: 'ciudad', ciudad: 'Dallas, TX', lat: 32.7767, lng: -96.7970 },
  { id: 'phoenix', nombre: 'Phoenix, AZ', tipo: 'ciudad', ciudad: 'Phoenix, AZ', lat: 33.4484, lng: -112.0740 },
  { id: 'chicago', nombre: 'Chicago, IL', tipo: 'ciudad', ciudad: 'Chicago, IL', lat: 41.8781, lng: -87.6298 },
]

const DISTANCIAS_COMUNES = [
  { origen: 'yarda_tj', destino: 'puerto_la', millas: 130 },
  { origen: 'yarda_tj', destino: 'puerto_lb', millas: 135 },
  { origen: 'yarda_tj', destino: 'yarda_la', millas: 125 },
  { origen: 'yarda_otay', destino: 'puerto_la', millas: 128 },
  { origen: 'puerto_la', destino: 'yarda_la', millas: 25 },
  { origen: 'puerto_lb', destino: 'yarda_la', millas: 28 },
  { origen: 'yarda_sd', destino: 'puerto_la', millas: 120 },
  { origen: 'aduana_otay', destino: 'yarda_tj', millas: 5 },
  { origen: 'aduana_otay', destino: 'puerto_la', millas: 130 },
]

const RUTAS_STC = [
  { 
    id: 'custom', 
    nombre: 'Personalizada', 
    origen: '', 
    destino: '', 
    origenZip: '',
    destinoZip: '',
    origenDir: '',
    destinoDir: '',
    millas: 0, 
    millasMin: 0,
    millasMax: 0,
    casetas: 0,
    casetasDetalle: '',
    origenLat: null,
    origenLng: null,
    destinoLat: null,
    destinoLng: null,
    pais: 'custom'
  },
  // ============ RUTAS USA (Interstate) ============
  { 
    id: 'tj-la', 
    nombre: 'Tijuana - Los Angeles', 
    origen: 'Tijuana, BC', 
    destino: 'Los Angeles, CA',
    origenZip: '22000',
    destinoZip: '90731',
    origenDir: 'Garita de Otay, Tijuana, BC',
    destinoDir: 'Port of Los Angeles, 425 S Palos Verdes St, San Pedro, CA',
    millas: 135, 
    millasMin: 130,
    millasMax: 145,
    casetas: 0,
    casetasDetalle: 'Sin casetas - I-5 / I-405',
    origenLat: 32.5530,
    origenLng: -116.9386,
    destinoLat: 33.7361,
    destinoLng: -118.2642,
    pais: 'USA'
  },
  { 
    id: 'tj-colton', 
    nombre: 'Tijuana - Colton, CA', 
    origen: 'Tijuana, BC', 
    destino: 'Colton, CA',
    origenZip: '22000',
    destinoZip: '92324',
    origenDir: 'Garita de Otay, Tijuana, BC',
    destinoDir: 'Colton, CA 92324',
    millas: 120, 
    millasMin: 115,
    millasMax: 130,
    casetas: 0,
    casetasDetalle: 'Sin casetas - I-15',
    origenLat: 32.5530,
    origenLng: -116.9386,
    destinoLat: 34.0739,
    destinoLng: -117.3136,
    pais: 'USA',
    ratesDryVan: 800,
    ratesFlatbed: 950,
    fscPercent: 61
  },
  { 
    id: 'tj-sandiego', 
    nombre: 'Tijuana - San Diego', 
    origen: 'Tijuana, BC', 
    destino: 'San Diego, CA',
    origenZip: '22000',
    destinoZip: '92101',
    origenDir: 'Garita de Otay, Tijuana, BC',
    destinoDir: '1220 Pacific Hwy, San Diego, CA',
    millas: 20, 
    millasMin: 18,
    millasMax: 25,
    casetas: 0,
    casetasDetalle: 'Sin casetas',
    origenLat: 32.5530,
    origenLng: -116.9386,
    destinoLat: 32.7157,
    destinoLng: -117.1611,
    pais: 'USA'
  },
  { 
    id: 'tj-phoenix', 
    nombre: 'Tijuana - Phoenix', 
    origen: 'Tijuana, BC', 
    destino: 'Phoenix, AZ',
    origenZip: '22000',
    destinoZip: '85001',
    origenDir: 'Garita de Otay, Tijuana, BC',
    destinoDir: '401 E Jefferson St, Phoenix, AZ',
    millas: 355, 
    millasMin: 350,
    millasMax: 380,
    casetas: 0,
    casetasDetalle: 'Sin casetas - I-8 / I-10',
    origenLat: 32.5530,
    origenLng: -116.9386,
    destinoLat: 33.4484,
    destinoLng: -112.0740,
    pais: 'USA'
  },
  { 
    id: 'tj-laredo', 
    nombre: 'Tijuana - Laredo (via USA)', 
    origen: 'Tijuana, BC', 
    destino: 'Laredo, TX',
    origenZip: '22000',
    destinoZip: '78040',
    origenDir: 'Garita de Otay, Tijuana, BC',
    destinoDir: 'World Trade Bridge, Laredo, TX',
    millas: 1275, 
    millasMin: 1250,
    millasMax: 1300,
    casetas: 0,
    casetasDetalle: 'Sin casetas - I-10 / I-35',
    origenLat: 32.5530,
    origenLng: -116.9386,
    destinoLat: 27.5036,
    destinoLng: -99.5075,
    pais: 'USA'
  },
  { 
    id: 'tj-dallas', 
    nombre: 'Tijuana - Dallas', 
    origen: 'Tijuana, BC', 
    destino: 'Dallas, TX',
    origenZip: '22000',
    destinoZip: '75201',
    origenDir: 'Garita de Otay, Tijuana, BC',
    destinoDir: '2323 Bryan St, Dallas, TX',
    millas: 1435, 
    millasMin: 1400,
    millasMax: 1480,
    casetas: 0,
    casetasDetalle: 'Sin casetas - I-10 / I-20',
    origenLat: 32.5530,
    origenLng: -116.9386,
    destinoLat: 32.7767,
    destinoLng: -96.7970,
    pais: 'USA'
  },
  { 
    id: 'tj-houston', 
    nombre: 'Tijuana - Houston', 
    origen: 'Tijuana, BC', 
    destino: 'Houston, TX',
    origenZip: '22000',
    destinoZip: '77001',
    origenDir: 'Garita de Otay, Tijuana, BC',
    destinoDir: 'Port of Houston, 111 East Loop N, Houston, TX',
    millas: 1550, 
    millasMin: 1520,
    millasMax: 1600,
    casetas: 0,
    casetasDetalle: 'Sin casetas - I-10',
    origenLat: 32.5530,
    origenLng: -116.9386,
    destinoLat: 29.7604,
    destinoLng: -95.3698,
    pais: 'USA'
  },
  { 
    id: 'tj-chicago', 
    nombre: 'Tijuana - Chicago', 
    origen: 'Tijuana, BC', 
    destino: 'Chicago, IL',
    origenZip: '22000',
    destinoZip: '60601',
    origenDir: 'Garita de Otay, Tijuana, BC',
    destinoDir: '233 S Wacker Dr, Chicago, IL',
    millas: 2050, 
    millasMin: 2000,
    millasMax: 2100,
    casetas: 45,
    casetasDetalle: 'Illinois Tollway (~$45 USD)',
    origenLat: 32.5530,
    origenLng: -116.9386,
    destinoLat: 41.8781,
    destinoLng: -87.6298,
    pais: 'USA'
  },
  { 
    id: 'tj-atlanta', 
    nombre: 'Tijuana - Atlanta', 
    origen: 'Tijuana, BC', 
    destino: 'Atlanta, GA',
    origenZip: '22000',
    destinoZip: '30301',
    origenDir: 'Garita de Otay, Tijuana, BC',
    destinoDir: '191 Peachtree St NE, Atlanta, GA',
    millas: 2200, 
    millasMin: 2150,
    millasMax: 2280,
    casetas: 25,
    casetasDetalle: 'GA 400 + Peach Pass (~$25 USD)',
    origenLat: 32.5530,
    origenLng: -116.9386,
    destinoLat: 33.7490,
    destinoLng: -84.3880,
    pais: 'USA'
  },
  { 
    id: 'tj-miami', 
    nombre: 'Tijuana - Miami', 
    origen: 'Tijuana, BC', 
    destino: 'Miami, FL',
    origenZip: '22000',
    destinoZip: '33101',
    origenDir: 'Garita de Otay, Tijuana, BC',
    destinoDir: 'Port Miami, 1015 N America Way, Miami, FL',
    millas: 2750, 
    millasMin: 2700,
    millasMax: 2820,
    casetas: 65,
    casetasDetalle: 'Florida Turnpike + SunPass (~$65 USD)',
    origenLat: 32.5530,
    origenLng: -116.9386,
    destinoLat: 25.7617,
    destinoLng: -80.1918,
    pais: 'USA'
  },
  { 
    id: 'tj-nyc', 
    nombre: 'Tijuana - New York', 
    origen: 'Tijuana, BC', 
    destino: 'New York, NY',
    origenZip: '22000',
    destinoZip: '10001',
    origenDir: 'Garita de Otay, Tijuana, BC',
    destinoDir: 'Port Newark-Elizabeth, Newark, NJ',
    millas: 2800, 
    millasMin: 2750,
    millasMax: 2900,
    casetas: 120,
    casetasDetalle: 'NJ Turnpike + George Washington Bridge (~$120 USD)',
    origenLat: 32.5530,
    origenLng: -116.9386,
    destinoLat: 40.7128,
    destinoLng: -74.0060,
    pais: 'USA'
  },
  { 
    id: 'la-phoenix', 
    nombre: 'Los Angeles - Phoenix', 
    origen: 'Los Angeles, CA', 
    destino: 'Phoenix, AZ',
    origenZip: '90731',
    destinoZip: '85001',
    origenDir: 'Port of Los Angeles, San Pedro, CA',
    destinoDir: '401 E Jefferson St, Phoenix, AZ',
    millas: 370, 
    millasMin: 360,
    millasMax: 390,
    casetas: 0,
    casetasDetalle: 'Sin casetas - I-10',
    origenLat: 33.7361,
    origenLng: -118.2642,
    destinoLat: 33.4484,
    destinoLng: -112.0740,
    pais: 'USA'
  },
  { 
    id: 'la-dallas', 
    nombre: 'Los Angeles - Dallas', 
    origen: 'Los Angeles, CA', 
    destino: 'Dallas, TX',
    origenZip: '90731',
    destinoZip: '75201',
    origenDir: 'Port of Los Angeles, San Pedro, CA',
    destinoDir: '2323 Bryan St, Dallas, TX',
    millas: 1435, 
    millasMin: 1400,
    millasMax: 1480,
    casetas: 0,
    casetasDetalle: 'Sin casetas - I-10 / I-20',
    origenLat: 33.7361,
    origenLng: -118.2642,
    destinoLat: 32.7767,
    destinoLng: -96.7970,
    pais: 'USA'
  },
  { 
    id: 'la-houston', 
    nombre: 'Los Angeles - Houston', 
    origen: 'Los Angeles, CA', 
    destino: 'Houston, TX',
    origenZip: '90731',
    destinoZip: '77001',
    origenDir: 'Port of Los Angeles, San Pedro, CA',
    destinoDir: 'Port of Houston, 111 East Loop N, Houston, TX',
    millas: 1550, 
    millasMin: 1520,
    millasMax: 1600,
    casetas: 0,
    casetasDetalle: 'Sin casetas - I-10',
    origenLat: 33.7361,
    origenLng: -118.2642,
    destinoLat: 29.7604,
    destinoLng: -95.3698,
    pais: 'USA'
  },
  { 
    id: 'laredo-dallas', 
    nombre: 'Laredo - Dallas', 
    origen: 'Laredo, TX', 
    destino: 'Dallas, TX',
    origenZip: '78040',
    destinoZip: '75201',
    origenDir: 'World Trade Bridge, Laredo, TX',
    destinoDir: '2323 Bryan St, Dallas, TX',
    millas: 440, 
    millasMin: 430,
    millasMax: 460,
    casetas: 0,
    casetasDetalle: 'Sin casetas - I-35',
    origenLat: 27.5036,
    origenLng: -99.5075,
    destinoLat: 32.7767,
    destinoLng: -96.7970,
    pais: 'USA'
  },
  { 
    id: 'laredo-houston', 
    nombre: 'Laredo - Houston', 
    origen: 'Laredo, TX', 
    destino: 'Houston, TX',
    origenZip: '78040',
    destinoZip: '77001',
    origenDir: 'World Trade Bridge, Laredo, TX',
    destinoDir: 'Port of Houston, 111 East Loop N, Houston, TX',
    millas: 320, 
    millasMin: 310,
    millasMax: 340,
    casetas: 0,
    casetasDetalle: 'Sin casetas - I-35 / US-59',
    origenLat: 27.5036,
    origenLng: -99.5075,
    destinoLat: 29.7604,
    destinoLng: -95.3698,
    pais: 'USA'
  },
  { 
    id: 'laredo-sanantonio', 
    nombre: 'Laredo - San Antonio', 
    origen: 'Laredo, TX', 
    destino: 'San Antonio, TX',
    origenZip: '78040',
    destinoZip: '78201',
    origenDir: 'World Trade Bridge, Laredo, TX',
    destinoDir: '100 Montana St, San Antonio, TX',
    millas: 157, 
    millasMin: 150,
    millasMax: 165,
    casetas: 0,
    casetasDetalle: 'Sin casetas - I-35',
    origenLat: 27.5036,
    origenLng: -99.5075,
    destinoLat: 29.4241,
    destinoLng: -98.4936,
    pais: 'USA'
  },
  { 
    id: 'dallas-houston', 
    nombre: 'Dallas - Houston', 
    origen: 'Dallas, TX', 
    destino: 'Houston, TX',
    origenZip: '75201',
    destinoZip: '77001',
    origenDir: '2323 Bryan St, Dallas, TX',
    destinoDir: 'Port of Houston, 111 East Loop N, Houston, TX',
    millas: 240, 
    millasMin: 235,
    millasMax: 250,
    casetas: 0,
    casetasDetalle: 'Sin casetas - I-45',
    origenLat: 32.7767,
    origenLng: -96.7970,
    destinoLat: 29.7604,
    destinoLng: -95.3698,
    pais: 'USA'
  },
  { 
    id: 'houston-atlanta', 
    nombre: 'Houston - Atlanta', 
    origen: 'Houston, TX', 
    destino: 'Atlanta, GA',
    origenZip: '77001',
    destinoZip: '30301',
    origenDir: 'Port of Houston, 111 East Loop N, Houston, TX',
    destinoDir: '191 Peachtree St NE, Atlanta, GA',
    millas: 790, 
    millasMin: 770,
    millasMax: 820,
    casetas: 15,
    casetasDetalle: 'GA 400 (~$15 USD)',
    origenLat: 29.7604,
    origenLng: -95.3698,
    destinoLat: 33.7490,
    destinoLng: -84.3880,
    pais: 'USA'
  },
  // ============ RUTAS MÉXICO (SCT/CAPUFE) ============
  // Datos basados en sistema SIBUAC SCT - Casetas en MXN convertidas a USD aprox
  { 
    id: 'tj-ensenada', 
    nombre: 'Tijuana - Ensenada', 
    origen: 'Tijuana, BC', 
    destino: 'Ensenada, BC',
    origenZip: '22000',
    destinoZip: '22800',
    origenDir: 'Zona Industrial Otay, Tijuana, BC',
    destinoDir: 'Puerto de Ensenada, Ensenada, BC',
    millas: 68, // 110 km
    millasMin: 65,
    millasMax: 72,
    casetas: 8, // ~$150 MXN / 17.5 = $8.57 USD
    casetasDetalle: 'Caseta Playas de Tijuana + La Misión (~$150 MXN)',
    origenLat: 32.5149,
    origenLng: -117.0382,
    destinoLat: 31.8667,
    destinoLng: -116.6167,
    pais: 'MEX'
  },
  { 
    id: 'tj-mexicali', 
    nombre: 'Tijuana - Mexicali', 
    origen: 'Tijuana, BC', 
    destino: 'Mexicali, BC',
    origenZip: '22000',
    destinoZip: '21000',
    origenDir: 'Zona Industrial Otay, Tijuana, BC',
    destinoDir: 'Garita Mexicali II, Mexicali, BC',
    millas: 118, // 190 km
    millasMin: 115,
    millasMax: 125,
    casetas: 14, // ~$250 MXN
    casetasDetalle: 'Caseta La Rumorosa (~$250 MXN) - Autopista 2D',
    origenLat: 32.5149,
    origenLng: -117.0382,
    destinoLat: 32.6245,
    destinoLng: -115.4523,
    pais: 'MEX'
  },
  { 
    id: 'tj-hermosillo', 
    nombre: 'Tijuana - Hermosillo', 
    origen: 'Tijuana, BC', 
    destino: 'Hermosillo, SON',
    origenZip: '22000',
    destinoZip: '83000',
    origenDir: 'Zona Industrial Otay, Tijuana, BC',
    destinoDir: 'Zona Industrial, Hermosillo, SON',
    millas: 497, // 800 km
    millasMin: 490,
    millasMax: 510,
    casetas: 45, // ~$800 MXN
    casetasDetalle: '4 casetas: La Rumorosa, San Luis, Sonoyta, Santa Ana (~$800 MXN)',
    origenLat: 32.5149,
    origenLng: -117.0382,
    destinoLat: 29.0729,
    destinoLng: -110.9559,
    pais: 'MEX'
  },
  { 
    id: 'tj-guadalajara', 
    nombre: 'Tijuana - Guadalajara', 
    origen: 'Tijuana, BC', 
    destino: 'Guadalajara, JAL',
    origenZip: '22000',
    destinoZip: '44100',
    origenDir: 'Zona Industrial Otay, Tijuana, BC',
    destinoDir: 'Central de Abastos, Guadalajara, JAL',
    millas: 1367, // 2200 km
    millasMin: 1350,
    millasMax: 1400,
    casetas: 125, // ~$2,200 MXN
    casetasDetalle: '12+ casetas vía Mazatlán (~$2,200 MXN) - Autopista 15D',
    origenLat: 32.5149,
    origenLng: -117.0382,
    destinoLat: 20.6597,
    destinoLng: -103.3496,
    pais: 'MEX'
  },
  { 
    id: 'tj-cdmx', 
    nombre: 'Tijuana - CDMX', 
    origen: 'Tijuana, BC', 
    destino: 'Ciudad de México',
    origenZip: '22000',
    destinoZip: '06600',
    origenDir: 'Zona Industrial Otay, Tijuana, BC',
    destinoDir: 'Central de Abastos, Iztapalapa, CDMX',
    millas: 1740, // 2800 km
    millasMin: 1700,
    millasMax: 1800,
    casetas: 175, // ~$3,100 MXN
    casetasDetalle: '15+ casetas vía Mazatlán-GDL (~$3,100 MXN)',
    origenLat: 32.5149,
    origenLng: -117.0382,
    destinoLat: 19.3815,
    destinoLng: -99.0967,
    pais: 'MEX'
  },
  { 
    id: 'mexicali-cdmx', 
    nombre: 'Mexicali - CDMX', 
    origen: 'Mexicali, BC', 
    destino: 'Ciudad de México',
    origenZip: '21000',
    destinoZip: '06600',
    origenDir: 'Garita Mexicali II, Mexicali, BC',
    destinoDir: 'Central de Abastos, Iztapalapa, CDMX',
    millas: 1615, // 2600 km
    millasMin: 1580,
    millasMax: 1650,
    casetas: 160, // ~$2,800 MXN
    casetasDetalle: '14+ casetas vía Hermosillo-Mazatlán-GDL (~$2,800 MXN)',
    origenLat: 32.6245,
    origenLng: -115.4523,
    destinoLat: 19.3815,
    destinoLng: -99.0967,
    pais: 'MEX'
  },
  { 
    id: 'gdl-cdmx', 
    nombre: 'Guadalajara - CDMX', 
    origen: 'Guadalajara, JAL', 
    destino: 'Ciudad de México',
    origenZip: '44100',
    destinoZip: '06600',
    origenDir: 'Central de Abastos, Guadalajara, JAL',
    destinoDir: 'Central de Abastos, Iztapalapa, CDMX',
    millas: 342, // 550 km
    millasMin: 335,
    millasMax: 355,
    casetas: 55, // ~$970 MXN
    casetasDetalle: '5 casetas: Zapotlanejo, La Barca, Salamanca, Palmillas, Tepotzotlán (~$970 MXN)',
    origenLat: 20.6597,
    origenLng: -103.3496,
    destinoLat: 19.3815,
    destinoLng: -99.0967,
    pais: 'MEX'
  },
  { 
    id: 'mty-cdmx', 
    nombre: 'Monterrey - CDMX', 
    origen: 'Monterrey, NL', 
    destino: 'Ciudad de México',
    origenZip: '64000',
    destinoZip: '06600',
    origenDir: 'Zona Industrial, Monterrey, NL',
    destinoDir: 'Central de Abastos, Iztapalapa, CDMX',
    millas: 559, // 900 km
    millasMin: 545,
    millasMax: 575,
    casetas: 65, // ~$1,150 MXN
    casetasDetalle: '6 casetas vía Saltillo-SLP (~$1,150 MXN) - Autopista 57D',
    origenLat: 25.6866,
    origenLng: -100.3161,
    destinoLat: 19.3815,
    destinoLng: -99.0967,
    pais: 'MEX'
  },
  { 
    id: 'laredo-mty', 
    nombre: 'Nuevo Laredo - Monterrey', 
    origen: 'Nuevo Laredo, TAMPS', 
    destino: 'Monterrey, NL',
    origenZip: '88000',
    destinoZip: '64000',
    origenDir: 'Puente Colombia, Nuevo Laredo, TAMPS',
    destinoDir: 'Zona Industrial, Monterrey, NL',
    millas: 140, // 225 km
    millasMin: 135,
    millasMax: 150,
    casetas: 18, // ~$320 MXN
    casetasDetalle: '2 casetas: Nuevo Laredo, Ciénega de Flores (~$320 MXN)',
    origenLat: 27.4861,
    origenLng: -99.5069,
    destinoLat: 25.6866,
    destinoLng: -100.3161,
    pais: 'MEX'
  },
  { 
    id: 'laredo-gdl', 
    nombre: 'Nuevo Laredo - Guadalajara', 
    origen: 'Nuevo Laredo, TAMPS', 
    destino: 'Guadalajara, JAL',
    origenZip: '88000',
    destinoZip: '44100',
    origenDir: 'Puente Colombia, Nuevo Laredo, TAMPS',
    destinoDir: 'Central de Abastos, Guadalajara, JAL',
    millas: 621, // 1000 km
    millasMin: 605,
    millasMax: 640,
    casetas: 75, // ~$1,320 MXN
    casetasDetalle: '7 casetas vía Monterrey-Saltillo-Zacatecas (~$1,320 MXN)',
    origenLat: 27.4861,
    origenLng: -99.5069,
    destinoLat: 20.6597,
    destinoLng: -103.3496,
    pais: 'MEX'
  },
  { 
    id: 'laredo-cdmx', 
    nombre: 'Nuevo Laredo - CDMX', 
    origen: 'Nuevo Laredo, TAMPS', 
    destino: 'Ciudad de México',
    origenZip: '88000',
    destinoZip: '06600',
    origenDir: 'Puente Colombia, Nuevo Laredo, TAMPS',
    destinoDir: 'Central de Abastos, Iztapalapa, CDMX',
    millas: 714, // 1150 km
    millasMin: 695,
    millasMax: 735,
    casetas: 85, // ~$1,500 MXN
    casetasDetalle: '8 casetas vía Monterrey-Saltillo-SLP (~$1,500 MXN)',
    origenLat: 27.4861,
    origenLng: -99.5069,
    destinoLat: 19.3815,
    destinoLng: -99.0967,
    pais: 'MEX'
  },
  { 
    id: 'veracruz-cdmx', 
    nombre: 'Veracruz - CDMX', 
    origen: 'Veracruz, VER', 
    destino: 'Ciudad de México',
    origenZip: '91700',
    destinoZip: '06600',
    origenDir: 'Puerto de Veracruz, Veracruz, VER',
    destinoDir: 'Central de Abastos, Iztapalapa, CDMX',
    millas: 261, // 420 km
    millasMin: 250,
    millasMax: 275,
    casetas: 45, // ~$800 MXN
    casetasDetalle: '4 casetas: Veracruz, Fortín, Orizaba, Amozoc (~$800 MXN)',
    origenLat: 19.1738,
    origenLng: -96.1342,
    destinoLat: 19.3815,
    destinoLng: -99.0967,
    pais: 'MEX'
  },
  { 
    id: 'manzanillo-gdl', 
    nombre: 'Manzanillo - Guadalajara', 
    origen: 'Manzanillo, COL', 
    destino: 'Guadalajara, JAL',
    origenZip: '28200',
    destinoZip: '44100',
    origenDir: 'Puerto de Manzanillo, Manzanillo, COL',
    destinoDir: 'Central de Abastos, Guadalajara, JAL',
    millas: 186, // 300 km
    millasMin: 180,
    millasMax: 195,
    casetas: 28, // ~$500 MXN
    casetasDetalle: '3 casetas: Manzanillo, Colima, Acatlán (~$500 MXN)',
    origenLat: 19.0522,
    origenLng: -104.3158,
    destinoLat: 20.6597,
    destinoLng: -103.3496,
    pais: 'MEX'
  },
  { 
    id: 'queretaro-cdmx', 
    nombre: 'Querétaro - CDMX', 
    origen: 'Querétaro, QRO', 
    destino: 'Ciudad de México',
    origenZip: '76000',
    destinoZip: '06600',
    origenDir: 'Zona Industrial, Querétaro, QRO',
    destinoDir: 'Central de Abastos, Iztapalapa, CDMX',
    millas: 134, // 215 km
    millasMin: 128,
    millasMax: 142,
    casetas: 22, // ~$390 MXN
    casetasDetalle: '2 casetas: Palmillas, Tepotzotlán (~$390 MXN)',
    origenLat: 20.5888,
    origenLng: -100.3899,
    destinoLat: 19.3815,
    destinoLng: -99.0967,
    pais: 'MEX'
  },
  { 
    id: 'slp-cdmx', 
    nombre: 'San Luis Potosí - CDMX', 
    origen: 'San Luis Potosí, SLP', 
    destino: 'Ciudad de México',
    origenZip: '78000',
    destinoZip: '06600',
    origenDir: 'Zona Industrial, San Luis Potosí, SLP',
    destinoDir: 'Central de Abastos, Iztapalapa, CDMX',
    millas: 258, // 415 km
    millasMin: 250,
    millasMax: 270,
    casetas: 35, // ~$620 MXN
    casetasDetalle: '4 casetas vía Querétaro (~$620 MXN) - Autopista 57D',
    origenLat: 22.1565,
    origenLng: -100.9855,
    destinoLat: 19.3815,
    destinoLng: -99.0967,
    pais: 'MEX'
  },
]

const TIPOS_CAJA = [
  { id: '53dry', nombre: "53' Dry Van", pies: 53, pesoMaxLbs: 45000, pesoMaxKg: 20412 },
  { id: '53reefer', nombre: "53' Reefer", pies: 53, pesoMaxLbs: 44000, pesoMaxKg: 19958 },
  { id: '48dry', nombre: "48' Dry Van", pies: 48, pesoMaxLbs: 44000, pesoMaxKg: 19958 },
  { id: '40hc', nombre: "40' High Cube", pies: 40, pesoMaxLbs: 44800, pesoMaxKg: 20320 },
  { id: '40std', nombre: "40' Standard", pies: 40, pesoMaxLbs: 44800, pesoMaxKg: 20320 },
  { id: '20std', nombre: "20' Standard", pies: 20, pesoMaxLbs: 47900, pesoMaxKg: 21727 },
  { id: 'flatbed', nombre: "53' Flatbed", pies: 53, pesoMaxLbs: 48000, pesoMaxKg: 21772 },
  { id: 'stepdeck', nombre: "Step Deck", pies: 53, pesoMaxLbs: 48000, pesoMaxKg: 21772 },
]

const LIMITES_PESO_ZONA = {
  california: { nombre: 'California', pesoMaxLbs: 80000, pesoMaxKg: 36287, nota: 'Límite estándar federal' },
  texas: { nombre: 'Texas', pesoMaxLbs: 84000, pesoMaxKg: 38102, nota: 'Permiso especial disponible' },
  mexico: { nombre: 'México (NOM)', pesoMaxLbs: 168399, pesoMaxKg: 76400, nota: 'T3-S2-R4 máximo' },
  federal_us: { nombre: 'Federal USA', pesoMaxLbs: 80000, pesoMaxKg: 36287, nota: 'Límite interestatal' },
}

const TIPOS_CAMION = [
  { id: 'default', nombre: 'No especificado', ejes: 5, tanques: 2, mpg: 6.5 },
  { id: 'day_cab', nombre: 'Day Cab', ejes: 5, tanques: 2, mpg: 6.8 },
  { id: 'sleeper', nombre: 'Sleeper', ejes: 5, tanques: 2, mpg: 6.2 },
  { id: 'sleeper_large', nombre: 'Sleeper Grande', ejes: 5, tanques: 3, mpg: 5.8 },
]

const TIPOS_TRANSMISION = [
  { id: 'default', nombre: 'No especificado' },
  { id: 'manual', nombre: 'Manual (Estándar)' },
  { id: 'automatico', nombre: 'Automático' },
  { id: 'automated', nombre: 'Automatizado (AMT)' },
]

// Iconos personalizados para el mapa
const createCustomIcon = (color, label) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:12px;border:2px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);">${label}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

function App() {
  // Sistema de usuarios: 'admin' o 'consultor'
  const [tipoUsuario, setTipoUsuario] = useState('admin')
  const [tripMode, setTripMode] = useState('simple')
  const [unidadDistancia, setUnidadDistancia] = useState('km')
  const [unidadPeso, setUnidadPeso] = useState('ton') // 'ton', 'lbs', 'kg'
  const [activeTab, setActiveTab] = useState('viaje')
  const [showMapa, setShowMapa] = useState(false)
  const [showHistorial, setShowHistorial] = useState(false)
  const [showReporte, setShowReporte] = useState(false)
  const [showRateQuote, setShowRateQuote] = useState(false)
  
  // Estado para Rate Quote
  const [rateQuote, setRateQuote] = useState({
    customerName: '',
    contactName: '',
    phone: '',
    email: '',
    createdBy: '',
    origen: '',
    destino: '',
    tipoCaja: 'dryvan', // 'dryvan' o 'flatbed'
    hazmat: false,
    rateDryVan: 800,
    rateFlatbed: 950,
    fscPercent: 61,
    fscPerGallon: 7.31,
  })
  
  // Referencia para el reporte PDF
  const reporteRef = useRef(null)
  
  // Estado para selector de ubicación en mapa
  const [showMapSelector, setShowMapSelector] = useState(false)
  const [mapSelectorTarget, setMapSelectorTarget] = useState(null) // {tramoId, campo: 'origen'|'destino'}
  const [mapSelectorPosition, setMapSelectorPosition] = useState([32.5, -117.0])
  
  // Historial de rutas ejecutadas
  const [historialRutas, setHistorialRutas] = useState([])
  
  // Ciudades guardadas para autocompletar
  const [ciudadesGuardadas, setCiudadesGuardadas] = useState([
    'Tijuana, BC', 'Los Angeles, CA', 'San Diego, CA', 'Phoenix, AZ', 
    'Dallas, TX', 'Houston, TX', 'Laredo, TX', 'San Antonio, TX',
    'Chicago, IL', 'Atlanta, GA', 'Miami, FL', 'New York, NY'
  ])

  // Estado para reporte/liquidación de viaje
  const [reporteViaje, setReporteViaje] = useState({
    woIda: '',
    woRegreso: '',
    origenIda: '',
    destinoIda: '',
    millasIda: '',
    tarifaIda: '',
    origenVacio: '',
    destinoVacio: '',
    millasVacio: '',
    origenRegreso: '',
    destinoRegreso: '',
    millasRegreso: '',
    tarifaRegreso: '',
  })
  
  const [vehiculo, setVehiculo] = useState({
    tipoCamion: 'default',
    transmision: 'default',
    ejes: 5,
    tanques: 2,
    tipoCaja: '53dry',
    zonaOperacion: 'federal_us',
  })

  const [config, setConfig] = useState({
    mpg: 6.5,
    dieselPrice: 4.50,
    payrollPerMile: 0.55,
    adminPerMile: 0.15,
    operationalPerMile: 0.20,
    talachaPerMile: 0.08,
    llantasPerMile: 0.05,
    mantenimientoEje: 0.03,
    idealMin: 25,
    stableMin: 18,
    comodinMin: 10,
  })

  // Estado para tipo de cambio MXN/USD
  const [tipoCambio, setTipoCambio] = useState({
    valor: 17.50,
    fecha: new Date().toISOString().split('T')[0],
    monedaActiva: 'MXN', // Solo MXN
    cargando: false,
    ultimaActualizacion: null,
  })

  // Modo de operación: 'revisar' (analizar tarifa existente) o 'cotizar' (calcular tarifa para cliente nuevo)
  const [modoOperacion, setModoOperacion] = useState('revisar')

  const [simpleTrip, setSimpleTrip] = useState({
    rutaSTC: 'custom',
    origen: '',
    destino: '',
    miles: '',
    rate: '',
    casetas: '',
    toneladas: '',
  })

  // Sistema de tramos del viaje - mínimo 2 (ida y vuelta)
  const [tramosViaje, setTramosViaje] = useState([
    { id: '1', tipo: 'L', origenId: 'custom', origen: '', destinoId: 'custom', destino: '', millas: '', tarifa: '', casetas: '', toneladas: '', descripcion: 'Ida Cargado', cruceTarifa: false, pagoChoferCruce: '' },
    { id: '2', tipo: 'L', origenId: 'custom', origen: '', destinoId: 'custom', destino: '', millas: '', tarifa: '', casetas: '', toneladas: '', descripcion: 'Regreso Cargado', cruceTarifa: false, pagoChoferCruce: '' },
  ])
  const [cantidadMinTramos, setCantidadMinTramos] = useState(2)
  const [clienteViajeId, setClienteViajeId] = useState('')

  // Estado para clientes
  const [clientes, setClientes] = useState([
    { id: '1', nombre: 'Cliente General', tarifaBase: 0, descuento: 0, notas: 'Tarifa estándar' },
  ])
  const [showClienteForm, setShowClienteForm] = useState(false)
  const [editingCliente, setEditingCliente] = useState(null)
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', tarifaBase: '', descuento: '', notas: '' })

  // Funciones para manejar tramos del viaje
  const handleCambiarCantidadTramos = (nuevaCantidad) => {
    const cantidad = parseInt(nuevaCantidad) || 2
    setCantidadMinTramos(cantidad)
    
    if (tramosViaje.length < cantidad) {
      const faltantes = cantidad - tramosViaje.length
      const nuevos = []
      for (let i = 0; i < faltantes; i++) {
        nuevos.push({
          id: Date.now().toString() + i,
          tipo: 'L',
          origenId: 'custom',
          origen: '',
          destinoId: 'custom',
          destino: '',
          millas: '',
          tarifa: '',
          casetas: '',
          toneladas: '',
          descripcion: `Tramo ${tramosViaje.length + i + 1}`,
          cruceTarifa: false,
          pagoChoferCruce: ''
        })
      }
      setTramosViaje([...tramosViaje, ...nuevos])
    }
  }

  const actualizarTramo = (id, campo, valor) => {
    setTramosViaje(prev => prev.map(tramo => 
      tramo.id === id ? { ...tramo, [campo]: valor } : tramo
    ))
  }

  // Función para actualizar múltiples campos de un tramo a la vez
  const actualizarTramoMultiple = (id, cambios) => {
    setTramosViaje(prev => prev.map(tramo => 
      tramo.id === id ? { ...tramo, ...cambios } : tramo
    ))
  }

  const agregarTramo = () => {
    const nuevoTramo = {
      id: Date.now().toString(),
      tipo: 'L',
      origenId: 'custom',
      origen: '',
      destinoId: 'custom',
      destino: '',
      millas: '',
      tarifa: '',
      casetas: '',
      toneladas: '',
      descripcion: `Tramo ${tramosViaje.length + 1}`,
      cruceTarifa: false,
      pagoChoferCruce: ''
    }
    setTramosViaje([...tramosViaje, nuevoTramo])
  }

  const eliminarTramo = (id) => {
    if (tramosViaje.length <= cantidadMinTramos) return
    setTramosViaje(tramosViaje.filter(t => t.id !== id))
  }

  const getTipoTramoInfo = (tipoId) => TIPOS_MOVIMIENTO.find(t => t.id === tipoId)

  // Funciones para selector de ubicación en mapa
  const abrirSelectorMapa = (tramoId, campo) => {
    const tramo = tramosViaje.find(t => t.id === tramoId)
    // Si ya tiene coordenadas, centrar ahí
    if (campo === 'origen' && tramo?.origenLat) {
      setMapSelectorPosition([tramo.origenLat, tramo.origenLng])
    } else if (campo === 'destino' && tramo?.destinoLat) {
      setMapSelectorPosition([tramo.destinoLat, tramo.destinoLng])
    } else {
      // Centrar en Tijuana por defecto
      setMapSelectorPosition([32.5, -117.0])
    }
    setMapSelectorTarget({ tramoId, campo })
    setShowMapSelector(true)
  }

  const confirmarUbicacionMapa = async (lat, lng) => {
    if (!mapSelectorTarget) return
    
    // Obtener nombre de la ubicación usando reverse geocoding
    let nombreUbicacion = `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      const data = await response.json()
      if (data.address) {
        const { city, town, village, state, country } = data.address
        nombreUbicacion = [city || town || village, state || country].filter(Boolean).join(', ') || nombreUbicacion
      }
    } catch (e) {
      console.log('No se pudo obtener nombre de ubicación')
    }
    
    const { tramoId, campo } = mapSelectorTarget
    
    // Si es viaje sencillo (tramoId === 'simple')
    if (tramoId === 'simple') {
      if (campo === 'origen') {
        setSimpleTrip(prev => ({ ...prev, origen: nombreUbicacion, origenLat: lat, origenLng: lng }))
      } else {
        setSimpleTrip(prev => ({ ...prev, destino: nombreUbicacion, destinoLat: lat, destinoLng: lng }))
      }
    } else {
      // Actualizar el tramo con la ubicación (vuelta completa)
      setTramosViaje(prev => prev.map(tramo => {
        if (tramo.id === tramoId) {
          if (campo === 'origen') {
            return { ...tramo, origen: nombreUbicacion, origenId: 'custom', origenLat: lat, origenLng: lng }
          } else {
            return { ...tramo, destino: nombreUbicacion, destinoId: 'custom', destinoLat: lat, destinoLng: lng }
          }
        }
        return tramo
      }))
    }
    
    // Guardar ciudad si es nueva
    setCiudadesGuardadas(prev => prev.includes(nombreUbicacion) ? prev : [...prev, nombreUbicacion])
    
    setShowMapSelector(false)
    setMapSelectorTarget(null)
  }

  // Función para abrir selector de mapa en viaje sencillo
  const abrirSelectorMapaSimple = (campo) => {
    // Si ya tiene coordenadas, centrar ahí
    if (campo === 'origen' && simpleTrip.origenLat) {
      setMapSelectorPosition([simpleTrip.origenLat, simpleTrip.origenLng])
    } else if (campo === 'destino' && simpleTrip.destinoLat) {
      setMapSelectorPosition([simpleTrip.destinoLat, simpleTrip.destinoLng])
    } else {
      // Centrar en Tijuana por defecto
      setMapSelectorPosition([32.5, -117.0])
    }
    setMapSelectorTarget({ tramoId: 'simple', campo })
    setShowMapSelector(true)
  }

  const calcularTotalesViaje = () => {
    const totalMillas = tramosViaje.reduce((acc, t) => acc + (parseFloat(t.millas) || 0), 0)
    const totalTarifa = tramosViaje.reduce((acc, t) => acc + (parseFloat(t.tarifa) || 0), 0)
    const totalCasetas = tramosViaje.reduce((acc, t) => acc + (parseFloat(t.casetas) || 0), 0)
    const totalPagoChoferCruce = tramosViaje.reduce((acc, t) => acc + (t.cruceTarifa ? (parseFloat(t.pagoChoferCruce) || 0) : 0), 0)
    const costPerMile = calculateCostPerMile()
    const totalCosto = totalMillas * costPerMile + totalCasetas + totalPagoChoferCruce
    const utilidad = totalTarifa - totalCosto
    const margen = totalTarifa > 0 ? (utilidad / totalTarifa) * 100 : 0
    
    return { totalMillas, totalTarifa, totalCasetas, totalPagoChoferCruce, totalCosto, utilidad, margen }
  }

  // Función para guardar ruta en historial
  const guardarEnHistorial = (datos, tipo = 'simple') => {
    const nuevaEntrada = {
      id: Date.now().toString(),
      fecha: new Date().toLocaleString('es-MX'),
      tipo,
      ...datos,
    }
    setHistorialRutas(prev => [nuevaEntrada, ...prev].slice(0, 100)) // Máximo 100 registros
    
    // Guardar ciudades nuevas
    if (datos.origen) {
      setCiudadesGuardadas(prev => prev.includes(datos.origen) ? prev : [...prev, datos.origen])
    }
    if (datos.destino) {
      setCiudadesGuardadas(prev => prev.includes(datos.destino) ? prev : [...prev, datos.destino])
    }
    
    // Mostrar confirmación
    alert('✅ Ruta guardada en el historial')
  }

  // Función para ejecutar análisis y guardar en historial
  const ejecutarAnalisis = () => {
    // Configuración del vehículo para guardar
    const tipoCamionInfo = TIPOS_CAMION.find(t => t.id === vehiculo.tipoCamion)
    const tipoCajaInfo = TIPOS_CAJA.find(c => c.id === vehiculo.tipoCaja)
    const configVehiculo = {
      tipoCamion: tipoCamionInfo?.nombre || vehiculo.tipoCamion,
      tipoCaja: tipoCajaInfo?.nombre || vehiculo.tipoCaja,
      ejes: vehiculo.ejes,
      tanques: vehiculo.tanques,
      zonaOperacion: vehiculo.zonaOperacion,
      mpg: config.mpg,
      dieselPrice: config.dieselPrice,
      costPerMile: calculateCostPerMile(),
    }

    if (tripMode === 'simple' && simpleResults) {
      guardarEnHistorial({
        origen: simpleTrip.origen,
        destino: simpleTrip.destino,
        millas: parseFloat(simpleTrip.miles) || 0,
        tarifa: parseFloat(simpleTrip.rate) || 0,
        casetas: parseFloat(simpleTrip.casetas) || 0,
        toneladas: parseFloat(simpleTrip.toneladas) || 0,
        costo: simpleResults.totalCost,
        utilidad: simpleResults.profit,
        margen: simpleResults.profitPercent,
        status: simpleResults.status,
        vehiculo: configVehiculo,
      }, 'simple')
    } else if (tripMode === 'round') {
      const totales = calcularTotalesViaje()
      guardarEnHistorial({
        tramos: tramosViaje.map(t => ({ origen: t.origen, destino: t.destino, millas: t.millas, tarifa: t.tarifa })),
        totalMillas: totales.totalMillas,
        totalTarifa: totales.totalTarifa,
        totalCosto: totales.totalCosto,
        utilidad: totales.utilidad,
        margen: totales.margen,
        status: getStatus(totales.margen),
        vehiculo: configVehiculo,
      }, 'vuelta_completa')
    }
  }

  // Calcular reporte de liquidación
  const calcularReporteLiquidacion = () => {
    const costPerMile = calculateCostPerMile()
    const dieselPerMile = config.dieselPrice / config.mpg
    
    // IDA
    const millasIda = parseFloat(reporteViaje.millasIda) || 0
    const tarifaIda = parseFloat(reporteViaje.tarifaIda) || 0
    const costoIda = millasIda * costPerMile
    const dieselIda = millasIda * dieselPerMile
    const spmIda = millasIda > 0 ? tarifaIda / millasIda : 0
    const cpmIda = costPerMile
    const ppmIda = millasIda > 0 ? (tarifaIda - costoIda) / millasIda : 0
    const profitIda = tarifaIda > 0 ? ((tarifaIda - costoIda) / tarifaIda) * 100 : 0
    
    // VACÍO
    const millasVacio = parseFloat(reporteViaje.millasVacio) || 0
    const costoVacio = millasVacio * costPerMile
    
    // REGRESO
    const millasRegreso = parseFloat(reporteViaje.millasRegreso) || 0
    const tarifaRegreso = parseFloat(reporteViaje.tarifaRegreso) || 0
    const costoRegreso = (millasRegreso + millasVacio) * costPerMile
    const dieselRegreso = (millasRegreso + millasVacio) * dieselPerMile
    const spmRegreso = millasRegreso > 0 ? tarifaRegreso / millasRegreso : 0
    const cpmRegreso = costPerMile
    const ppmRegreso = millasRegreso > 0 ? (tarifaRegreso - costoRegreso) / millasRegreso : 0
    const profitRegreso = tarifaRegreso > 0 ? ((tarifaRegreso - costoRegreso) / tarifaRegreso) * 100 : 0
    
    // TOTALES
    const totalMillas = millasIda + millasVacio + millasRegreso
    const totalTarifa = tarifaIda + tarifaRegreso
    const totalCosto = totalMillas * costPerMile
    const totalDiesel = totalMillas * dieselPerMile
    const spmTotal = (millasIda + millasRegreso) > 0 ? totalTarifa / (millasIda + millasRegreso) : 0
    const ppmTotal = totalMillas > 0 ? (totalTarifa - totalCosto) / totalMillas : 0
    const profitTotal = totalTarifa > 0 ? ((totalTarifa - totalCosto) / totalTarifa) * 100 : 0
    
    return {
      ida: { millas: millasIda, tarifa: tarifaIda, costo: costoIda, diesel: dieselIda, spm: spmIda, cpm: cpmIda, ppm: ppmIda, profit: profitIda },
      vacio: { millas: millasVacio, costo: costoVacio },
      regreso: { millas: millasRegreso, tarifa: tarifaRegreso, costo: costoRegreso, diesel: dieselRegreso, spm: spmRegreso, cpm: cpmRegreso, ppm: ppmRegreso, profit: profitRegreso },
      total: { millas: totalMillas, tarifa: totalTarifa, costo: totalCosto, diesel: totalDiesel, spm: spmTotal, cpm: costPerMile, ppm: ppmTotal, profit: profitTotal },
    }
  }

  // Función para generar PDF del reporte de liquidación
  const generarPDFLiquidacion = async () => {
    const rep = calcularReporteLiquidacion()
    const fecha = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
    
    const pdf = new jsPDF('p', 'mm', 'letter')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const margin = 20
    
    // Header
    pdf.setFillColor(31, 41, 55)
    pdf.rect(0, 0, pageWidth, 30, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(18)
    pdf.setFont('helvetica', 'bold')
    pdf.text('LIQUIDACIÓN DE VIAJE', pageWidth / 2, 15, { align: 'center' })
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Fecha: ${fecha}`, pageWidth / 2, 24, { align: 'center' })
    
    let y = 40
    
    // Función helper para dibujar sección
    const drawSection = (title, woNum, data, isVacio = false) => {
      // Título de sección con W.O.
      if (isVacio) {
        pdf.setFillColor(254, 243, 199)
        pdf.rect(margin, y, pageWidth - margin * 2, 10, 'F')
        pdf.setTextColor(146, 64, 14)
      } else {
        pdf.setFillColor(229, 231, 235)
        pdf.rect(margin, y, pageWidth - margin * 2, 10, 'F')
        pdf.setTextColor(31, 41, 55)
      }
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'bold')
      
      if (woNum) {
        pdf.text(`${title}  —  W.O. # ${woNum}`, margin + 5, y + 7)
      } else {
        pdf.text(title, margin + 5, y + 7)
      }
      y += 14
      
      // Datos
      pdf.setTextColor(55, 65, 81)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      
      if (data.origen) {
        pdf.text(`Origen: ${data.origen}`, margin + 5, y)
        y += 5
      }
      if (data.destino) {
        pdf.text(`Destino: ${data.destino}`, margin + 5, y)
        y += 5
      }
      if (data.millas !== undefined) {
        pdf.text(`Millas Recorridas: ${data.millas.toLocaleString()}`, margin + 5, y)
        y += 5
      }
      if (data.tarifa !== undefined && data.tarifa > 0) {
        pdf.text(`Venta de Flete: ${formatCurrency(data.tarifa)}`, margin + 5, y)
        y += 5
      }
      if (data.diesel !== undefined && data.diesel > 0) {
        pdf.text(`Consumo de Diesel: ${formatCurrency(data.diesel)}`, margin + 5, y)
        y += 5
      }
      
      // Métricas (solo si no es vacío)
      if (!isVacio && data.spm !== undefined) {
        y += 3
        pdf.setFillColor(219, 234, 254)
        pdf.rect(margin, y, pageWidth - margin * 2, 14, 'F')
        
        const metricWidth = (pageWidth - margin * 2) / 4
        pdf.setFontSize(7)
        pdf.setTextColor(107, 114, 128)
        pdf.text('SPM', margin + metricWidth * 0.5, y + 4, { align: 'center' })
        pdf.text('CPM', margin + metricWidth * 1.5, y + 4, { align: 'center' })
        pdf.text('PPM', margin + metricWidth * 2.5, y + 4, { align: 'center' })
        pdf.text('PROFIT %', margin + metricWidth * 3.5, y + 4, { align: 'center' })
        
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(31, 41, 55)
        pdf.text(`$${data.spm.toFixed(2)}`, margin + metricWidth * 0.5, y + 11, { align: 'center' })
        pdf.text(`$${data.cpm.toFixed(2)}`, margin + metricWidth * 1.5, y + 11, { align: 'center' })
        pdf.text(`$${data.ppm.toFixed(2)}`, margin + metricWidth * 2.5, y + 11, { align: 'center' })
        
        // Color del profit
        if (data.profit >= 18) pdf.setTextColor(16, 185, 129)
        else if (data.profit >= 10) pdf.setTextColor(245, 158, 11)
        else pdf.setTextColor(239, 68, 68)
        pdf.text(`${data.profit.toFixed(0)}%`, margin + metricWidth * 3.5, y + 11, { align: 'center' })
        
        y += 18
      }
      
      y += 8
    }
    
    // IDA
    if (rep.ida.millas > 0) {
      drawSection('TRAMO DE IDA', reporteViaje.woIda, {
        origen: reporteViaje.origenIda,
        destino: reporteViaje.destinoIda,
        millas: rep.ida.millas,
        tarifa: rep.ida.tarifa,
        diesel: rep.ida.diesel,
        spm: rep.ida.spm,
        cpm: rep.ida.cpm,
        ppm: rep.ida.ppm,
        profit: rep.ida.profit
      })
    }
    
    // VACÍO
    if (rep.vacio.millas > 0) {
      drawSection('EMPTY MILES TO LOAD', null, {
        origen: reporteViaje.origenVacio,
        destino: reporteViaje.destinoVacio,
        millas: rep.vacio.millas
      }, true)
    }
    
    // REGRESO
    if (rep.regreso.millas > 0) {
      drawSection('TRAMO DE REGRESO', reporteViaje.woRegreso, {
        origen: reporteViaje.origenRegreso,
        destino: reporteViaje.destinoRegreso,
        millas: rep.regreso.millas,
        tarifa: rep.regreso.tarifa,
        diesel: rep.regreso.diesel,
        spm: rep.regreso.spm,
        cpm: rep.regreso.cpm,
        ppm: rep.regreso.ppm,
        profit: rep.regreso.profit
      })
    }
    
    // RESUMEN TOTAL
    y += 5
    pdf.setFillColor(31, 41, 55)
    pdf.rect(margin, y, pageWidth - margin * 2, 40, 'F')
    
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('RESUMEN TOTAL DEL VIAJE', pageWidth / 2, y + 10, { align: 'center' })
    
    const metricWidth = (pageWidth - margin * 2) / 4
    pdf.setFontSize(7)
    pdf.setFont('helvetica', 'normal')
    pdf.text('SPM', margin + metricWidth * 0.5, y + 18, { align: 'center' })
    pdf.text('CPM', margin + metricWidth * 1.5, y + 18, { align: 'center' })
    pdf.text('PPM', margin + metricWidth * 2.5, y + 18, { align: 'center' })
    pdf.text('PROFIT %', margin + metricWidth * 3.5, y + 18, { align: 'center' })
    
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`$${rep.total.spm.toFixed(2)}`, margin + metricWidth * 0.5, y + 28, { align: 'center' })
    pdf.text(`$${rep.total.cpm.toFixed(2)}`, margin + metricWidth * 1.5, y + 28, { align: 'center' })
    pdf.text(`$${rep.total.ppm.toFixed(2)}`, margin + metricWidth * 2.5, y + 28, { align: 'center' })
    
    if (rep.total.profit >= 18) pdf.setTextColor(134, 239, 172)
    else if (rep.total.profit >= 10) pdf.setTextColor(253, 224, 71)
    else pdf.setTextColor(252, 165, 165)
    pdf.text(`${rep.total.profit.toFixed(0)}%`, margin + metricWidth * 3.5, y + 28, { align: 'center' })
    
    y += 50
    
    // Totales finales en recuadro
    pdf.setFillColor(249, 250, 251)
    pdf.rect(margin, y, pageWidth - margin * 2, 25, 'F')
    pdf.setDrawColor(229, 231, 235)
    pdf.rect(margin, y, pageWidth - margin * 2, 25, 'S')
    
    pdf.setTextColor(31, 41, 55)
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    
    const col1 = margin + 10
    const col2 = pageWidth / 2 + 10
    
    pdf.text(`Total Millas:`, col1, y + 8)
    pdf.text(`Total Costo:`, col1, y + 18)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`${rep.total.millas.toLocaleString()}`, col1 + 35, y + 8)
    pdf.text(`${formatCurrency(rep.total.costo)}`, col1 + 35, y + 18)
    
    pdf.setFont('helvetica', 'bold')
    pdf.text(`Total Venta:`, col2, y + 8)
    pdf.text(`Utilidad Neta:`, col2, y + 18)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`${formatCurrency(rep.total.tarifa)}`, col2 + 35, y + 8)
    
    // Utilidad en color
    const utilidad = rep.total.tarifa - rep.total.costo
    if (utilidad >= 0) pdf.setTextColor(16, 185, 129)
    else pdf.setTextColor(239, 68, 68)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`${formatCurrency(utilidad)}`, col2 + 35, y + 18)
    
    // Footer
    pdf.setFontSize(8)
    pdf.setTextColor(156, 163, 175)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Generado por Tablero de Rentabilidad de Rutas - Tijuana, BC', pageWidth / 2, 265, { align: 'center' })
    
    // Guardar PDF
    const woIds = [reporteViaje.woIda, reporteViaje.woRegreso].filter(Boolean).join('-') || 'sin-wo'
    pdf.save(`Liquidacion_${woIds}_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const convertDistance = (value, toKm = false) => {
    if (toKm) return value * 1.60934
    return value
  }

  const getDistanceLabel = () => unidadDistancia === 'millas' ? 'mi' : 'km'
  const getDistanceFullLabel = () => unidadDistancia === 'millas' ? 'Millas' : 'Kilómetros'

  // Funciones para conversión de peso
  const getWeightLabel = () => {
    switch(unidadPeso) {
      case 'ton': return 'ton'
      case 'lbs': return 'lbs'
      case 'kg': return 'kg'
      default: return 'ton'
    }
  }
  
  const getWeightFullLabel = () => {
    switch(unidadPeso) {
      case 'ton': return 'Toneladas'
      case 'lbs': return 'Libras'
      case 'kg': return 'Kilogramos'
      default: return 'Toneladas'
    }
  }

  // Convertir peso a la unidad seleccionada (base: toneladas)
  const convertWeight = (value, fromUnit = 'ton') => {
    if (!value || isNaN(value)) return 0
    const val = parseFloat(value)
    
    // Primero convertir a toneladas como base
    let toneladas = val
    if (fromUnit === 'lbs') toneladas = val / 2204.62
    else if (fromUnit === 'kg') toneladas = val / 1000
    
    // Luego convertir a la unidad destino
    switch(unidadPeso) {
      case 'ton': return toneladas
      case 'lbs': return toneladas * 2204.62
      case 'kg': return toneladas * 1000
      default: return toneladas
    }
  }

  // Función para obtener tipo de cambio de API (Banxico o alternativa)
  const obtenerTipoCambio = async (fecha = null) => {
    setTipoCambio(prev => ({ ...prev, cargando: true }))
    
    try {
      // Usar API gratuita de exchangerate-api o similar
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
      const data = await response.json()
      
      if (data && data.rates && data.rates.MXN) {
        setTipoCambio(prev => ({
          ...prev,
          valor: parseFloat(data.rates.MXN.toFixed(4)),
          ultimaActualizacion: new Date().toLocaleString('es-MX'),
          cargando: false,
        }))
      }
    } catch (error) {
      console.log('Error obteniendo tipo de cambio, usando valor por defecto')
      setTipoCambio(prev => ({ ...prev, cargando: false }))
    }
  }

  // Conversión de moneda
  const convertirMoneda = (valor, aUSD = true) => {
    if (!valor || isNaN(valor)) return 0
    if (aUSD) {
      return parseFloat(valor) / tipoCambio.valor // MXN a USD
    }
    return parseFloat(valor) * tipoCambio.valor // USD a MXN
  }

  // Formatear moneda
  const formatCurrencyMXN = (value) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
  }

  // Mostrar valor en ambas monedas
  const mostrarDualMoneda = (valorUSD) => {
    const mxn = convertirMoneda(valorUSD, false)
    return `${formatCurrency(valorUSD)} / ${formatCurrencyMXN(mxn)}`
  }

  const calculateCostPerMile = () => {
    const fuelCostPerMile = config.dieselPrice / config.mpg
    const talachaCost = config.talachaPerMile + (config.mantenimientoEje * vehiculo.ejes)
    return fuelCostPerMile + config.payrollPerMile + config.adminPerMile + config.operationalPerMile + talachaCost + config.llantasPerMile
  }

  const handleRutaSTCChange = (rutaId, isReturn = false) => {
    const ruta = RUTAS_STC.find(r => r.id === rutaId)
    if (!ruta) return

    if (tripMode === 'simple') {
      setSimpleTrip({
        ...simpleTrip,
        rutaSTC: rutaId,
        origen: ruta.origen,
        destino: ruta.destino,
        origenDir: ruta.origenDir || '',
        destinoDir: ruta.destinoDir || '',
        origenZip: ruta.origenZip || '',
        destinoZip: ruta.destinoZip || '',
        origenLat: ruta.origenLat,
        origenLng: ruta.origenLng,
        destinoLat: ruta.destinoLat,
        destinoLng: ruta.destinoLng,
        millasRecomendadas: ruta.millas,
        millasMin: ruta.millasMin || ruta.millas,
        millasMax: ruta.millasMax || ruta.millas,
        miles: ruta.millas > 0 ? ruta.millas.toString() : simpleTrip.miles,
        casetas: ruta.casetas >= 0 ? ruta.casetas.toString() : simpleTrip.casetas,
        casetasDetalle: ruta.casetasDetalle || '',
      })
    }
  }

  const handleTipoCamionChange = (tipoCamionId) => {
    const tipo = TIPOS_CAMION.find(t => t.id === tipoCamionId)
    if (tipo) {
      setVehiculo({
        ...vehiculo,
        tipoCamion: tipoCamionId,
        ejes: tipo.ejes,
        tanques: tipo.tanques,
      })
      setConfig({
        ...config,
        mpg: tipo.mpg,
      })
    }
  }

  const getCajaInfo = () => TIPOS_CAJA.find(c => c.id === vehiculo.tipoCaja)
  const getZonaInfo = () => LIMITES_PESO_ZONA[vehiculo.zonaOperacion]

  // Funciones para clientes
  const agregarCliente = () => {
    if (!nuevoCliente.nombre.trim()) return
    const cliente = {
      id: Date.now().toString(),
      nombre: nuevoCliente.nombre,
      tarifaBase: parseFloat(nuevoCliente.tarifaBase) || 0,
      descuento: parseFloat(nuevoCliente.descuento) || 0,
      notas: nuevoCliente.notas,
    }
    setClientes([...clientes, cliente])
    setNuevoCliente({ nombre: '', tarifaBase: '', descuento: '', notas: '' })
    setShowClienteForm(false)
  }

  const editarCliente = (cliente) => {
    setEditingCliente(cliente)
    setNuevoCliente({
      nombre: cliente.nombre,
      tarifaBase: cliente.tarifaBase.toString(),
      descuento: cliente.descuento.toString(),
      notas: cliente.notas,
    })
    setShowClienteForm(true)
  }

  const guardarEdicionCliente = () => {
    if (!nuevoCliente.nombre.trim()) return
    setClientes(clientes.map(c => 
      c.id === editingCliente.id 
        ? { ...c, nombre: nuevoCliente.nombre, tarifaBase: parseFloat(nuevoCliente.tarifaBase) || 0, descuento: parseFloat(nuevoCliente.descuento) || 0, notas: nuevoCliente.notas }
        : c
    ))
    setNuevoCliente({ nombre: '', tarifaBase: '', descuento: '', notas: '' })
    setEditingCliente(null)
    setShowClienteForm(false)
  }

  const eliminarCliente = (id) => {
    if (clientes.length <= 1) return
    setClientes(clientes.filter(c => c.id !== id))
  }

  // Funciones auxiliares para ubicaciones
  const getUbicacionNombre = (id) => {
    const ubicacion = UBICACIONES_YARDA.find(u => u.id === id)
    return ubicacion ? ubicacion.nombre : id
  }

  const buscarDistanciaComun = (origenId, destinoId) => {
    const distancia = DISTANCIAS_COMUNES.find(d => 
      (d.origen === origenId && d.destino === destinoId) ||
      (d.origen === destinoId && d.destino === origenId)
    )
    return distancia ? distancia.millas : ''
  }

  const getTipoMovimientoInfo = (tipoId) => TIPOS_MOVIMIENTO.find(t => t.id === tipoId)

  const getStatus = (profitPercent) => {
    if (profitPercent >= config.idealMin) return 'ideal'
    if (profitPercent >= config.stableMin) return 'stable'
    if (profitPercent >= config.comodinMin) return 'comodin'
    return 'danger'
  }

  const getStatusLabel = (status) => {
    const labels = {
      ideal: 'IDEAL',
      stable: 'ESTABLE',
      comodin: 'COMODÍN',
      danger: 'NO RENTABLE'
    }
    return labels[status]
  }

  const calculateIdealRate = (miles, targetProfit = config.stableMin, casetas = 0) => {
    const costPerMile = calculateCostPerMile()
    const totalCost = (miles * costPerMile) + casetas
    const idealRate = totalCost / (1 - targetProfit / 100)
    return idealRate
  }

  // Calcular tarifas recomendadas para cotización de nueva ruta
  const calcularTarifasCotizacion = useMemo(() => {
    const miles = parseFloat(simpleTrip.miles) || 0
    const casetas = parseFloat(simpleTrip.casetas) || 0
    
    if (miles <= 0) return null

    const costPerMile = calculateCostPerMile()
    const costoBase = miles * costPerMile
    const costoTotal = costoBase + casetas

    // Calcular tarifas para diferentes niveles de rentabilidad
    const tarifas = {
      costoTotal,
      costPerMile,
      miles,
      casetas,
      // Tarifa mínima (10% - Comodín)
      minima: {
        tarifa: costoTotal / (1 - 0.10),
        margen: 10,
        utilidad: (costoTotal / (1 - 0.10)) - costoTotal,
        spm: (costoTotal / (1 - 0.10)) / miles,
        label: 'MÍNIMA',
        descripcion: 'Solo para casos urgentes o llenar vacíos',
        color: 'comodin'
      },
      // Tarifa estable (18%)
      estable: {
        tarifa: costoTotal / (1 - 0.18),
        margen: 18,
        utilidad: (costoTotal / (1 - 0.18)) - costoTotal,
        spm: (costoTotal / (1 - 0.18)) / miles,
        label: 'ESTABLE',
        descripcion: 'Tarifa base recomendada',
        color: 'stable'
      },
      // Tarifa ideal (25%)
      ideal: {
        tarifa: costoTotal / (1 - 0.25),
        margen: 25,
        utilidad: (costoTotal / (1 - 0.25)) - costoTotal,
        spm: (costoTotal / (1 - 0.25)) / miles,
        label: 'IDEAL',
        descripcion: 'Tarifa objetivo para clientes regulares',
        color: 'ideal'
      },
      // Tarifa premium (40%)
      premium: {
        tarifa: costoTotal / (1 - 0.40),
        margen: 40,
        utilidad: (costoTotal / (1 - 0.40)) - costoTotal,
        spm: (costoTotal / (1 - 0.40)) / miles,
        label: 'PREMIUM',
        descripcion: 'Para cargas urgentes o especiales',
        color: 'premium'
      }
    }

    return tarifas
  }, [simpleTrip.miles, simpleTrip.casetas, config])

  const simpleResults = useMemo(() => {
    const miles = parseFloat(simpleTrip.miles) || 0
    const rate = parseFloat(simpleTrip.rate) || 0
    const casetas = parseFloat(simpleTrip.casetas) || 0
    const toneladas = parseFloat(simpleTrip.toneladas) || 0
    
    if (miles <= 0 || rate <= 0) return null

    const costPerMile = calculateCostPerMile()
    const baseCost = miles * costPerMile
    const totalCost = baseCost + casetas
    const revenue = rate
    const revenuePerMile = revenue / miles
    const profit = revenue - totalCost
    const profitPercent = (profit / revenue) * 100
    const profitPerMile = profit / miles
    const status = getStatus(profitPercent)
    const idealRate = calculateIdealRate(miles, config.stableMin, casetas)

    const cajaInfo = getCajaInfo()
    const zonaInfo = getZonaInfo()
    const pesoEnLbs = toneladas * 2204.62
    const excedePeso = pesoEnLbs > zonaInfo.pesoMaxLbs

    return {
      miles,
      revenue,
      revenuePerMile,
      totalCost,
      costPerMile,
      profit,
      profitPercent,
      profitPerMile,
      status,
      idealRate,
      casetas,
      toneladas,
      pesoEnLbs,
      excedePeso,
      limiteZona: zonaInfo.pesoMaxLbs,
      fuelCost: (config.dieselPrice / config.mpg) * miles,
      payrollCost: config.payrollPerMile * miles,
      adminCost: config.adminPerMile * miles,
      operationalCost: config.operationalPerMile * miles,
      talachaCost: (config.talachaPerMile + config.mantenimientoEje * vehiculo.ejes) * miles,
      llantasCost: config.llantasPerMile * miles,
    }
  }, [simpleTrip, config, vehiculo])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatPercent = (value) => {
    return `${value.toFixed(1)}%`
  }

  return (
    <>
    <div className="app-container">
      <header className="header">
        <div className="header-top">
          <h1>
            Sistema de Gestión de Transporte
          </h1>
          <div className="header-actions">
            <div className="user-selector">
              <span className="user-label">{tipoUsuario === 'admin' ? <Unlock size={14} /> : <Lock size={14} />}</span>
              <select 
                value={tipoUsuario} 
                onChange={(e) => setTipoUsuario(e.target.value)}
                className="user-select"
              >
                <option value="admin">Administrador</option>
                <option value="consultor">Consultor</option>
              </select>
            </div>
            <button 
              className={`header-btn ${showHistorial ? 'active' : ''}`}
              onClick={() => { setShowHistorial(!showHistorial); setShowReporte(false); }}
            >
              <History size={16} /> Historial
            </button>
            <button 
              className={`header-btn ${showReporte ? 'active' : ''}`}
              onClick={() => { setShowReporte(!showReporte); setShowHistorial(false); setShowRateQuote(false); }}
            >
              <FileText size={16} /> Liquidación
            </button>
            <button 
              className={`header-btn rate-quote-btn ${showRateQuote ? 'active' : ''}`}
              onClick={() => { setShowRateQuote(!showRateQuote); setShowHistorial(false); setShowReporte(false); }}
            >
              <ClipboardList size={16} /> Rate Quote
            </button>
          </div>
        </div>
        <p>Tijuana, Baja California - Análisis de Costos y Utilidades</p>
        <div className="header-toggles">
          <div className="unit-toggle">
            <button 
              className="active" 
              disabled
            >
              Kilómetros
            </button>
          </div>
          <div className="weight-toggle">
            <button 
              className={unidadPeso === 'ton' ? 'active' : ''} 
              onClick={() => setUnidadPeso('ton')}
            >
              Ton
            </button>
            <button 
              className={unidadPeso === 'lbs' ? 'active' : ''} 
              onClick={() => setUnidadPeso('lbs')}
            >
              Lbs
            </button>
            <button 
              className={unidadPeso === 'kg' ? 'active' : ''} 
              onClick={() => setUnidadPeso('kg')}
            >
              Kg
            </button>
          </div>
          <div className="currency-toggle">
            <button 
              className="active" 
              disabled
            >
              🇲🇽 MXN
            </button>
          </div>
        </div>
      </header>

      <div className="main-content">
        <aside className="sidebar">
          {tipoUsuario === 'admin' ? (
            <>
              <div className="sidebar-tabs">
                <button 
                  className={`sidebar-tab ${activeTab === 'viaje' ? 'active' : ''}`}
                  onClick={() => setActiveTab('viaje')}
                >
                  <Route size={16} /> Costos
                </button>
                <button 
                  className={`sidebar-tab ${activeTab === 'vehiculo' ? 'active' : ''}`}
                  onClick={() => setActiveTab('vehiculo')}
                >
                  <Truck size={16} /> Vehículo
                </button>
                <button 
                  className={`sidebar-tab ${activeTab === 'mantenimiento' ? 'active' : ''}`}
                  onClick={() => setActiveTab('mantenimiento')}
                >
                  <Wrench size={16} /> Mant.
                </button>
              </div>
              <div className="sidebar-tabs" style={{marginTop: '8px'}}>
                <button 
                  className={`sidebar-tab ${activeTab === 'clientes' ? 'active' : ''}`}
                  onClick={() => setActiveTab('clientes')}
                >
                  <UserCircle size={16} /> Clientes
                </button>
              </div>
            </>
          ) : (
            <div className="consultor-info">
              <div className="info-box">
                <Lock size={16} />
                <span>Modo Consultor</span>
              </div>
              <p>Solo puedes ingresar: Origen, Destino, Millas y Precio.</p>
              <p>Los parámetros de costos son configurados por el Administrador.</p>
            </div>
          )}

          {activeTab === 'vehiculo' && tipoUsuario === 'admin' && (
            <div className="card">
              <div className="card-header">
                <Truck className="icon" size={20} />
                <h3>Configuración del Vehículo</h3>
              </div>

              <div className="form-group">
                <label>Tipo de Camión</label>
                <select 
                  value={vehiculo.tipoCamion}
                  onChange={(e) => handleTipoCamionChange(e.target.value)}
                >
                  {TIPOS_CAMION.map(tipo => (
                    <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Transmisión</label>
                <select 
                  value={vehiculo.transmision}
                  onChange={(e) => setVehiculo({...vehiculo, transmision: e.target.value})}
                >
                  {TIPOS_TRANSMISION.map(tipo => (
                    <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                  ))}
                </select>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                <div className="form-group">
                  <label>Ejes</label>
                  <input
                    type="number"
                    value={vehiculo.ejes}
                    onChange={(e) => setVehiculo({...vehiculo, ejes: parseInt(e.target.value) || 5})}
                    min="2"
                    max="10"
                  />
                </div>
                <div className="form-group">
                  <label>Tanques</label>
                  <input
                    type="number"
                    value={vehiculo.tanques}
                    onChange={(e) => setVehiculo({...vehiculo, tanques: parseInt(e.target.value) || 2})}
                    min="1"
                    max="4"
                  />
                </div>
              </div>

              <div className="form-group">
                <label><Box size={14} style={{marginRight: 4}} />Tipo de Caja</label>
                <select 
                  value={vehiculo.tipoCaja}
                  onChange={(e) => setVehiculo({...vehiculo, tipoCaja: e.target.value})}
                >
                  {TIPOS_CAJA.map(caja => (
                    <option key={caja.id} value={caja.id}>{caja.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label><Scale size={14} style={{marginRight: 4}} />Zona de Operación (Límite de Peso)</label>
                <select 
                  value={vehiculo.zonaOperacion}
                  onChange={(e) => setVehiculo({...vehiculo, zonaOperacion: e.target.value})}
                >
                  {Object.entries(LIMITES_PESO_ZONA).map(([key, zona]) => (
                    <option key={key} value={key}>{zona.nombre} - {zona.pesoMaxLbs.toLocaleString()} lbs</option>
                  ))}
                </select>
              </div>

              <div className="info-box">
                <strong>Caja:</strong> {getCajaInfo()?.nombre}<br/>
                <strong>Peso máx carga:</strong> {getCajaInfo()?.pesoMaxLbs.toLocaleString()} lbs ({getCajaInfo()?.pesoMaxKg.toLocaleString()} kg)<br/>
                <strong>Límite zona:</strong> {getZonaInfo()?.pesoMaxLbs.toLocaleString()} lbs<br/>
                <small style={{color: 'var(--gray-500)'}}>{getZonaInfo()?.nota}</small>
              </div>
            </div>
          )}

          {activeTab === 'mantenimiento' && tipoUsuario === 'admin' && (
            <div className="card">
              <div className="card-header">
                <Wrench className="icon" size={20} />
                <h3>Costos de Mantenimiento</h3>
              </div>

              <div className="form-group">
                <label>Talacha (por milla)</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    value={config.talachaPerMile}
                    onChange={(e) => setConfig({...config, talachaPerMile: parseFloat(e.target.value) || 0})}
                    step="0.01"
                  />
                  <span className="unit">MXN</span>
                </div>
              </div>

              <div className="form-group">
                <label>Llantas (por milla)</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    value={config.llantasPerMile}
                    onChange={(e) => setConfig({...config, llantasPerMile: parseFloat(e.target.value) || 0})}
                    step="0.01"
                  />
                  <span className="unit">MXN</span>
                </div>
              </div>

              <div className="form-group">
                <label>Mantenimiento por Eje (por milla)</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    value={config.mantenimientoEje}
                    onChange={(e) => setConfig({...config, mantenimientoEje: parseFloat(e.target.value) || 0})}
                    step="0.01"
                  />
                  <span className="unit">MXN</span>
                </div>
              </div>

              <div className="info-box">
                <strong>Ejes configurados:</strong> {vehiculo.ejes}<br/>
                <strong>Costo mant. ejes/milla:</strong> {formatCurrency(config.mantenimientoEje * vehiculo.ejes)}<br/>
                <strong>Total talacha+llantas+ejes:</strong> {formatCurrency(config.talachaPerMile + config.llantasPerMile + (config.mantenimientoEje * vehiculo.ejes))}/milla
              </div>
            </div>
          )}

          {activeTab === 'viaje' && tipoUsuario === 'admin' && (
            <div className="card">
              <div className="card-header">
                <Settings className="icon" size={20} />
                <h3>Configuración de Costos</h3>
              </div>

              <div className="form-group">
                <label>Rendimiento (MPG)</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    value={config.mpg}
                    onChange={(e) => setConfig({...config, mpg: parseFloat(e.target.value) || 0})}
                    step="0.1"
                  />
                  <span className="unit">mpg</span>
                </div>
              </div>

              <div className="form-group">
                <label><Fuel size={14} style={{marginRight: 4}} />Precio Diésel (por galón)</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    value={config.dieselPrice}
                    onChange={(e) => setConfig({...config, dieselPrice: parseFloat(e.target.value) || 0})}
                    step="0.01"
                  />
                  <span className="unit">MXN</span>
                </div>
              </div>

              <div className="form-group">
                <label><Users size={14} style={{marginRight: 4}} />Nómina (por milla)</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    value={config.payrollPerMile}
                    onChange={(e) => setConfig({...config, payrollPerMile: parseFloat(e.target.value) || 0})}
                    step="0.01"
                  />
                  <span className="unit">MXN</span>
                </div>
              </div>

              <div className="form-group">
                <label><Building2 size={14} style={{marginRight: 4}} />Gastos Administrativos (por milla)</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    value={config.adminPerMile}
                    onChange={(e) => setConfig({...config, adminPerMile: parseFloat(e.target.value) || 0})}
                    step="0.01"
                  />
                  <span className="unit">MXN</span>
                </div>
              </div>

              <div className="form-group">
                <label><Wrench size={14} style={{marginRight: 4}} />Gastos Operativos (por milla)</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    value={config.operationalPerMile}
                    onChange={(e) => setConfig({...config, operationalPerMile: parseFloat(e.target.value) || 0})}
                    step="0.01"
                  />
                  <span className="unit">MXN</span>
                </div>
              </div>

              <div className="total-row">
                <span>Costo Total por Milla</span>
                <span>{formatCurrency(calculateCostPerMile())}</span>
              </div>

              <div className="config-section">
                <h4><TrendingUp size={16} /> Rangos de Rentabilidad (%)</h4>
                <div className="range-config">
                  <div className="range-item">
                    <div className="color-dot" style={{background: 'var(--blue-ideal)'}}></div>
                    <input
                      type="number"
                      value={config.idealMin}
                      onChange={(e) => setConfig({...config, idealMin: parseFloat(e.target.value) || 0})}
                    />
                    <span>% Ideal</span>
                  </div>
                  <div className="range-item">
                    <div className="color-dot" style={{background: 'var(--green-stable)'}}></div>
                    <input
                      type="number"
                      value={config.stableMin}
                      onChange={(e) => setConfig({...config, stableMin: parseFloat(e.target.value) || 0})}
                    />
                    <span>% Estable</span>
                  </div>
                  <div className="range-item">
                    <div className="color-dot" style={{background: 'var(--yellow-comodin)'}}></div>
                    <input
                      type="number"
                      value={config.comodinMin}
                      onChange={(e) => setConfig({...config, comodinMin: parseFloat(e.target.value) || 0})}
                    />
                    <span>% Comodín</span>
                  </div>
                  <div className="range-item">
                    <div className="color-dot" style={{background: 'var(--red-danger)'}}></div>
                    <span style={{fontSize: '0.8rem', color: 'var(--gray-500)'}}>{'<'} {config.comodinMin}% No Rentable</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clientes' && tipoUsuario === 'admin' && (
            <div className="card">
              <div className="card-header">
                <UserCircle className="icon" size={20} />
                <h3>Registro de Clientes</h3>
              </div>

              <div className="clientes-list">
                {clientes.map(cliente => (
                  <div key={cliente.id} className="cliente-item">
                    <div className="cliente-info">
                      <strong>{cliente.nombre}</strong>
                      {cliente.tarifaBase > 0 && (
                        <span className="cliente-tarifa">Base: {formatCurrency(cliente.tarifaBase)}</span>
                      )}
                      {cliente.descuento > 0 && (
                        <span className="cliente-descuento">-{cliente.descuento}%</span>
                      )}
                      {cliente.notas && <small>{cliente.notas}</small>}
                    </div>
                    <div className="cliente-actions">
                      <button onClick={() => editarCliente(cliente)} className="btn-icon">
                        <Edit3 size={14} />
                      </button>
                      {clientes.length > 1 && (
                        <button onClick={() => eliminarCliente(cliente.id)} className="btn-icon danger">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {showClienteForm ? (
                <div className="cliente-form">
                  <div className="form-group">
                    <label>Nombre del Cliente</label>
                    <input
                      type="text"
                      placeholder="Ej: Empresa ABC"
                      value={nuevoCliente.nombre}
                      onChange={(e) => setNuevoCliente({...nuevoCliente, nombre: e.target.value})}
                    />
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                    <div className="form-group">
                      <label>Tarifa Base (USD)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={nuevoCliente.tarifaBase}
                        onChange={(e) => setNuevoCliente({...nuevoCliente, tarifaBase: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Descuento (%)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={nuevoCliente.descuento}
                        onChange={(e) => setNuevoCliente({...nuevoCliente, descuento: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Notas</label>
                    <input
                      type="text"
                      placeholder="Notas adicionales..."
                      value={nuevoCliente.notas}
                      onChange={(e) => setNuevoCliente({...nuevoCliente, notas: e.target.value})}
                    />
                  </div>
                  <div className="form-actions">
                    <button 
                      className="btn-secondary"
                      onClick={() => {
                        setShowClienteForm(false)
                        setEditingCliente(null)
                        setNuevoCliente({ nombre: '', tarifaBase: '', descuento: '', notas: '' })
                      }}
                    >
                      <X size={14} /> Cancelar
                    </button>
                    <button 
                      className="btn-primary"
                      onClick={editingCliente ? guardarEdicionCliente : agregarCliente}
                    >
                      <Save size={14} /> {editingCliente ? 'Guardar' : 'Agregar'}
                    </button>
                  </div>
                </div>
              ) : (
                <button className="btn-add" onClick={() => setShowClienteForm(true)}>
                  <Plus size={16} /> Agregar Cliente
                </button>
              )}
            </div>
          )}


          <div className="card">
            <div className="legend">
              <div className="legend-item">
                <div className="legend-color ideal"></div>
                <span>Ideal ({'>='}{config.idealMin}%)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color stable"></div>
                <span>Estable ({config.stableMin}-{config.idealMin}%)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color comodin"></div>
                <span>Comodín ({config.comodinMin}-{config.stableMin}%)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color danger"></div>
                <span>No Rentable ({'<'}{config.comodinMin}%)</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="results-container">
          <div className="card">
            <div className="tabs">
              <button 
                className={`tab-btn ${tripMode === 'simple' ? 'active' : ''}`}
                onClick={() => setTripMode('simple')}
              >
                <ArrowRight size={18} />
                Viaje Sencillo
              </button>
              <button 
                className={`tab-btn ${tripMode === 'round' ? 'active' : ''}`}
                onClick={() => setTripMode('round')}
              >
                <RotateCcw size={18} />
                Vuelta Completa
              </button>
            </div>

            {tripMode === 'round' && (
              <div className="vuelta-completa-config">
                <div className="config-row">
                  <div className="form-group" style={{marginBottom: 0, flex: 1}}>
                    <label><UserCircle size={14} style={{marginRight: 4}} />Cliente</label>
                    <select 
                      value={clienteViajeId}
                      onChange={(e) => setClienteViajeId(e.target.value)}
                    >
                      <option value="">-- Sin cliente --</option>
                      {clientes.map(cliente => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.nombre} {cliente.descuento > 0 ? `(-${cliente.descuento}%)` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{marginBottom: 0}}>
                    <label>Tramos del viaje</label>
                    <select 
                      value={cantidadMinTramos}
                      onChange={(e) => handleCambiarCantidadTramos(e.target.value)}
                      className="select-cantidad"
                    >
                      {[2, 3, 4, 5, 6, 7, 8].map(n => (
                        <option key={n} value={n}>{n} tramos</option>
                      ))}
                    </select>
                  </div>
                  <button 
                    className={`btn-mapa ${showMapa ? 'active' : ''}`}
                    onClick={() => setShowMapa(!showMapa)}
                  >
                    <Map size={16} /> {showMapa ? 'Ocultar Mapa' : 'Ver Mapa'}
                  </button>
                </div>
                
                <div className="tipos-leyenda" style={{marginTop: '12px'}}>
                  {TIPOS_MOVIMIENTO.map(tipo => (
                    <div key={tipo.id} className="tipo-leyenda-item" style={{borderColor: tipo.color}}>
                      <span className="tipo-letra" style={{background: tipo.color}}>{tipo.id}</span>
                      <span>{tipo.nombre}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tripMode === 'simple' ? (
              <div className="trip-section" style={{background: '#f0f9ff'}}>
                {/* Toggle entre Revisar Tarifa y Cotizar Nueva Ruta */}
                <div className="modo-operacion-toggle">
                  <button 
                    className={`modo-btn ${modoOperacion === 'revisar' ? 'active' : ''}`}
                    onClick={() => setModoOperacion('revisar')}
                  >
                    <Calculator size={16} />
                    Revisar Tarifa
                  </button>
                  <button 
                    className={`modo-btn ${modoOperacion === 'cotizar' ? 'active' : ''}`}
                    onClick={() => setModoOperacion('cotizar')}
                  >
                    <DollarSign size={16} />
                    Cotizar Nueva Ruta
                  </button>
                </div>

                <h4><Navigation size={18} className="icon" /> {modoOperacion === 'cotizar' ? 'Datos para Cotización' : 'Datos del Viaje'}</h4>
                
                <div className="form-group">
                  <label><Route size={14} style={{marginRight: 4}} />Ruta Predefinida (STC)</label>
                  <select 
                    value={simpleTrip.rutaSTC}
                    onChange={(e) => handleRutaSTCChange(e.target.value)}
                  >
                    <optgroup label="── Personalizada ──">
                      <option value="custom">✏️ Personalizada (escribir manualmente)</option>
                    </optgroup>
                    <optgroup label="── Rutas USA ──">
                      {RUTAS_STC.filter(r => r.pais === 'USA').map(ruta => (
                        <option key={ruta.id} value={ruta.id}>{ruta.nombre} ({ruta.millas} mi)</option>
                      ))}
                    </optgroup>
                    <optgroup label="── Rutas México ──">
                      {RUTAS_STC.filter(r => r.pais === 'MEX').map(ruta => (
                        <option key={ruta.id} value={ruta.id}>{ruta.nombre} ({ruta.millas} mi)</option>
                      ))}
                    </optgroup>
                  </select>
                  {simpleTrip.rutaSTC === 'custom' && (
                    <small className="hint-personalizada">
                      💡 Selecciona una ruta predefinida para ver millas recomendadas, ZIP codes y casetas automáticas
                    </small>
                  )}
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                  <div className="form-group">
                    <label><MapPin size={14} style={{marginRight: 4}} />Origen</label>
                    <div className="ubicacion-input-row">
                      <input
                        type="text"
                        placeholder="Ej: Tijuana, BC"
                        value={simpleTrip.origen}
                        onChange={(e) => setSimpleTrip({...simpleTrip, origen: e.target.value})}
                        list="ciudades-guardadas-simple"
                      />
                      <button 
                        className="btn-map-picker" 
                        onClick={() => abrirSelectorMapaSimple('origen')}
                        title="Seleccionar en mapa"
                      >
                        <Map size={14} />
                      </button>
                    </div>
                    {simpleTrip.origenZip && (
                      <small className="zip-info">📮 ZIP: {simpleTrip.origenZip}</small>
                    )}
                    {simpleTrip.origenDir && (
                      <small className="direccion-info">📍 {simpleTrip.origenDir}</small>
                    )}
                    {simpleTrip.origenLat && !simpleTrip.origenDir && (
                      <small className="coords-info">📍 {simpleTrip.origenLat.toFixed(4)}, {simpleTrip.origenLng.toFixed(4)}</small>
                    )}
                  </div>
                  <div className="form-group">
                    <label><MapPin size={14} style={{marginRight: 4}} />Destino</label>
                    <div className="ubicacion-input-row">
                      <input
                        type="text"
                        placeholder="Ej: Los Angeles, CA"
                        value={simpleTrip.destino}
                        onChange={(e) => setSimpleTrip({...simpleTrip, destino: e.target.value})}
                        list="ciudades-guardadas-simple"
                      />
                      <button 
                        className="btn-map-picker" 
                        onClick={() => abrirSelectorMapaSimple('destino')}
                        title="Seleccionar en mapa"
                      >
                        <Map size={14} />
                      </button>
                    </div>
                    {simpleTrip.destinoZip && (
                      <small className="zip-info">📮 ZIP: {simpleTrip.destinoZip}</small>
                    )}
                    {simpleTrip.destinoDir && (
                      <small className="direccion-info">📍 {simpleTrip.destinoDir}</small>
                    )}
                    {simpleTrip.destinoLat && !simpleTrip.destinoDir && (
                      <small className="coords-info">📍 {simpleTrip.destinoLat.toFixed(4)}, {simpleTrip.destinoLng.toFixed(4)}</small>
                    )}
                  </div>
                </div>
                <datalist id="ciudades-guardadas-simple">
                  {ciudadesGuardadas.map((ciudad, i) => (
                    <option key={i} value={ciudad} />
                  ))}
                </datalist>

                {/* Millas recomendadas */}
                {simpleTrip.millasRecomendadas > 0 && (
                  <div className="millas-recomendadas-box">
                    <div className="millas-rec-header">
                      <Route size={14} />
                      <span>Millas Recomendadas: <strong>{simpleTrip.millasRecomendadas}</strong></span>
                      <span className="millas-rango">({simpleTrip.millasMin} - {simpleTrip.millasMax} mi)</span>
                    </div>
                    <button 
                      className="btn-usar-recomendadas"
                      onClick={() => setSimpleTrip({...simpleTrip, miles: simpleTrip.millasRecomendadas.toString()})}
                    >
                      Usar millas recomendadas
                    </button>
                  </div>
                )}

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                  <div className="form-group">
                    <label>{getDistanceFullLabel()} del Recorrido {simpleTrip.millasRecomendadas > 0 && <span className="label-hint">(modificable)</span>}</label>
                    <div className="input-with-unit">
                      <input
                        type="number"
                        placeholder="Ej: 1200"
                        value={simpleTrip.miles}
                        onChange={(e) => setSimpleTrip({...simpleTrip, miles: e.target.value})}
                      />
                      <span className="unit">{getDistanceLabel()}</span>
                    </div>
                  </div>
                  {modoOperacion === 'revisar' && (
                    <div className="form-group">
                      <label>Tarifa del Flete</label>
                      <div className="input-with-unit">
                        <input
                          type="number"
                          placeholder="Ej: 3500"
                          value={simpleTrip.rate}
                          onChange={(e) => setSimpleTrip({...simpleTrip, rate: e.target.value})}
                        />
                        <span className="unit">MXN</span>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                  <div className="form-group">
                    <label><CircleDollarSign size={14} style={{marginRight: 4}} />Casetas</label>
                    <div className="input-with-unit">
                      <input
                        type="number"
                        placeholder="Ej: 150"
                        value={simpleTrip.casetas}
                        onChange={(e) => setSimpleTrip({...simpleTrip, casetas: e.target.value})}
                      />
                      <span className="unit">MXN</span>
                    </div>
                    {simpleTrip.casetasDetalle && (
                      <small className="casetas-detalle">ℹ️ {simpleTrip.casetasDetalle}</small>
                    )}
                  </div>
                  <div className="form-group">
                    <label><Weight size={14} style={{marginRight: 4}} />{getWeightFullLabel()} de Carga</label>
                    <div className="input-with-unit">
                      <input
                        type="number"
                        placeholder="Ej: 20"
                        value={simpleTrip.toneladas}
                        onChange={(e) => setSimpleTrip({...simpleTrip, toneladas: e.target.value})}
                      />
                      <span className="unit">{getWeightLabel()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {showMapa && (
                  <div className="mapa-container" style={{marginBottom: '16px'}}>
                    <MapContainer 
                      center={[32.7, -117.1]} 
                      zoom={5} 
                      style={{height: '300px', width: '100%', borderRadius: '8px'}}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {tramosViaje.map((tramo, index) => {
                        const tipoInfo = getTipoTramoInfo(tramo.tipo)
                        const origenUbicacion = UBICACIONES_YARDA.find(u => u.id === tramo.origenId)
                        const destinoUbicacion = UBICACIONES_YARDA.find(u => u.id === tramo.destinoId)
                        
                        const origenCoords = origenUbicacion?.lat ? [origenUbicacion.lat, origenUbicacion.lng] : null
                        const destinoCoords = destinoUbicacion?.lat ? [destinoUbicacion.lat, destinoUbicacion.lng] : null
                        
                        return (
                          <div key={tramo.id}>
                            {origenCoords && (
                              <Marker 
                                position={origenCoords}
                                icon={createCustomIcon(tipoInfo?.color || '#666', index + 1)}
                              >
                                <Popup>
                                  <strong>Tramo #{index + 1}</strong><br/>
                                  {tramo.origen} → {tramo.destino}<br/>
                                  <span style={{color: tipoInfo?.color}}>{tipoInfo?.nombre}</span>
                                </Popup>
                              </Marker>
                            )}
                            {origenCoords && destinoCoords && (
                              <Polyline 
                                positions={[origenCoords, destinoCoords]}
                                color={tipoInfo?.color || '#666'}
                                weight={3}
                                opacity={0.8}
                                dashArray={tramo.tipo === 'E' ? '10, 10' : null}
                              />
                            )}
                          </div>
                        )
                      })}
                    </MapContainer>
                  </div>
                )}

                <div className="tramos-lista">
                  {tramosViaje.map((tramo, index) => {
                    const tipoInfo = getTipoTramoInfo(tramo.tipo)
                    return (
                      <div key={tramo.id} className="tramo-card" style={{borderLeftColor: tipoInfo?.color}}>
                        <div className="tramo-header">
                          <div className="tramo-numero">
                            <span className="numero">{index + 1}</span>
                            <select 
                              value={tramo.tipo}
                              onChange={(e) => actualizarTramo(tramo.id, 'tipo', e.target.value)}
                              className="tramo-tipo-select"
                              style={{background: tipoInfo?.color}}
                            >
                              {TIPOS_MOVIMIENTO.map(tipo => (
                                <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                              ))}
                            </select>
                          </div>
                          {tramosViaje.length > cantidadMinTramos && (
                            <button className="btn-icon danger" onClick={() => eliminarTramo(tramo.id)}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                        
                        <div className="tramo-ubicaciones">
                          <div className="ubicacion-grupo">
                            <label><MapPin size={12} /> Origen</label>
                            <div className="ubicacion-input-row">
                              <select 
                                value={tramo.origenId}
                                onChange={(e) => {
                                  const ubicacion = UBICACIONES_YARDA.find(u => u.id === e.target.value)
                                  if (e.target.value !== 'custom' && ubicacion) {
                                    const millas = buscarDistanciaComun(e.target.value, tramo.destinoId)
                                    actualizarTramoMultiple(tramo.id, {
                                      origenId: e.target.value,
                                      origen: ubicacion.nombre,
                                      origenLat: ubicacion.lat || null,
                                      origenLng: ubicacion.lng || null,
                                      ...(millas ? { millas } : {})
                                    })
                                  } else {
                                    actualizarTramoMultiple(tramo.id, {
                                      origenId: 'custom',
                                      origen: '',
                                      origenLat: null,
                                      origenLng: null
                                    })
                                  }
                                }}
                              >
                                {UBICACIONES_YARDA.map(ub => (
                                  <option key={ub.id} value={ub.id}>{ub.nombre}</option>
                                ))}
                              </select>
                              <button 
                                className="btn-map-picker" 
                                onClick={() => abrirSelectorMapa(tramo.id, 'origen')}
                                title="Seleccionar en mapa"
                              >
                                <Map size={14} />
                              </button>
                            </div>
                            {tramo.origenId === 'custom' && (
                              <input
                                type="text"
                                placeholder="Escribir origen..."
                                value={tramo.origen}
                                onChange={(e) => actualizarTramo(tramo.id, 'origen', e.target.value)}
                                list="ciudades-guardadas"
                              />
                            )}
                            {tramo.origen && tramo.origenId !== 'custom' && (
                              <small className="ubicacion-seleccionada">✓ {tramo.origen}</small>
                            )}
                            {tramo.origenLat && (
                              <small className="coords-info">📍 {tramo.origenLat.toFixed(4)}, {tramo.origenLng.toFixed(4)}</small>
                            )}
                          </div>
                          <ArrowRight size={16} className="flecha" />
                          <div className="ubicacion-grupo">
                            <label><MapPin size={12} /> Destino</label>
                            <div className="ubicacion-input-row">
                              <select 
                                value={tramo.destinoId}
                                onChange={(e) => {
                                  const ubicacion = UBICACIONES_YARDA.find(u => u.id === e.target.value)
                                  if (e.target.value !== 'custom' && ubicacion) {
                                    const millas = buscarDistanciaComun(tramo.origenId, e.target.value)
                                    actualizarTramoMultiple(tramo.id, {
                                      destinoId: e.target.value,
                                      destino: ubicacion.nombre,
                                      destinoLat: ubicacion.lat || null,
                                      destinoLng: ubicacion.lng || null,
                                      ...(millas ? { millas } : {})
                                    })
                                  } else {
                                    actualizarTramoMultiple(tramo.id, {
                                      destinoId: 'custom',
                                      destino: '',
                                      destinoLat: null,
                                      destinoLng: null
                                    })
                                  }
                                }}
                              >
                                {UBICACIONES_YARDA.map(ub => (
                                  <option key={ub.id} value={ub.id}>{ub.nombre}</option>
                                ))}
                              </select>
                              <button 
                                className="btn-map-picker" 
                                onClick={() => abrirSelectorMapa(tramo.id, 'destino')}
                                title="Seleccionar en mapa"
                              >
                                <Map size={14} />
                              </button>
                            </div>
                            {tramo.destinoId === 'custom' && (
                              <input
                                type="text"
                                placeholder="Escribir destino..."
                                value={tramo.destino}
                                onChange={(e) => actualizarTramo(tramo.id, 'destino', e.target.value)}
                                list="ciudades-guardadas"
                              />
                            )}
                            {tramo.destino && tramo.destinoId !== 'custom' && (
                              <small className="ubicacion-seleccionada">✓ {tramo.destino}</small>
                            )}
                            {tramo.destinoLat && (
                              <small className="coords-info">📍 {tramo.destinoLat.toFixed(4)}, {tramo.destinoLng.toFixed(4)}</small>
                            )}
                          </div>
                        </div>
                        <datalist id="ciudades-guardadas">
                          {ciudadesGuardadas.map((ciudad, i) => (
                            <option key={i} value={ciudad} />
                          ))}
                        </datalist>

                        <div className="tramo-datos">
                          <div className="dato-grupo">
                            <label>{getDistanceLabel()}</label>
                            <input
                              type="number"
                              placeholder="0"
                              value={tramo.millas}
                              onChange={(e) => actualizarTramo(tramo.id, 'millas', e.target.value)}
                            />
                          </div>
                          <div className="dato-grupo">
                            <label>Tarifa $</label>
                            <input
                              type="number"
                              placeholder="0"
                              value={tramo.tarifa}
                              onChange={(e) => actualizarTramo(tramo.id, 'tarifa', e.target.value)}
                            />
                          </div>
                          <div className="dato-grupo">
                            <label>Casetas $</label>
                            <input
                              type="number"
                              placeholder="0"
                              value={tramo.casetas}
                              onChange={(e) => actualizarTramo(tramo.id, 'casetas', e.target.value)}
                            />
                          </div>
                          <div className="dato-grupo">
                            <label>{getWeightLabel()}</label>
                            <input
                              type="number"
                              placeholder="0"
                              value={tramo.toneladas}
                              onChange={(e) => actualizarTramo(tramo.id, 'toneladas', e.target.value)}
                            />
                          </div>
                        </div>
                        
                        {/* Cruce por tarifa y pago de chofer */}
                        <div className="cruce-section">
                          <label className="checkbox-cruce">
                            <input
                              type="checkbox"
                              checked={tramo.cruceTarifa || false}
                              onChange={(e) => actualizarTramo(tramo.id, 'cruceTarifa', e.target.checked)}
                            />
                            <span className="checkmark"></span>
                            <span>Cruce por tarifa</span>
                          </label>
                          {tramo.cruceTarifa && (
                            <div className="pago-chofer-cruce">
                              <label>Pago chofer cruce $</label>
                              <input
                                type="number"
                                placeholder="0"
                                value={tramo.pagoChoferCruce || ''}
                                onChange={(e) => actualizarTramo(tramo.id, 'pagoChoferCruce', e.target.value)}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <button className="btn-add-movimiento" onClick={agregarTramo}>
                  <Plus size={16} /> Agregar Tramo
                </button>

                <div className="viaje-resumen">
                  {(() => {
                    const totales = calcularTotalesViaje()
                    const status = getStatus(totales.margen)
                    return (
                      <>
                        <div className="resumen-grid">
                          <div className="resumen-item">
                            <span className="resumen-label">Total {getDistanceFullLabel()}</span>
                            <span className="resumen-valor">{totales.totalMillas.toLocaleString()} {getDistanceLabel()}</span>
                          </div>
                          <div className="resumen-item">
                            <span className="resumen-label">Total Tarifas</span>
                            <span className="resumen-valor">{formatCurrency(totales.totalTarifa)}</span>
                          </div>
                          <div className="resumen-item">
                            <span className="resumen-label">Casetas</span>
                            <span className="resumen-valor">{formatCurrency(totales.totalCasetas)}</span>
                          </div>
                          {totales.totalPagoChoferCruce > 0 && (
                            <div className="resumen-item">
                              <span className="resumen-label">Pago Chofer Cruce</span>
                              <span className="resumen-valor">{formatCurrency(totales.totalPagoChoferCruce)}</span>
                            </div>
                          )}
                          <div className="resumen-item">
                            <span className="resumen-label">Costo Total</span>
                            <span className="resumen-valor">{formatCurrency(totales.totalCosto)}</span>
                          </div>
                          <div className={`resumen-item resumen-utilidad ${status}`}>
                            <span className="resumen-label">Utilidad</span>
                            <span className="resumen-valor">{formatCurrency(totales.utilidad)} ({totales.margen.toFixed(1)}%)</span>
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </>
            )}
          </div>

          {/* Resultados de Cotización - Nueva Ruta */}
          {tripMode === 'simple' && modoOperacion === 'cotizar' && calcularTarifasCotizacion && (
            <div className="result-card cotizacion">
              <div className="result-header">
                <h3>
                  <DollarSign size={20} />
                  Tarifas Recomendadas para Cliente
                  {simpleTrip.origen && simpleTrip.destino && (
                    <span style={{fontSize: '0.85rem', fontWeight: 'normal', color: 'var(--gray-500)'}}>
                      {' '}| {simpleTrip.origen} → {simpleTrip.destino}
                    </span>
                  )}
                </h3>
              </div>

              {/* Resumen de costos */}
              <div className="cotizacion-costos">
                <div className="costo-item">
                  <span className="costo-label">Costo por Milla (CPM)</span>
                  <span className="costo-valor">{formatCurrency(calcularTarifasCotizacion.costPerMile)}</span>
                </div>
                <div className="costo-item">
                  <span className="costo-label">Millas</span>
                  <span className="costo-valor">{calcularTarifasCotizacion.miles.toLocaleString()} mi</span>
                </div>
                <div className="costo-item">
                  <span className="costo-label">Casetas</span>
                  <span className="costo-valor">{formatCurrency(calcularTarifasCotizacion.casetas)}</span>
                </div>
                <div className="costo-item total">
                  <span className="costo-label">COSTO TOTAL</span>
                  <span className="costo-valor">{formatCurrency(calcularTarifasCotizacion.costoTotal)}</span>
                </div>
              </div>

              {/* Tabla de tarifas recomendadas */}
              <div className="cotizacion-tarifas">
                <h4>💰 Tarifas Recomendadas por Nivel de Rentabilidad</h4>
                <div className="tarifas-grid">
                  {['minima', 'estable', 'ideal', 'premium'].map(nivel => {
                    const t = calcularTarifasCotizacion[nivel]
                    return (
                      <div key={nivel} className={`tarifa-card ${t.color}`}>
                        <div className="tarifa-header">
                          <span className="tarifa-label">{t.label}</span>
                          <span className="tarifa-margen">{t.margen}%</span>
                        </div>
                        <div className="tarifa-precio">
                          {formatCurrency(t.tarifa)}
                        </div>
                        <div className="tarifa-detalles">
                          <div><strong>SPM:</strong> {formatCurrency(t.spm)}/mi</div>
                          <div><strong>Utilidad:</strong> {formatCurrency(t.utilidad)}</div>
                        </div>
                        <div className="tarifa-descripcion">{t.descripcion}</div>
                        <button 
                          className="btn-usar-tarifa"
                          onClick={() => {
                            setSimpleTrip({...simpleTrip, rate: t.tarifa.toFixed(2)})
                            setModoOperacion('revisar')
                          }}
                        >
                          Usar esta tarifa
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Nota informativa */}
              <div className="cotizacion-nota">
                <AlertTriangle size={16} />
                <span>
                  <strong>Recuerda:</strong> Estas tarifas cubren el viaje de IDA. Si el cliente no garantiza carga de regreso, 
                  considera usar la tarifa IDEAL o PREMIUM para cubrir posibles millas vacías.
                </span>
              </div>
            </div>
          )}

          {/* Resultados de Revisión de Tarifa Existente */}
          {tripMode === 'simple' && modoOperacion === 'revisar' && simpleResults && (
            <div className={`result-card ${simpleResults.status}`}>
              <div className="result-header">
                <h3>
                  <Calculator size={20} />
                  Análisis de Rentabilidad
                  {simpleTrip.origen && simpleTrip.destino && (
                    <span style={{fontSize: '0.85rem', fontWeight: 'normal', color: 'var(--gray-500)'}}>
                      {' '}| {simpleTrip.origen} → {simpleTrip.destino}
                    </span>
                  )}
                </h3>
                <span className={`status-badge ${simpleResults.status}`}>
                  {getStatusLabel(simpleResults.status)}
                </span>
              </div>

              {simpleResults.excedePeso && (
                <div className="weight-warning">
                  <AlertTriangle size={18} />
                  <span>
                    <strong>¡Excede límite de peso!</strong> Carga: {simpleResults.pesoEnLbs.toLocaleString()} lbs | Límite zona: {simpleResults.limiteZona.toLocaleString()} lbs
                  </span>
                </div>
              )}

              <div className="metrics-grid">
                <div className="metric">
                  <div className="metric-label">{getDistanceFullLabel()}</div>
                  <div className="metric-value">{simpleResults.miles.toLocaleString()}</div>
                </div>
                <div className="metric">
                  <div className="metric-label">Venta Total</div>
                  <div className="metric-value">
                    {tipoCambio.monedaActiva === 'USD' 
                      ? formatCurrency(simpleResults.revenue)
                      : formatCurrencyMXN(simpleResults.revenue * tipoCambio.valor)}
                  </div>
                </div>
                <div className="metric">
                  <div className="metric-label">Venta/{getDistanceLabel()}</div>
                  <div className="metric-value">
                    {tipoCambio.monedaActiva === 'USD' 
                      ? formatCurrency(simpleResults.revenuePerMile)
                      : formatCurrencyMXN(simpleResults.revenuePerMile * tipoCambio.valor)}
                  </div>
                </div>
                <div className="metric">
                  <div className="metric-label">Costo Total</div>
                  <div className="metric-value">
                    {tipoCambio.monedaActiva === 'USD' 
                      ? formatCurrency(simpleResults.totalCost)
                      : formatCurrencyMXN(simpleResults.totalCost * tipoCambio.valor)}
                  </div>
                </div>
                <div className="metric">
                  <div className="metric-label">Costo/{getDistanceLabel()}</div>
                  <div className="metric-value">
                    {tipoCambio.monedaActiva === 'USD' 
                      ? formatCurrency(simpleResults.costPerMile)
                      : formatCurrencyMXN(simpleResults.costPerMile * tipoCambio.valor)}
                  </div>
                </div>
                <div className="metric">
                  <div className="metric-label">Utilidad</div>
                  <div className={`metric-value ${simpleResults.profit >= 0 ? 'positive' : 'negative'}`}>
                    {tipoCambio.monedaActiva === 'USD' 
                      ? formatCurrency(simpleResults.profit)
                      : formatCurrencyMXN(simpleResults.profit * tipoCambio.valor)}
                  </div>
                </div>
                <div className="metric">
                  <div className="metric-label">% Utilidad</div>
                  <div className={`metric-value ${simpleResults.profit >= 0 ? 'positive' : 'negative'}`}>
                    {formatPercent(simpleResults.profitPercent)}
                  </div>
                </div>
                <div className="metric">
                  <div className="metric-label">Utilidad/{getDistanceLabel()}</div>
                  <div className={`metric-value ${simpleResults.profitPerMile >= 0 ? 'positive' : 'negative'}`}>
                    {tipoCambio.monedaActiva === 'USD' 
                      ? formatCurrency(simpleResults.profitPerMile)
                      : formatCurrencyMXN(simpleResults.profitPerMile * tipoCambio.valor)}
                  </div>
                </div>
              </div>

              <div className="divider"></div>

              <h4 style={{marginBottom: '12px', color: 'var(--gray-700)'}}>Desglose de Costos</h4>
              <div className="cost-breakdown">
                <div className="cost-item">
                  <span className="label"><Fuel size={14} /> Diésel</span>
                  <span className="value">{formatCurrency(simpleResults.fuelCost)}</span>
                </div>
                <div className="cost-item">
                  <span className="label"><Users size={14} /> Nómina</span>
                  <span className="value">{formatCurrency(simpleResults.payrollCost)}</span>
                </div>
                <div className="cost-item">
                  <span className="label"><Building2 size={14} /> Administrativos</span>
                  <span className="value">{formatCurrency(simpleResults.adminCost)}</span>
                </div>
                <div className="cost-item">
                  <span className="label"><Wrench size={14} /> Operativos</span>
                  <span className="value">{formatCurrency(simpleResults.operationalCost)}</span>
                </div>
                <div className="cost-item">
                  <span className="label"><Wrench size={14} /> Talacha/Ejes</span>
                  <span className="value">{formatCurrency(simpleResults.talachaCost)}</span>
                </div>
                <div className="cost-item">
                  <span className="label"><Gauge size={14} /> Llantas</span>
                  <span className="value">{formatCurrency(simpleResults.llantasCost)}</span>
                </div>
                {simpleResults.casetas > 0 && (
                  <div className="cost-item">
                    <span className="label"><CircleDollarSign size={14} /> Casetas</span>
                    <span className="value">{formatCurrency(simpleResults.casetas)}</span>
                  </div>
                )}
              </div>

              {simpleResults.status === 'danger' && (
                <div className="alert-box danger">
                  <XCircle size={24} className="alert-icon" />
                  <div className="alert-content">
                    <h4>¡Ruta No Rentable!</h4>
                    <p>
                      La tarifa actual no cubre los costos operativos. 
                      <strong className="tarifa-ideal"> Tarifa mínima recomendada: {formatCurrency(simpleResults.idealRate)}</strong> 
                      {' '}para alcanzar {config.stableMin}% de utilidad.
                    </p>
                  </div>
                </div>
              )}

              {simpleResults.status === 'comodin' && (
                <div className="alert-box warning">
                  <AlertTriangle size={24} className="alert-icon" />
                  <div className="alert-content">
                    <h4>Viaje Comodín</h4>
                    <p>
                      Este viaje genera ganancia pero está por debajo del margen estable. 
                      Considera negociar una tarifa de al menos {formatCurrency(simpleResults.idealRate)} para mejor rentabilidad.
                    </p>
                  </div>
                </div>
              )}

              {(simpleResults.status === 'stable' || simpleResults.status === 'ideal') && (
                <div className="alert-box success">
                  <CheckCircle size={24} className="alert-icon" />
                  <div className="alert-content">
                    <h4>{simpleResults.status === 'ideal' ? '¡Excelente Ruta!' : 'Ruta Rentable'}</h4>
                    <p>
                      {simpleResults.status === 'ideal' 
                        ? 'Esta ruta tiene una rentabilidad ideal. ¡Adelante con el viaje!'
                        : 'Esta ruta tiene una rentabilidad estable y es recomendable tomarla.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {tripMode === 'simple' && !simpleResults && (
            <div className="result-card" style={{textAlign: 'center', padding: '60px 20px'}}>
              <Truck size={64} style={{color: 'var(--gray-300)', marginBottom: '20px'}} />
              <h3 style={{color: 'var(--gray-500)', marginBottom: '10px'}}>Ingresa los datos del viaje</h3>
              <p style={{color: 'var(--gray-400)'}}>
                Completa los campos de millas y tarifa para ver el análisis de rentabilidad
              </p>
            </div>
          )}

          {/* Botón para guardar en historial */}
          {(simpleResults || (tripMode === 'round' && tramosViaje.some(t => t.millas && t.tarifa))) && (
            <button className="btn-guardar-historial" onClick={ejecutarAnalisis}>
              <ClipboardList size={18} /> Guardar en Historial
            </button>
          )}
        </main>
      </div>

      {/* Panel de Historial */}
      {showHistorial && (
        <div className="modal-overlay" onClick={() => setShowHistorial(false)}>
          <div className="modal-panel historial-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><History size={24} /> Historial de Rutas</h2>
              <button className="btn-close" onClick={() => setShowHistorial(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              {historialRutas.length === 0 ? (
                <div className="empty-state">
                  <ClipboardList size={48} />
                  <p>No hay rutas en el historial</p>
                  <small>Las rutas se guardarán aquí cuando ejecutes un análisis</small>
                </div>
              ) : (
                <div className="historial-lista">
                  {historialRutas.map((ruta) => (
                    <div key={ruta.id} className={`historial-item ${ruta.status}`}>
                      <div className="historial-fecha">{ruta.fecha}</div>
                      <div className="historial-ruta">
                        {ruta.tipo === 'simple' ? (
                          <span>{ruta.origen} → {ruta.destino}</span>
                        ) : (
                          <span>Vuelta Completa ({ruta.tramos?.length || 0} tramos)</span>
                        )}
                      </div>
                      <div className="historial-datos">
                        <span>{ruta.millas || ruta.totalMillas} mi</span>
                        <span>{formatCurrency(ruta.tarifa || ruta.totalTarifa)}</span>
                        <span className={`profit-badge ${ruta.status}`}>{ruta.margen?.toFixed(1)}%</span>
                      </div>
                      {ruta.vehiculo && (
                        <div className="historial-vehiculo">
                          <Truck size={12} />
                          <span>{ruta.vehiculo.tipoCamion}</span>
                          <span>|</span>
                          <span>{ruta.vehiculo.tipoCaja}</span>
                          <span>|</span>
                          <span>{ruta.vehiculo.ejes} ejes</span>
                          <span>|</span>
                          <span>CPM: ${ruta.vehiculo.costPerMile?.toFixed(2)}</span>
                        </div>
                      )}
                      <button 
                        className="btn-icon"
                        onClick={() => {
                          if (ruta.tipo === 'simple') {
                            setSimpleTrip({
                              ...simpleTrip,
                              origen: ruta.origen,
                              destino: ruta.destino,
                              miles: ruta.millas.toString(),
                              rate: ruta.tarifa.toString(),
                              casetas: (ruta.casetas || 0).toString(),
                              toneladas: (ruta.toneladas || 0).toString(),
                            })
                            setTripMode('simple')
                          }
                          setShowHistorial(false)
                        }}
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Panel de Liquidación/Reporte de Viaje */}
      {showReporte && (
        <div className="modal-overlay" onClick={() => setShowReporte(false)}>
          <div className="modal-panel reporte-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FileText size={24} /> Reporte de Viaje</h2>
              <button className="btn-close" onClick={() => setShowReporte(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              {/* Explicación del módulo */}
              <div className="reporte-explicacion">
                <h4>📋 ¿Qué es el Reporte de Liquidación?</h4>
                <p>Este reporte analiza un <strong>viaje completo de ida y vuelta</strong> dividido en 3 secciones:</p>
                <ul>
                  <li><strong>🚛 Tramo de IDA:</strong> Viaje cargado desde origen hasta destino (genera ingreso)</li>
                  <li><strong>📦 Empty Miles:</strong> Millas vacías para ir a cargar el siguiente flete (solo costo, sin ingreso)</li>
                  <li><strong>🚛 Tramo de REGRESO:</strong> Viaje cargado de regreso (genera ingreso)</li>
                </ul>
                <p className="reporte-tip">💡 <strong>W.O. #</strong> = Work Order (número de orden de trabajo del cliente)</p>
              </div>

              <div className="reporte-form">
                {/* W.O. IDA */}
                <div className="reporte-section">
                  <h3>🚛 Tramo IDA - W.O. # <input type="text" value={reporteViaje.woIda} onChange={(e) => setReporteViaje({...reporteViaje, woIda: e.target.value})} placeholder="775480" className="wo-input" /></h3>
                  <div className="reporte-grid">
                    <div className="form-group">
                      <label>Origen</label>
                      <input type="text" list="ciudades-list" value={reporteViaje.origenIda} onChange={(e) => setReporteViaje({...reporteViaje, origenIda: e.target.value})} placeholder="Tijuana, BCN" />
                    </div>
                    <div className="form-group">
                      <label>Destino</label>
                      <input type="text" list="ciudades-list" value={reporteViaje.destinoIda} onChange={(e) => setReporteViaje({...reporteViaje, destinoIda: e.target.value})} placeholder="Laredo, TX" />
                    </div>
                    <div className="form-group">
                      <label>Millas</label>
                      <input type="number" value={reporteViaje.millasIda} onChange={(e) => setReporteViaje({...reporteViaje, millasIda: e.target.value})} placeholder="1136" />
                    </div>
                    <div className="form-group">
                      <label>Venta de Flete $</label>
                      <input type="number" value={reporteViaje.tarifaIda} onChange={(e) => setReporteViaje({...reporteViaje, tarifaIda: e.target.value})} placeholder="4267.50" />
                    </div>
                  </div>
                </div>

                {/* VACÍO */}
                <div className="reporte-section vacio">
                  <h3>📦 Empty Miles to Load (Millas Vacías)</h3>
                  <div className="reporte-grid">
                    <div className="form-group">
                      <label>Origen</label>
                      <input type="text" list="ciudades-list" value={reporteViaje.origenVacio} onChange={(e) => setReporteViaje({...reporteViaje, origenVacio: e.target.value})} placeholder="Laredo, TX" />
                    </div>
                    <div className="form-group">
                      <label>Destino</label>
                      <input type="text" list="ciudades-list" value={reporteViaje.destinoVacio} onChange={(e) => setReporteViaje({...reporteViaje, destinoVacio: e.target.value})} placeholder="San Antonio, TX" />
                    </div>
                    <div className="form-group">
                      <label>Millas Vacías</label>
                      <input type="number" value={reporteViaje.millasVacio} onChange={(e) => setReporteViaje({...reporteViaje, millasVacio: e.target.value})} placeholder="157" />
                    </div>
                  </div>
                </div>

                {/* W.O. REGRESO */}
                <div className="reporte-section">
                  <h3>🚛 Tramo REGRESO - W.O. # <input type="text" value={reporteViaje.woRegreso} onChange={(e) => setReporteViaje({...reporteViaje, woRegreso: e.target.value})} placeholder="775923" className="wo-input" /></h3>
                  <div className="reporte-grid">
                    <div className="form-group">
                      <label>Origen</label>
                      <input type="text" list="ciudades-list" value={reporteViaje.origenRegreso} onChange={(e) => setReporteViaje({...reporteViaje, origenRegreso: e.target.value})} placeholder="San Antonio, TX" />
                    </div>
                    <div className="form-group">
                      <label>Destino</label>
                      <input type="text" list="ciudades-list" value={reporteViaje.destinoRegreso} onChange={(e) => setReporteViaje({...reporteViaje, destinoRegreso: e.target.value})} placeholder="San Diego, CA" />
                    </div>
                    <div className="form-group">
                      <label>Millas</label>
                      <input type="number" value={reporteViaje.millasRegreso} onChange={(e) => setReporteViaje({...reporteViaje, millasRegreso: e.target.value})} placeholder="1275" />
                    </div>
                    <div className="form-group">
                      <label>Venta de Flete $</label>
                      <input type="number" value={reporteViaje.tarifaRegreso} onChange={(e) => setReporteViaje({...reporteViaje, tarifaRegreso: e.target.value})} placeholder="2300" />
                    </div>
                  </div>
                </div>

                <datalist id="ciudades-list">
                  {ciudadesGuardadas.map((ciudad, i) => (
                    <option key={i} value={ciudad} />
                  ))}
                </datalist>
              </div>

              {/* Resultados del Reporte */}
              {(reporteViaje.millasIda || reporteViaje.millasRegreso) && (
                <div className="reporte-resultados">
                  {(() => {
                    const rep = calcularReporteLiquidacion()
                    return (
                      <>
                        {/* IDA */}
                        {rep.ida.millas > 0 && (
                          <div className="reporte-card">
                            <div className="reporte-card-header">
                              <span className="wo-badge">W.O. # {reporteViaje.woIda || '---'}</span>
                            </div>
                            <div className="reporte-info">
                              <p><strong>Origen:</strong> {reporteViaje.origenIda}</p>
                              <p><strong>Destino:</strong> {reporteViaje.destinoIda}</p>
                              <p><strong>Venta de Flete:</strong> {formatCurrency(rep.ida.tarifa)}</p>
                              <p><strong>Millas Recorridas:</strong> {rep.ida.millas.toLocaleString()}</p>
                              <p><strong>Consumo del Diesel:</strong> {formatCurrency(rep.ida.diesel)}</p>
                            </div>
                            <div className="reporte-metricas">
                              <div className="metrica"><span>SPM</span><span>{rep.ida.spm.toFixed(2)}</span></div>
                              <div className="metrica"><span>CPM</span><span>{rep.ida.cpm.toFixed(2)}</span></div>
                              <div className="metrica"><span>PPM</span><span>{rep.ida.ppm.toFixed(2)}</span></div>
                              <div className={`metrica profit ${rep.ida.profit >= 18 ? 'good' : rep.ida.profit >= 10 ? 'warning' : 'bad'}`}>
                                <span>PROFIT %</span><span>{rep.ida.profit.toFixed(0)}%</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* VACÍO */}
                        {rep.vacio.millas > 0 && (
                          <div className="reporte-card vacio">
                            <h4>Empty Miles to load</h4>
                            <p><strong>Origen:</strong> {reporteViaje.origenVacio} <strong>Destino:</strong> {reporteViaje.destinoVacio}</p>
                            <p><strong>Millas Recorridas:</strong> {rep.vacio.millas}</p>
                          </div>
                        )}

                        {/* REGRESO */}
                        {rep.regreso.millas > 0 && (
                          <div className="reporte-card">
                            <div className="reporte-card-header">
                              <span className="wo-badge">W.O. # {reporteViaje.woRegreso || '---'}</span>
                            </div>
                            <div className="reporte-info">
                              <p><strong>Origen:</strong> {reporteViaje.origenRegreso}</p>
                              <p><strong>Destino:</strong> {reporteViaje.destinoRegreso}</p>
                              <p><strong>Venta de Flete:</strong> {formatCurrency(rep.regreso.tarifa)}</p>
                              <p><strong>Millas Recorridas:</strong> {rep.regreso.millas.toLocaleString()}</p>
                              <p><strong>Consumo del Diesel:</strong> {formatCurrency(rep.regreso.diesel)}</p>
                            </div>
                            <div className="reporte-metricas">
                              <div className="metrica"><span>SPM</span><span>{rep.regreso.spm.toFixed(2)}</span></div>
                              <div className="metrica"><span>CPM</span><span>{rep.regreso.cpm.toFixed(2)}</span></div>
                              <div className="metrica"><span>PPM</span><span>{rep.regreso.ppm.toFixed(2)}</span></div>
                              <div className={`metrica profit ${rep.regreso.profit >= 18 ? 'good' : rep.regreso.profit >= 10 ? 'warning' : 'bad'}`}>
                                <span>PROFIT %</span><span>{rep.regreso.profit.toFixed(0)}%</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* TOTALES */}
                        <div className="reporte-total">
                          <h4>Resumen Total del Viaje</h4>
                          <div className="reporte-metricas total">
                            <div className="metrica"><span>SPM</span><span>{rep.total.spm.toFixed(2)}</span></div>
                            <div className="metrica"><span>CPM</span><span>{rep.total.cpm.toFixed(2)}</span></div>
                            <div className="metrica"><span>PPM</span><span>{rep.total.ppm.toFixed(2)}</span></div>
                            <div className={`metrica profit ${rep.total.profit >= 18 ? 'good' : rep.total.profit >= 10 ? 'warning' : 'bad'}`}>
                              <span>PROFIT %</span><span>{rep.total.profit.toFixed(0)}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Botón para generar PDF */}
                        <button className="btn-generar-pdf" onClick={generarPDFLiquidacion}>
                          <Download size={18} /> Descargar PDF de Liquidación
                        </button>
                      </>
                    )
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Selector de Ubicación en Mapa */}
      {showMapSelector && (
        <div className="modal-overlay" onClick={() => setShowMapSelector(false)}>
          <div className="modal-panel map-selector-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><Map size={24} /> Seleccionar Ubicación - {mapSelectorTarget?.campo === 'origen' ? 'Origen' : 'Destino'}</h2>
              <button className="btn-close" onClick={() => setShowMapSelector(false)}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{padding: 0}}>
              <div className="map-selector-instructions">
                <p>📍 Haz clic en el mapa para seleccionar la ubicación exacta</p>
              </div>
              <MapContainer 
                center={mapSelectorPosition} 
                zoom={8} 
                style={{height: '450px', width: '100%'}}
                onClick={(e) => {
                  setMapSelectorPosition([e.latlng.lat, e.latlng.lng])
                }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onMapClick={(lat, lng) => setMapSelectorPosition([lat, lng])} />
                <Marker 
                  position={mapSelectorPosition}
                  icon={createCustomIcon(mapSelectorTarget?.campo === 'origen' ? '#10b981' : '#3b82f6', mapSelectorTarget?.campo === 'origen' ? 'O' : 'D')}
                >
                  <Popup>
                    <strong>Ubicación seleccionada</strong><br/>
                    Lat: {mapSelectorPosition[0].toFixed(6)}<br/>
                    Lng: {mapSelectorPosition[1].toFixed(6)}
                  </Popup>
                </Marker>
                {/* Mostrar ubicaciones predefinidas */}
                {UBICACIONES_YARDA.filter(u => u.lat).map(ub => (
                  <Marker 
                    key={ub.id}
                    position={[ub.lat, ub.lng]}
                    icon={createCustomIcon('#6b7280', ub.nombre.charAt(0))}
                    eventHandlers={{
                      click: () => setMapSelectorPosition([ub.lat, ub.lng])
                    }}
                  >
                    <Popup>{ub.nombre}<br/><small>{ub.ciudad}</small></Popup>
                  </Marker>
                ))}
              </MapContainer>
              <div className="map-selector-footer">
                <div className="coords-display">
                  <span>📍 Lat: <strong>{mapSelectorPosition[0].toFixed(6)}</strong></span>
                  <span>Lng: <strong>{mapSelectorPosition[1].toFixed(6)}</strong></span>
                </div>
                <div className="map-selector-actions">
                  <button className="btn-cancel" onClick={() => setShowMapSelector(false)}>
                    Cancelar
                  </button>
                  <button 
                    className="btn-confirm" 
                    onClick={() => confirmarUbicacionMapa(mapSelectorPosition[0], mapSelectorPosition[1])}
                  >
                    <CheckCircle size={16} /> Confirmar Ubicación
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Rate Quote */}
      {showRateQuote && (
        <div className="modal-overlay" onClick={() => setShowRateQuote(false)}>
          <div className="modal-panel rate-quote-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header rate-quote-header">
              <div className="rate-quote-title">
                <h2>RATE QUOTE</h2>
                <p>COTIZACIÓN DE TRANSPORTE</p>
              </div>
              <button className="btn-close" onClick={() => setShowRateQuote(false)}><X size={20} /></button>
            </div>
            
            <div className="modal-body rate-quote-body">
              {/* Información del Cliente */}
              <div className="rate-quote-section">
                <div className="rate-quote-row">
                  <div className="rate-quote-field">
                    <label>CUSTOMER:</label>
                    <input 
                      type="text" 
                      value={rateQuote.customerName}
                      onChange={(e) => setRateQuote({...rateQuote, customerName: e.target.value})}
                      placeholder="Nombre de la empresa"
                    />
                  </div>
                  <div className="rate-quote-field">
                    <label>DATE:</label>
                    <span>{new Date().toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'})}</span>
                  </div>
                </div>
                <div className="rate-quote-row">
                  <div className="rate-quote-field">
                    <label>CONTACT:</label>
                    <input 
                      type="text" 
                      value={rateQuote.contactName}
                      onChange={(e) => setRateQuote({...rateQuote, contactName: e.target.value})}
                      placeholder="Nombre del contacto"
                    />
                  </div>
                  <div className="rate-quote-field">
                    <label>CREATED BY:</label>
                    <input 
                      type="text" 
                      value={rateQuote.createdBy}
                      onChange={(e) => setRateQuote({...rateQuote, createdBy: e.target.value})}
                    />
                  </div>
                </div>
                <div className="rate-quote-row">
                  <div className="rate-quote-field">
                    <label>PHONE:</label>
                    <input 
                      type="text" 
                      value={rateQuote.phone}
                      onChange={(e) => setRateQuote({...rateQuote, phone: e.target.value})}
                      placeholder="Teléfono"
                    />
                  </div>
                  <div className="rate-quote-field">
                    <label>QUOTE #:</label>
                    <span>SIN-{new Date().toLocaleDateString('en-US', {month: '2-digit', day: '2-digit'}).replace('/', '.')}.{Math.floor(Math.random() * 100)}</span>
                  </div>
                </div>
                <div className="rate-quote-row">
                  <div className="rate-quote-field">
                    <label>EMAIL:</label>
                    <input 
                      type="text" 
                      value={rateQuote.email}
                      onChange={(e) => setRateQuote({...rateQuote, email: e.target.value})}
                      placeholder="correo@empresa.com"
                    />
                  </div>
                  <div className="rate-quote-field">
                    <label>EMAIL:</label>
    <span>info@transport.com</span>
                  </div>
                </div>
              </div>

              {/* Tabla de Rates */}
              <div className="rate-quote-table">
                <div className="rate-table-header">
                  <div>SERVICE DESCRIPTION<br/>TRANSPORTATION RATES</div>
                  <div>UNIT OF<br/>MEASUREMENT</div>
                  <div>RATE</div>
                </div>
                
                {/* Dry Van */}
                <div className="rate-table-row">
                  <div className="rate-route">
                    <strong>FROM:</strong> {rateQuote.origen || simpleTrip.origen || 'TIJUANA, BCN'}<br/>
                    <strong>TO:</strong> {rateQuote.destino || simpleTrip.destino || 'COLTON, CA - 92324'}
                  </div>
                  <div className="rate-unit">
                    <span className="unit-type">53 DRY VAN</span>
                    <span className="unit-detail">Legal Weight</span>
                    <span className="unit-hazmat no-hazmat">NO HAZMAT</span>
                  </div>
                  <div className="rate-price">
                    <div className="rate-base">
                      <input 
                        type="number" 
                        value={rateQuote.rateDryVan}
                        onChange={(e) => setRateQuote({...rateQuote, rateDryVan: parseFloat(e.target.value) || 0})}
                        style={{width: '80px', textAlign: 'right'}}
                      /> USD
                    </div>
                    <div className="rate-fsc">+ FSC Per trip</div>
                    <div className="rate-total">
                      <strong>Total: ${(rateQuote.rateDryVan * (1 + rateQuote.fscPercent/100)).toFixed(2)} USD</strong>
                    </div>
                  </div>
                </div>

                {/* Flatbed */}
                <div className="rate-table-row">
                  <div className="rate-route">
                    <strong>FROM:</strong> {rateQuote.origen || simpleTrip.origen || 'TIJUANA, BCN'}<br/>
                    <strong>TO:</strong> {rateQuote.destino || simpleTrip.destino || 'COLTON, CA - 92324'}
                  </div>
                  <div className="rate-unit">
                    <span className="unit-type">48 FLATBED</span>
                    <span className="unit-detail">Legal Weight</span>
                    <span className="unit-hazmat no-hazmat">NO HAZMAT</span>
                  </div>
                  <div className="rate-price">
                    <div className="rate-base">
                      <input 
                        type="number" 
                        value={rateQuote.rateFlatbed}
                        onChange={(e) => setRateQuote({...rateQuote, rateFlatbed: parseFloat(e.target.value) || 0})}
                        style={{width: '80px', textAlign: 'right'}}
                      /> USD
                    </div>
                    <div className="rate-fsc">+ FSC Per trip</div>
                    <div className="rate-total">
                      <strong>Total: ${(rateQuote.rateFlatbed * (1 + rateQuote.fscPercent/100)).toFixed(2)} USD</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* FSC Info */}
              <div className="rate-quote-fsc-info">
                <div className="fsc-left">
                  <p><strong>Additional charges may apply.</strong> Please review and sign the accessorial charges sheet.</p>
                  <p>Waiting times exceeding 1 hour at the shipper, customs, or consignee will incur additional charges of <strong>$50.00 USD per additional hour.</strong></p>
                </div>
                <div className="fsc-right">
                  <p><strong>(The FSC is calculated based on the average fuel prices.)</strong></p>
                  <p>Currently: <strong>${rateQuote.fscPerGallon} = {rateQuote.fscPercent}%</strong></p>
                  <p className="fsc-note">The diesel price varies depending on the market price per gallon. It may change weekly, and updates will be sent via email.</p>
                  <p className="fsc-source">For reference, the diesel price is obtained from: <a href="https://www.eia.gov/petroleum/gasdiesel/" target="_blank" rel="noopener noreferrer">eia.gov</a></p>
                  <p className="fsc-currency"><strong>All prices are in U.S. dollars.</strong></p>
                </div>
              </div>

              {/* Footer Notes */}
              <div className="rate-quote-footer-notes">
                <p><strong>FSC is calculated on weekly bases on EIA.</strong> It may change according to fuel prices. Rates based on dock-dock service. Rates are good for 30 days. USA cargo insurance limit $250,000.00 USD.</p>
                <p className="availability-note"><strong>ALL QUOTES ARE SUBJECT TO AVAILABILITY</strong></p>
                <p className="notes-text"><em>Notes: We are dedicated to providing our customer with the finest service, using every available resource, to ensure customer satisfaction with the success of each shipment and helping reach our customers goals.</em></p>
              </div>

              {/* Signatures */}
              <div className="rate-quote-signatures">
                <div className="signature-box">
                  <p className="signature-label">Carrier Name: <strong>TRANSPORTES</strong></p>
                  <p>Signature: _______________________</p>
                  <p>Name: <strong>{rateQuote.createdBy}</strong></p>
                  <p>Title: <strong>GM</strong></p>
                  <p>Date: <strong>{new Date().toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'})}</strong></p>
                </div>
                <div className="signature-box">
                  <p className="signature-label">Customer Name: <strong>{rateQuote.customerName || '_______________'}</strong></p>
                  <p>Signature: _______________________</p>
                  <p>Name: <strong>{rateQuote.contactName || '_______________'}</strong></p>
                  <p>Title: _______________</p>
                  <p>Date: _______________</p>
                </div>
              </div>

              <p className="sign-return-note">** Please sign and return to sales representative.</p>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowRateQuote(false)}>
                Cerrar
              </button>
              <button className="btn-primary" onClick={() => {
                const printContent = document.querySelector('.rate-quote-body').innerHTML;
                const logoSrc = document.querySelector('.rate-quote-logo img')?.src || '';
                const printWindow = window.open('', '_blank');
                printWindow.document.write(`
                  <html>
                  <head>
                    <title>Rate Quote - Transporte</title>
                    <style>
                      * { margin: 0; padding: 0; box-sizing: border-box; font-family: Arial, sans-serif; }
                      body { padding: 15px; font-size: 11px; }
                      .header-print { display: flex; align-items: center; gap: 20px; margin-bottom: 12px; border-bottom: 2px solid #c9a227; padding-bottom: 10px; }
                      .header-print img { height: 50px; }
                      .header-print .title { flex: 1; text-align: center; }
                      .header-print h1 { color: #1e3a5f; font-size: 18px; margin-bottom: 3px; }
                      .header-print p { color: #1e3a5f; font-size: 11px; }
                      .rate-quote-section { border: 1px solid #ddd; padding: 8px; margin-bottom: 8px; background: #f9f9f9; border-radius: 5px; }
                      .rate-quote-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 4px; }
                      .rate-quote-field { display: flex; align-items: center; gap: 6px; }
                      .rate-quote-field label { font-weight: bold; min-width: 70px; color: #1e3a5f; font-size: 10px; }
                      .rate-quote-field input, .rate-quote-field span { font-size: 10px; }
                      .rate-quote-table { border: 2px solid #1e3a5f; margin-bottom: 8px; border-radius: 5px; overflow: hidden; }
                      .rate-table-header { display: grid; grid-template-columns: 2fr 1fr 1fr; background: #c9a227; color: white; padding: 6px; text-align: center; font-weight: bold; font-size: 9px; }
                      .rate-table-row { display: grid; grid-template-columns: 2fr 1fr 1fr; padding: 8px; border-bottom: 1px solid #ddd; align-items: center; }
                      .rate-route { line-height: 1.3; font-size: 10px; }
                      .rate-unit { text-align: center; }
                      .unit-type { font-weight: bold; color: #1e3a5f; font-size: 11px; }
                      .unit-detail { font-size: 9px; }
                      .unit-hazmat { background: #d4edda; color: #155724; padding: 2px 5px; border-radius: 3px; font-size: 8px; }
                      .rate-price { text-align: center; }
                      .rate-base { font-weight: bold; color: #1e3a5f; font-size: 11px; }
                      .rate-fsc { font-size: 9px; color: #666; }
                      .rate-total { color: #c9a227; font-weight: bold; margin-top: 3px; font-size: 10px; }
                      .rate-quote-fsc-info { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f9f9f9; padding: 8px; margin-bottom: 8px; border-radius: 5px; font-size: 9px; }
                      .rate-quote-fsc-info p { margin: 2px 0; line-height: 1.3; }
                      .rate-quote-footer-notes { background: #fff3cd; padding: 8px; margin-bottom: 8px; border-radius: 5px; font-size: 9px; }
                      .rate-quote-footer-notes p { margin: 2px 0; line-height: 1.3; }
                      .availability-note { text-align: center; font-size: 11px; color: #1e3a5f; margin: 6px 0; }
                      .notes-text { font-size: 8px; }
                      .rate-quote-signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 8px; }
                      .signature-box { border: 1px solid #ddd; padding: 8px; border-radius: 5px; background: #f9f9f9; }
                      .signature-box p { margin: 3px 0; font-size: 9px; }
                      .signature-label { border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 6px; }
                      .sign-return-note { text-align: center; color: #dc3545; font-weight: bold; font-size: 10px; }
                      @page { size: letter; margin: 0.4in; }
                    </style>
                  </head>
                  <body>
                    <div class="header-print">
                      <div class="title">
                        <h1>RATE QUOTE</h1>
                        <p>COTIZACIÓN DE TRANSPORTE</p>
                      </div>
                    </div>
                    ${printContent}
                  </body>
                  </html>
                `);
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => { printWindow.print(); }, 250);
              }}>
                <Download size={16} /> Imprimir / Guardar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    <Analytics />
    </>
  )
}

// Componente para manejar clicks en el mapa
function MapClickHandler({ onMapClick }) {
  const map = useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default App
