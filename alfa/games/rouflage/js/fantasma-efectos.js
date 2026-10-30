// Fans of Rouflage · LO QUE DEJAN LOS PODERES DEL FANTASMA (fantasma-poder.js) y lo que hacen a la piel de un colado:
//  · VAHO: una nube fría donde está el fantasma; quien esté dentro se queda sin linterna y lo de dentro no se ve (veCazador, bot-cazador.js).
//  · CHARCO: un charco de pintura en el suelo; el becario que lo pisa va más lento un rato (entes.js multiplica por FPZ.charcoVel).
//  · FOCO: un foco redondo que alumbra la zona para todos (se suma a los focos del mapa: eventoFocos, eventos.js).
//  · PORTAZO: un «¡PAM!» que se oye lejos (los becarios bot van a mirar) y CIERRA DE VERDAD el paso más cercano (un hueco en un muro, de 2 a 6
//    casillas) unos segundos: nadie pasa, la linterna no lo cruza y los bots buscan otro camino. Se abre sola. La calcula quien la lanza y la manda.
//  · RETOQUE y SOPLO: un brochazo que copia el fondo en la piel de un colado (mejor camuflaje) o un soplido que le desgasta la pintura.
// En el PvP todos los navegadores ponen la zona; el efecto en cada personaje lo aplica quien lo lleva (poderMio) y la piel se vuelve a mandar.
'use strict';

const FPZ = { portazo: { oido: 1.8, dura: 4, busca: 220, abre: 0.5 }, vaho: { r: 95 }, charco: { r: 34, dura: 12, lento: 2.5 }, charcoVel: 0.5, foco: { r: 140 }, retoque: 0.25, soplo: { manchas: 3, radio: 6, fuerza: 70 }, lista: [] };
const FPZ_COL = ['#39d5e8', '#ff7a1a', '#7ee04a', '#ff5fa8'];      // los charcos, de un color que sale del sitio (igual en todos los navegadores)

function fpZonasLimpia() { FPZ.lista.length = 0; }
// pone lo que se queda en el mapa (aquí y en los demás navegadores)
function fpZonaPon(k, x, y, puerta) {
  if (k === 'portazo') {
    if (puerta && puerta.w > 0 && puerta.h > 0) FPZ.lista.push({ k, x, y, t: 0, dura: FPZ.portazo.dura, p: puerta });
    fxTexto(x, y - 40, tr('¡PAM!'), '#ffcb3d', 24); suenaEn('fpPortazo', x, y, 1.3);
    for (let i = 0; i < 8; i++) fxGota(x + rand(-20, 20), y - rand(0, 30), '#c9b48a', rand(-90, 90), rand(-120, -30));
    if (!J.pvp || RFP.soyHost) {      // los bots del navegador que los lleva van corriendo a mirar, desde más lejos que a un silbido
      const antes = REGLAS.oido; REGLAS.oido = antes * FPZ.portazo.oido;
      for (const b of J.cazadores) if (b.bot && !b.fuera) { oyeSilbido(b, x, y); if (b.bot.estado === 'investiga' && b.marca === '?') b.marca = '!'; }
      REGLAS.oido = antes;
    }
    return;
  }
  const dura = k === 'charco' ? FPZ.charco.dura : PODERES[k].dura;
  FPZ.lista.push({ k, x, y, t: 0, dura, col: FPZ_COL[(Math.round(x) + Math.round(y)) % FPZ_COL.length] });
  if (k === 'vaho') { play('fpVaho'); fxTexto(x, y - 50, tr('¡Fffff!'), '#e6f2ff'); }
  else if (k === 'charco') { suenaEn('fpCharco', x, y); fxSalpica(x, y, FPZ_COL[(Math.round(x) + Math.round(y)) % FPZ_COL.length], 10); }
  else if (k === 'foco') { suenaEn('fpFoco', x, y); }
}
// EL PORTAZO: el hueco de muro más cercano a (x, y) que se puede cerrar: una fila (o columna) de 2 a 6 casillas de suelo con muro a los dos
// lados y paso libre por delante y por detrás. Sin nadie dentro (ni muebles). Devuelve { x, y, w, h, hor } en el mundo, o null si no hay ninguno cerca
function fpPuertaCerca(x, y) {
  const S = (i, j) => i >= 0 && j >= 0 && i < MW && j < MH && GRID[j * MW + i] === SUELO, R = Math.ceil(FPZ.portazo.busca / CEL);
  const ci = Math.floor(x / CEL), cj = Math.floor(y / CEL), cand = [];
  for (let j = cj - R; j <= cj + R; j++) for (let i = ci - R; i <= ci + R; i++) {
    if (!S(i, j)) continue;
    // hueco en un muro horizontal (se cruza de arriba abajo): el tramo de suelo de la fila j, cerrado por muro a izquierda y derecha
    if (!S(i - 1, j)) { let i1 = i; while (i1 - i < 7 && S(i1 + 1, j)) i1++; const w = i1 - i + 1;
      if (w >= 2 && w <= 6 && !S(i1 + 1, j) && S(i, j - 1) && S(i, j + 1) && S(i1, j - 1) && S(i1, j + 1) && !S(i - 1, j + 1) && !S(i1 + 1, j + 1)) cand.push({ x: i * CEL, y: j * CEL, w: w * CEL, h: CEL, hor: true }); }
    // hueco en un muro vertical (se cruza de lado a lado)
    if (!S(i, j - 1)) { let j1 = j; while (j1 - j < 7 && S(i, j1 + 1)) j1++; const h = j1 - j + 1;
      if (h >= 2 && h <= 6 && !S(i, j1 + 1) && S(i - 1, j) && S(i + 1, j) && S(i - 1, j1) && S(i + 1, j1) && !S(i + 1, j - 1) && !S(i + 1, j1 + 1)) cand.push({ x: i * CEL, y: j * CEL, w: CEL, h: h * CEL, hor: false }); }
  }
  const libre = q => !(PUERTA.cerrada && q.x < PUERTA.x + PUERTA.w && q.x + q.w > PUERTA.x && q.y < PUERTA.y + PUERTA.h && q.y + q.h > PUERTA.y)
    && !J.entes.some(e => !e.fuera && e.x + MEDIO_PIE > q.x - 4 && e.x - MEDIO_PIE < q.x + q.w + 4 && e.y > q.y - 4 && e.y - FONDO_PIE < q.y + q.h + 4)
    && !MUEBLES.some(m => m.pisa && q.x < m.pisa.x1 && q.x + q.w > m.pisa.x0 && q.y < m.pisa.y1 && q.y + q.h > m.pisa.y0)
    && !FPZ.lista.some(z => z.k === 'portazo' && z.p.x === q.x && z.p.y === q.y);
  cand.sort((a, b) => lejos(x, y, a.x + a.w / 2, a.y + a.h / 2) - lejos(x, y, b.x + b.w / 2, b.y + b.h / 2));
  return cand.find(q => lejos(x, y, q.x + q.w / 2, q.y + q.h / 2) <= FPZ.portazo.busca && libre(q)) || null;
}
// ¿hay una puerta cerrada de un portazo en esa caja (mapa.js: chocaCaja) o en esa casilla (celdaLibre, rayoMapa)?
const portazoCaja = (x0, y0, x1, y1) => FPZ.lista.length > 0 && FPZ.lista.some(z => z.k === 'portazo' && x0 < z.p.x + z.p.w && x1 > z.p.x && y0 < z.p.y + z.p.h && y1 > z.p.y);
const portazoCelda = (i, j) => FPZ.lista.length > 0 && portazoCaja(i * CEL + CEL / 2 - 0.5, j * CEL + CEL / 2 - 0.5, i * CEL + CEL / 2 + 0.5, j * CEL + CEL / 2 + 0.5);
// la puerta en sí, ordenada con los demás (dibujo.js): una hoja de madera con su marco que se cierra de golpe y, al final, se abre sola
function pintaPortazo(c, t, z) {
  const q = z.p, cierra = Math.min(1, z.t / 0.12), abre = Math.max(0, (z.t - (z.dura - FPZ.portazo.abre)) / FPZ.portazo.abre), k = cierra * (1 - abre);
  if (k <= 0.01) return;
  const tiembla = z.t < 0.3 ? Math.sin(z.t * 70) * 2 * (1 - z.t / 0.3) : 0;
  c.save();
  if (q.hor) {      // de frente: la hoja levantada delante del hueco del muro
    const alto = ALTO_CARA * CEL, x = q.x + tiembla, w = q.w * k, y = q.y + q.h - alto;
    forma(c, caja(x, y, w, alto, 2), '#b9783f', 3);
    if (w > 14) {
      forma(c, caja(x + 5, y + 6, w - 10, alto / 2 - 9, 2), '#a5672f', 2); forma(c, caja(x + 5, y + alto / 2 + 3, w - 10, alto / 2 - 9, 2), '#a5672f', 2);
      forma(c, ovalo(x + w - 9, y + alto / 2, 2.6, 2.6), '#ffcb3d', 1.5);
      c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(x + 7, y + 8, 3, alto - 16);
    }
  } else {      // de lado: la hoja vista desde arriba, de punta a punta del hueco, con el canto que asoma
    const h = q.h * k, x = q.x + q.w / 2 - 5 + tiembla, y = q.y;
    forma(c, caja(x, y - 18, 10, h + 18, 2), '#a5672f', 3);
    forma(c, caja(x, y - 18, 10, 10, 2), '#c98a4a', 2);
    if (h > 14) forma(c, ovalo(x + 10, y + h / 2, 2.6, 2.6), '#ffcb3d', 1.5);
  }
  c.restore();
}

// los focos de los fantasmas, para la oscuridad y para la vista de los bots (eventoFocos los suma a los del mapa)
const fpFocos = () => FPZ.lista.filter(z => z.k === 'foco').map(z => ({ x: z.x, y: z.y, dir: 0, ang: Math.PI, largo: FPZ.foco.r * Math.min(1, z.t / 0.15, (z.dura - z.t) / 0.3 + 0.3) }));
// ¿tapa el vaho el punto (x, y)?
const vahoTapa = (x, y) => FPZ.lista.some(z => z.k === 'vaho' && lejos(z.x, z.y, x, y) < FPZ.vaho.r);

// cada fotograma: pasa el tiempo de cada cosa y se aplica a los becarios de este navegador
function fpZonasAvanza(dt) {
  if (J.fase !== 'caza') { if (FPZ.lista.length) fpZonasLimpia(); return; }
  for (let i = FPZ.lista.length - 1; i >= 0; i--) if ((FPZ.lista[i].t += dt) > FPZ.lista[i].dura) FPZ.lista.splice(i, 1);
  if (!FPZ.lista.length) return;
  for (const h of J.cazadores) {
    if (h.fuera || !poderMio(h)) continue;
    for (const z of FPZ.lista) {
      if (z.k === 'vaho' && lejos(z.x, z.y, h.x, h.y - 10) < FPZ.vaho.r) h.apagada = Math.max(h.apagada, 0.15);
      else if (z.k === 'charco' && lejos(z.x, z.y, h.x, h.y) < FPZ.charco.r) {
        if (!(h.lento > 0)) { fxSalpica(h.x, h.y, z.col, 6); if (h.jugador) { avisa(tr('¡Has pisado un charco de pintura! Vas más lento'), 'malo'); play('fpCharco'); } }
        h.lento = FPZ.charco.lento;
      }
    }
  }
}
// el retoque y el soplo: lo aplica quien lleva a ese colado, que mide su camuflaje y vuelve a mandar su piel
function fpPiel(k, h, x, y, mio, quien) {
  if (k === 'retoque') { fxSalpica(h.x, h.y - 26, '#b6f58a', 10); fxTexto(h.x, h.y - 70, tr('¡Retocado!'), '#b6f58a'); play('fpRetoque'); }
  else { fxSalpica(h.x, h.y - 26, '#e6f2ff', 8); fxTexto(h.x, h.y - 70, tr('¡Fuuu!'), '#e6f2ff'); play('fpSoplo'); }
  if (!mio) fantasmaSusto(x, y, quien);
  if (!poderMio(h)) return;
  if (k === 'retoque') afinaBot(h, FPZ.retoque);
  else { desgasta(h, () => Math.random(), FPZ.soplo.manchas, FPZ.soplo.radio, FPZ.soplo.fuerza); mideCamuflaje(h); }
  if (h.jugador) { avisa(tr(k === 'retoque' ? '¡Un fantasma amigo te ha retocado la pintura!' : '¡Un fantasma te ha soplado y se te va la pintura!'), k === 'retoque' ? 'aviso' : 'malo'); refrescaHud(); }
  if (J.pvp && RFP.activo) rfpMandaPiel(h);
}

// ---------- los dibujos ----------
// el charco, en el suelo (antes que los personajes): una mancha de pintura con su borde y su brillo, que se seca al final
function fpPintaSuelo(c, t) {
  for (const z of FPZ.lista) {
    if (z.k !== 'charco') continue;
    const a = Math.min(1, z.t / 0.2, (z.dura - z.t) / 1.5), r = FPZ.charco.r * (0.6 + 0.4 * Math.min(1, z.t / 0.25));
    c.save(); c.globalAlpha = a; c.translate(z.x, z.y);
    const traza = () => { c.beginPath(); for (let i = 0; i <= 14; i++) { const an = i / 14 * TAU, rr = r * (1 + 0.14 * Math.sin(an * 3 + z.x) + 0.08 * Math.sin(an * 5 + z.y)); c.lineTo(Math.cos(an) * rr, Math.sin(an) * rr * 0.55); } c.closePath(); };
    traza(); c.fillStyle = z.col; c.fill(); c.lineWidth = 3; c.strokeStyle = OL; c.stroke();
    c.beginPath(); c.ellipse(-r * 0.3, -r * 0.14, r * 0.28, r * 0.08, -0.2, 0, TAU); c.fillStyle = 'rgba(255,255,255,0.55)'; c.fill();
    c.restore();
  }
}
// la nube del vaho, por encima de los personajes y por debajo de la oscuridad: bolas de nube con su contorno grueso, que se hinchan y se van
function fpPintaNubes(c, t) {
  for (const z of FPZ.lista) {
    if (z.k !== 'vaho') continue;
    const a = Math.min(1, z.t / 0.25, (z.dura - z.t) / 0.5), R = FPZ.vaho.r * (0.7 + 0.3 * Math.min(1, z.t / 0.4));
    c.save(); c.globalAlpha = 0.92 * a; c.translate(z.x, z.y - 14);
    const bolas = [[0, 0, 0.55], [-0.5, 0.08, 0.42], [0.5, 0.06, 0.44], [-0.24, -0.3, 0.4], [0.28, -0.28, 0.38], [-0.7, -0.1, 0.3], [0.72, -0.12, 0.3]];
    const traza = (m) => { c.beginPath(); for (const [bx, by, br] of bolas) { const x = bx * R + Math.sin(t * 1.3 + bx * 5) * 3, y = by * R * 0.7 + Math.cos(t * 1.1 + by * 7) * 2; c.moveTo(x + br * R + m, y); c.arc(x, y, br * R + m, 0, TAU); } };
    traza(3); c.fillStyle = OL; c.fill();
    traza(0); c.fillStyle = '#e6f2ff'; c.fill();
    c.globalAlpha = 0.5 * a; c.beginPath(); c.ellipse(-R * 0.2, -R * 0.25, R * 0.3, R * 0.1, -0.2, 0, TAU); c.fillStyle = '#ffffff'; c.fill();
    c.restore();
  }
}

// ---------- los sonidos ----------
Object.assign(SFX, {
  fpVaho: () => { noise(0.7, 0.09, 1400, 'lowpass'); noise(0.4, 0.05, 3200, 'bandpass', 0.1); },
  fpCharco: (v = 1, out = master) => { ruidoEn(out, 0.12, 0.14 * v, 700, 'bandpass'); tonoEn(out, 320, 120, 0.16, 'sine', 0.1 * v); tonoEn(out, 520, 260, 0.1, 'sine', 0.05 * v, 0.08); },
  fpFoco: (v = 1, out = master) => { ruidoEn(out, 0.03, 0.12 * v, 4000, 'highpass'); tonoEn(out, 180, 180, 0.5, 'triangle', 0.05 * v, 0.03); },
  fpPortazo: (v = 1, out = master) => { ruidoEn(out, 0.22, 0.42 * v, 300); tonoEn(out, 110, 40, 0.3, 'sine', 0.35 * v); ruidoEn(out, 0.08, 0.15 * v, 2200, 'bandpass', 0.12); },
  fpSusto: () => { tone(300, 900, 0.12, 'square', 0.06); tone(900, 500, 0.2, 'triangle', 0.06, 0.12); },
  fpRetoque: () => { noise(0.09, 0.05, 2600, 'bandpass'); [1318, 1760, 2349].forEach((f, i) => tone(f, f, 0.1, 'sine', 0.05, 0.08 + i * 0.06)); },
  fpSoplo: () => { noise(0.6, 0.08, 900, 'bandpass'); tone(260, 180, 0.4, 'sine', 0.03); },
});
Object.assign(THROTTLE, { fpCharco: 120 });
