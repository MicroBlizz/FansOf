// Fans of Ratkov · UTILIDADES: cuentas pequeñas que usa todo el juego. Lo de core/js/sistema/utiles.js ($, rand, clamp, lerp, pick…)
// ya está cargado; aquí va lo que falta, con nombres propios para no pisarlo.
'use strict';
const TAU = Math.PI * 2;
const entre = (a, b) => a + Math.random() * (b - a);
const entero = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
const azar = p => Math.random() < p;
const lejos = (ax, az, bx, bz) => Math.hypot(bx - ax, bz - az);
// la diferencia entre dos ángulos, de -π a π
function giroA(a, b) { let d = b - a; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; return d; }
// elige de una lista de [cosa, peso]
function sorteo(lista) { let t = 0; for (const [, p] of lista) t += p; let r = Math.random() * t; for (const [c, p] of lista) { r -= p; if (r <= 0) return c; } return lista[lista.length - 1][0]; }
// azar repetible (para el decorado: tiene que salir siempre igual)
function semilla(s) { let x = s >>> 0 || 1; return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return ((x >>> 0) % 100000) / 100000; }; }
// minutos y segundos
const mmss = s => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
// número con separador de miles (las chapas)
const miles = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
// escapar texto para meterlo en HTML
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// un elemento por id
const el = id => document.getElementById(id);
