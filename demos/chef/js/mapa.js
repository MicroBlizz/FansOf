// Fans of Chef · MAPA: el sótano de la jornada es una fila de salas (escenas de salas.js, elegidas en otro orden cada día) unidas por los
// bordes: salir por la derecha es entrar en la siguiente por la izquierda. La primera sala tiene el montacargas (entrada y salida) y la
// última, el cofre. Cada sala guarda sus bichos y su botín; al cambiar de sala se cambian las listas (ENEMIGOS y BOTIN) por las suyas.
'use strict';

const MAPA = { salas: [], i: 0, sala: null, montacargas: null, cofre: null, antorchas: [] };

// construye el sótano: `n` salas (con las escenas que haya, repetidas si hacen falta) y dónde aparece el cocinero
function construyeMapa(n, rng) {
  const orden = [...SALAS.keys()].sort(() => rng() - 0.5);
  MAPA.salas = [];
  for (let i = 0; i < n; i++) {
    const def = SALAS[i === 0 ? 0 : orden[i % orden.length]];
    MAPA.salas.push({ i, def, enemigos: [], botin: [], visitada: i === 0, cofreAbierto: false });
  }
  MAPA.i = -1;
  entraSala(0);
  const a = MAPA.salas[0].def.arco;
  return { x: a[0], y: a[1] + 36 };
}
// cambiar de sala: se guardan las listas de la que se deja y se cargan las de la nueva
function entraSala(i) {
  if (MAPA.i >= 0) { const v = MAPA.salas[MAPA.i]; v.enemigos = ENEMIGOS.slice(); v.botin = BOTIN.slice(); if (MAPA.cofre) v.cofreAbierto = MAPA.cofre.abierto; }
  MAPA.i = i; const s = MAPA.salas[i]; MAPA.sala = s.def;
  ENEMIGOS.length = 0; ENEMIGOS.push(...s.enemigos); BOTIN.length = 0; BOTIN.push(...s.botin);
  const d = s.def;
  MAPA.antorchas = d.antorchas.map(([x, y]) => ({ x, y }));
  MAPA.montacargas = i === 0 ? { x: d.arco[0], y: d.arco[1] } : null;
  MAPA.cofre = i === MAPA.salas.length - 1 ? { x: d.cofre[0], y: d.cofre[1], abierto: s.cofreAbierto } : null;
  FX.part.length = 0; FX.nums.length = 0;
}
const salaActual = () => MAPA.salas[MAPA.i];
const pisable = (x, y) => pisableEn(MAPA.sala, x, y);
// ¿la caja de los pies (px, py, w, h) se sale del suelo? Se miran sus cuatro esquinas y el centro
function chocaCaja(px, py, w, h) {
  return !(pisable(px, py) && pisable(px + w, py) && pisable(px, py + h) && pisable(px + w, py + h) && pisable(px + w / 2, py + h / 2));
}
// el cocinero toca un borde con salida: pasa a la sala de al lado (si la hay)
function compruebaSalidas() {
  const d = MAPA.sala, s = d.salidas, i = MAPA.i;
  if (J.x >= d.w - 22 && s.der && J.y >= s.der[0] && J.y <= s.der[1] && i < MAPA.salas.length - 1) {
    entraSala(i + 1); const e = MAPA.sala.salidas.izq; J.x = 30; J.y = clamp(J.y, e[0] + 6, e[1] - 6); llegaASala();
  } else if (J.x <= 12 && s.izq && J.y >= s.izq[0] && J.y <= s.izq[1] && i > 0) {
    entraSala(i - 1); const e = MAPA.sala.salidas.der; J.x = MAPA.sala.w - 30; J.y = clamp(J.y, e[0] + 6, e[1] - 6); llegaASala();
  }
}
function llegaASala() {
  const s = salaActual(); CAM.x = J.x - PAN.W / 2; CAM.y = J.y - PAN.H / 2; SONIDO.puerta(); ENTRADA.destino = null; J.presa = null; GUIA.evento('sala');
  if (!s.visitada) { s.visitada = true; for (const e of ENEMIGOS) e.despierto = true; if (ENEMIGOS.length) aviso(tr('¡Comida viva!'), 1.2, PALETA.O); }
}
