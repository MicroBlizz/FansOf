// Fans of Goose · JEFES QUE OBLIGAN A ESQUIVAR (31-10-2026, Daniel: «me sigue pareciendo fácil»). Con la tienda subida, los minijefes
// caían en 1-5 s, antes de atacar, y bastaba con dar vueltas. Ahora, para los minijefes, la Oca Parca y la Oca Madre:
//  · ESCUDO: al bajar de cada tramo de vida (CFG.jefes.tramos) el jefe se queda intocable unos segundos y lanza su GRAN ATAQUE
//    (lluvia de zonas, ondas que salen de él o zonas que te persiguen), así cada pelea tiene al menos tres asaltos sea cual sea tu poder.
//  · ZONAS: cada pocos segundos marca un círculo rojo donde estás (los peligros de js/tierras2.js): si no te apartas, duele.
// Lo llaman mueveMinijefe (js/minijefes.js), mueveParca (js/parca.js), avanzaJefe y danar (js/enemigos.js). Todo pixel art.
'use strict';

const esJefeGrande = e => e.tipo === 'jefe' || e.tipo === 'parca' || e.tipo.startsWith('mj-');
const danoNoche = () => (JUEGO.mod && JUEGO.mod.dano) || 1;

// cada fotograma de un jefe: el escudo, las zonas sueltas y el gran ataque en marcha
function avanzaJefe2(e, dt, furia) {
  const C = CFG.jefes, yo = JUEGO.yo;
  if (e.escudo > 0) {
    e.escudo -= dt;
    if (e.escudo <= 0) { aviso(tr('¡ESCUDO ROTO!'), '#ffd34d', 0.9); SONIDO.jefeTiro(); anillo(e.x, e.y, e.r + 14, '#ffd34d', 0.35, 3); }
  }
  if (e.tZona === undefined) e.tZona = C.zonaPrimera;
  e.tZona -= dt;
  if (e.tZona <= 0 && !e.ataque) {
    e.tZona = C.zonaCada * (furia ? 0.7 : 1);
    peligro(yo.x, yo.y, C.zonaR, C.zonaAviso, C.zonaDano * danoNoche(), 'zona');
  }
  if (e.ataque) granAtaque(e, dt);
}

// lo llama danar antes de quitar vida: ¿se lo come el escudo? (y, si el golpe cruza un tramo, salta el escudo)
function frenaJefe(e, d) {
  if (!esJefeGrande(e)) return false;
  if (e.escudo > 0) {
    if (!e.tTexto || JUEGO.t > e.tTexto) { e.tTexto = JUEGO.t + 0.6; texto(e.x, e.y - e.r, tr('¡ESCUDO!'), '#ffd34d', 6, 0.5); }
    return true;
  }
  const tramos = e.tipo === 'jefe' ? CFG.jefes.tramosMadre : CFG.jefes.tramos, k = e.tramo || 0;
  if (k >= tramos.length) return false;
  const corte = e.hpMax * tramos[k];
  if (e.hp - d > corte) return false;
  e.hp = corte; e.tramo = k + 1; e.flash = 0.09;
  levantaEscudo(e, k);
  return true;
}

function levantaEscudo(e, k) {
  e.escudo = CFG.jefes.escudo;
  const tipos = ['lluvia', 'ondas', 'persigue'];
  e.ataque = { tipo: tipos[k % tipos.length], t: 0, hecho: 0 };
  aviso(tr('¡ESQUIVA!'), '#ff4d4d', 1.2); SONIDO.jefeCarga(); tiembla(4); destella('#ff4d4d', 0.2); vibra(60);
}

// los tres grandes ataques: todos con aviso (el círculo rojo crece antes de estallar)
function granAtaque(e, dt) {
  const A = e.ataque, C = CFG.jefes, yo = JUEGO.yo, d = C.granDano * danoNoche();
  A.t += dt;
  if (A.tipo === 'lluvia') {   // una en ti y ocho alrededor, a la vez
    if (!A.hecho) {
      A.hecho = 1;
      peligro(yo.x, yo.y, C.zonaR + 2, 1.3, d, 'zona');
      for (let i = 0; i < 8; i++) { const a = i * 0.785 + Math.random() * 0.4, r = 34 + Math.random() * 40; peligro(yo.x + Math.cos(a) * r, yo.y + Math.sin(a) * r * 0.7, C.zonaR, 1.3 + Math.random() * 0.4, d, 'zona'); }
    }
    if (A.t > 1.8) e.ataque = null;
  } else if (A.tipo === 'ondas') {   // tres aros de zonas que salen del jefe: métete entre dos
    while (A.hecho < 3 && A.t >= A.hecho * 0.5) {
      const r = 28 + A.hecho * 30, n = 6 + A.hecho * 2, giro = A.hecho * 0.3;
      for (let i = 0; i < n; i++) { const a = giro + i * 6.283 / n; peligro(e.x + Math.cos(a) * r, e.y + Math.sin(a) * r * 0.7, C.zonaR - 2, 1.0, d, 'zona'); }
      A.hecho++;
    }
    if (A.t > 2.6) e.ataque = null;
  } else {   // seis zonas que te siguen: no te pares
    while (A.hecho < 6 && A.t >= A.hecho * 0.4) { peligro(yo.x, yo.y, C.zonaR, 0.9, d, 'zona'); A.hecho++; }
    if (A.t > 3.2) e.ataque = null;
  }
}

// el escudo dorado alrededor del jefe (puntos de píxel que giran, nada vectorial; lo llama pintaMundo tras los peligros)
function pintaEscudosJefes() {
  const J = JUEGO, l = ENE.lista;
  for (let i = 0; i < ENE.n; i++) {
    const e = l[i]; if (!(e.escudo > 0) || e.hp <= 0) continue;
    const r = e.r + 8, n = 14, parpadeo = e.escudo < 0.8 && Math.sin(J.t * 30) < 0;
    if (parpadeo) continue;
    for (let k = 0; k < n; k++) {
      const a = J.t * 2.2 + k * 6.283 / n, x = snap(e.x + Math.cos(a) * r), y = snap(e.y - 4 + Math.sin(a) * r * 0.75);
      G.fillStyle = '#120808'; G.fillRect(x - 1.5, y - 1.5, 3, 3);
      G.fillStyle = k % 2 ? '#ffd34d' : '#fff3b0'; G.fillRect(x - 1, y - 1, 2, 2);
    }
  }
}
