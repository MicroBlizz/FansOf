// Fans of Cooking · RECETAS: los ingredientes (qué se les hace: cortar, sartén, olla, horno) y las recetas (qué lleva el plato que se sirve).
// Las cifras de tiempo están en ajustes.js. Un ingrediente se dibuja en pintar.js por su `forma` y sus colores.
'use strict';
// Ingredientes: nombre, color principal, color del detalle, forma del dibujo y qué procesos admite.
// cortar: hay que trocearlo en la tabla. sarten: va al fogón (ya cortado si también se corta). horno: entra al horno solo o montado. olla: entra a la olla cortado.
const INGREDIENTES = {
  pan: { nombre: 'Pan', color: '#e0a95c', detalle: '#f6dfb0', forma: 'pan', cortar: true },
  queso: { nombre: 'Queso', color: '#ffd94a', detalle: '#ffb52e', forma: 'queso', cortar: true },
  jamon: { nombre: 'Jamón', color: '#f08aa0', detalle: '#ffd1da', forma: 'oval', cortar: true },
  tomate: { nombre: 'Tomate', color: '#ff4b3a', detalle: '#4caf50', forma: 'tomate', cortar: true, olla: true },
  lechuga: { nombre: 'Lechuga', color: '#7fd64a', detalle: '#4c9a2a', forma: 'hoja', cortar: true, olla: true },
  patata: { nombre: 'Patata', color: '#d9b06b', detalle: '#b3883f', forma: 'oval', cortar: true, sarten: true, olla: true },
  carne: { nombre: 'Carne', color: '#b05a4a', detalle: '#7a3a2a', forma: 'oval', sarten: true },
  masa: { nombre: 'Masa', color: '#f3dcb0', detalle: '#e5c58a', forma: 'disco' },
  nata: { nombre: 'Nata', color: '#fff7ea', detalle: '#ffe3c2', forma: 'nube' },
  cereza: { nombre: 'Cerezas', color: '#d4203a', detalle: '#4caf50', forma: 'cerezas' },
  hueso: { nombre: 'Hueso', color: '#efe8d0', detalle: '#c8bd9c', forma: 'hueso', cortar: true, olla: true },
  ojo: { nombre: 'Ojo', color: '#f4f4f4', detalle: '#3bbf6a', forma: 'ojo', olla: true },
  cafe: { nombre: 'Café', color: '#5a3a24', detalle: '#2f1b10', forma: 'granos', olla: true },
  fideos: { nombre: 'Fideos', color: '#f7e2a0', detalle: '#e3c66c', forma: 'fideos', olla: true },
};
// Recetas: lo que tiene que haber en el plato (ingrediente y estado: crudo, cortado, cocinado, sopa u horneado), con la facción del chiste.
// `horno: true` significa que los ingredientes se montan en una encimera y el montón entero entra al horno. `olla: [..]` es una sopa: esos ingredientes cortados van a la olla.
const RECETAS = [
  // Cafetería de los becarios: frío y rápido
  { id: 'tostada', nombre: 'Tostada del becario', fac: 'microblizz', ings: [['pan', 'cortado'], ['queso', 'cortado']] },
  { id: 'ensalada', nombre: 'Ensalada de Pulgas', fac: 'animales', ings: [['lechuga', 'cortado'], ['tomate', 'cortado']] },
  { id: 'bocadillo', nombre: 'Bocadillo de la LAN', fac: 'gamer', ings: [['pan', 'cortado'], ['jamon', 'cortado'], ['queso', 'cortado']] },
  { id: 'merienda', nombre: 'Merienda de SnackMom', fac: 'streamers', ings: [['pan', 'cortado'], ['jamon', 'cortado'], ['queso', 'cortado'], ['tomate', 'cortado']] },
  // Juniors: la sartén
  { id: 'patatas', nombre: 'Patatas del parche', fac: 'ciber', ings: [['patata', 'cocinado']] },
  { id: 'hamburguesa', nombre: 'Hamburguesa Stonks', fac: 'memes', ings: [['pan', 'cortado'], ['carne', 'cocinado']] },
  { id: 'completa', nombre: 'Hamburguesa Clickbait', fac: 'memes', ings: [['pan', 'cortado'], ['carne', 'cocinado'], ['lechuga', 'cortado'], ['tomate', 'cortado']] },
  { id: 'combo', nombre: 'Combo del Speedrunner', fac: 'gamer', ings: [['pan', 'cortado'], ['carne', 'cocinado'], ['patata', 'cocinado']] },
  // Seniors: la olla
  { id: 'cafe', nombre: 'Café de las horas extra', fac: 'microblizz', olla: ['cafe'] },
  { id: 'sopa', nombre: 'Sopa de la cripta', fac: 'nomuertos', olla: ['tomate', 'patata'] },
  { id: 'formol', nombre: 'Poción de formol', fac: 'nomuertos', olla: ['ojo', 'hueso'] },
  { id: 'ramen', nombre: 'Ramen de la LAN Party', fac: 'gamer', olla: ['fideos', 'hueso', 'lechuga'] },
  // Leads: el horno
  { id: 'pizza', nombre: 'Pizza del Foro', fac: 'memes', horno: true, ings: [['masa', 'crudo'], ['tomate', 'cortado'], ['queso', 'cortado']] },
  { id: 'tarta', nombre: 'Tarta de taquilla', fac: 'pop', horno: true, ings: [['masa', 'crudo'], ['nata', 'crudo'], ['cereza', 'crudo']] },
  { id: 'pizzaxl', nombre: 'Pizza Review Bombing', fac: 'gamer', horno: true, ings: [['masa', 'crudo'], ['tomate', 'cortado'], ['queso', 'cortado'], ['jamon', 'cortado']] },
  { id: 'ambrosia', nombre: 'Ambrosía de oferta', fac: 'heroes', horno: true, ings: [['masa', 'crudo'], ['nata', 'crudo'], ['queso', 'cortado']] },
];
const RECETA = Object.fromEntries(RECETAS.map(r => [r.id, r]));

// Lo que lleva una receta como lista de pares [ingrediente, estado] ya listos para el plato (las de olla, una sopa; las de horno, los ingredientes horneados).
function recetaFinal(r) {
  if (r.olla) return [['sopa', r.olla.slice().sort().join('+')]];
  if (r.horno) return r.ings.map(([t]) => [t, 'horneado']);
  return r.ings;
}
const claveIngs = lista => lista.map(([t, e]) => t + ':' + e).sort().join(',');
// ¿Esta lista de [ingrediente, estado] es exactamente una receta? Devuelve la receta o null.
function recetaDe(lista) {
  const k = claveIngs(lista);
  return RECETAS.find(r => claveIngs(recetaFinal(r)) === k) || null;
}
// ¿Esta lista podría llegar a ser una receta (o un montón para el horno)? Sirve para dejar juntar cosas solo cuando tiene sentido.
function cabeEnReceta(lista, soloHorno) {
  const cuenta = l => { const m = {}; for (const [t, e] of l) m[t + ':' + e] = (m[t + ':' + e] || 0) + 1; return m; };
  const mine = cuenta(lista);
  return RECETAS.some(r => {
    if (soloHorno && !r.horno) return false;
    const obj = cuenta(soloHorno ? r.ings : recetaFinal(r));
    return Object.keys(mine).every(k => obj[k] >= mine[k]);
  });
}
