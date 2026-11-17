// Fans Of Paperwork · PW: el único objeto global del juego. Cada archivo cuelga de él sus expedientes (PW.AJ, PW.Planta, PW.casos…) en vez de
// soltar variables globales; principal.js las compone al arrancar. Capas (docs/calidad/ARQUITECTURA.md): dominio/ (las reglas, puras:
// sin reloj, sin azar propio, sin guardado ni DOM), aplicacion/ (los casos de uso y el motor), adaptadores/ (pantalla, guardado, reloj,
// sonido) y principal.js (la composición). Diseño: docs/paperwork/PLAN.md y ADR 113.
'use strict';
const PW = {};
// un resultado de dominio: lo que ha salido bien, o un error con nombre (nunca una excepción por una regla incumplida)
PW.ok = valor => ({ ok: true, valor });
PW.error = (error, datos) => ({ ok: false, error, datos });
// saca n elementos distintos de una lista, al azar (azar: () → 0..1); la lista no se toca
PW.saca = (lista, n, azar) => {
  const quedan = lista.slice(), fuera = [];
  while (fuera.length < n && quedan.length) fuera.push(quedan.splice(Math.floor(azar() * quedan.length) % quedan.length, 1)[0]);
  return fuera;
};
// un ritmo por segundo suavizado: mezcla el de antes con lo ganado en estos dt segundos (ventana de unos 30 s)
PW.suaviza = (antes, ganado, dt) => { const k = Math.min(1, dt / 30); return (antes || 0) * (1 - k) + (Math.max(0, ganado) / dt) * k; };
