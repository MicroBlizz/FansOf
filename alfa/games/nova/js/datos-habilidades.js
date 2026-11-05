// Fans of Nova · Datos de la habilidad activa: una por facción (la de tu campaña; en el simulador, la del casco). Las reglas de la recarga
// están en dominio/habilidad.js (NV.Habilidad) y lo que hace cada una en la partida, en habilidad.js. Diseño: docs/nova/habilidad-activa.md.
// Cifras de partida: se ajustan con herramientas/nova/nova-balance.py y la partida automática. dura: segundos que actúa; recarga: segundos
// hasta poder usarla otra vez (cuentan desde que se usa).
'use strict';
const NOVA_HABILIDADES = {
 "rango": 2,
 "facciones": {
  "animales":  { "id": "estampida", "nombre": "Estampida", "recarga": 35, "dura": 1.5, "vel": 2.2, "dano": 3, "txt": "Embestida: los golpes no te dañan y dañas a lo que tocas" },
  "nomuertos": { "id": "legion", "nombre": "Legión", "recarga": 40, "dura": 8, "espiritus": 3, "cada": 0.5, "alcance": 420, "dano": 0.8, "txt": "Tres espíritus de los caídos luchan a tu lado" },
  "streamers": { "id": "directo", "nombre": "Directo", "recarga": 35, "dura": 4, "radio": 520, "tira": 240, "txt": "Atrae a los enemigos cercanos y tu hype no se pierde" },
  "heroes":    { "id": "gesta", "nombre": "Gesta", "recarga": 45, "dura": 6, "txt": "Subes un rango durante unos segundos" },
  "ciber":     { "id": "plasma", "nombre": "Escudo de plasma", "recarga": 35, "dura": 2.5, "radio": 380, "apagon": 2, "txt": "Escudo total y, al acabar, un pulso que apaga lo cercano" },
  "memes":     { "id": "tirada", "nombre": "Tirada", "recarga": 30, "opciones": ["estampida", "gesta", "plasma", "concierto"], "txt": "Una de cuatro habilidades al azar, todas útiles" },
  "gamer":     { "id": "bullettime", "nombre": "Bullet time", "recarga": 40, "dura": 3, "lento": 0.35, "txt": "Todo va a cámara lenta menos tus armas" },
  "olvidados": { "id": "radar", "nombre": "Fuera del radar", "recarga": 40, "dura": 4, "txt": "Nadie te apunta durante unos segundos" },
  "pop":       { "id": "concierto", "nombre": "Concierto", "recarga": 35, "dura": 1.5, "radio": 420, "empuje": 700, "txt": "Una onda que empuja y aturde a todo lo que te rodea" }
 }
};
