// Fans of Dungeons · El pintado de la partida: el mapa con la cámara (casillas, niebla de lo recordado, trampas vistas, el
// camino marcado), las figuras ordenadas por altura, los efectos, el marcador de arriba (Vida, Café, planta, turno, monedas),
// el registro de mensajes, los botones de abajo y el minimapa. Los botones que se pintan quedan en BOTONES para el toque.
'use strict';

const PAN = { W: 240, H: 460, k: 1 };
const HUD_H = 30, LOG_H = 38, BOT_H = 48, LH = 11;   // alturas del marcador, del registro y de los botones; LH: una línea de texto
let BOTONES = [];
const BARRA = [];   // dónde está cada botón de abajo (para que el tutorial los señale)
// colores de mazmorra: piedra, hueso, sangre seca y oro viejo (sin neón)
const COL = { fondo: '#07050b', panel: '#120d12', borde: '#3e322c', texto: '#e2d6c0', apagado: '#7a6e62', vida: '#b8282e', cafe: '#3a6ab0', oro: '#d8a840', neon: '#8a2a2a', cian: '#4a9aa8' };
const VISTA = { x: 0, y: HUD_H, w: 240, h: 340, minimapa: true, mirar: false };

// el texto de la interfaz: la letra grande (7 píxeles con contorno), que en el móvil se lee bien
function txt(ctx, s, x, y, c = COL.texto, alin) { return escribe(ctx, s, x, y, { c, alin }); }
// corta un texto para que quepa en «ancho» (con puntos suspensivos)
function corta(s, ancho) { s = String(s); if (anchoTexto(s) <= ancho) return s; while (s.length > 1 && anchoTexto(s + '…') > ancho) s = s.slice(0, -1); return s + '…'; }

// un botón de la interfaz: lo pinta y lo apunta para el toque. o: { icono (rejilla), txt, apagado, activo, num }
function boton(ctx, x, y, w, h, o, f) {
  ctx.fillStyle = o.activo ? '#2a1a1a' : COL.panel; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#1e1618'; ctx.fillRect(x + 1, y + h - 3, w - 2, 2);
  ctx.fillStyle = o.apagado ? '#241c1c' : o.activo ? '#8a2a2a' : COL.borde; ctx.fillRect(x, y, w, 1); ctx.fillRect(x, y + h - 1, w, 1); ctx.fillRect(x, y, 1, h); ctx.fillRect(x + w - 1, y, 1, h);
  ctx.fillStyle = '#5a4a40'; ctx.fillRect(x + 1, y + 1, w - 2, 1);
  const esc = o.escala || (h >= 36 ? 3 : h >= 20 ? 2 : 1);
  let tx = x + 5;
  if (o.icono) {
    const r = rejilla(o.icono, { escala: o.etq ? Math.min(esc, 2) : esc });
    ctx.globalAlpha = o.apagado ? 0.35 : 1;
    const iy = o.etq ? y + Math.round((h - 10 - r.height) / 2) : y + Math.round((h - r.height) / 2) - (o.num !== undefined && !o.txt ? 3 : 0);
    ctx.drawImage(r, x + Math.round(o.txt ? 5 : (w - r.width) / 2), iy);
    ctx.globalAlpha = 1; tx += r.width + 4;
  }
  if (o.etq) { const e = o.etq; escribeMini(ctx, e, x + Math.round((w - anchoMini(e)) / 2), y + h - 9, o.apagado ? COL.apagado : '#b8a890'); }
  if (o.txt) { const t = corta(o.txt, w - (tx - x) - 4); txt(ctx, t, o.icono ? tx : x + Math.round((w - anchoTexto(t)) / 2), y + Math.round((h - 7) / 2), o.apagado ? COL.apagado : COL.texto); }
  if (o.num !== undefined) { const n = String(o.num); txt(ctx, n, x + w - anchoTexto(n) - 3, y + 3, COL.oro); }
  BOTONES.push({ x, y, w, h, f, apagado: o.apagado });
}

// la cámara sigue al héroe (suave), sin salirse del mapa
function avanzaCamara(dt) {
  const h = J.heroe, m = J.mapa; if (!h || !m) return;
  const tx = limita(h.x * TS + TS / 2 - VISTA.w / 2, 0, Math.max(0, m.w * TS - VISTA.w)), ty = limita(h.y * TS + TS / 2 - VISTA.h / 2, 0, Math.max(0, m.h * TS - VISTA.h));
  if (!J.cam.listo) { J.cam.x = tx; J.cam.y = ty; J.cam.listo = true; return; }
  const k = Math.min(1, dt * 9);
  J.cam.x += (tx - J.cam.x) * k; J.cam.y += (ty - J.cam.y) * k;
}

function pintaJuego(ctx) {
  const m = J.mapa, h = J.heroe;
  VISTA.x = 0; VISTA.y = HUD_H; VISTA.w = PAN.W; VISTA.h = PAN.H - HUD_H - LOG_H - BOT_H;
  const ox = Math.round(J.cam.x) + TEMBLOR.x - (m.w * TS < VISTA.w ? Math.round((VISTA.w - m.w * TS) / 2) : 0);
  const oy = Math.round(J.cam.y) + TEMBLOR.y - (m.h * TS < VISTA.h ? Math.round((VISTA.h - m.h * TS) / 2) : 0);
  VISTA.ox = ox; VISTA.oy = oy;
  ctx.save(); ctx.beginPath(); ctx.rect(VISTA.x, VISTA.y, VISTA.w, VISTA.h); ctx.clip();
  ctx.translate(VISTA.x - ox, VISTA.y - oy);
  ctx.fillStyle = COL.fondo; ctx.fillRect(ox, oy, VISTA.w, VISTA.h);
  const x0 = Math.max(0, Math.floor(ox / TS)), y0 = Math.max(0, Math.floor(oy / TS)), x1 = Math.min(m.w - 1, Math.ceil((ox + VISTA.w) / TS)), y1 = Math.min(m.h - 1, Math.ceil((oy + VISTA.h) / TS) + 1);
  const z = m.zona, altos = [], antorchas = [];   // lo que se pinta ordenado por altura (figuras, objetos, muebles con vida) y las antorchas
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    const k = ty * m.w + tx, vis = m.vis[k];
    if (!vis) continue;
    const t = m.t[k], px = tx * TS, py = ty * TS;
    let img, detalle = null;
    if (t === T.MURO) {
      const abajo = ty + 1 < m.h ? m.t[k + m.w] : T.MURO, cara = abajo !== T.MURO && m.vis[k + m.w];
      img = cara ? casilla(z, 'muro') : casilla(z, 'muro_top');
      if (cara && (tx * 7 + ty * 13) % 6 === 0) antorchas.push([tx, ty]);
    }
    else if (t === T.SUELO) { img = casilla(z, 'suelo', (tx + ty) & 1); if (m.v[k] >= 2) detalle = casilla(z, 'detalle', m.v[k]); }
    else if (t === T.PUERTA || t === T.PUERTA_CERRADA) img = casilla(z, 'puerta');
    else if (t === T.PUERTA_ABIERTA) img = casilla(z, 'puerta_abierta');
    else if (t === T.LLEGADA) img = casilla(z, 'llegada');
    else if (t === T.SUBIDA) img = casilla(z, 'subida');
    else if (t === T.MUEBLE) img = casilla(z, 'mueble', m.v[k]);
    else if (t === T.ALFOMBRA) img = casilla(z, 'alfombra');
    else img = casilla(z, t === T.ALFOMBRA2 ? 'alfombra2' : 'suelo', 0);
    ctx.drawImage(img, px, py);
    if (detalle) ctx.drawImage(detalle, px, py);
    if (t === T.PUERTA_CERRADA) { ctx.fillStyle = '#ffd040'; ctx.fillRect(px + 12, py + 13, 8, 6); ctx.fillStyle = '#20102c'; ctx.fillRect(px + 15, py + 15, 2, 3); }
    if (t === T.PUESTO) altos.push({ y: py + TS, f: () => pintaIcono(ctx, 'puesto', px + TS / 2, py + TS + 2) });
    else if (t === T.MAQUINA) altos.push({ y: py + TS, f: () => pintaIcono(ctx, 'maquina', px + TS / 2, py + TS) });
    else if (t === T.JAULA) altos.push({ y: py + TS, f: () => { pintaFigura(ctx, 'ardilla', px + TS / 2, py + TS - 3, { anim: 'quieto', f: Math.floor(J.tiempo * 3) % 4 }); pintaIcono(ctx, 'jaula', px + TS / 2, py + TS); } });
    else if (t === T.ATRIL) altos.push({ y: py + TS, f: () => pintaIcono(ctx, m.usado[clave(tx, ty)] ? 'atril_leido' : 'atril', px + TS / 2, py + TS) });
    else if (t === T.REJA) altos.push({ y: py + TS, f: () => pintaIcono(ctx, 'reja', px + TS / 2, py + TS) });
    else if (t === T.ROMPIBLE) altos.push({ y: py + TS, f: () => pintaIcono(ctx, 'rompible_' + rompibleDe(m, tx, ty), px + TS / 2, py + TS - 1) });
    else if (t === T.ALTAR) altos.push({ y: py + TS, f: () => pintaIcono(ctx, m.usado[clave(tx, ty)] ? 'altar_apagado' : 'altar', px + TS / 2, py + TS) });
    else if (t === T.CAFETERA) altos.push({ y: py + TS, f: () => pintaIcono(ctx, 'cafetera', px + TS / 2, py + TS) });
    const tp = m.trampas.get(clave(tx, ty)); if (tp && tp.vista) pintaIcono(ctx, 'trampa', px + TS / 2, py + TS - 2);
    if (vis === 1) { ctx.fillStyle = 'rgba(5,3,12,0.78)'; ctx.fillRect(px, py, TS, TS); }
  }
  // las antorchas de los muros (dos cuadros de llama, cada una a su ritmo)
  for (const [tx, ty] of antorchas) { const f = Math.floor(J.tiempo * 6 + tx * 3 + ty) & 1; ctx.drawImage(CAS['antorcha' + f], tx * TS, ty * TS); }
  // el camino marcado
  if (h.camino.length) { ctx.fillStyle = 'rgba(216,168,64,0.35)'; for (const [cx, cy] of h.camino) ctx.fillRect(cx * TS + 13, cy * TS + 13, 6, 6); }
  pintaRuta(ctx);
  pintaPeligro(ctx);
  pintaFx(ctx, 'suelo', 0, 0);
  // restos, objetos, figuras
  for (const r of J.restos) if (m.vis[r.y * m.w + r.x]) altos.push({ y: r.y * TS + TS - 6, f: () => pintaIcono(ctx, 'restos', r.x * TS + TS / 2, r.y * TS + TS - 2) });
  for (const o of J.objetos) {
    if (!m.vis[o.y * m.w + o.x]) continue;
    const bob = Math.round(Math.sin(J.tiempo * 3 + o.x) * 1.5);
    if (o.obj.id === 'cofre' && o.obj.maldito) altos.push({ y: o.y * TS + TS - 4, f: () => pintaIcono(ctx, 'cofre_maldito', o.x * TS + TS / 2, o.y * TS + TS - 1) });
    else if (o.obj.id === 'cofre') altos.push({ y: o.y * TS + TS - 4, f: () => pintaFigura(ctx, 'cofre', o.x * TS + TS / 2, o.y * TS + TS - 2, { f: Math.floor(J.tiempo * 2 + o.x) % 4 }) });
    else altos.push({ y: o.y * TS + TS - 5, f: () => { const ic = iconoObj(o.obj); pintaIcono(ctx, ic, o.x * TS + TS / 2, o.y * TS + TS - 3 - bob); if ((o.obj.rar || 0) >= 2) { ctx.fillStyle = RAR_COLOR[o.obj.rar]; ctx.fillRect(o.x * TS + 4 + Math.round(Math.sin(J.tiempo * 5 + o.y) * 2), o.y * TS + 6, 2, 2); } } });
  }
  const todos = [h, ...J.enemigos, ...J.aliados];
  for (const e of todos) {
    if (!e || e.vida <= 0) continue;
    if (e !== h && m.vis[e.y * m.w + e.x] !== 2) continue;
    altos.push({ y: e.y * TS + TS + e.dy, f: () => pintaEntidad(ctx, e) });
  }
  altos.sort((a, b) => a.y - b.y);
  for (const a of altos) a.f();
  pintaOscuridad(ctx, antorchas, ox, oy);
  pintaFx(ctx, 'aire', 0, 0);
  ctx.restore();
  pintaVineta(ctx);
  if (VISTA.minimapa) pintaMinimapa(ctx);
  pintaHud(ctx);
  pintaLog(ctx);
  pintaBotones(ctx);
  pintaFx(ctx, 'pantalla', 0, 0);
}
// la oscuridad: solo se ve bien lo que está cerca del héroe; la luz tiembla; las antorchas abren un hueco cálido
function pintaOscuridad(ctx, antorchas, ox, oy) {
  const h = J.heroe, cx = h.x * TS + TS / 2 + h.dx, cy = h.y * TS + TS / 2 - 10 + h.dy;
  const temblor = 0.97 + 0.03 * Math.sin(J.tiempo * 9) + 0.015 * Math.sin(J.tiempo * 23);
  const r1 = TS * (h.vision + 1) * temblor;
  const g = ctx.createRadialGradient(cx, cy, TS * 1.6, cx, cy, r1);
  g.addColorStop(0, 'rgba(4,2,10,0)'); g.addColorStop(0.3, 'rgba(4,2,10,0.18)'); g.addColorStop(0.7, 'rgba(4,2,10,0.55)'); g.addColorStop(1, 'rgba(4,2,10,0.9)');
  ctx.fillStyle = g; ctx.fillRect(ox, oy, VISTA.w, VISTA.h);
  ctx.globalCompositeOperation = 'lighter';
  for (const [tx, ty] of antorchas) {
    const x = tx * TS + TS / 2, y = ty * TS + 16, k = 0.85 + 0.15 * Math.sin(J.tiempo * 11 + tx * 2 + ty * 5);
    const a = ctx.createRadialGradient(x, y, 2, x, y, TS * 2.6 * k);
    a.addColorStop(0, 'rgba(255,150,60,0.42)'); a.addColorStop(0.5, 'rgba(255,110,40,0.14)'); a.addColorStop(1, 'rgba(255,90,30,0)');
    ctx.fillStyle = a; ctx.fillRect(x - TS * 3, y - TS * 3, TS * 6, TS * 6);
  }
  ctx.globalCompositeOperation = 'source-over';
}
// la viñeta de los bordes de la pantalla (y el latido rojo si queda poca vida)
function pintaVineta(ctx) {
  const h = J.heroe, cx = VISTA.x + VISTA.w / 2, cy = VISTA.y + VISTA.h / 2, r = Math.max(VISTA.w, VISTA.h) * 0.72;
  const g = ctx.createRadialGradient(cx, cy, r * 0.45, cx, cy, r);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.72)');
  ctx.fillStyle = g; ctx.fillRect(VISTA.x, VISTA.y, VISTA.w, VISTA.h);
  if (h && h.vida > 0 && h.vida < h.vidaMax * 0.3) {
    const p = 0.1 + 0.12 * Math.max(0, Math.sin(J.tiempo * 5));
    const rg = ctx.createRadialGradient(cx, cy, r * 0.35, cx, cy, r);
    rg.addColorStop(0, 'rgba(120,0,20,0)'); rg.addColorStop(1, 'rgba(120,0,20,' + p.toFixed(3) + ')');
    ctx.fillStyle = rg; ctx.fillRect(VISTA.x, VISTA.y, VISTA.w, VISTA.h);
  }
}
function pintaEntidad(ctx, e) {
  const fx = e.x * TS + TS / 2 + e.dx, fy = e.y * TS + TS + e.dy - (e.vuela ? 0 : 0);
  if (e === J.heroe && e.escudo > 0) { ctx.globalAlpha = 0.35 + 0.15 * Math.sin(J.tiempo * 6); anilloPx(ctx, Math.round(fx), Math.round(fy - 22), 22, 2, COL.cian); ctx.globalAlpha = 1; }
  if (e.bando === 'enemigo' && e.despierto && !e.mimico) { ctx.fillStyle = 'rgba(0,0,0,0.3)'; ovaloPx(ctx, fx, fy - 1, 10, 3, 'rgba(10,6,20,0.45)'); }
  const fig = e.mimico ? 'cofre' : e.fig, a = e.anim;
  const fantasma = e.estados && e.estados.invisible > 0;   // invisible: se ve a medias (solo tú)
  if (fantasma) ctx.globalAlpha = 0.55 + 0.1 * Math.sin(J.tiempo * 5);
  pintaFigura(ctx, fig, fx, fy, { anim: e.mimico ? 'quieto' : a.nombre, f: a.f, izq: e.izq, blanco: e.blanco > 0 });
  ctx.globalAlpha = 1;
  if (e.mimico) return;
  // encima de la cabeza, de abajo arriba: la barra de vida (con su número), los estados y lo que hará en su turno
  let top = fy - altoFigura(fig) - 4;
  if (e.bando !== 'heroe' && (e.vida < e.vidaMax || e.despierto || e.bando === 'aliado')) {
    const w = e.jefe ? 40 : e.mini ? 30 : 20, n = String(Math.max(0, Math.ceil(e.vida))), nw = anchoMini(n), x0 = Math.round(fx - (w + nw + 3) / 2);
    ctx.fillStyle = '#120a14'; ctx.fillRect(x0 - 1, top - 1, w + 2, 5);
    ctx.fillStyle = '#3a1418'; ctx.fillRect(x0, top, w, 3);
    ctx.fillStyle = e.bando === 'aliado' ? '#6aa878' : COL.vida; ctx.fillRect(x0, top, Math.max(1, Math.round(w * e.vida / e.vidaMax)), 3);
    ctx.fillStyle = 'rgba(12,6,16,0.75)'; ctx.fillRect(x0 + w + 2, top - 2, nw + 2, 8);
    escribeMini(ctx, n, x0 + w + 3, top - 1, e.bando === 'aliado' ? '#a0e0a8' : '#ffb0b8');
    top -= 4;
  }
  let ex = fx - 8, hay = false;
  for (const k in e.estados) if (e.estados[k] > 0 && ESTADO_COLOR[k]) { ctx.fillStyle = ESTADO_COLOR[k]; ctx.fillRect(Math.round(ex), top - 5, 4, 4); ex += 6; hay = true; }
  if (hay) top -= 6;
  if (e.elite || e.mini) { if (e.mini) { pintaRejilla(ctx, 'corona', fx - 6, top - 6); pintaRejilla(ctx, 'corona', fx + 1, top - 6); } else pintaRejilla(ctx, 'corona', fx - 2, top - 6); top -= 6; }
  if (e.fiel) { pintaRejilla(ctx, 'ui_vida', fx - 3, top - 7); top -= 7; }
  if (e.bando === 'enemigo' && VISTA.intenciones !== false) pintaIntencion(ctx, e, fx, top - 1);
}
// encima del enemigo, lo que hará en su turno: espada y «-3» (te va a quitar 3 de vida), dos rayas naranjas (prepara un golpe
// fuerte), diana y «-3» (te dispara), pies (se acerca), cruz verde (cura a otro). bajo: el borde de abajo del bocadillo
function pintaIntencion(ctx, e, fx, bajo) {
  const it = intencion(e); if (!it) return;
  const ic = { golpe: 'int_espada', carga: 'int_carga', dispara: 'int_mira', avanza: 'int_pies', cura: 'int_cura' }[it.tipo];
  const salto = it.tipo === 'golpe' || it.tipo === 'carga' ? Math.round(Math.sin(J.tiempo * 8) * 1) : 0;
  const etq = { carga: tr('PREPARA'), avanza: tr('VIENE'), cura: tr('CURA') }[it.tipo];
  const n = it.dano ? '-' + it.dano : etq || '', r = rejilla(ic, { escala: 2 }), iw = r.width, ih = r.height;
  const w = iw + (n ? anchoTexto(n) + 3 : 0) + 4, hh = ih + 4, x = Math.round(fx - w / 2), y = Math.round(bajo - hh + salto);
  ctx.fillStyle = 'rgba(12,6,16,0.8)'; ctx.fillRect(x, y, w, hh);
  ctx.fillStyle = it.fuerte ? '#ff5a3a' : it.tipo === 'carga' ? '#ff9a2a' : it.tipo === 'golpe' || it.tipo === 'dispara' ? '#a8323a' : '#3a3046'; ctx.fillRect(x, y + hh - 1, w, 1);
  pintaRejilla(ctx, ic, x + 2, y + 2, { escala: 2 });
  if (n) txt(ctx, n, x + iw + 4, y + Math.round((hh - 7) / 2), it.fuerte ? '#ffd040' : it.tipo === 'carga' ? '#ff9a2a' : it.tipo === 'avanza' ? '#c8c0b0' : it.tipo === 'cura' ? '#5fd36a' : '#ff8080');
}
// las casillas donde van a caer los golpes del turno que viene: rojo (golpe seguro), naranja que late (golpe fuerte que viene)
function pintaPeligro(ctx) {
  const m = J.mapa;
  for (const e of J.enemigos) {
    if (visM(m, e.x, e.y) !== 2) continue;
    const it = intencion(e); if (!it || !it.casillas.length || it.tipo === 'avanza' || it.tipo === 'cura') continue;
    for (const [x, y] of it.casillas) {
      const px = x * TS, py = y * TS, late = 0.5 + 0.5 * Math.sin(J.tiempo * (it.fuerte ? 10 : 5));
      if (it.fuerte) { ctx.fillStyle = 'rgba(220,40,30,' + (0.28 + 0.22 * late).toFixed(2) + ')'; ctx.fillRect(px + 1, py + 1, TS - 2, TS - 2); }
      ctx.fillStyle = it.fuerte ? '#ff5a3a' : it.tipo === 'carga' ? '#ff9a2a' : 'rgba(220,60,60,0.75)';
      const g = it.fuerte ? 2 : 1;
      ctx.fillRect(px + 1, py + 1, TS - 2, g); ctx.fillRect(px + 1, py + TS - 1 - g, TS - 2, g); ctx.fillRect(px + 1, py + 1, g, TS - 2); ctx.fillRect(px + TS - 1 - g, py + 1, g, TS - 2);
    }
  }
}
// la ruta que propones con el primer toque cuando hay enemigos a la vista: el segundo toque en la misma casilla la confirma
function pintaRuta(ctx) {
  const r = J.ruta; if (!r) return;
  const late = Math.floor(J.tiempo * 4) % 2;
  ctx.fillStyle = 'rgba(240,232,220,0.55)';
  for (const [cx, cy] of r.c) ctx.fillRect(cx * TS + 14, cy * TS + 14, 4, 4);
  ctx.fillStyle = late ? '#f0e8dc' : '#c8a040';
  const px = r.x * TS, py = r.y * TS;
  for (const [a, b] of [[0, 0], [TS - 6, 0], [0, TS - 2], [TS - 6, TS - 2]]) ctx.fillRect(px + a, py + b, 6, 2);
  for (const [a, b] of [[0, 0], [TS - 2, 0], [0, TS - 6], [TS - 2, TS - 6]]) ctx.fillRect(px + a, py + b, 2, 6);
}
function pintaMinimapa(ctx) {
  const m = J.mapa, h = J.heroe, esc = PAN.W > 480 ? 2 : 1, w = m.w * esc, hh = m.h * esc, x0 = PAN.W - w - 3, y0 = VISTA.y + 3;
  ctx.fillStyle = 'rgba(6,4,8,0.8)'; ctx.fillRect(x0 - 1, y0 - 1, w + 2, hh + 2);
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
    const k = y * m.w + x, v = m.vis[k]; if (!v) continue;
    const t = m.t[k];
    ctx.fillStyle = t === T.MURO ? (v === 2 ? '#5a4c46' : '#30282a') : t === T.SUBIDA ? '#ffd040' : t === T.PUERTA || t === T.PUERTA_CERRADA ? '#b07040' : t === T.PUESTO || t === T.MAQUINA || t === T.ALTAR || t === T.ATRIL || t === T.JAULA ? '#c8a040' : t === T.REJA ? '#a8323a' : (v === 2 ? '#2a2228' : '#161014');
    ctx.fillRect(x0 + x * esc, y0 + y * esc, esc, esc);
  }
  for (const e of J.enemigos) if (m.vis[e.y * m.w + e.x] === 2) { ctx.fillStyle = e.jefe ? '#ff8a2a' : '#c02a30'; ctx.fillRect(x0 + e.x * esc, y0 + e.y * esc, esc, esc); }
  ctx.fillStyle = Math.floor(J.tiempo * 4) % 2 ? '#ffffff' : '#d8a840'; ctx.fillRect(x0 + h.x * esc, y0 + h.y * esc, esc, esc);
  BOTONES.push({ x: x0 - 1, y: y0 - 1, w: w + 2, h: hh + 2, f: () => { if (J.modo === 'juego') { J.panel = { tipo: 'mapa' }; J.modo = 'panel'; } } });   // tocarlo abre el mapa grande
}// el marcador de arriba: Vida y Café con sus barras; planta, nivel y monedas
function pintaHud(ctx) {
  const h = J.heroe, W = PAN.W;
  ctx.fillStyle = COL.panel; ctx.fillRect(0, 0, W, HUD_H); ctx.fillStyle = COL.borde; ctx.fillRect(0, HUD_H - 1, W, 1);
  const bw = Math.max(50, Math.min(110, Math.floor(W * 0.3)));
  const tv = h.vida + '/' + h.vidaMax, tc = h.cafe + '/' + h.cafeMax;
  barra(ctx, 14, 3, bw, 10, h.vida / h.vidaMax, COL.vida, 'ui_vida', tv);
  barra(ctx, 14, 16, bw, 10, h.cafe / h.cafeMax, COL.cafe, 'ui_cafe', tc);
  const x2 = 14 + bw + 8 + Math.max(anchoTexto(tv), anchoTexto(tc)) + 6;
  if (h.escudoMax) { pintaRejilla(ctx, 'ui_escudo', x2, 5, { escala: 2 }); ctx.fillStyle = '#100a0c'; ctx.fillRect(x2 + 12, 6, 18, 6); ctx.fillStyle = COL.cian; ctx.fillRect(x2 + 13, 7, Math.round(16 * h.escudo / h.escudoMax), 4); }
  // a la derecha: planta y nivel arriba, monedas abajo
  const pl = tr('P.') + J.planta + ' ' + tr('Nv') + h.nivel;
  txt(ctx, pl, W - 4 - anchoTexto(pl), 4, COL.oro);
  const mon = String(h.monedas); txt(ctx, mon, W - 4 - anchoTexto(mon), 17, COL.oro); pintaRejilla(ctx, 'ui_moneda', W - 8 - anchoTexto(mon) - 12, 17, { escala: 2 });
  // la experiencia, una raya fina debajo del marcador
  ctx.fillStyle = '#5a3a8a'; ctx.fillRect(0, HUD_H - 2, Math.round(W * h.xp / xpPara(h.nivel)), 1);
  // los estados, encima del mapa
  let ex = 4;
  if (J.modo !== 'panel') for (const k in h.estados) if (h.estados[k] > 0 && ESTADO_TXT[k]) { const t = tr(ESTADO_TXT[k]) + ' ' + h.estados[k]; txt(ctx, t, ex, HUD_H + 4, ESTADO_COLOR[k]); ex += anchoTexto(t) + 8; }
}
function barra(ctx, x, y, w, h, k, color, icono, t) {
  pintaRejilla(ctx, icono, x - 13, y - 1, { escala: 2 });
  ctx.fillStyle = '#100a0c'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = color; ctx.fillRect(x + 1, y + 1, Math.round((w - 2) * limita(k, 0, 1)), h - 2);
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(x + 1, y + 1, Math.round((w - 2) * limita(k, 0, 1)), 1);
  txt(ctx, t, x + w + 4, y + 1, COL.texto);
}
// el registro: los mensajes más nuevos abajo, partidos en líneas (caben 3)
