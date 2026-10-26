// Fans of Cooking · PINTAR: la cocina en el lienzo (960 de ancho lógico): el suelo y las estaciones con un poco de relieve, los ingredientes,
// los platos, los dos cocineros (dibujos de la serie, con gorro), lo que vuela, el humo, el fuego y las barras de progreso.
'use strict';
const PINTAR = (() => {
  const T = COOK.tile, V = { w: 960, h: 600, ox: 64, oy: COOK.hud };
  const COLOR = { encimera: ['#9aa7c4', '#6f7c9a'], tabla: ['#c99a62', '#8f673a'], fogon: ['#5a5f74', '#3a3e4e'], horno: ['#6b4f3f', '#4a3328'], olla: ['#5a5f74', '#3a3e4e'],
    fregadero: ['#8fc5e8', '#5a8fb3'], platos: ['#9aa7c4', '#6f7c9a'], ventanilla: ['#ffcb3d', '#c9931a'], basura: ['#4d5563', '#2f3540'], extintor: ['#9aa7c4', '#6f7c9a'],
    cinta: ['#3b3f52', '#262938'], cajon: ['#c99a62', '#8f673a'], pared: ['#3a2b52', '#2a1e3c'] };
  const tamano = (w, h) => { V.w = w; V.h = h; V.ox = Math.round((w - 13 * T) / 2); };
  const px = (x, y) => [V.ox + x * T, V.oy + y * T];
  const rr = (c, x, y, w, h, r) => { c.beginPath(); rrPath(c, x, y, w, h, r); };
  const trazo = (c, lw = 2.5) => { c.lineWidth = lw; c.strokeStyle = OL; c.lineJoin = 'round'; c.stroke(); };

  /* ---------- los ingredientes ---------- */
  function ingrediente(c, ing, estado, x, y, s = 1) {
    if (ing === 'sopa') { sopa(c, estado, x, y, s); return; }
    const I = INGREDIENTES[ing]; if (!I) return;
    const quemado = estado === 'quemado', hecho = estado === 'cocinado' || estado === 'horneado';
    let col = I.color, det = I.detalle;
    if (quemado) { col = '#2a2024'; det = '#4a3a3e'; } else if (hecho) { col = sombra(col, 0.72); det = sombra(det, 0.72); }
    c.save(); c.translate(x, y); c.scale(s, s); c.lineJoin = 'round';
    const cortado = estado === 'cortado' || hecho || quemado;
    switch (I.forma) {
      case 'tomate': if (cortado) { for (const dx of [-9, 1, 10]) { c.beginPath(); c.arc(dx, 2, 7, 0, Math.PI * 2); c.fillStyle = col; c.fill(); trazo(c, 2); dot(c, dx, 2, 2.6, det); } } else { c.beginPath(); c.arc(0, 2, 13, 0, Math.PI * 2); c.fillStyle = col; c.fill(); trazo(c); c.beginPath(); c.moveTo(0, -10); c.lineTo(-7, -16); c.lineTo(0, -12); c.lineTo(7, -16); c.closePath(); c.fillStyle = det; c.fill(); trazo(c, 2); } break;
      case 'hoja': if (cortado) { for (const [dx, dy] of [[-8, -2], [4, 4], [8, -5]]) { c.beginPath(); c.ellipse(dx, dy, 7, 5, 0.4, 0, Math.PI * 2); c.fillStyle = col; c.fill(); trazo(c, 2); } } else { c.beginPath(); c.ellipse(0, 0, 15, 11, 0, 0, Math.PI * 2); c.fillStyle = col; c.fill(); trazo(c); line(c, [-10, 0, 10, 0], det, 2.5); } break;
      case 'pan': if (cortado) { rr(c, -14, -4, 28, 8, 3); c.fillStyle = det; c.fill(); trazo(c, 2); rr(c, -14, 4, 28, 8, 3); c.fillStyle = col; c.fill(); trazo(c, 2); } else { rr(c, -15, -8, 30, 20, 9); c.fillStyle = col; c.fill(); trazo(c); line(c, [-8, -1, 8, -1], det, 2.5); } break;
      case 'queso': if (cortado) { for (const dx of [-9, 2, 11]) { rr(c, dx - 5, -5, 10, 10, 2); c.fillStyle = col; c.fill(); trazo(c, 2); dot(c, dx, 0, 1.8, det); } } else { c.beginPath(); c.moveTo(-14, 10); c.lineTo(14, 10); c.lineTo(10, -10); c.closePath(); c.fillStyle = col; c.fill(); trazo(c); dot(c, 2, 4, 2.5, det); dot(c, 7, -1, 1.8, det); } break;
      case 'oval': if (cortado) { for (const dx of [-9, 1, 10]) { c.beginPath(); c.ellipse(dx, 2, 6, 7, 0, 0, Math.PI * 2); c.fillStyle = col; c.fill(); trazo(c, 2); } } else { c.beginPath(); c.ellipse(0, 1, 15, 10, 0, 0, Math.PI * 2); c.fillStyle = col; c.fill(); trazo(c); dot(c, -5, -2, 2, det); dot(c, 5, 3, 2, det); } break;
      case 'disco': c.beginPath(); c.arc(0, 1, 15, 0, Math.PI * 2); c.fillStyle = col; c.fill(); trazo(c); c.beginPath(); c.arc(0, 1, 10, 0, Math.PI * 2); c.strokeStyle = det; c.lineWidth = 2; c.stroke(); break;
      case 'nube': for (const [dx, dy, r] of [[-8, 2, 8], [0, -3, 10], [9, 3, 8]]) { c.beginPath(); c.arc(dx, dy, r, 0, Math.PI * 2); c.fillStyle = col; c.fill(); } c.beginPath(); c.arc(-8, 2, 8, 0, Math.PI * 2); c.arc(0, -3, 10, 0, Math.PI * 2); c.arc(9, 3, 8, 0, Math.PI * 2); trazo(c, 2); break;
      case 'cerezas': line(c, [-6, 2, -2, -12, 6, 2], det, 2.5); dot(c, -7, 5, 6.5, col); dot(c, 7, 5, 6.5, col); c.beginPath(); c.arc(-7, 5, 6.5, 0, Math.PI * 2); trazo(c, 2); c.beginPath(); c.arc(7, 5, 6.5, 0, Math.PI * 2); trazo(c, 2); break;
      case 'hueso': if (cortado) { for (const dx of [-9, 1, 10]) { rr(c, dx - 4, -6, 8, 12, 3); c.fillStyle = col; c.fill(); trazo(c, 2); } } else { rr(c, -12, -3, 24, 6, 3); c.fillStyle = col; c.fill(); trazo(c, 2); for (const sx of [-12, 12]) for (const sy of [-4, 4]) { dot(c, sx, sy, 4.5, col); } c.beginPath(); for (const sx of [-12, 12]) for (const sy of [-4, 4]) { c.moveTo(sx + 4.5, sy); c.arc(sx, sy, 4.5, 0, Math.PI * 2); } trazo(c, 2); } break;
      case 'ojo': c.beginPath(); c.ellipse(0, 0, 14, 9, 0, 0, Math.PI * 2); c.fillStyle = col; c.fill(); trazo(c); dot(c, 2, 0, 5.5, det); dot(c, 3, 0, 2.5, OL); dot(c, 4.5, -1.5, 1, '#fff'); break;
      case 'granos': for (const [dx, dy] of [[-8, -3], [2, -6], [8, 3], [-3, 5]]) { c.beginPath(); c.ellipse(dx, dy, 5.5, 4, 0.6, 0, Math.PI * 2); c.fillStyle = col; c.fill(); trazo(c, 1.8); line(c, [dx - 2, dy + 2, dx + 2, dy - 2], det, 1.5); } break;
      case 'fideos': rr(c, -12, -6, 24, 14, 4); c.fillStyle = col; c.fill(); trazo(c, 2); for (const dx of [-7, -2, 3, 8]) line(c, [dx, -4, dx, 6], det, 1.6); break;
      default: c.beginPath(); c.arc(0, 0, 12, 0, Math.PI * 2); c.fillStyle = col; c.fill(); trazo(c);
    }
    c.restore();
  }
  function sopa(c, estado, x, y, s) {
    const n = (estado || '').split('+'), I = INGREDIENTES[n[0]], col = estado === 'quemado' ? '#2a2024' : I ? I.color : '#e0a95c';
    c.save(); c.translate(x, y); c.scale(s, s);
    c.beginPath(); c.ellipse(0, 4, 17, 8, 0, 0, Math.PI); c.lineTo(-17, 4); c.closePath(); c.fillStyle = '#f4f0ff'; c.fill(); trazo(c, 2);
    c.beginPath(); c.ellipse(0, 4, 17, 7, 0, 0, Math.PI * 2); c.fillStyle = '#f4f0ff'; c.fill(); trazo(c, 2);
    c.beginPath(); c.ellipse(0, 4, 13, 5, 0, 0, Math.PI * 2); c.fillStyle = col; c.fill(); trazo(c, 1.6);
    if (estado !== 'quemado') for (const [dx, dy] of [[-5, 3], [4, 5], [1, 2]]) dot(c, dx, dy, 1.6, 'rgba(255,255,255,.6)');
    c.restore();
  }
  function sombra(hex, k) { const n = parseInt(hex.slice(1), 16); const r = (n >> 16) * k, g = ((n >> 8) & 255) * k, b = (n & 255) * k; return `rgb(${r | 0},${g | 0},${b | 0})`; }

  function item(c, it, x, y, s = 1) {
    if (!it) return;
    if (it.tipo === 'extintor') { c.save(); c.translate(x, y); c.scale(s, s); rr(c, -7, -16, 14, 30, 5); c.fillStyle = '#e53935'; c.fill(); trazo(c, 2.2); rr(c, -4, -22, 8, 7, 2); c.fillStyle = '#20102c'; c.fill(); line(c, [4, -18, 12, -8], OL, 3); c.restore(); return; }
    if (it.tipo === 'ing') { ingrediente(c, it.ing, it.estado, x, y, s); return; }
    if (it.tipo === 'monton') { it.ings.forEach(([n, e], i) => ingrediente(c, n, e, x + (i - (it.ings.length - 1) / 2) * 6 * s, y - i * 5 * s, s * 0.78)); return; }
    if (it.tipo === 'plato') {
      c.save(); c.translate(x, y); c.scale(s, s);
      c.beginPath(); c.ellipse(0, 4, 22, 12, 0, 0, Math.PI * 2); c.fillStyle = it.sucio ? '#b9a98f' : '#fff'; c.fill(); trazo(c, 2.4);
      c.beginPath(); c.ellipse(0, 4, 15, 7.5, 0, 0, Math.PI * 2); c.strokeStyle = it.sucio ? '#8a7a60' : '#cdd6ea'; c.lineWidth = 1.8; c.stroke();
      if (it.sucio) { dot(c, -6, 2, 3, '#6a5a40'); dot(c, 5, 6, 2.5, '#6a5a40'); }
      c.restore();
      it.ings.forEach(([n, e], i) => ingrediente(c, n, e, x + (i - (it.ings.length - 1) / 2) * 7 * s, y - 2 * s - i * 3 * s, s * 0.68));
    }
  }

  /* ---------- la cocina ---------- */
  function casilla(c, t, tiempo) {
    const [x, y] = px(t.x, t.y);
    if (t.t === 'vacio') return;
    if (t.t === 'suelo') { c.fillStyle = (t.x + t.y) % 2 ? '#3f2f5e' : '#463566'; c.fillRect(x, y, T, T); return; }
    if (t.t === 'pared') { c.fillStyle = '#2a1e3c'; c.fillRect(x, y, T, T); c.fillStyle = '#3a2b52'; c.fillRect(x, y, T, T - 12); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1; c.strokeRect(x + 0.5, y + 0.5, T - 1, T - 13); return; }
    const [top, front] = COLOR[t.t] || COLOR.encimera;
    c.fillStyle = front; rr(c, x + 2, y + 10, T - 4, T - 10, 6); c.fill(); trazo(c, 2);
    c.fillStyle = top; rr(c, x + 2, y + 2, T - 4, T - 18, 6); c.fill(); trazo(c, 2);
    const cx = x + T / 2, cy = y + 24;
    switch (t.t) {
      case 'tabla': rr(c, x + 10, y + 8, T - 20, 30, 4); c.fillStyle = '#e2b67c'; c.fill(); trazo(c, 2); if (!t.item) { line(c, [x + 40, y + 12, x + 46, y + 30], '#cfd8e8', 3); } break;
      case 'fogon': c.beginPath(); c.arc(cx, cy, 20, 0, Math.PI * 2); c.fillStyle = t.apagado ? '#2a2d3a' : '#20102c'; c.fill(); trazo(c, 2); c.beginPath(); c.arc(cx, cy, 15, 0, Math.PI * 2); c.fillStyle = t.apagado ? '#3a3e4e' : (t.item ? '#ff7a1a' : '#ff5a1a'); c.fill(); if (!t.apagado) { c.beginPath(); c.arc(cx, cy, 9, 0, Math.PI * 2); c.fillStyle = '#ffcb3d'; c.fill(); }
        // la sartén
        c.beginPath(); c.arc(cx, cy, 17, 0, Math.PI * 2); c.fillStyle = '#4a4f63'; c.fill(); trazo(c, 2); c.beginPath(); c.arc(cx, cy, 13, 0, Math.PI * 2); c.fillStyle = '#2b2e3b'; c.fill(); line(c, [cx + 15, cy - 6, cx + 30, cy - 14], OL, 5); break;
      case 'olla': c.beginPath(); c.arc(cx, cy, 20, 0, Math.PI * 2); c.fillStyle = t.apagado ? '#2a2d3a' : '#20102c'; c.fill(); trazo(c, 2); rr(c, cx - 19, cy - 14, 38, 32, 8); c.fillStyle = '#6a7090'; c.fill(); trazo(c, 2); c.beginPath(); c.ellipse(cx, cy - 12, 19, 7, 0, 0, Math.PI * 2); c.fillStyle = '#3a3e52'; c.fill(); trazo(c, 2);
        if (t.ings.length && !t.item) { c.beginPath(); c.ellipse(cx, cy - 12, 14, 4.5, 0, 0, Math.PI * 2); c.fillStyle = INGREDIENTES[t.ings[0][0]].color; c.fill(); } for (const sx of [-24, 24]) line(c, [cx + sx * 0.8, cy, cx + sx, cy], OL, 5); break;
      case 'horno': rr(c, x + 8, y + 6, T - 16, 34, 5); c.fillStyle = '#2b2026'; c.fill(); trazo(c, 2); rr(c, x + 13, y + 11, T - 26, 22, 3); c.fillStyle = t.apagado ? '#3a3238' : (t.item ? '#ff8a3a' : '#7a3d2a'); c.fill(); trazo(c, 1.6); for (const dx of [16, 48]) dot(c, x + dx, y + 44, 3.5, '#ffcb3d'); break;
      case 'fregadero': rr(c, x + 8, y + 8, T - 16, 30, 6); c.fillStyle = '#3b7aa6'; c.fill(); trazo(c, 2); c.beginPath(); c.ellipse(cx, cy, 20, 10, 0, 0, Math.PI * 2); c.fillStyle = '#7fd0ff'; c.fill(); line(c, [cx + 18, y + 6, cx + 18, y - 4, cx + 8, y - 4], OL, 4);
        for (let i = 0; i < Math.min(4, t.sucios); i++) item(c, { tipo: 'plato', ings: [], sucio: true }, x + 16, y + 20 - i * 4, 0.55); for (let i = 0; i < Math.min(4, t.limpios); i++) item(c, { tipo: 'plato', ings: [], sucio: false }, x + 48, y + 20 - i * 4, 0.55); break;
      case 'platos': for (let i = 0; i < Math.min(5, t.platos); i++) item(c, { tipo: 'plato', ings: [], sucio: false }, cx, cy + 4 - i * 4, 0.9); break;
      case 'ventanilla': rr(c, x + 6, y + 4, T - 12, 34, 6); c.fillStyle = '#20102c'; c.fill(); rr(c, x + 10, y + 8, T - 20, 26, 4); c.fillStyle = '#fff1c2'; c.fill(); trazo(c, 1.6); otxt(c, 'SERVIR', cx, y + 21, 13, '#ff7a1a'); break;
      case 'basura': rr(c, cx - 15, y + 8, 30, 32, 4); c.fillStyle = '#2f3540'; c.fill(); trazo(c, 2); rr(c, cx - 18, y + 4, 36, 8, 3); c.fillStyle = '#4d5563'; c.fill(); trazo(c, 2); for (const dx of [-7, 0, 7]) line(c, [cx + dx, y + 16, cx + dx, y + 34], '#20102c', 2); break;
      case 'extintor': rr(c, x + 14, y + 6, T - 28, 32, 4); c.fillStyle = '#ffd6d6'; c.fill(); trazo(c, 2); if (!t.item) otxt(c, 'VACÍO', cx, cy, 11, '#e53935'); break;
      case 'cinta': { const [dx, dy] = t.dir, f = (tiempo * 60) % 20; for (let i = -1; i < 4; i++) { const k = (i * 20 + f) - 20, ax = cx + dx * k, ay = cy + 2 + dy * k; if (Math.abs(ax - cx) > 26 || Math.abs(ay - cy - 2) > 20) continue; c.beginPath(); c.moveTo(ax - dy * 10 - dx * 6, ay + dx * 10 - dy * 6); c.lineTo(ax + dx * 6, ay + dy * 6); c.lineTo(ax + dy * 10 - dx * 6, ay - dx * 10 - dy * 6); c.strokeStyle = '#7f86a8'; c.lineWidth = 3; c.lineCap = 'round'; c.stroke(); } break; }
      case 'cajon': { rr(c, x + 8, y + 6, T - 16, 32, 5); c.fillStyle = '#b07a3e'; c.fill(); trazo(c, 2); line(c, [x + 14, y + 22, x + 50, y + 22], '#8f5e2a', 2); ingrediente(c, t.ing, 'crudo', cx, cy - 2, 0.8); break; }
      default: break;
    }
  }
  function progreso(c, t, k) {
    const [x, y] = px(t.x, t.y); if (!(k > 0 && k < 1)) return;
    rr(c, x + 10, y - 10, T - 20, 9, 4); c.fillStyle = 'rgba(20,10,30,.85)'; c.fill(); trazo(c, 1.5);
    rr(c, x + 11.5, y - 8.5, (T - 23) * k, 6, 3); c.fillStyle = k > 0.8 ? '#ff5a1a' : '#9be58a'; c.fill();
  }
  function cocineroPinta(c, k, tiempo, activo, solo) {
    const sp = SPR[k.key]; const esc = sp ? 72 / sp.ht : 1, bote = Math.abs(Math.sin(k.anda)) * 3, x = V.ox + k.x, y = V.oy + k.y + 10 - bote;
    c.save(); c.globalAlpha = 0.35; c.beginPath(); c.ellipse(x, V.oy + k.y + 12, 20, 8, 0, 0, Math.PI * 2); c.fillStyle = '#000'; c.fill(); c.restore();
    if (solo && activo) { c.beginPath(); c.moveTo(x, y - 86); c.lineTo(x - 9, y - 100); c.lineTo(x + 9, y - 100); c.closePath(); c.fillStyle = k.color; c.fill(); trazo(c, 2); }
    if (sp) { c.save(); c.translate(x, y); c.scale(esc * (k.fx < 0 ? -1 : 1), esc); c.drawImage(sp.c, -sp.ax, -sp.ay, sp.wd, sp.ht); c.restore(); }
    else { c.beginPath(); c.arc(x, y - 28, 22, 0, Math.PI * 2); c.fillStyle = k.color; c.fill(); trazo(c); }
    // el gorro de cocina y el delantal del color del jugador
    const gy = y - (sp ? sp.ay * esc : 50) + 2; c.save(); c.translate(x, gy); rr(c, -13, -4, 26, 9, 3); c.fillStyle = '#fff'; c.fill(); trazo(c, 2); c.beginPath(); c.arc(-7, -8, 8, 0, Math.PI * 2); c.arc(7, -8, 8, 0, Math.PI * 2); c.arc(0, -13, 9, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill(); c.beginPath(); c.moveTo(-13, -4); c.arc(-7, -8, 8, Math.PI * 0.9, Math.PI * 1.6); c.arc(0, -13, 9, Math.PI * 1.15, Math.PI * 1.85); c.arc(7, -8, 8, Math.PI * 1.4, Math.PI * 2.1); c.lineTo(13, -4); trazo(c, 2); c.restore();
    c.fillStyle = k.color; rr(c, x - 7, y - 30, 14, 10, 3); c.fill(); trazo(c, 1.5);
    if (k.item) item(c, k.item, x + k.fx * 22, y - 26 + (k.fy > 0 ? 10 : k.fy < 0 ? -14 : 0), 0.85);
  }
  function fuego(c, t, tiempo) {
    const [x, y] = px(t.x, t.y), cx = x + T / 2;
    for (let i = 0; i < 4; i++) { const f = (tiempo * 3 + i * 0.7) % 1, h = 22 + 14 * Math.sin(tiempo * 9 + i); c.beginPath(); c.moveTo(cx - 16 + i * 10, y + 30); c.quadraticCurveTo(cx - 20 + i * 10, y + 30 - h / 2, cx - 11 + i * 10 + Math.sin(tiempo * 7 + i) * 4, y + 30 - h); c.quadraticCurveTo(cx - 2 + i * 10, y + 30 - h / 2, cx - 6 + i * 10, y + 30); c.closePath(); c.fillStyle = i % 2 ? '#ff7a1a' : '#ffcb3d'; c.globalAlpha = 0.85 + 0.15 * f; c.fill(); c.globalAlpha = 1; trazo(c, 1.8); }
  }
  function humo(c, t, tiempo, k) {
    const [x, y] = px(t.x, t.y), cx = x + T / 2;
    for (let i = 0; i < 3; i++) { const f = ((tiempo * 0.7 + i * 0.33) % 1); c.globalAlpha = (1 - f) * 0.55 * k; c.beginPath(); c.arc(cx + Math.sin(tiempo * 2 + i) * 8, y + 10 - f * 40, 7 + f * 10, 0, Math.PI * 2); c.fillStyle = '#9aa0b4'; c.fill(); }
    c.globalAlpha = 1;
  }
  // el cliente de la planta (su jefe) come al otro lado de la ventanilla y reacciona a lo que le sirves
  let reac = null;
  function reaccion(texto, color) { reac = { texto, color, t: 0 }; }
  function cliente(c, P, dt, tiempo) {
    const sp = SPR[P.rango.jefe]; if (!sp) return;
    if (reac) { reac.t += dt; if (reac.t > 1.8) reac = null; }
    for (const f of P.tiles) for (const t of f) if (t.t === 'ventanilla') {
      const [x, y] = px(t.x + 1, t.y), cx = x + T / 2, pie = y + T - 4, esc = Math.min(58 / sp.wd, 68 / sp.ht), bob = Math.sin(tiempo * 3) * 2;
      c.save(); c.translate(cx, pie + bob); c.scale(-esc, esc); c.drawImage(sp.c, -sp.ax, -sp.ay, sp.wd, sp.ht); c.restore();
      if (reac) {   // el bocadillo
        const u = reac.t / 1.8; c.save(); c.globalAlpha = 1 - Math.max(0, u - 0.7) / 0.3; c.font = '800 13px "Baloo 2", system-ui, sans-serif';
        const w = c.measureText(reac.texto).width + 18, bx = Math.min(V.w - w - 4, cx - w / 2), by = y - 30 - u * 8;
        rr(c, bx, by, w, 24, 8); c.fillStyle = '#fff'; c.fill(); trazo(c, 2.5);
        c.fillStyle = reac.color || '#20102c'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(reac.texto, bx + w / 2, by + 12); c.restore();
      }
    }
  }
  // el hueco del ascensor: la cabina sube por un pozo oscuro con cables y marcas de planta que bajan
  function pozo(c, P, tiempo) {
    const x0 = V.ox + 3 * T, x1 = V.ox + 10 * T, y0 = V.oy - 8, h = P.alto * T + 20;
    c.fillStyle = '#0d0a16'; c.fillRect(0, y0, V.w, h);
    c.strokeStyle = '#2a2240'; c.lineWidth = 6; for (const x of [x0 - 22, x1 + 22]) { c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y0 + h); c.stroke(); }
    const des = (tiempo * 90) % 160; c.fillStyle = '#1e1830';
    for (let y = y0 - 160 + des; y < y0 + h; y += 160) { c.fillRect(0, Math.max(y0, y), x0 - 40, Math.min(6, y0 + h - Math.max(y0, y))); c.fillRect(x1 + 40, Math.max(y0, y), V.w - x1 - 40, Math.min(6, y0 + h - Math.max(y0, y))); }
    c.strokeStyle = '#555'; c.lineWidth = 3; for (const x of [x0 + 2 * T, x1 - 2 * T]) { c.beginPath(); c.moveTo(x, y0); c.lineTo(x, V.oy); c.stroke(); }
  }
  function frame(c, P, dt, tiempo) {
    c.fillStyle = '#1b1130'; c.fillRect(0, 0, V.w, V.h);
    const fondo = c.createLinearGradient(0, V.oy, 0, V.oy + P.alto * T); fondo.addColorStop(0, '#2a1e3c'); fondo.addColorStop(1, '#1b1130'); c.fillStyle = fondo; c.fillRect(0, V.oy - 8, V.w, P.alto * T + 20);
    if (P.nivel.ascensor) pozo(c, P, tiempo);
    for (const f of P.tiles) for (const t of f) casilla(c, t, tiempo);
    cliente(c, P, dt, tiempo);
    if (P.nivel.ascensor) otxt(c, tr('PLANTA {n}', { n: P.nivel.ri + 1 }), V.ox + 1.5 * T, V.oy + 30, 16, '#7fd0ff');
    // la casilla que tiene delante cada cocinero
    for (const k of P.cocineros) { if (P.modo !== 'dobles' && k.i !== P.activo) continue; const t = PARTIDA.delante(k); if (!t) continue; const [x, y] = px(t.x, t.y); c.save(); c.strokeStyle = k.color; c.lineWidth = 3; c.globalAlpha = 0.9; rr(c, x + 3, y + 3, T - 6, T - 6, 7); c.stroke(); c.restore(); }
    // lo que hay encima de cada casilla, los cocineros y lo que vuela, de arriba abajo
    const capas = [];
    for (const f of P.tiles) for (const t of f) if (t.item && t.t !== 'extintor' && t.t !== 'cajon') capas.push({ y: t.y * T + (t.t === 'suelo' ? 40 : 10), f: () => { const [x, y] = px(t.x, t.y); item(c, t.item, x + T / 2, y + (t.t === 'suelo' ? 38 : 20), t.t === 'suelo' ? 0.8 : 0.95); } });
    for (const k of P.cocineros) capas.push({ y: k.y + 8, f: () => cocineroPinta(c, k, tiempo, k.i === P.activo, P.modo === 'solo') });
    for (const v of P.vuelos) { v.t += dt; const u = Math.min(1, v.t / v.dur), x = lerp(v.x0, v.x1, u) + V.ox, y = lerp(v.y0, v.y1, u) + V.oy - Math.sin(u * Math.PI) * 50; capas.push({ y: 9999, f: () => item(c, v.it, x, y, 0.9) }); }
    P.vuelos = P.vuelos.filter(v => v.t < v.dur);
    capas.sort((a, b) => a.y - b.y).forEach(l => l.f());
    for (const f of P.tiles) for (const t of f) {
      if (t.fuego) fuego(c, t, tiempo); else if (t.humo > 0) humo(c, t, tiempo, Math.min(1, t.humo / COOK.fuego.aviso + 0.3));
      if (t.t === 'fogon' || t.t === 'horno' || t.t === 'olla') { const it = t.item, T0 = COOK.tiempos; if (t.apagado) otxt(c, 'APAGADO', px(t.x, t.y)[0] + T / 2, px(t.x, t.y)[1] - 6, 12, '#7fd0ff'); else if (it && it.estado !== 'quemado' && (it.estado === 'crudo' || it.estado === 'cortado' || (t.t === 'olla' && it.ing === 'sopa' && false))) progreso(c, t, t.prog / (t.t === 'fogon' ? T0.sarten : T0.horno)); else if (it && (it.estado === 'cocinado' || it.estado === 'horneado' || (it.ing === 'sopa' && it.estado !== 'quemado'))) { const k = t.prog / (t.t === 'olla' ? T0.quemar * 1.6 : T0.quemar); if (k > 0.45) { const [x, y] = px(t.x, t.y); otxt(c, '¡SACA!', x + T / 2, y - 6, 12, Math.sin(tiempo * 12) > 0 ? '#ff5a1a' : '#ffcb3d'); } } else if (t.t === 'olla' && t.ings.length && !it) progreso(c, t, t.prog / T0.olla); }
      else if (t.prog > 0 && t.prog < 1) progreso(c, t, t.prog);
    }
  }
  // el fondo de las pantallas: una cocina vacía a media luz
  let fondoTiles = null;
  function fondo(c, tiempo) {
    if (!fondoTiles) fondoTiles = PARTIDA.construye(RANGOS[3].niveles[2].mapa).tiles;
    c.fillStyle = '#1b1130'; c.fillRect(0, 0, V.w, V.h);
    for (const f of fondoTiles) for (const t of f) casilla(c, t, tiempo);
    c.fillStyle = 'rgba(21,11,33,.72)'; c.fillRect(0, 0, V.w, V.h);
  }
  return { frame, fondo, tamano, item, ingrediente, V , reaccion };
})();
