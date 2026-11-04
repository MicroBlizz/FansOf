// Fans of Chef · GUÍA: que nunca haya que adivinar qué hacer. En el sótano, una flecha dorada señala adónde ir (la salida de la derecha
// cuando la sala está limpia, el cofre al final y el montacargas cuando ya tienes lo que piden) y las salidas brillan en el borde. En la
// primera jornada, un tutorial por pasos que avanza con lo que haces. En la cantina, mientras dure la ayuda (jornadas 1 y 2), el siguiente
// paso de la comanda más antigua («Coge un tomate», «Córtalo», «Échalo a la olla»…) con la estación resaltada.
'use strict';

const GUIA = { paso: 0, t: 0, objetivo: null, texto: '', evento: null };
const PASOS_CAZA = [
  { txt: () => modoControl() === 'tocar' ? tr('Toca el suelo para andar') : tr('Muévete con WASD o la palanca'), hecho: e => e === 'anda' },
  { txt: () => modoControl() === 'tocar' ? tr('Toca un bicho: el cocinero va y le pega solo') : tr('Pulsa ATACAR (J) cerca de un bicho'), hecho: e => e === 'baja' },
  { txt: () => tr('Recoge lo que suelta pasando por encima'), hecho: e => e === 'recoge' },
  { txt: () => tr('Sigue la flecha: hay más comida en las otras salas'), hecho: e => e === 'sala' },
  { txt: () => tr('Con la sartén (K) bloqueas y aturdes. Cuando tengas todo, vuelve al montacargas'), hecho: e => e === 'sube' },
];
const ayudaCantina = () => SAVE.dia <= 2;
GUIA.empiezaCaza = function () { GUIA.paso = SAVE.tutorial ? PASOS_CAZA.length : 0; GUIA.t = 0; };
GUIA.evento = function (e) {
  const p = PASOS_CAZA[GUIA.paso];
  if (p && p.hecho(e)) { GUIA.paso++; GUIA.t = 0; SONIDO.boton(); if (GUIA.paso >= PASOS_CAZA.length) { SAVE.tutorial = 1; guarda(); } }
};

// adónde señala la flecha en el sótano
function objetivoCaza() {
  if (JORNADA.objetivosHechos()) {
    if (MAPA.montacargas) return { x: MAPA.montacargas.x, y: MAPA.montacargas.y + 20, txt: tr('¡Al montacargas!') };
    return { x: 6, y: (MAPA.sala.salidas.izq[0] + MAPA.sala.salidas.izq[1]) / 2, txt: tr('Vuelve') };
  }
  if (ENEMIGOS.some(e => !e.muerto)) return null;
  if (MAPA.cofre && !MAPA.cofre.abierto) return { x: MAPA.cofre.x, y: MAPA.cofre.y, txt: tr('El cofre') };
  if (MAPA.i < MAPA.salas.length - 1) return { x: MAPA.sala.w - 6, y: (MAPA.sala.salidas.der[0] + MAPA.sala.salidas.der[1]) / 2, txt: tr('Siguiente sala') };
  if (MAPA.montacargas) return { x: MAPA.montacargas.x, y: MAPA.montacargas.y + 20, txt: tr('Al montacargas') };
  return { x: 6, y: (MAPA.sala.salidas.izq[0] + MAPA.sala.salidas.izq[1]) / 2, txt: tr('Vuelve al montacargas') };
}
// el siguiente paso de la comanda más antigua, en la cantina
function pasoCantina() {
  const c = CANTINA.comandas[0]; if (!c) return null;
  const R = RECETAS[c.receta], est = id => CANTINA.estaciones.find(e => e.id === id), m = J.mano;
  const fuegos = CANTINA.estaciones.filter(e => e.tipo === 'fuego' && e.clase === R.fuego);
  const hecho = fuegos.find(f => f.estado === 'hecha' && f.receta === c.receta);
  if (m && m.tipo === 'plato' && m.receta === c.receta) return { e: est('ventanilla'), txt: tr('Sírvelo en la ventanilla') };
  if (m && m.tipo === 'plato' && !m.receta && hecho) return { e: hecho, txt: tr('Emplata lo que hay en el fuego') };
  if (hecho && !m) return { e: est('platos'), txt: tr('Coge un plato') };
  if (m && m.tipo === 'quemado') return { e: est('basura'), txt: tr('Tíralo a la basura') };
  const quemada = CANTINA.estaciones.find(f => f.tipo === 'fuego' && f.estado === 'quemada');
  if (quemada && !m) return { e: quemada, txt: tr('Saca lo quemado') };
  if (m && m.tipo === 'ing' && m.cortado) { const f = fuegos.find(x => x.estado === 'vacia' || x.estado === 'llena'); return f ? { e: f, txt: tr('Échalo a la {f}', { f: R.fuego === 'olla' ? tr('olla') : tr('sartén') }) } : null; }
  if (m && m.tipo === 'ing') { const t = CANTINA.estaciones.find(x => x.tipo === 'tabla' && !x.item); return t ? { e: t, txt: tr('Déjalo en la tabla') } : null; }
  const enTabla = CANTINA.estaciones.find(x => x.tipo === 'tabla' && x.item && x.item.tipo === 'ing');
  if (enTabla && !m) return { e: enTabla, txt: enTabla.item.cortado ? tr('Coge lo cortado') : (modoControl() === 'tocar' ? tr('Tócala para cortar') : tr('Mantén CORTAR (K) para cortar')) };
  if (fuegos.some(f => f.estado === 'cocinando' && f.receta === c.receta)) return { e: null, txt: tr('Se está cocinando... prepara otra cosa') };
  // qué ingrediente falta en el fuego para esta receta
  const enFuego = fuegos.find(f => f.estado === 'llena') || null, ya = enFuego ? cuenta(enFuego.contenido) : {};
  const falta = Object.keys(R.lleva).find(k => (ya[k] || 0) < R.lleva[k]);
  if (falta && !m && !(JORNADA.despensa[falta] > 0) && JORNADA.fase === 'arena') { const b = Object.keys(BICHOS).find(t => BICHOS[t].suelta === falta); return { e: null, txt: tr('Caza: {bicho}', { bicho: tr(BICHOS[b].nombre) }) }; }
  if (falta && !m) return { e: est('caja_' + falta), txt: tr('Coge: {que}', { que: tr(INGREDIENTES[falta].nombre) }) };
  return null;
}
function avanzaGuia(dt) {
  GUIA.t += dt;
  if (JORNADA.fase === 'caza' && J.anduvo > 30) GUIA.evento('anda');
  if (JORNADA.fase === 'caza') { const o = objetivoCaza(); GUIA.objetivo = o; }
  else if (JORNADA.fase === 'servicio' || JORNADA.fase === 'arena') { const p = ayudaCantina() ? pasoCantina() : null; GUIA.objetivo = p && p.e ? { x: (p.e.r[0] + p.e.r[2]) / 2, y: p.e.r[1], txt: '' } : null; GUIA.texto = p ? p.txt : ''; }
}
// la flecha: rebota encima del objetivo si se ve, o en el borde de la pantalla apuntando hacia él
function pintaFlecha(ctx, cam, W, H, o) {
  const x = o.x - cam.x, y = o.y - cam.y, dentro = x > 10 && x < W - 10 && y > 30 && y < H - 30, b = Math.sin(PAN.t * 6) * 3;
  ctx.save();
  if (dentro) { ctx.translate(Math.round(x), Math.round(y - 30 + b)); ctx.rotate(Math.PI / 2); }
  else { const cx = clamp(x, 18, W - 18), cy = clamp(y, 44, H - 50); ctx.translate(Math.round(cx), Math.round(cy)); ctx.rotate(Math.atan2(y - cy, x - cx)); ctx.translate(b, 0); }
  ctx.fillStyle = PALETA.K; ctx.beginPath(); ctx.moveTo(11, 0); ctx.lineTo(-7, -9); ctx.lineTo(-3, 0); ctx.lineTo(-7, 9); ctx.closePath(); ctx.fill();
  ctx.fillStyle = PALETA.Y; ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-5, -6); ctx.lineTo(-2, 0); ctx.lineTo(-5, 6); ctx.closePath(); ctx.fill();
  ctx.restore();
  if (o.txt && dentro) letra(ctx, o.txt, x, y - 44 + b, PALETA.Y, 'center', 7);
}
// las salidas que se pueden usar brillan en el borde de la sala
function pintaSalidas(ctx, cam) {
  const d = MAPA.sala, a = 0.35 + Math.sin(PAN.t * 4) * 0.2;
  const tramo = (x, s, flecha) => { const y0 = s[0] - cam.y, y1 = s[1] - cam.y; ctx.globalAlpha = a; caja(ctx, x - cam.x, y0, 4, y1 - y0, PALETA.Y); ctx.globalAlpha = 1; for (let yy = y0 + 14; yy < y1 - 6; yy += 26) letra(ctx, flecha, x - cam.x + (flecha === '>' ? -8 : 8), yy, PALETA.Y, 'center', 8); };
  if (MAPA.i < MAPA.salas.length - 1 && !ENEMIGOS.some(e => !e.muerto)) tramo(d.w - 4, d.salidas.der, '>');
  if (MAPA.i > 0) tramo(0, d.salidas.izq, '<');
}
// el cartel del tutorial / del paso siguiente, arriba en el centro, debajo del marcador
function pintaGuia(ctx, cam, W, H) {
  if (JORNADA.fase === 'caza') { pintaSalidas(ctx, cam); if (GUIA.objetivo) pintaFlecha(ctx, cam, W, H, GUIA.objetivo); }
  if ((JORNADA.fase === 'servicio' || JORNADA.fase === 'arena') && GUIA.objetivo) pintaFlecha(ctx, cam, W, H, GUIA.objetivo);
  const p = JORNADA.fase === 'caza' ? PASOS_CAZA[GUIA.paso] : null, txt = p ? p.txt() : (JORNADA.fase === 'servicio' || JORNADA.fase === 'arena' ? GUIA.texto : '');
  if (!txt) return;
  const w = Math.min(W - 12, 230), x = (W - w) / 2, y = Math.max(64, Math.round(H * 0.16));
  ctx.globalAlpha = 0.92; marcoMadera(ctx, x, y, w, 18); ctx.globalAlpha = 1;
  letraCabe(ctx, txt, W / 2, y + 12, w - 10, PALETA.W, 'center', 7);
}
