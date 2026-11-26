// Fans of Pop · LA BARRA DE CORAZONES, MONEDAS Y PERLAS (tarea #373, boceto A de Pepins, 25-11-2026): una sola pastilla blanca centrada,
// con los corazones, las monedas y las perlas a la misma altura y separadores punteados; el reloj del siguiente corazón cuelga como una
// etiqueta bajo los corazones y, en el camino, el «+» de la tienda va dentro, al final. La misma pieza en el camino, el nivel y
// Memoria (en el lienzo) y en la victoria (en HTML, js/victoria-panel.js). Qué sale y dónde lo dicen las reglas (js/barra-recursos-reglas.js).
'use strict';
const PP_BARRA_TINTA = Object.freeze({ fondo: '#fff', borde: '#ffb3d6', sombra: '#f4a5cb', cifra: '#7a4a8a', puntos: '#f3bfd9', reloj: '#ff6eb5', relojBorde: '#c43a84' });
const PP_BARRA_LETRA = 26;   // la letra de las cifras en el lienzo (la misma en monedas y perlas)
const ppBarraFuente = () => `700 ${PP_BARRA_LETRA}px ${PP_FUENTE}`;

// la pausa baja bajo la barra en un nivel normal; en un nivel con duelo, no (PP_BARRA_REGLAS.pausaBaja)
const ppBarraPausaBaja = pantalla => PP_BARRA_REGLAS.pausaBaja(pantalla, !!(PP_P && PP_P.T && PP_P.T.nim));

/* ---------- en el lienzo ---------- */
// las piezas, cada una en su sitio (coordenadas de la pastilla, a escala 1); `mid` es la mitad del alto
function ppBarraCorazones(c, p, mid, opc) {
  const vidas = ppVidas(), llenos = ppInfinitas() ? PP_CFG.vida : vidas, dano = opc.dano || 0, paso = PP_BARRA_REGLAS.MEDIDAS.corazon;
  for (let i = 0; i < PP_CFG.vida; i++) ppCorazon(c, p.x + paso / 2 + i * paso, mid, 38 + (i === vidas && dano > 0 ? dano * 10 : 0), i < llenos);   // el dibujo trae aire: a 38 se ve del alto de la moneda, sin montarse
}
function ppBarraCifra(c, p, mid, pinta, txt) {
  pinta(c, p.x + PP_BARRA_REGLAS.MEDIDAS.icono / 2, mid, 34);   // la moneda y la perla llenan su dibujo: a 34 miden lo que un corazón
  c.font = ppBarraFuente(); c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = PP_BARRA_TINTA.cifra;
  c.fillText(txt, p.x + PP_BARRA_REGLAS.MEDIDAS.icono + PP_BARRA_REGLAS.MEDIDAS.hueco, mid + 2);
}
function ppBarraSeparador(c, p, mid) {
  c.fillStyle = PP_BARRA_TINTA.puntos;
  for (let y = -14; y <= 10; y += 8) { c.beginPath(); c.roundRect(p.x, mid + y, p.w, 4, 1); c.fill(); }
}
// el «+» verde de la tienda, como el de siempre
function ppBarraMas(c, p, mid) {
  const x = p.x + p.w / 2;
  c.beginPath(); c.arc(x, mid, 16, 0, Math.PI * 2); c.fillStyle = '#4fc964'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#26924a'; c.stroke();
  c.fillStyle = '#fff'; c.fillRect(x - 8, mid - 2.5, 16, 5); c.fillRect(x - 2.5, mid - 8, 5, 16);
}
function ppBarraPieza(c, p, mid, txt, opc) {
  if (p.tipo === 'corazones') ppBarraCorazones(c, p, mid, opc);
  else if (p.tipo === 'monedas') ppBarraCifra(c, p, mid, ppMoneda, txt.monedas);
  else if (p.tipo === 'perlas') ppBarraCifra(c, p, mid, ppPerla, txt.perlas);
  else if (p.tipo === 'sep') ppBarraSeparador(c, p, mid);
  else if (p.tipo === 'mas') ppBarraMas(c, p, mid);
}
// la etiqueta rosa del reloj, colgando bajo los corazones (x: su borde izquierdo; y: su centro)
function ppBarraReloj(c, x, y, esc) {
  const txt = tr('+1 en {t}', { t: ppReloj(ppFaltaVida()) }), tam = Math.round(17 * esc);
  c.font = `700 ${tam}px ${PP_FUENTE}`;
  const w = c.measureText(txt).width + 18 * esc, h = 26 * esc;
  c.beginPath(); c.roundRect(x, y - h / 2 + 3 * esc, w, h, h / 2); c.fillStyle = PP_BARRA_TINTA.relojBorde; c.fill();
  c.beginPath(); c.roundRect(x, y - h / 2, w, h, h / 2); c.fillStyle = PP_BARRA_TINTA.reloj; c.fill(); c.lineWidth = 3 * esc; c.strokeStyle = '#fff'; c.stroke();
  c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, x + w / 2, y + 1);
}
// La barra de `pantalla` ('camino', 'nivel', 'memoria') centrada en (cx, cy). opc: { dano, maximo }.
// Devuelve dónde quedó cada cosa, en coordenadas del lienzo: { corazones: [{x, y, r}], monedas: {x, y}, perlas: {x, y}, mas: {x, y, r}, reloj: {x, y}, abajo }
function ppBarraRecursos(c, pantalla, cx, cy, opc = {}) {
  const R = PP_BARRA_REGLAS, txt = { monedas: R.cifra(SAVE.monedas), perlas: R.cifra(SAVE.perlas || 0) };
  c.font = ppBarraFuente();
  const L = R.medidas(R.grupos(pantalla), { monedas: c.measureText(txt.monedas).width, perlas: c.measureText(txt.perlas).width, vidas: PP_CFG.vida }, opc.maximo);
  const x0 = cx - L.ancho * L.esc / 2, y0 = cy - L.alto * L.esc / 2, mid = L.alto / 2;
  c.save(); c.translate(x0, y0); c.scale(L.esc, L.esc);
  c.fillStyle = PP_BARRA_TINTA.sombra; c.beginPath(); c.roundRect(0, 6, L.ancho, L.alto, mid); c.fill();
  c.fillStyle = PP_BARRA_TINTA.fondo; c.beginPath(); c.roundRect(0, 0, L.ancho, L.alto, mid); c.fill();
  c.lineWidth = 5; c.strokeStyle = PP_BARRA_TINTA.borde; c.stroke();
  for (const p of L.piezas) ppBarraPieza(c, p, mid, txt, opc);
  c.restore();
  const S = ppBarraSitios(L, x0, y0);
  if (S.reloj) ppBarraReloj(c, S.reloj.x, S.reloj.y, L.esc);
  return S;
}
// dónde quedó cada pieza (para los toques y para lo que vuela hasta la barra) y, si falta algún corazón, dónde cuelga el reloj
function ppBarraSitios(L, x0, y0) {
  const e = L.esc, cy = y0 + L.alto * e / 2, en = x => x0 + x * e, S = { corazones: [], abajo: y0 + (L.alto + 6) * e };
  for (const p of L.piezas) {
    if (p.tipo === 'corazones') for (let i = 0; i < PP_CFG.vida; i++) S.corazones.push({ x: en(p.x + (i + 0.5) * PP_BARRA_REGLAS.MEDIDAS.corazon), y: cy, r: PP_BARRA_REGLAS.MEDIDAS.corazon / 2 * e + 1 });
    else if (p.tipo === 'mas') S.mas = { x: en(p.x + p.w / 2), y: cy, r: (PP_BARRA_REGLAS.MEDIDAS.mas / 2 + 10) * e };   // el botón y un margen para el pulgar, a la escala de la barra
    else if (p.tipo !== 'sep') S[p.tipo] = { x: en(p.x + PP_BARRA_REGLAS.MEDIDAS.icono / 2), y: cy };
  }
  const cor = L.piezas.find(p => p.tipo === 'corazones');
  if (cor && PP_BARRA_REGLAS.conReloj(ppVidas(), PP_CFG.vida, ppInfinitas())) { S.reloj = { x: en(cor.x - 4), y: y0 + (L.alto + 4) * e }; S.abajo += 18 * e; }
  return S;
}

// el nombre del mundo en la cabecera del camino con su chip de estrellas al lado, centrados juntos; devuelve dónde quedó la estrella
function ppBarraNombreMundo(c, texto, y, borde, estrellas) {
  const tam = 28, cuenta = PP_BARRA_REGLAS.cifra(estrellas);
  c.font = `700 ${Math.round(tam * PP_LETRA)}px ${PP_FUENTE}`;
  const anchoNombre = c.measureText(texto).width;
  c.font = `700 20px ${PP_FUENTE}`;
  const anchoChip = 46 + c.measureText(cuenta).width, sitio = PP_BARRA_REGLAS.nombreConEstrella(anchoNombre, anchoChip, 270);
  ppTexto(c, texto, sitio.xNombre, y, tam, '#fff', 'center', borde);
  c.beginPath(); c.roundRect(sitio.xChip, y - 14, anchoChip, 28, 14); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#f6d36a'; c.stroke();
  ppEstrella(c, sitio.xChip + 17, y, 26, true);
  c.font = `700 20px ${PP_FUENTE}`; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = PP_BARRA_TINTA.cifra; c.fillText(cuenta, sitio.xChip + 34, y + 1);
  return { x: sitio.xChip + 17, y };
}

/* ---------- en HTML (la victoria y el pase) ---------- */
// las mismas piezas; conserva las clases que buscan las monedas que vuelan y las cifras que cuentan (js/victoria-panel.js, js/pase.js)
function ppBarraRecursosHtml(monedas) {
  const R = PP_BARRA_REGLAS, llenos = ppInfinitas() ? PP_CFG.vida : Math.min(PP_CFG.vida, ppVidas());
  const pieza = {
    corazones: () => `<div class="pp-vic-vidas">${Array.from({ length: PP_CFG.vida }, (_, k) => `<span class="pp-vic-vida${k < llenos ? '' : ' pp-vacia'}">${ppIcono('i-vida', 46, '#ff6e8a')}</span>`).join('')}</div>`,
    monedas: () => `<div class="pp-vic-caja pp-vic-caja-mon">${ppIcono('i-moneda', 34)}<b class="pp-vic-mon">${R.cifra(monedas)}</b></div>`,
    perlas: () => `<div class="pp-vic-caja pp-vic-caja-per">${ppIcono('i-perla', 34, '#ffd1ec')}<b class="pp-vic-per">${R.cifra(SAVE.perlas || 0)}</b></div>`,
  };
  return `<div class="pp-vic-arriba">${R.grupos('victoria').map(g => pieza[g]()).join('<i class="pp-vic-sep"></i>')}</div>`;
}
