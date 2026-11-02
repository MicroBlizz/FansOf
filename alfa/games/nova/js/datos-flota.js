// Fans of Nova · Datos de la flota que trabaja mientras no juegas: tope de la bodega, trabajos, lo que rinde cada tipo de sector y las
// mejoras. Las reglas están en dominio/flota.js (NV.Flota). Diseño: docs/nova/idle-flota.md (29-10-2026, elegido entero el 02-11-2026)
// con la bodega de 12 h (Arkioner, 02-11-2026). Calibración: 8 h con 3 naves de nivel 1 en sectores normales ≈ 60 % de una misión ganada.
'use strict';
const NOVA_FLOTA = {
 "topeHoras": 12,
 "naves": [3, 6, 9],
 "nivel": { "max": 10, "base": 30, "paso": 20 },
 "trabajos": {
  "minar":     { "produce": "aleacion", "ritmo": 4, "sectores": { "cinturon": 1.5, "pecio": 0.8 } },
  "patrullar": { "produce": null, "bloqueado": true },
  "escoltar":  { "produce": null, "bloqueado": true }
 },
 "mejoras": {
  "bodega":    { "max": 3, "horas": 2, "coste": [120, 240, 400] },
  "velocidad": { "max": 5, "parte": 0.1, "coste": [80, 140, 200, 280, 360] },
  "naves":     { "max": 2, "coste": [250, 600] }
 }
};
