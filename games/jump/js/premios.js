// Fans of Jump · Lo que se puede ganar al caer (PLAN-JUMP.md, monetización):
// · La segunda oportunidad: al caer, 4 s para pagar zanahorias y seguir desde el último tronco (una vez por partida). Se
//   paga con la moneda ganada, nunca con un anuncio, porque es en mitad de la partida.
// · El anuncio con premio, solo al terminar y nunca obligatorio: duplica las zanahorias de esa partida (3 al día). Por
//   ahora es un anuncio de prueba y solo sale en la alfa y en desarrollo; en la app, aquí irá el de AdMob (verAnuncio).
'use strict';

const CASI_SEG = 4;
const ANUNCIOS_DIA = 3;
const precioSeguir = () => 30;
const hoy = () => new Date().toISOString().slice(0, 10);
const anunciosQuedan = () => ANUNCIOS_DIA - (GUARDA.anuncios && GUARDA.anuncios.dia === hoy() ? GUARDA.anuncios.n : 0);
const hayAnuncios = () => NUCLEO.alfa || NUCLEO.desarrollo;
const ANUNCIO = { activo: false, t: 0, alAcabar: null };

// en vez de acabar: si se puede, se ofrece seguir
function muere(motivo) {
  const J = JUEGO;
  if (J.seguido || tutoActivo() || GUARDA.zanas + J.zanas < precioSeguir()) return acaba(motivo);
  const c = J.conejo;
  J.modo = 'casi'; J.casi = { motivo, t: 0 }; c.salto = null; c.tronco = null; APUNTA.activo = false;
  onda(c.x, c.wy, 8); salpica(c.x, c.wy, 12, motivo === 'ola' ? '#9a6a40' : 'rgba(255,255,255,0.95)');
  SONIDO.chof(); vibra(120);
}
function avanzaCasi(dt) {
  const J = JUEGO;
  if (J.modo !== 'casi') return;
  J.casi.t += dt; J.conejo.hunde = Math.min(0.7, J.conejo.hunde + dt * 1.4);
  if (J.casi.t >= CASI_SEG) { J.modo = 'juego'; acaba(J.casi.motivo); }
}
// paga y sigue: primero con lo recogido en esta partida y luego con lo guardado; vuelve al último tronco y la ola retrocede
function sigue() {
  const J = JUEGO, c = J.conejo, p = precioSeguir(), deLaPartida = Math.min(J.zanas, p);
  J.zanas -= deLaPartida; GUARDA.zanas -= p - deLaPartida; salvaGuarda();
  J.seguido = true; J.modo = 'juego'; J.casi = null; c.hunde = 0;
  const vale = o => o.wy > OLA.wy + 40;
  const t = c.ultimo && RIO.troncos.includes(c.ultimo) && vale(c.ultimo) ? c.ultimo : RIO.troncos.filter(vale).sort((a, b) => a.wy - b.wy)[0];
  Object.assign(c, { tronco: t, ox: 0, owy: 0, x: t.x, wy: t.wy, cae: 1 }); J.enTronco = 9;
  OLA.wy = Math.min(OLA.wy, c.wy - 150); OLA.pala = Math.min(OLA.pala, OLA.wy - 20);
  bandera(tr('¡Otra oportunidad!'), PASTEL.menta); corazones(c.x, c.wy + 10); SONIDO.rescate();
}
function pintaCasi() {
  const J = JUEGO, W = PAN.W, H = PAN.H;
  if (J.modo !== 'casi') return;
  const k = Math.min(1, J.casi.t / 0.2), queda = Math.max(0, CASI_SEG - J.casi.t);
  G.fillStyle = `rgba(40,25,60,${0.35 * k})`; G.fillRect(0, 0, W, H);
  boton(0, 0, W, H, () => {});
  const w = 150, h = 108, x = W / 2 - w / 2, y = H / 2 - h / 2 - 10;
  G.globalAlpha = k;
  caja(x + 2, y + 3, w, h, 6, 'rgba(40,25,60,0.35)', null); caja(x, y, w, h, 6, PASTEL.papel, OLC, 1);
  letras(tr('¡Casi te pilla!'), W / 2, y + 14, 12, PASTEL.texto, { logo: true });
  // la cuenta atrás: un anillo que se vacía
  G.beginPath(); G.arc(W / 2, y + 42, 13, 0, Math.PI * 2); G.lineWidth = 4; G.strokeStyle = PASTEL.raya; G.stroke();
  G.beginPath(); G.arc(W / 2, y + 42, 13, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * queda / CASI_SEG); G.strokeStyle = PASTEL.melocoton; G.lineCap = 'round'; G.stroke();
  letras(String(Math.ceil(queda)), W / 2, y + 43, 12, PASTEL.texto);
  const bw = 112, bh = 20, bx = W / 2 - bw / 2, by = y + 62, txt = tr('¡Sigue!') + ' · ' + precioSeguir(), tw = anchoLetras(txt, 10, { logo: true });
  caja(bx, by + 2, bw, bh, 5, OLC, null); caja(bx, by, bw, bh, 5, PASTEL.menta, OLC, 1);
  letras(txt, W / 2 - 6, by + 10.5, 10, '#ffffff', { logo: true, borde: PASTEL.mentaO, bw: 2.4 });
  iconoZana(W / 2 + tw / 2 + 2, by + 10, 13);
  boton(bx - 4, by - 4, bw + 8, bh + 8, sigue);
  letras(tr('No, gracias'), W / 2, by + 32, 7.5, PASTEL.suave, { peso: 700 });
  boton(W / 2 - 30, by + 25, 60, 14, () => { J.modo = 'juego'; acaba(J.casi.motivo); SONIDO.boton(); });
  G.globalAlpha = 1;
}

/* ---------- el anuncio con premio (de prueba) ---------- */
function verAnuncio(alAcabar) { Object.assign(ANUNCIO, { activo: true, t: 0, alAcabar }); SONIDO.boton(); }
function duplicaZanas() {
  const J = JUEGO;
  if (J.duplicado || !anunciosQuedan()) return;
  verAnuncio(() => {
    const d = hoy(); GUARDA.anuncios = { dia: d, n: (GUARDA.anuncios && GUARDA.anuncios.dia === d ? GUARDA.anuncios.n : 0) + 1 };
    GUARDA.zanas += J.ganadas; J.ganadas *= 2; J.duplicado = true; salvaGuarda();
    confeti(PAN.W / 2, CAM.y + PAN.H * 0.5, 24); SONIDO.compra();
  });
}
function avanzaAnuncio(dt) { if (ANUNCIO.activo) ANUNCIO.t += dt; }
function pintaAnuncio() {
  if (!ANUNCIO.activo) return;
  const W = PAN.W, H = PAN.H, SEG = 5, listo = ANUNCIO.t >= SEG;
  G.fillStyle = 'rgba(40,25,60,0.8)'; G.fillRect(0, 0, W, H);
  boton(0, 0, W, H, () => {});
  const w = W - 40, h = 150, x = 20, y = H / 2 - h / 2;
  caja(x, y, w, h, 6, PASTEL.papel, OLC, 1);
  caja(x + 8, y - 6, 50, 12, 3, PASTEL.oro, OLC, 0.8); letras(tr('ANUNCIO'), x + 33, y + 0.5, 7, PASTEL.texto);
  spriteConejo('quieto' + Math.floor(ANUNCIO.t * 7) % 8, W / 2, y + 62, 4.4);
  envuelve(tr('Un mensaje de nuestros patrocinadores… que somos nosotros.'), w - 20, 7.6).forEach((l, i) => letras(l, W / 2, y + 76 + i * 9, 7.6, PASTEL.texto, { peso: 700 }));
  const k = Math.min(1, ANUNCIO.t / SEG);
  caja(x + 14, y + 96, w - 28, 5, 2.5, PASTEL.raya, null); caja(x + 14, y + 96, (w - 28) * k, 5, 2.5, PASTEL.melocoton, null);
  const bw = 120, bx = W / 2 - bw / 2, by = y + 108, txt = listo ? tr('RECOGER PREMIO') : tr('El premio llega en {t}…', { t: Math.ceil(SEG - ANUNCIO.t) });
  caja(bx, by, bw, 18, 5, listo ? PASTEL.menta : PASTEL.raya, OLC, 0.9);
  letras(txt, W / 2, by + 9.5, 8, listo ? '#ffffff' : PASTEL.flojo, listo ? { borde: PASTEL.mentaO, bw: 2 } : {});
  if (listo) boton(bx - 4, by - 4, bw + 8, 26, () => { ANUNCIO.activo = false; ANUNCIO.alAcabar(); });
  letras(tr('Cerrar sin premio'), W / 2, by + 28, 6.8, PASTEL.suave, { peso: 700 });
  boton(W / 2 - 34, by + 22, 68, 13, () => { ANUNCIO.activo = false; SONIDO.boton(); });
  envuelve(tr('Anuncio de prueba. En la app de Google Play aquí saldrá un anuncio de verdad.'), w - 20, 5.6).forEach((l, i) => letras(l, W / 2, y + h + 10 + i * 7, 5.6, '#ffffff', { peso: 700 }));
}
