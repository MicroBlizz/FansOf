// Fans of Jump · EL CONTRATO DE OBRA (el pase de temporada): Microblizz te «contrata» 4 semanas. Cada partida da experiencia (metros, órdenes
// incumplidas y rescates) y con ella subes de nivel (30). Cada nivel tiene su premio en la pista GRATIS (zanahorias, kit y, en los grandes,
// un pelaje o una capa) y en la pista del CONTRATO FIRMADO (de pago, 2,99 €: pack 'pase' de anuncios.js, apagado hasta Google Play Billing):
// cosméticos exclusivos (colores de obra) y zanahorias que devuelven casi lo que cuesta. Se puede cobrar lo de abajo cuando se firma, aunque
// sea tarde. Al acabar la temporada, el contrato se renueva: la experiencia vuelve a 0 y lo cobrado se queda. Con cuenta, el servidor (75) lleva
// la cuenta de la experiencia y de lo cobrado; sin cuenta, va en la partida local. Precios de pelajes/capas del pase en el puesto: -1 (no se venden).
'use strict';

const PASE = {
  inicio: '2026-10-26', dias: 28,   // la temporada 0 empieza ese lunes; cada 28 días, otra
  xpNivel: 1500, niveles: 30, xpMetro: 1, xpOrden: 25, xpRescate: 10, topeXpDia: 6000,
  // la pista gratis y la del contrato: por nivel (1..30), { z } zanahorias, { kit } un objeto, { pelaje } o { capa } un color exclusivo
  gratis: { 1: { z: 30 }, 2: { kit: 'cafe' }, 3: { z: 40 }, 4: { z: 40 }, 5: { kit: 'casco' }, 6: { z: 50 }, 7: { z: 50 }, 8: { kit: 'mirilla' }, 9: { z: 60 }, 10: { capa: '#c6ff3a' },
    11: { z: 60 }, 12: { kit: 'suerte' }, 13: { z: 70 }, 14: { z: 70 }, 15: { kit: 'casco' }, 16: { z: 80 }, 17: { z: 80 }, 18: { kit: 'cafe' }, 19: { z: 90 }, 20: { pelaje: '#9aa6b2' },
    21: { z: 90 }, 22: { kit: 'mirilla' }, 23: { z: 100 }, 24: { z: 100 }, 25: { kit: 'casco' }, 26: { z: 120 }, 27: { z: 120 }, 28: { kit: 'suerte' }, 29: { z: 150 }, 30: { z: 300 } },
  contrato: { 1: { pelaje: '#ffd34d' }, 2: { z: 60 }, 3: { z: 60 }, 4: { kit: 'casco' }, 5: { capa: '#ffe600' }, 6: { z: 80 }, 7: { z: 80 }, 8: { kit: 'suerte' }, 9: { z: 90 }, 10: { z: 100 },
    11: { z: 100 }, 12: { kit: 'casco' }, 13: { z: 110 }, 14: { z: 110 }, 15: { capa: '#2f2f2f' }, 16: { z: 120 }, 17: { z: 120 }, 18: { kit: 'mirilla' }, 19: { z: 130 }, 20: { z: 150 },
    21: { z: 150 }, 22: { kit: 'casco' }, 23: { z: 160 }, 24: { z: 160 }, 25: { pelaje: '#ff8c42' }, 26: { z: 180 }, 27: { z: 180 }, 28: { kit: 'suerte' }, 29: { z: 200 }, 30: { z: 400 } },
};
// los colores del pase en el puesto (no se venden: precio -1; el nombre sale en la tarjeta y en el pase)
const PASE_PIELES = { pelaje: [['#9aa6b2', 'Hormigón'], ['#ffd34d', 'Amarillo de obra'], ['#ff8c42', 'Naranja de obra']], capas: [['#c6ff3a', 'Chaleco reflectante'], ['#ffe600', 'Capa de capataz'], ['#2f2f2f', 'Negro Microblizz']] };
for (const [col, nombre] of PASE_PIELES.pelaje) PUESTO.pelaje.push([col, -1, nombre]);
for (const [col, nombre] of PASE_PIELES.capas) PUESTO.capas.push([col, -1, nombre]);
const nombrePiel = col => (PASE_PIELES.pelaje.concat(PASE_PIELES.capas).find(p => p[0] === col) || [])[1] || col;

// la temporada de hoy y cuántos días le quedan (por la fecha local del móvil; el servidor usa la de Madrid)
function temporadaDe(fecha) { const d0 = new Date(PASE.inicio + 'T00:00:00'), n = Math.floor((fecha - d0) / 864e5); return n < 0 ? -1 : Math.floor(n / PASE.dias); }
const temporadaPase = () => temporadaDe(new Date());
function diasQuedanPase() { const t = temporadaPase(); if (t < 0) return 0; const fin = new Date(PASE.inicio + 'T00:00:00'); fin.setDate(fin.getDate() + (t + 1) * PASE.dias); return Math.max(0, Math.ceil((fin - Date.now()) / 864e5)); }
// el estado del pase en la partida (si cambió la temporada, uno nuevo)
function estadoPase() {
  const t = temporadaPase();
  if (!GUARDA.pase || GUARDA.pase.temporada !== t) GUARDA.pase = { temporada: t, xp: 0, premium: false, cobrados: [], cobradosP: [], dia: '', xpHoy: 0 };
  return GUARDA.pase;
}
const nivelPase = () => Math.min(PASE.niveles, 1 + Math.floor(estadoPase().xp / PASE.xpNivel));
// al acabar una partida (partida.js): la experiencia (con tope del día), sin servidor; con servidor, lo manda el servidor en jump_partida
function xpPartida(J) { return J.metros * PASE.xpMetro + J.hechas.length * PASE.xpOrden + J.rescatados * PASE.xpRescate; }
function sumaXpPase(xp) {
  if (JS.activo() || temporadaPase() < 0) return;
  const p = estadoPase(), d = hoy();
  if (p.dia !== d) { p.dia = d; p.xpHoy = 0; }
  const cabe = Math.max(0, Math.min(xp, PASE.topeXpDia - p.xpHoy));
  p.xp += cabe; p.xpHoy += cabe;
}
// cobrar un nivel: lo da al momento y, con servidor, lo pide (jump_pase_cobrar); si el servidor dice que no, se corrige solo
function cobraPase(nivel, premium) {
  const p = estadoPase(), lista = premium ? p.cobradosP : p.cobrados, premio = (premium ? PASE.contrato : PASE.gratis)[nivel];
  if (!premio || nivel > nivelPase() || lista.includes(nivel) || (premium && !p.premium)) return SONIDO.uy();
  lista.push(nivel);
  if (premio.z) GUARDA.zanas += premio.z;
  if (premio.kit) GUARDA.kit[premio.kit] = (GUARDA.kit[premio.kit] || 0) + 1;
  if (premio.pelaje) GUARDA.tengo['pelo' + premio.pelaje] = true;
  if (premio.capa) GUARDA.tengo['capa' + premio.capa] = true;
  salvaGuarda(); JS.pide('pase', { nivel, premium: !!premium });
  bandera(premio.z ? '+' + premio.z : premio.kit ? tr('¡Kit para tu próxima partida!') : tr(nombrePiel(premio.pelaje || premio.capa)), PASTEL.oro);
  confeti(PAN.W / 2, CAM.y + PAN.H * 0.5, 24); SONIDO.compra();
}
// ¿hay algo que cobrar? (para el aviso de la portada)
function pasePendiente() { const p = estadoPase(), n = nivelPase(); for (let i = 1; i <= n; i++) { if (PASE.gratis[i] && !p.cobrados.includes(i)) return true; if (p.premium && PASE.contrato[i] && !p.cobradosP.includes(i)) return true; } return false; }

/* ---------- el dibujo ---------- */
function iconoPremio(premio, x, y, s = 1) {
  if (!premio) return;
  if (premio.z) { iconoZana(x, y - 1, 13 * s); letras('+' + premio.z, x, y + 9, 6, PASTEL.melocotonO); }
  else if (premio.kit) aqui(x, y, 0, 0.8 * s, 0.8 * s, () => iconoKit(premio.kit, 0, 0));
  else if (premio.pelaje) spriteConejo('quieto0', x, y + 9, 3.2 * s, 0, 1, 1, premio.pelaje, GUARDA.capa);
  else if (premio.capa) spriteConejo('quieto0', x, y + 9, 3.2 * s, 0, 1, 1, GUARDA.pelaje, premio.capa);
}
// la franja de la portada: nivel y barra, y si hay algo que cobrar, brilla
function pintaFranjaPase(x, y, w, t) {
  if (temporadaPase() < 0) return;
  const p = estadoPase(), n = nivelPase(), k = n >= PASE.niveles ? 1 : (p.xp % PASE.xpNivel) / PASE.xpNivel, hay = pasePendiente();
  caja(x, y + 1.5, w, 15, 4, OLC, null); caja(x, y, w, 15, 4, hay ? PASTEL.oro : PASTEL.papel, OLC, 0.9);
  letras(tr('Contrato de obra'), x + 6, y + 7.8, 7, PASTEL.texto, { alin: 'left', peso: 800, max: w * 0.45 });
  letras(tr('Nivel {n}', { n }), x + w - 6, y + 7.8, 7, PASTEL.texto, { alin: 'right', peso: 800 });
  const bx = x + w * 0.5, bw = w * 0.5 - 34;
  caja(bx, y + 5, bw, 5, 2.5, PASTEL.raya, null); caja(bx, y + 5, bw * k, 5, 2.5, PASTEL.lilaO, null);
  if (hay) estrellita(x + w - 2, y - 2, 2.2 + Math.sin(t * 7), 0.9);
  boton(x, y - 3, w, 21, () => abrePanel('pase'));
}
function pintaPase() {
  const W = PAN.W, H = PAN.H, x = 8, y = 34, w = W - 16, h = H - 48, p = estadoPase(), n = nivelPase();
  marco('Contrato de obra', x, y, w, h, PASTEL.oro);
  pastillaZanas(x + 6, y + 7);
  // cabecera: temporada, nivel y barra
  const k = n >= PASE.niveles ? 1 : (p.xp % PASE.xpNivel) / PASE.xpNivel;
  letras(tr('Quedan {d} días', { d: diasQuedanPase() }), x + w - 8, y + 14, 6.6, PASTEL.suave, { alin: 'right', peso: 800 });
  letras(tr('Nivel {n}', { n }) + ' · ' + (n >= PASE.niveles ? tr('¡Completo!') : tr('{x} / {t} de experiencia', { x: p.xp % PASE.xpNivel, t: PASE.xpNivel })), x + 10, y + 30, 7.2, PASTEL.texto, { alin: 'left', peso: 800, max: w - 20 });
  caja(x + 10, y + 35, w - 20, 6, 3, PASTEL.raya, null); caja(x + 10, y + 35, (w - 20) * k, 6, 3, PASTEL.lilaO, null);
  envuelve(tr('Cada partida da experiencia: un punto por metro, 25 por orden incumplida y 10 por rescate.'), w - 20, 5.6).forEach((l, i) => letras(l, W / 2, y + 48 + i * 7, 5.6, PASTEL.suave, { peso: 700 }));
  // las dos columnas: gratis y contrato
  const cx1 = x + 34, cx2 = x + w - 34, top = y + 62;
  letras(tr('Gratis'), cx1, top, 6.6, PASTEL.texto, { peso: 800 }); letras(tr('Contrato firmado'), cx2, top, 6.6, p.premium ? PASTEL.texto : PASTEL.flojo, { peso: 800, max: 60 });
  const pie = p.premium ? 6 : 30;
  contenido(x + 4, top + 6, w - 8, h - (top + 6 - y) - pie, y0 => {
    const fh = 34;
    for (let i = 1; i <= PASE.niveles; i++) {
      const fy = y0 + 2 + (i - 1) * fh, llega = i <= n, g = PASE.gratis[i], c = PASE.contrato[i];
      caja(x + 6, fy, w - 12, fh - 3, 4, llega ? '#ffffff' : PASTEL.fondo, OLC, llega ? 0.8 : 0.5);
      elipse(W / 2, fy + fh / 2 - 1.5, 7.5, 7.5, llega ? PASTEL.oro : PASTEL.raya, OLC, 0.7); letras(String(i), W / 2, fy + fh / 2 - 1, 6.6, PASTEL.texto);
      for (const [premio, cx, prem, lista] of [[g, cx1, false, p.cobrados], [c, cx2, true, p.cobradosP]]) {
        if (!premio) continue;
        const cobrado = lista.includes(i), puede = llega && !cobrado && (!prem || p.premium);
        G.globalAlpha = cobrado ? 0.4 : (prem && !p.premium) ? 0.55 : 1;
        iconoPremio(premio, cx, fy + fh / 2 - 7);
        G.globalAlpha = 1;
        if (cobrado) { trazo(cx - 6, fy + fh / 2, cx - 1, fy + fh / 2 + 5, 1.6, PASTEL.mentaO, null); trazo(cx - 1, fy + fh / 2 + 5, cx + 8, fy + fh / 2 - 7, 1.6, PASTEL.mentaO, null); }
        else if (puede) { caja(cx - 14, fy + fh - 11, 28, 8, 4, PASTEL.menta, OLC, 0.6); letras(tr('Cobrar'), cx, fy + fh - 6.8, 5.6, PASTEL.texto, { peso: 800 }); boton(cx - 16, fy, 32, fh, () => cobraPase(i, prem)); }
      }
    }
    return y0 + 4 + PASE.niveles * fh;
  });
  if (!p.premium) {
    const bt = tr('Firmar el contrato') + ' · ' + euros(2.99), bw = Math.min(w - 20, anchoLetras(bt, 8) + 20), by = y + h - 24;
    caja(W / 2 - bw / 2, by + 2, bw, 18, 5, OLC, null); caja(W / 2 - bw / 2, by, bw, 18, 5, PASTEL.melocoton, OLC, 1);
    letras(bt, W / 2, by + 9.5, 8, '#ffffff', { borde: PASTEL.melocotonO, bw: 2, max: bw - 10 });
    boton(W / 2 - bw / 2 - 4, by - 4, bw + 8, 26, () => { const pk = PACKS.find(q => q[0] === 'pase'); if (pk) compraPack(pk); });
  }
}
