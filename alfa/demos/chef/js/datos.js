// Fans of Chef · DATOS: los ingredientes, la comida viva del sótano (qué bicho suelta qué), las recetas de la cantina y
// qué pide la empresa cada jornada. Las cifras de vida y daño están aquí; los tiempos generales, en ajustes.js.
'use strict';

// ingredientes: nombre, color (para el icono por código si no hay imagen) y qué bicho lo suelta
const INGREDIENTES = {
  tomate:   { nombre: 'Tomate explosivo', color: '#e8342a', luz: '#ff8a7a' },
  cebolla:  { nombre: 'Cebolla monstruosa', color: '#d9962e', luz: '#f7d38a' },
  gelatina: { nombre: 'Esencia de gelatina', color: '#7be04a', luz: '#d8ff9a' },
};

// la comida viva: vida, velocidad, daño, qué suelta y cuánto. El comportamiento está en enemigos.js por su `tipo`.
const BICHOS = {
  tomate:   { nombre: 'Tomate explosivo', vida: 2, vel: 54, dano: 1, suelta: 'tomate', cuantos: [1, 2], ancho: 30, alto: 40, mecha: 0.8, radio: 40 },
  cebollon: { nombre: 'Cebollón monstruoso', vida: 4, vel: 32, dano: 1, suelta: 'cebolla', cuantos: [1, 2], ancho: 40, alto: 64, embiste: 130 },
  gelatina: { nombre: 'Gelatina de slime', vida: 3, vel: 0, dano: 1, suelta: 'gelatina', cuantos: [1, 1], ancho: 40, alto: 44, salto: 85 },
};

// las recetas de la cantina: qué lleva cada plato (ingredientes cortados), en qué fuego se hace (olla o sartén) y los puntos base
const RECETAS = {
  sopa:     { nombre: 'Sopa de gelatina', lleva: { gelatina: 1, cebolla: 1 }, fuego: 'olla', puntos: 20, color: '#7be04a' },
  relleno:  { nombre: 'Tomate relleno de becario', lleva: { tomate: 2 }, fuego: 'sarten', puntos: 20, color: '#e8342a' },
  aros:     { nombre: 'Aros de cebollón', lleva: { cebolla: 2 }, fuego: 'sarten', puntos: 20, color: '#d9962e' },
  gazpacho: { nombre: 'Gazpacho que grita', lleva: { tomate: 1, gelatina: 1 }, fuego: 'olla', puntos: 25, color: '#ff6a4a' },
};

// quién come en la cantina y qué pide: la lista de cada jornada (de la 4 en adelante se repite la última con más clientes)
const CLIENTES = ['Becario', 'Becaria', 'Becario en prácticas', 'Becario eterno', 'Programadora', 'Programador'];
const JORNADAS = [
  ['sopa', 'relleno', 'aros'],
  ['sopa', 'sopa', 'relleno', 'gazpacho'],
  ['sopa', 'gazpacho', 'relleno', 'aros', 'gazpacho'],
];
function pedidosDeJornada(dia) {
  const base = JORNADAS[Math.min(dia, JORNADAS.length) - 1].slice();
  for (let i = JORNADAS.length; i < dia && i < JORNADAS.length + 3; i++) base.push(pick(Object.keys(RECETAS)));
  return base;
}
// lo que hace falta cazar para servir todos los pedidos de la jornada
function objetivosDe(pedidos) {
  const o = {};
  for (const p of pedidos) for (const k in RECETAS[p].lleva) o[k] = (o[k] || 0) + RECETAS[p].lleva[k];
  return o;
}
