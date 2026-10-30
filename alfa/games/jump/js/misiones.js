// Fans of Jump · Las órdenes de Microblizz: siempre hay 3 colgadas (en la portada y en el parte final) y CrazyBunny las
// incumple dentro de una partida. Cada orden incumplida da zanahorias y Microblizz cuelga otra, un poco más estricta.
'use strict';

const TIPOS_MISION = {
  metros:    { txt: 'Prohibido pasar de {n} m', n: [25, 40, 60, 85, 110, 150, 200, 260], de: J => J.metros },
  cuestas:   { txt: 'Prohibido llevar {n} empleados a la vez', n: [2, 3, 4, 5, 6, 8], de: J => J.maxCuestas },
  perfectos: { txt: 'Prohibido caer {n} veces en el centro', n: [3, 5, 8, 11, 15, 20], de: J => J.perfectos },
  zanas:     { txt: 'Las zanahorias son de Microblizz: no cojas {n}', n: [4, 8, 12, 18, 25, 35], de: J => J.zanas },
  saltos:    { txt: 'No saltes más de {n} troncos', n: [10, 18, 28, 40, 55, 75], de: J => J.saltos },
  racha:     { txt: 'Nada de rachas de {n}', n: [4, 6, 9, 13, 18], de: J => J.maxRacha },
  fiebre:    { txt: 'Prohibida la Fiebre arcoíris', n: [1, 1, 2, 2, 3], de: J => J.fiebres, txtN: 'Prohibida la Fiebre arcoíris ({n} veces)' },
};
const premioMision = nivel => 15 + nivel * 12;

function misionesGuardadas() {
  if (!GUARDA.misiones || GUARDA.misiones.length !== 3) GUARDA.misiones = [{ tipo: 'cuestas', nivel: 0 }, { tipo: 'perfectos', nivel: 0 }, { tipo: 'metros', nivel: 0 }];
  return GUARDA.misiones;
}
// las 3 de ahora, con su texto, su cifra y su premio
function misionesActivas() {
  return misionesGuardadas().map(m => {
    const T = TIPOS_MISION[m.tipo], nivel = Math.min(m.nivel, T.n.length - 1), n = T.n[nivel];
    return { tipo: m.tipo, nivel, n, txt: tr(n > 1 && T.txtN ? T.txtN : T.txt, { n }), premio: premioMision(nivel) };
  });
}
const progresoMision = (m, J) => Math.min(m.n, TIPOS_MISION[m.tipo].de(J));

// durante la partida: ¿se ha cumplido alguna?
function compruebaMisiones() {
  const J = JUEGO;
  misionesActivas().forEach((m, i) => {
    if (J.hechas.includes(i) || progresoMision(m, J) < m.n) return;
    J.hechas.push(i);
    bandera(tr('¡Orden incumplida!'), PASTEL.lila); SONIDO.meta();
  });
}
// al acabar: el premio de las cumplidas, y cada una cambia por la siguiente (otro tipo que no esté ya)
function cierraMisiones() {
  compruebaMisiones();   // lo que se cumplió sin pisar un tronco (imán, Fiebre, silbato) también cuenta
  const J = JUEGO, act = misionesActivas();
  J.resumenMisiones = act.map((m, i) => ({ txt: m.txt, hecha: J.hechas.includes(i), premio: m.premio, va: progresoMision(m, J), n: m.n }));
  let premio = 0;
  const lista = misionesGuardadas();
  J.hechas.forEach(i => {
    premio += act[i].premio;
    const usados = lista.map(m => m.tipo), libres = Object.keys(TIPOS_MISION).filter(k => !usados.includes(k));
    const tipo = libres[Math.floor(Math.random() * libres.length)] || lista[i].tipo;
    GUARDA.nivelMision = GUARDA.nivelMision || {};
    GUARDA.nivelMision[lista[i].tipo] = (GUARDA.nivelMision[lista[i].tipo] || 0) + 1;
    lista[i] = { tipo, nivel: GUARDA.nivelMision[tipo] || 0 };
  });
  return premio;
}
