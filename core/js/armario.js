// Fans Of · ARMARIO: marcos para el avatar y títulos que salen bajo el nombre. Solo para lucirse: no dan ventaja en las partidas.
// Los datos (qué marcos y títulos hay y cuáles se tienen de serie) son de cada juego: RETOS.armario. Si un juego no los trae, no hay armario.
// Se ganan en los pases (premios { marco } o { titulo }); el sistema de pases está en core/js/retos.js.
'use strict';
const ARM = () => (typeof RETOS !== 'undefined' && RETOS.armario) || null;
// lo que llevas puesto y lo que tienes (SAVE.look). Lo de serie se tiene siempre.
function lookDe() {
  const A = ARM(), L = SAVE.look && typeof SAVE.look === 'object' ? SAVE.look : (SAVE.look = {});
  if (!Array.isArray(L.marcos)) L.marcos = [];
  if (!Array.isArray(L.titulos)) L.titulos = [];
  if (A) {
    for (const id in A.marcos) if (A.marcos[id].serie && !L.marcos.includes(id)) L.marcos.push(id);
    for (const id in A.titulos) if (A.titulos[id].serie && !L.titulos.includes(id)) L.titulos.push(id);
    if (!A.marcos[L.marco] || !L.marcos.includes(L.marco)) L.marco = Object.keys(A.marcos).find(id => A.marcos[id].serie) || '';
    if (L.titulo && (!A.titulos[L.titulo] || !L.titulos.includes(L.titulo))) L.titulo = '';
    if (L.titulo === undefined) L.titulo = Object.keys(A.titulos).find(id => A.titulos[id].serie) || '';
  }
  return L;
}
const LOOK_LISTA = t => (t === 'marco' ? 'marcos' : 'titulos');
const tieneLook = (t, id) => lookDe()[LOOK_LISTA(t)].includes(id);
// da un marco o un título; devuelve true si es nuevo
function darLook(t, id) {
  const A = ARM(); if (!A || !(t === 'marco' ? A.marcos : A.titulos)[id]) return false;
  const L = lookDe(), lista = L[LOOK_LISTA(t)];
  if (lista.includes(id)) return false;
  lista.push(id); (L.nuevos || (L.nuevos = [])).push(t + ':' + id);
  return true;
}
const lookNuevos = () => ((SAVE.look && SAVE.look.nuevos) || []).length;
function ponerLook(t, id) {
  const L = lookDe();
  if (t === 'marco') L.marco = id; else L.titulo = id;
  saveGame();
}
const marcoDef = id => (ARM() && ARM().marcos[id]) || null;
const tituloDef = id => (ARM() && ARM().titulos[id]) || null;
const rarColor = (rar, k = 1) => (RARITY[rar] || RARITY.basic)[k];
// el título como trozo de HTML (comillas angulares y el color de su rareza); vacío si no llevas
function tituloHtml(id, cls = '') {
  const T = tituloDef(id); if (!T) return '';
  return `<span class="tt-x ${cls}" style="--tt:${rarColor(T.rar)}">«${esc(T.name)}»</span>`;
}

/* =========================================================
   DIBUJO DE LOS MARCOS
   Todo en un cuadrado de lado S. El marco ocupa el centro (con margen m para los adornos que sobresalen:
   asas, coronas, cintas). Cada marco: colores del aro (a arriba, b abajo), el fondo de detrás del avatar y sus adornos.
   ========================================================= */
const MARCO_ARTE = {
  normal:      { a: '#8d63d1', b: '#3e2363', fa: '#3e2363', fb: '#26143c' },
  billetes:    { a: '#9af5b9', b: '#1f8a4c', fa: '#2f7a4f', fb: '#123b25', ad: 'billetes' },
  carton:      { a: '#e8b878', b: '#8a5a2b', fa: '#5a3d22', fb: '#2e1f12', ad: 'carton' },
  corporativo: { a: '#d6e2f2', b: '#55667f', fa: '#34405a', fb: '#1a2133', ad: 'corporativo' },
  maletin:     { a: '#ffe58a', b: '#b8780a', fa: '#5c3a12', fb: '#2b1a08', ad: 'maletin' },
  accionista:  { a: '#f2f4f8', b: '#7d8799', fa: '#20402e', fb: '#0f2018', ad: 'accionista' },
  ceo:         { a: '#fff0a6', b: '#c7860c', fa: '#5a1420', fb: '#2a070d', ad: 'ceo', brillo: '#ffcb3d' },
  duelista:    { a: '#a9d6ff', b: '#1d5fc9', fa: '#173d8f', fb: '#0b1d47', ad: 'duelista' },
  leyenda:     { a: '#ffb3bd', b: '#b04ad8', fa: '#4a1640', fb: '#1e0820', ad: 'leyenda', brillo: '#ff7e8a' },
  neon:        { a: '#2a1446', b: '#140a24', fa: '#120822', fb: '#06030d', ad: 'neon' },
  paytowin:    { a: '#c9ff8a', b: '#2f8a1c', fa: '#3d2a08', fb: '#1a1203', ad: 'paytowin', brillo: '#7be04a' },
  trofeo:      { a: '#fff4c2', b: '#d0901a', fa: '#26143c', fb: '#120a1e', ad: 'trofeo', brillo: '#ffcb3d' },
};
// un aro: el hueco del medio se deja vacío (regla par-impar) para no tapar el avatar
function marcoAro(c, x, y, w, r, T, A, B) {
  c.save();
  c.beginPath(); rrPath(c, x, y, w, w, r); rrPath(c, x + T, y + T, w - 2 * T, w - 2 * T, Math.max(2, r - T * 0.7));
  const g = c.createLinearGradient(0, y, 0, y + w); g.addColorStop(0, A); g.addColorStop(1, B);
  c.fillStyle = g; c.fill('evenodd');
  c.lineWidth = Math.max(1.6, w * 0.022); c.strokeStyle = OL; c.lineJoin = 'round'; c.stroke();
  // brillo de arriba, como el resto de botones del juego
  c.beginPath(); c.moveTo(x + r, y + T * 0.38); c.lineTo(x + w - r, y + T * 0.38);
  c.lineWidth = Math.max(1, T * 0.22); c.lineCap = 'round'; c.strokeStyle = 'rgba(255,255,255,.55)'; c.stroke();
  c.restore();
}
function marcoMoneda(c, x, y, s) {
  const g = c.createRadialGradient(x - s * 0.3, y - s * 0.35, s * 0.1, x, y, s); g.addColorStop(0, '#fff3b0'); g.addColorStop(0.6, '#ffcb3d'); g.addColorStop(1, '#c7860c');
  c.beginPath(); c.arc(x, y, s, 0, Math.PI * 2); c.fillStyle = g; c.fill(); c.lineWidth = Math.max(1.4, s * 0.22); c.strokeStyle = OL; c.stroke();
  c.beginPath(); c.arc(x, y, s * 0.68, 0, Math.PI * 2); c.lineWidth = Math.max(0.8, s * 0.1); c.strokeStyle = 'rgba(138,90,10,.55)'; c.stroke();
  c.font = `${s * 1.15}px ${FONT_D}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#8a5a0a'; c.fillText('$', x, y + s * 0.08);
}
function marcoGema(c, x, y, s, col) {
  c.save(); c.translate(x, y);
  shape(c, poly(0, -s, s * 0.85, -s * 0.2, 0, s, -s * 0.85, -s * 0.2), col, Math.max(1.2, s * 0.22));
  c.beginPath(); c.moveTo(-s * 0.85, -s * 0.2); c.lineTo(s * 0.85, -s * 0.2); c.moveTo(0, -s); c.lineTo(-s * 0.3, -s * 0.2); c.lineTo(0, s); c.lineTo(s * 0.3, -s * 0.2); c.closePath();
  c.lineWidth = Math.max(0.6, s * 0.1); c.strokeStyle = 'rgba(255,255,255,.55)'; c.stroke();
  c.restore();
}
function marcoEstrella(c, x, y, s, col) { c.beginPath(); starPath(c, x, y, s, s * 0.46); c.fillStyle = col; c.fill(); c.lineWidth = Math.max(1.2, s * 0.2); c.strokeStyle = OL; c.lineJoin = 'round'; c.stroke(); }
// los adornos de cada marco (x, y, w: el cuadrado del aro; T: su grosor)
const MARCO_ADORNO = {
  billetes(c, x, y, w, T) {
    // rayitas de billete en el aro y una moneda en cada esquina
    c.save(); c.strokeStyle = 'rgba(20,70,40,.45)'; c.lineWidth = Math.max(0.8, T * 0.12);
    for (let i = 0.22; i < 0.8; i += 0.07) { c.beginPath(); c.moveTo(x + w * i, y + T * 0.3); c.lineTo(x + w * i + T * 0.35, y + T * 0.75); c.stroke(); c.beginPath(); c.moveTo(x + w * i, y + w - T * 0.75); c.lineTo(x + w * i + T * 0.35, y + w - T * 0.3); c.stroke(); }
    c.restore();
    const s = T * 0.95; for (const [px, py] of [[x + T * 0.5, y + T * 0.5], [x + w - T * 0.5, y + T * 0.5], [x + T * 0.5, y + w - T * 0.5], [x + w - T * 0.5, y + w - T * 0.5]]) marcoMoneda(c, px, py, s);
  },
  carton(c, x, y, w, T) {
    c.save(); c.strokeStyle = 'rgba(70,40,15,.35)'; c.lineWidth = Math.max(0.8, T * 0.14);
    for (let i = 0.15; i < 0.9; i += 0.06) { c.beginPath(); c.moveTo(x + T * 0.25, y + w * i); c.lineTo(x + T * 0.8, y + w * i); c.stroke(); c.beginPath(); c.moveTo(x + w - T * 0.8, y + w * i); c.lineTo(x + w - T * 0.25, y + w * i); c.stroke(); }
    // cinta de embalar en la esquina
    c.translate(x + T * 1.6, y + T * 1.6); c.rotate(-Math.PI / 4);
    shape(c, rr(-T * 2.6, -T * 0.55, T * 5.2, T * 1.1, 1), 'rgba(240,220,170,.92)', Math.max(1.2, T * 0.16));
    c.restore();
    // sello rojo abajo
    c.save(); c.translate(x + w / 2, y + w - T * 0.5); c.rotate(-0.08);
    shape(c, rr(-T * 2.4, -T * 0.62, T * 4.8, T * 1.24, T * 0.25), '#e63946', Math.max(1.2, T * 0.16));
    c.font = `${T * 0.95}px ${FONT_D}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#fff6ea'; c.fillText(tr('FRÁGIL'), 0, T * 0.08);
    c.restore();
  },
  corporativo(c, x, y, w, T) {
    c.save(); c.strokeStyle = 'rgba(40,52,74,.35)'; c.lineWidth = Math.max(0.6, T * 0.1);
    for (let i = 0.25; i < 0.95; i += 0.2) { c.beginPath(); c.moveTo(x + T * i * 1.0, y + T); c.lineTo(x + T * i, y + w - T); c.stroke(); }
    c.restore();
    // la tarjeta de empleado colgando abajo a la derecha
    const bx = x + w - T * 1.9, by = y + w - T * 1.2;
    line(c, [bx - T * 0.9, by - T * 1.6, bx, by - T * 0.4, bx + T * 0.9, by - T * 1.6], '#e63946', Math.max(1.2, T * 0.25));
    shape(c, rr(bx - T * 1.05, by - T * 0.5, T * 2.1, T * 1.6, T * 0.25), '#f4f6fa', Math.max(1.2, T * 0.16));
    shape(c, rr(bx - T * 0.75, by - T * 0.2, T * 0.7, T * 0.8, T * 0.12), '#7ab8ff', Math.max(0.8, T * 0.1));
    line(c, [bx + T * 0.1, by, bx + T * 0.75, by], '#5f6673', Math.max(0.8, T * 0.12));
    line(c, [bx + T * 0.1, by + T * 0.35, bx + T * 0.6, by + T * 0.35], '#5f6673', Math.max(0.8, T * 0.12));
  },
  maletin(c, x, y, w, T) {
    // el asa arriba
    c.save(); c.beginPath(); c.moveTo(x + w * 0.36, y + T * 0.2); c.lineTo(x + w * 0.36, y - T * 0.75); c.quadraticCurveTo(x + w * 0.36, y - T * 1.2, x + w * 0.42, y - T * 1.2);
    c.lineTo(x + w * 0.58, y - T * 1.2); c.quadraticCurveTo(x + w * 0.64, y - T * 1.2, x + w * 0.64, y - T * 0.75); c.lineTo(x + w * 0.64, y + T * 0.2);
    c.lineWidth = T * 0.9; c.strokeStyle = OL; c.lineJoin = 'round'; c.stroke(); c.lineWidth = T * 0.5; c.strokeStyle = '#7a4a10'; c.stroke(); c.restore();
    // remaches en las esquinas y el cierre abajo
    for (const [px, py] of [[x + T * 0.55, y + T * 0.55], [x + w - T * 0.55, y + T * 0.55], [x + T * 0.55, y + w - T * 0.55], [x + w - T * 0.55, y + w - T * 0.55]]) { dot(c, px, py, T * 0.36, OL); dot(c, px, py, T * 0.24, '#fff3b0'); }
    shape(c, rr(x + w / 2 - T * 0.9, y + w - T * 0.95, T * 1.8, T * 1.3, T * 0.3), '#8a5a0a', Math.max(1.2, T * 0.16));
    dot(c, x + w / 2, y + w - T * 0.3, T * 0.22, '#ffe58a');
  },
  accionista(c, x, y, w, T) {
    // la gráfica que sube, abajo a la derecha
    const bx = x + w - T * 3.4, by = y + w - T * 0.45;
    c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
    const pts = [bx, by, bx + T * 1.1, by - T * 0.9, bx + T * 1.8, by - T * 0.45, bx + T * 3.1, by - T * 2.2];
    line(c, pts, OL, T * 0.95); line(c, pts, '#7be04a', T * 0.55);
    c.translate(bx + T * 3.1, by - T * 2.2); c.rotate(-0.95);
    shape(c, poly(0, -T * 0.85, T * 0.7, T * 0.35, -T * 0.7, T * 0.35), '#7be04a', Math.max(1.2, T * 0.16));
    c.restore();
    for (const [px, py] of [[x + T * 0.55, y + T * 0.55], [x + w - T * 0.55, y + T * 0.55], [x + T * 0.55, y + w - T * 0.55]]) marcoGema(c, px, py, T * 0.5, '#ffcb3d');
  },
  ceo(c, x, y, w, T) {
    // corona arriba, corbata roja abajo y gemas rojas en las esquinas
    const cx = x + w / 2, cy = y + T * 0.1, k = T * 1.15;
    shape(c, poly(cx - k * 1.6, cy, cx - k * 1.6, cy - k * 1.1, cx - k * 0.8, cy - k * 0.5, cx, cy - k * 1.5, cx + k * 0.8, cy - k * 0.5, cx + k * 1.6, cy - k * 1.1, cx + k * 1.6, cy), '#ffcb3d', Math.max(1.4, T * 0.2));
    dot(c, cx, cy - k * 0.5, k * 0.28, '#e63946'); dot(c, cx - k * 1.6, cy - k * 1.1, k * 0.2, '#fff3b0'); dot(c, cx + k * 1.6, cy - k * 1.1, k * 0.2, '#fff3b0'); dot(c, cx, cy - k * 1.5, k * 0.2, '#fff3b0');
    const ty = y + w - T * 0.6;
    shape(c, poly(cx - T * 0.6, ty - T * 0.5, cx + T * 0.6, ty - T * 0.5, cx + T * 0.35, ty + T * 0.15, cx - T * 0.35, ty + T * 0.15), '#c1121f', Math.max(1.2, T * 0.16));
    shape(c, poly(cx - T * 0.35, ty + T * 0.15, cx + T * 0.35, ty + T * 0.15, cx + T * 0.75, ty + T * 1.5, cx, ty + T * 2.0, cx - T * 0.75, ty + T * 1.5), '#e63946', Math.max(1.2, T * 0.16));
    for (const [px, py] of [[x + T * 0.55, y + T * 0.55], [x + w - T * 0.55, y + T * 0.55], [x + T * 0.55, y + w - T * 0.55], [x + w - T * 0.55, y + w - T * 0.55]]) marcoGema(c, px, py, T * 0.5, '#ff4b5c');
  },
  duelista(c, x, y, w, T) {
    // dos espadas cruzadas abajo y remaches de acero
    const cx = x + w / 2, cy = y + w - T * 0.3;
    for (const s of [-1, 1]) {
      c.save(); c.translate(cx, cy); c.rotate(s * 0.78);
      shape(c, rr(-T * 0.22, -T * 2.6, T * 0.44, T * 2.4, T * 0.12), '#e8eef7', Math.max(1.2, T * 0.14));
      shape(c, rr(-T * 0.75, -T * 0.32, T * 1.5, T * 0.36, T * 0.15), '#ffcb3d', Math.max(1.2, T * 0.14));
      shape(c, rr(-T * 0.18, 0, T * 0.36, T * 0.85, T * 0.1), '#7a4a10', Math.max(1.2, T * 0.14));
      c.restore();
    }
    for (const [px, py] of [[x + T * 0.55, y + T * 0.55], [x + w - T * 0.55, y + T * 0.55]]) { dot(c, px, py, T * 0.36, OL); dot(c, px, py, T * 0.24, '#e8eef7'); }
  },
  leyenda(c, x, y, w, T) {
    // laurel a los lados y una estrella arriba
    for (const s of [-1, 1]) {
      const bx = s < 0 ? x + T * 0.5 : x + w - T * 0.5;
      for (let i = 0; i < 5; i++) {
        const py = y + w * (0.28 + i * 0.12);
        c.save(); c.translate(bx, py); c.rotate(s * (0.7 - i * 0.05));
        shape(c, el(0, 0, T * 0.42, T * 0.85), i % 2 ? '#7be04a' : '#a6f07a', Math.max(1, T * 0.14));
        c.restore();
      }
    }
    marcoEstrella(c, x + w / 2, y + T * 0.15, T * 1.35, '#ffcb3d');
  },
  neon(c, x, y, w, T, r) {
    // dos tubos de neón que brillan: cian por fuera y rosa por dentro
    c.save(); c.lineJoin = 'round';
    for (const [col, ins] of [['#4ff0ff', T * 0.3], ['#ff5ad8', T * 0.72]]) {
      c.beginPath(); rrPath(c, x + ins, y + ins, w - 2 * ins, w - 2 * ins, Math.max(2, r - ins * 0.7));
      c.shadowColor = col; c.shadowBlur = T * 1.4; c.lineWidth = T * 0.24; c.strokeStyle = col; c.stroke();
      c.shadowBlur = 0; c.lineWidth = T * 0.1; c.strokeStyle = '#ffffff'; c.stroke();
    }
    c.restore();
  },
  paytowin(c, x, y, w, T) {
    // la tarjeta de crédito abajo y gemas en las esquinas
    const cx = x + w / 2, cy = y + w - T * 0.2;
    c.save(); c.translate(cx, cy); c.rotate(-0.12);
    shape(c, rr(-T * 2.1, -T * 1.0, T * 4.2, T * 2.3, T * 0.35), '#3a86ff', Math.max(1.2, T * 0.16));
    shape(c, rr(-T * 1.6, -T * 0.55, T * 0.9, T * 0.65, T * 0.12), '#ffcb3d', Math.max(0.8, T * 0.1));
    line(c, [-T * 1.6, T * 0.6, T * 1.5, T * 0.6], 'rgba(255,255,255,.75)', Math.max(0.8, T * 0.16));
    c.restore();
    for (const [px, py] of [[x + T * 0.55, y + T * 0.55], [x + w - T * 0.55, y + T * 0.55], [x + T * 0.55, y + w - T * 0.55], [x + w - T * 0.55, y + w - T * 0.55]]) marcoGema(c, px, py, T * 0.55, '#ff6ad5');
  },
  trofeo(c, x, y, w, T) {
    // copa de plástico arriba (con su «Hecho en Microblizz» que no se lee) y estrellas a los lados
    const cx = x + w / 2, cy = y - T * 0.1;
    shape(c, poly(cx - T * 1.2, cy - T * 1.6, cx + T * 1.2, cy - T * 1.6, cx + T * 0.8, cy - T * 0.3, cx - T * 0.8, cy - T * 0.3), '#ffcb3d', Math.max(1.2, T * 0.16));
    c.save(); c.beginPath(); c.arc(cx - T * 1.2, cy - T * 1.05, T * 0.45, Math.PI * 0.5, Math.PI * 1.5); c.moveTo(cx + T * 1.2, cy - T * 1.5); c.arc(cx + T * 1.2, cy - T * 1.05, T * 0.45, -Math.PI * 0.5, Math.PI * 0.5);
    c.lineWidth = T * 0.3; c.strokeStyle = OL; c.stroke(); c.lineWidth = T * 0.14; c.strokeStyle = '#ffcb3d'; c.stroke(); c.restore();
    shape(c, rr(cx - T * 0.25, cy - T * 0.35, T * 0.5, T * 0.55, 1), '#c7860c', Math.max(1, T * 0.14));
    shape(c, rr(cx - T * 0.85, cy + T * 0.15, T * 1.7, T * 0.5, T * 0.15), '#c7860c', Math.max(1.2, T * 0.16));
    marcoEstrella(c, x + T * 0.5, y + w / 2, T * 0.8, '#fff3b0'); marcoEstrella(c, x + w - T * 0.5, y + w / 2, T * 0.8, '#fff3b0');
  },
};
// pinta en el canvas cv (de LW píxeles lógicos) el avatar av con el marco id
function pintaAvatar(cv, LW, id, av) {
  const R2 = 3; cv.width = LW * R2; cv.height = LW * R2;
  const c = cv.getContext('2d'); c.setTransform(R2, 0, 0, R2, 0, 0); c.clearRect(0, 0, LW, LW);
  const M = MARCO_ARTE[id] || MARCO_ARTE.normal;
  const m = LW * 0.1, x = m, y = m, w = LW - 2 * m, T = w * 0.1, r = w * 0.22;
  // un halo para los marcos más raros
  if (M.brillo) { c.save(); c.shadowColor = M.brillo; c.shadowBlur = LW * 0.12; c.beginPath(); rrPath(c, x, y, w, w, r); c.fillStyle = M.brillo; c.fill(); c.restore(); }
  // el fondo y el avatar, recortados al hueco del marco
  c.save(); c.beginPath(); rrPath(c, x + T * 0.5, y + T * 0.5, w - T, w - T, r);
  const g = c.createLinearGradient(0, y, 0, y + w); g.addColorStop(0, M.fa); g.addColorStop(1, M.fb); c.fillStyle = g; c.fill(); c.clip();
  c.fillStyle = 'rgba(255,255,255,.07)'; c.beginPath(); c.arc(x + w * 0.3, y + w * 0.25, w * 0.5, 0, Math.PI * 2); c.fill();
  if (av) { const off = document.createElement('canvas'); const s = Math.round(w * 0.92); drawArt(off, av, s, s); c.drawImage(off, x + (w - s) / 2, y + w - s - T * 0.4, s, s); }
  c.restore();
  marcoAro(c, x, y, w, r, T, M.a, M.b);
  if (M.ad && MARCO_ADORNO[M.ad]) MARCO_ADORNO[M.ad](c, x, y, w, T, r);
}

/* =========================================================
   PANTALLA DEL ARMARIO: pestañas de marcos y títulos. Arriba, cómo te ven los demás.
   ========================================================= */
let armTab = 'marco';
// de dónde sale un marco o un título que aún no tienes (lo buscan los pases; el juego puede decir otra cosa con «de»)
function lookOrigen(t, id) {
  const D = (t === 'marco' ? marcoDef : tituloDef)(id); if (D && D.de) return D.de;
  if (typeof paseOrigen === 'function') { const o = paseOrigen(t, id); if (o) return o; }
  return 'Próximamente';
}
function openArmario(tab) {
  if (!ARM()) return;
  if (tab) armTab = tab;
  updateWallets(); buildArmario(); show('scr-armario');
  const L = lookDe(); L.nuevos = []; saveGame();
}
function buildArmario() {
  const L = lookDe(), A = ARM(), av = avatarOf();
  pintaAvatar($('#arm-av'), 84, L.marco, av);
  $('#arm-who').textContent = pname();
  $('#arm-tt').innerHTML = tituloHtml(L.titulo) || '<span class="tt-x tt-none">Sin título</span>';
  const nM = L.marcos.length, NM = Object.keys(A.marcos).length, nT = L.titulos.length, NT = Object.keys(A.titulos).length;
  for (const b of document.querySelectorAll('[data-armt]')) b.setAttribute('aria-pressed', String(b.dataset.armt === armTab));
  $('[data-armt="marco"]').innerHTML = `MARCOS <small>${nM}/${NM}</small>`;
  $('[data-armt="titulo"]').innerHTML = `TÍTULOS <small>${nT}/${NT}</small>`;
  const nuevo = (t, id) => (L.nuevos || []).includes(t + ':' + id) ? '<span class="arm-new ol">¡NUEVO!</span>' : '';
  const orden = (D, lista) => { const ks = Object.keys(D); return ks.slice().sort((a, b) => (lista.includes(b) - lista.includes(a)) || (ks.indexOf(a) - ks.indexOf(b))); };   // primero lo que tienes; después, en el orden de los datos
  const box = $('#arm-list');
  if (armTab === 'marco') {
    box.className = 'scroll-list arm-grid';
    box.innerHTML = orden(A.marcos, L.marcos).map(id => {
      const D = A.marcos[id], mio = L.marcos.includes(id), on = L.marco === id;
      return `<button class="arm-mk${mio ? '' : ' lock'}${on ? ' on' : ''} rar-${D.rar}" data-arm="marco:${id}" style="--rc:${rarColor(D.rar)};--rd:${rarColor(D.rar, 2)}" aria-pressed="${on}">${nuevo('marco', id)}<canvas aria-hidden="true"></canvas><b>${esc(D.name)}</b><small>${on ? 'PUESTO' : mio ? esc(RARITY[D.rar][0]) : esc(lookOrigen('marco', id))}</small>${mio ? '' : `<span class="arm-lk">${CANDADO_SVG}</span>`}</button>`;
    }).join('');
    for (const b of box.querySelectorAll('.arm-mk')) pintaAvatar(b.querySelector('canvas'), 72, b.dataset.arm.split(':')[1], av);
  } else {
    box.className = 'scroll-list arm-tlist';
    const sin = `<button class="arm-tt${L.titulo ? '' : ' on'}" data-arm="titulo:" aria-pressed="${!L.titulo}"><span class="att-main"><span class="tt-x tt-none">Sin título</span><small>${L.titulo ? 'Toca para no llevar ninguno' : 'No llevas ninguno'}</small></span>${L.titulo ? '' : '<span class="att-on ol">PUESTO</span>'}</button>`;
    box.innerHTML = sin + orden(A.titulos, L.titulos).map(id => {
      const D = A.titulos[id], mio = L.titulos.includes(id), on = L.titulo === id;
      return `<button class="arm-tt${mio ? '' : ' lock'}${on ? ' on' : ''}" data-arm="titulo:${id}" style="--rc:${rarColor(D.rar)}" aria-pressed="${on}"><span class="att-main">${tituloHtml(id)}<small>${mio ? esc(RARITY[D.rar][0]) : esc(lookOrigen('titulo', id))}</small></span>${on ? '<span class="att-on ol">PUESTO</span>' : nuevo('titulo', id)}${mio ? '' : `<span class="arm-lk">${CANDADO_SVG}</span>`}</button>`;
    }).join('');
  }
  for (const b of box.querySelectorAll('[data-arm]')) b.onclick = () => {
    const [t, id] = b.dataset.arm.split(':');
    if (id && !tieneLook(t, id)) { play('deny'); toast(`${t === 'marco' ? marcoDef(id).name : '«' + tituloDef(id).name + '»'}: ${lookOrigen(t, id)}`); return; }
    if ((t === 'marco' ? lookDe().marco : lookDe().titulo) === id) return;
    ponerLook(t, id); play('card'); buildArmario(); profileChip();
    if (!$('#scr-profile').hidden) buildProfile();
  };
}
if (ARM()) {
  for (const b of document.querySelectorAll('[data-armt]')) b.onclick = () => { armTab = b.dataset.armt; play('select'); buildArmario(); $('#arm-list').scrollTop = 0; };
  const back = $('#arm-back'); if (back) back.onclick = () => { play('select'); show('scr-title'); buildProfile(); $('#scr-profile').hidden = false; };
}

/* ---------- al ganar un marco o un título: enseñarlo en grande y ofrecer ponérselo ---------- */
function lookPremioBox(r, n = 1) {
  const t = r.marco ? 'marco' : 'titulo', id = r.marco || r.titulo, D = (t === 'marco' ? marcoDef : tituloDef)(id); if (!D) return;
  $('#cf-title').textContent = t === 'marco' ? '¡MARCO NUEVO!' : '¡TÍTULO NUEVO!';
  const rar = `<span class="lp-rar" style="--rc:${rarColor(D.rar)}">${esc(RARITY[D.rar][0])}</span>`;
  const otros = n > 1 ? `<small>Y ${n - 1} ${n - 1 > 1 ? 'cosas más' : 'cosa más'} para tu armario.</small>` : '';
  $('#cf-body').innerHTML = t === 'marco'
    ? `<div class="lp-box" style="--rc:${rarColor(D.rar)}"><canvas id="lp-cv" aria-hidden="true"></canvas><b class="ol">${esc(D.name)}</b>${rar}</div>${otros}`
    : `<div class="lp-box tt" style="--rc:${rarColor(D.rar)}"><span class="lp-who ol">${esc(pname())}</span>${tituloHtml(id, 'tt-grande')}${rar}</div>${otros}`;
  $('#cf-btns').innerHTML = '<button class="btn-ghost ol btn-ok" id="cf-ok">¡PONÉRMELO!</button><button class="btn-ghost ol" id="cf-no">LUEGO</button>';
  if (t === 'marco') pintaAvatar($('#lp-cv'), 132, id, avatarOf());
  $('#scr-confirm').hidden = false; play('levelup');
  const close = () => { $('#scr-confirm').hidden = true; };
  $('#cf-no').onclick = () => { play('select'); close(); };
  $('#cf-ok').onclick = () => { ponerLook(t, id); play('card'); close(); profileChip(); toast(t === 'marco' ? `Llevas el marco ${D.name}` : `Ahora eres «${D.name}»`, true); };
}
