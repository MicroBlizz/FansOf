// Fans of Basement · Tus compañeros (solo pantalla, pestaña BICHOS de la mesa): arriba, los dos huecos con los bichos que bajan
// contigo; debajo, cada especie del terrario con su nivel. Tocar una abre su ficha: sus cinco talentos (uno por nivel), lo que cuesta
// subirla, LLEVAR o DEJAR y el accesorio que lleva. La pestaña BICHOS también tiene el CATÁLOGO (mesa-campana.js). Las reglas, en
// companeros.js; los accesorios se fabrican en el taller y aquí se dibujan con código (UI.pintaAccesorio).
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const UI = B.ui, C = UI.C, T = UI.texto, V = () => B.vista, VERDE = '#2e6a2a';
  const ESC = { reunion: 0.55, critico: 0.75 };   // los grandes, más pequeños en los cuadros

  // ---------- los accesorios, dibujados con código (contorno grueso) ----------
  const LINEA = '#1a1a1a';
  const ACC = {
    collar(g, s) {
      g.lineWidth = 6 * s; g.strokeStyle = LINEA; g.beginPath(); g.arc(0, 0, 16 * s, 0, 7); g.stroke();
      g.lineWidth = 3.5 * s; g.strokeStyle = '#8a2a1a'; g.stroke();
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4, x = Math.cos(a), y = Math.sin(a);
        g.fillStyle = '#d8d8e0'; g.beginPath(); g.moveTo(x * 17 * s - y * 4 * s, y * 17 * s + x * 4 * s); g.lineTo(x * 27 * s, y * 27 * s); g.lineTo(x * 17 * s + y * 4 * s, y * 17 * s - x * 4 * s); g.closePath();
        g.fill(); g.lineWidth = 2 * s; g.strokeStyle = LINEA; g.stroke();
      }
    },
    pila(g, s) {
      UI.panel(g, -12 * s, -22 * s, 24 * s, 44 * s, '#1f1f24', null, null, 3 * s);
      UI.panel(g, -12 * s, -22 * s, 24 * s, 14 * s, '#c87a2a', null, null, 3 * s);
      UI.panel(g, -5 * s, -28 * s, 10 * s, 7 * s, '#d8d8e0', null, null, 2 * s);
      T(g, '+', 0, 6 * s, 20 * s, C.oro, 'center', 0);
    },
    gafas(g, s) {
      g.fillStyle = '#3a3a48'; g.fillRect(-28 * s, -4 * s, 56 * s, 6 * s);
      UI.panel(g, -22 * s, -14 * s, 44 * s, 26 * s, '#2a2a34', null, null, 3 * s);
      g.fillStyle = '#4fc2e8'; g.fillRect(-17 * s, -9 * s, 15 * s, 13 * s); g.fillRect(2 * s, -9 * s, 15 * s, 13 * s);
    },
    corbata(g, s) {
      g.beginPath(); g.moveTo(-7 * s, -24 * s); g.lineTo(7 * s, -24 * s); g.lineTo(4 * s, -15 * s); g.lineTo(11 * s, 18 * s); g.lineTo(0, 27 * s); g.lineTo(-11 * s, 18 * s); g.lineTo(-4 * s, -15 * s); g.closePath();
      g.fillStyle = '#e8413a'; g.fill(); g.lineWidth = 3.5 * s; g.strokeStyle = LINEA; g.stroke();
      g.fillStyle = C.oro; g.fillRect(-3 * s, -3 * s, 6 * s, 6 * s);
    },
  };
  UI.pintaAccesorio = function (g, id, x, y, s) { g.save(); g.translate(x, y); g.lineJoin = 'round'; ACC[id](g, s || 1); g.restore(); };

  // lo que hace un talento o un accesorio, en frases
  const BALA = {
    lento: () => 'Frena a los bichos que muerde', atraviesa: (n) => 'Atraviesa a {n} bichos', balas: (n) => 'Dispara {n} a la vez',
    area: () => 'Explota al dar', rebotes: (n) => 'Rebota {n} veces', abanico: null,
  };
  function frases(t) {
    const out = UI.describe(t.ef || {});
    for (const [k, v] of Object.entries(t.bala || {})) if (BALA[k]) out.push(tr(BALA[k](v), { n: v }));
    for (const f of UI.describe(t.aura || {})) out.push(tr('A ti: {f}', { f }));
    return out;
  }
  UI.frasesCompanero = frases;

  function pintaBicho(g, id, x, y, k, sombra) {
    const d = V().DIBUJO[id], esc = (ESC[id] || 1) * k;   // en sombra, sin el color propio de la especie (dorado, spam...)
    if (sombra) V().pinta(g, d[0], x, y, d[1] * esc, { filtro: 'brightness(0)', alfa: 0.5 }); else V().pintaCosa(g, id, x, y, null, esc);
  }

  // ---------- la pestaña ----------
  const SUB = [{ id: 'companeros', nombre: 'COMPAÑEROS' }, { id: 'catalogo', nombre: 'CATÁLOGO' }];
  UI.pestanaBichos = function (g, W, H, AJ, p, botones, m) {
    const { y0 } = UI.zonaMesa(H), w = (W - 36) / 2, sub = m.bichos || 'companeros';
    SUB.forEach((s, i) => {
      const b = { x: 12 + i * (w + 12), y: y0, w, h: 46, accion: 'subBichos', id: s.id };
      UI.boton(g, b, sub === s.id ? 'verde' : 'apagado', tr(s.nombre), 20);
      botones.push(b);
    });
    if (sub === 'catalogo') UI.pestanaCatalogo(g, W, H, AJ, p, botones, 56);
    else companeros(g, W, H, AJ, p, botones, y0 + 58);
  };

  // los dos huecos y la rejilla de especies
  function companeros(g, W, H, AJ, p, botones, y) {
    const { y1 } = UI.zonaMesa(H), K = AJ.companeros, wh = (W - 36) / 2;
    for (let i = 0; i < K.huecos; i++) {
      const b = { x: 12 + i * (wh + 12), y, w: wh, h: 112 }, id = p.compEquipados[i];
      UI.panel(g, b.x, b.y, b.w, b.h, id ? '#2f7d4f' : '#2a1830', null, null, 4);
      if (!id) { UI.lineas(g, tr('Hueco libre: toca un bicho para llevarlo'), b.x + b.w / 2, b.y + 40, 16, b.w - 24, '#b8a8c8', 'center', 0, 19); continue; }
      pintaBicho(g, id, b.x + 52, b.y + 56, 1);
      UI.textoCabe(g, UI.nombreBicho(AJ, id), b.x + 96, b.y + 38, 17, b.w - 104, '#ffffff', 'left', 3);
      T(g, tr('Nv') + ' ' + B.nivelCompanero(AJ, p, id), b.x + 96, b.y + 66, 22, C.oro, 'left', 3);
      if (p.accComp[id]) UI.pintaAccesorio(g, p.accComp[id], b.x + b.w - 28, b.y + 82, 0.6);
      botones.push({ ...b, accion: 'companero', id });
    }
    const ids = Object.keys(K.especies), cols = 3, cw = (W - 24 - (cols - 1) * 10) / cols, ya = y + 126;
    const ch = Math.min(190, Math.floor((y1 - ya) / Math.ceil(ids.length / cols)) - 10);
    ids.forEach((id, i) => celda(g, AJ, p, id, { x: 12 + (i % cols) * (cw + 10), y: ya + Math.floor(i / cols) * (ch + 10), w: cw, h: ch }, botones));
  }

  function celda(g, AJ, p, id, b, botones) {
    const n = B.nivelCompanero(AJ, p, id), lleva = p.compEquipados.includes(id);
    UI.cuadroRareza(g, b, n ? C.perg : '#3a2e48', (cx, cy) => pintaBicho(g, id, cx, cy - 22, 0.9, !n), lleva);
    UI.textoCabe(g, n ? UI.nombreBicho(AJ, id) : '???', b.x + b.w / 2, b.y + b.h - 44, 15, b.w - 14, n ? C.cafe : '#8a7a68', 'center', 0);
    if (!n) { UI.textoCabe(g, tr('Captúralo con la RED'), b.x + b.w / 2, b.y + b.h - 20, 13, b.w - 14, '#8a7a68', 'center', 0); return; }
    estrellas(g, n, b.x + b.w / 2, b.y + b.h - 20, 9);
    T(g, 'x' + (p.terrario[id] || 0), b.x + b.w - 8, b.y + 18, 15, '#8a5a24', 'right', 0);
    botones.push({ ...b, accion: 'companero', id });
  }

  // el nivel, en cinco cuadraditos (dorados los que tiene)
  function estrellas(g, n, cx, cy, r) {
    for (let i = 0; i < 5; i++) UI.panel(g, cx + (i - 2) * (r * 2 + 4) - r, cy - r, r * 2, r * 2, i < n ? C.oro : '#6a5a48', null, null, 2);
  }

  // ---------- la ficha de un compañero ----------
  UI.fichaCompanero = function (g, W, H, AJ, p, id) {
    g.fillStyle = 'rgba(10,5,20,0.82)'; g.fillRect(0, 0, W, H);
    const x = 16, w = W - 32, alto = Math.min(H - 40, 860), y = (H - alto) / 2, n = B.nivelCompanero(AJ, p, id), botones = [];
    UI.pergamino(g, x, y, w, alto);
    pintaBicho(g, id, x + 70, y + 70, 1.3);
    UI.textoCabe(g, UI.nombreBicho(AJ, id), x + 130, y + 50, 26, w - 150, C.cafe, 'left', 0);
    estrellas(g, n, x + 190, y + 92, 10);
    T(g, tr('{n} en el terrario', { n: p.terrario[id] || 0 }), x + w - 20, y + 92, 15, '#8a5a24', 'right', 0);
    let yy = y + 140;
    for (const t of B.talentosCompanero(AJ, id)) { talento(g, t, n, x + 16, yy, w - 32); yy += 62; }
    yy += 6;
    yy = subir(g, AJ, p, id, n, x, yy, w, botones);
    yy = accesorios(g, AJ, p, id, x, yy + 10, w, botones);
    const lleva = p.compEquipados.includes(id), bl = { x: x + 20, y: y + alto - 88, w: w / 2 - 30, h: 68, accion: 'llevarComp', id };
    const lleno = !lleva && p.compEquipados.length >= AJ.companeros.huecos;
    UI.boton(g, bl, lleva ? 'rojo' : lleno ? 'apagado' : 'verde', tr(lleva ? 'DEJAR' : 'LLEVAR'), 26);
    if (!lleno) botones.push(bl);
    if (lleno) UI.textoCabe(g, tr('Deja otro antes'), bl.x + bl.w / 2, bl.y - 12, 14, bl.w, C.rojo, 'center', 0);
    const cerrar = { x: W / 2 + 10, y: bl.y, w: w / 2 - 30, h: 68, accion: 'cerrarComp' };
    UI.boton(g, cerrar, 'azul', tr('CERRAR'), 26);
    return [...botones, cerrar, { x: 0, y: 0, w: W, h: H, accion: 'cerrarComp' }];   // tocar fuera también cierra (va el último)
  };

  // un talento: el número de su nivel, su nombre y lo que hace (verde si lo tiene, gris si aún no)
  function talento(g, t, n, x, y, w) {
    const tiene = t.nivel <= n;
    UI.panel(g, x, y, 44, 52, tiene ? C.oro : '#b8a47c', null, null, 3);
    T(g, String(t.nivel), x + 22, y + 26, 24, tiene ? C.cafe : '#6a5a48', 'center', 0);
    UI.textoCabe(g, tr(t.nombre), x + 56, y + 14, 18, w - 60, tiene ? C.cafe : '#8a7a68', 'left', 0);
    const f = t.nivel === 1 ? [tr('Baja contigo y dispara solo')] : frases(t);
    UI.textoCabe(g, f.join(' · '), x + 56, y + 38, 15, w - 60, tiene ? VERDE : '#8a7a68', 'left', 0);
  }

  // lo que cuesta el siguiente nivel y el botón de SUBIR (o «nivel máximo»)
  function subir(g, AJ, p, id, n, x, y, w, botones) {
    if (n >= 5) { UI.franja(g, tr('Nivel máximo'), x + w / 2, y + 26, 18, w - 40); return y + 56; }
    const c = B.costeSubirCompanero(AJ, n), falta = B.faltaMaterial(p, c.materiales), tiene = p.terrario[id] || 0;
    UI.franja(g, tr('SUBIR AL NIVEL {n}', { n: n + 1 }), x + w / 2, y + 8, 16, w - 40);
    const lista = [['cap', c.capturas], ...Object.entries(c.materiales)], paso = (w - 200) / lista.length;
    lista.forEach(([t, k], i) => {
      const cx = x + 20 + paso * i + paso / 2, ok = t === 'cap' ? tiene >= k : !falta[t];
      if (t === 'cap') pintaBicho(g, id, cx, y + 44, 0.45); else V().pintaCosa(g, t, cx, y + 44, null, 1);
      T(g, (t === 'cap' ? tiene : p.materiales[t] || 0) + '/' + k, cx, y + 78, 16, ok ? VERDE : C.rojo, 'center', 0);
    });
    const puede = tiene >= c.capturas && !Object.keys(falta).length, b = { x: x + w - 176, y: y + 26, w: 156, h: 62, accion: 'subirComp', id };
    UI.boton(g, b, puede ? 'naranja' : 'apagado', tr('SUBIR'), 24);
    if (puede) botones.push(b);
    return y + 96;
  }

  // los accesorios: los que tienes fabricados (tocar uno se lo pone; tocar el que lleva, se lo quita)
  function accesorios(g, AJ, p, id, x, y, w, botones) {
    UI.franja(g, tr('ACCESORIO (se fabrican en el TALLER)'), x + w / 2, y + 8, 16, w - 40);
    const ids = Object.keys(AJ.accesorios), lado = 74, hueco = (w - 40 - ids.length * lado) / (ids.length - 1), puesto = p.accComp[id];
    ids.forEach((a, i) => {
      const b = { x: x + 20 + i * (lado + hueco), y: y + 26, w: lado, h: lado }, libre = B.accesorioLibre(p, a, id);
      UI.cuadroRareza(g, b, libre || puesto === a ? '#d9c8a4' : '#3a2e48', (cx, cy) => UI.pintaAccesorio(g, a, cx, cy, 0.9), puesto === a);
      T(g, String(p.accesorios[a] || 0), b.x + b.w - 6, b.y + b.h - 10, 15, '#ffffff', 'right', 3);
      if (libre || puesto === a) botones.push({ ...b, accion: 'accComp', id, acc: puesto === a ? null : a });
    });
    const d = AJ.accesorios[puesto];
    UI.textoCabe(g, d ? tr(d.nombre) + ': ' + frases(d).join(' · ') : tr('No lleva nada'), x + w / 2, y + lado + 44, 15, w - 40, d ? VERDE : '#8a7a68', 'center', 0);
    return y + lado + 60;
  }
})(BAS);
