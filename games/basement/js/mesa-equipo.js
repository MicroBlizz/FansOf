// Fans of Basement · Tu mesa: pestañas EQUIPO y PAQUETES, y la apertura de un paquete (solo pantalla, estilo Swipe). En EQUIPO,
// los tres huecos (teclado, auriculares y silla) con la pieza puesta y las cuatro de cada rareza (tócalas para ponértelas si las
// tienes), y las mascotas con su nivel. En PAQUETES, el paquete de mensajería (se compra) y el del jefe (lo sueltan los jefes),
// siempre con sus probabilidades a la vista. Al abrir uno, el paquete tiembla, se abre con rayos del color de la rareza y enseña el premio.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const UI = B.ui, C = UI.C, T = UI.texto, V = () => B.vista;
  const HUECO = { teclado: 'TECLADO', auriculares: 'AURICULARES', silla: 'SILLA' };
  const DIBUJO_HUECO = { teclado: ['teclado', 4], auriculares: ['r-auriculares', 2], silla: ['r-silla', 2] };
  const RAREZA = { comun: 'COMÚN', raro: 'RARO', epico: 'ÉPICO', legendario: 'LEGENDARIO' };
  UI.nombreRareza = (r) => tr(RAREZA[r]);
  const pintaHueco = (g, h, x, y, k) => V().pinta(g, DIBUJO_HUECO[h][0], x, y, DIBUJO_HUECO[h][1] * (k || 1));
  UI.cuadroRareza = cuadro;

  // un cuadro de rareza: del color de la rareza si la tienes (con su dibujo), oscuro con «?» si no; el puesto, con marco blanco
  function cuadro(g, b, color, pinta, marcado) {
    if (marcado) { g.fillStyle = '#ffffff'; g.fillRect(b.x - 5, b.y - 5, b.w + 10, b.h + 10); }
    UI.panel(g, b.x, b.y, b.w, b.h, color || '#2a1830', null, null, 3);
    if (pinta) pinta(b.x + b.w / 2, b.y + b.h / 2);
    else T(g, '?', b.x + b.w / 2, b.y + b.h / 2, 24, '#6a5670', 'center', 0);
  }
  const LADO = 46, PASO = 52, ZONA = 4 * PASO + 12;   // los cuadros de rareza y lo que ocupan a la derecha
  const arriba = (y, h) => Math.round(y + h * 0.42 - LADO / 2);   // dónde empiezan los cuadros en una fila de alto h
  const cuadros = (x, y, w) => [0, 1, 2, 3].map((i) => ({ x: x + w - ZONA + 6 + i * PASO, y, w: LADO, h: LADO }));
  // el título pequeño, el nombre (en una o dos líneas, sin aplastarse) y la descripción debajo de todo, a lo ancho
  // (en filas bajas todo se aprieta en proporción; «Nada puesto» y lo apagado van sin contorno)
  function textos(g, x, y, w, h, titulo, nombre, color, desc) {
    const k = Math.min(1, h / 120), apagado = color === '#8a7a5a';
    T(g, titulo, x + 22, y + h * 0.2, 15, C.gris, 'left', 0);
    UI.nombre(g, nombre, x + 22, y + h * 0.48, Math.round(21 * Math.max(0.85, k)), w - ZONA - 30, color, 'left', apagado ? 0 : 3);
    if (desc) UI.textoCabe(g, desc, x + 22, y + h * 0.8, 14, w - 44, '#2e6a2a', 'left', 0);
  }

  function filaHueco(g, AJ, p, hueco, x, y, w, h, botones) {
    const puesta = p.equipo.puesto[hueco], pieza = puesta ? AJ.equipo[hueco][puesta] : null;
    UI.pergamino(g, x, y, w, h);
    textos(g, x, y, w, h, tr(HUECO[hueco]), pieza ? tr(pieza.nombre) : tr('Nada puesto'), pieza ? AJ.colorRareza[puesta] : '#8a7a5a', pieza ? UI.describe(pieza.ef).join(' · ') : '');
    cuadros(x, arriba(y, h), w).forEach((b, i) => {
      const r = AJ.rarezas[i], tiene = p.equipo.tiene[hueco + ':' + r];
      cuadro(g, b, tiene ? AJ.colorRareza[r] : null, tiene ? (cx, cy) => pintaHueco(g, hueco, cx, cy, 0.8) : null, puesta === r);
      if (tiene) botones.push({ ...b, accion: 'equipar', hueco, rareza: r });
    });
  }

  function filaMascotas(g, AJ, p, x, y, w, h, botones) {
    UI.pergamino(g, x, y, w, h);
    const id = p.mascota, m = B.mascotaDe(AJ, p);
    textos(g, x, y, w, h, tr('MASCOTA'), m ? tr(AJ.mascotas[id].nombre) + ' · ' + tr('Nv') + ' ' + m.nivel : tr('Ninguna todavía'), m ? AJ.colorRareza[AJ.mascotas[id].rareza] : '#8a7a5a',
      m ? tr('Dispara sola: {n} de daño', { n: m.dano }) + (m.cafeCada ? ' · ' + tr('trae café') : '') : '');
    cuadros(x, arriba(y, h), w).forEach((b, i) => {
      const k = Object.keys(AJ.mascotas)[i], nivel = p.mascotas[k];
      cuadro(g, b, nivel ? AJ.colorRareza[AJ.mascotas[k].rareza] : null, nivel ? (cx, cy) => V().pintaCosa(g, k, cx, cy, null, k === 'dron' ? 0.9 : 0.8) : null, id === k);
      if (!nivel) return;
      T(g, String(nivel), b.x + b.w - 2, b.y + b.h - 6, 16, '#ffffff', 'right', 3);
      botones.push({ ...b, accion: 'mascota', id: k });
    });
  }

  // El arma: la puesta, con su dibujo, su nivel y lo que hace, cuántas tienes y el botón de CAMBIAR (abre la armería).
  function filaArma(g, AJ, p, x, y, w, h, botones) {
    const a = B.armaDe(AJ, p), color = a.rareza ? AJ.colorRareza[a.rareza] : C.cafe, ids = Object.keys(AJ.armas);
    const tienes = ids.filter((id) => !AJ.armas[id].rareza || p.armas[id] > 0).length, b = { x: x + w - ZONA + 6, y: arriba(y, h), w: ZONA - 18, h: LADO, accion: 'armeria' };
    UI.pergamino(g, x, y, w, h);
    textos(g, x, y, w, h, tr('ARMA') + ' · ' + tr('{a} de {b}', { a: tienes, b: ids.length }), tr(a.nombre) + (a.rareza ? ' · ' + tr('Nv') + ' ' + a.nivel : ''), color, UI.queHaceArma(a.id));
    UI.boton(g, b, 'azul', tr('CAMBIAR'), 22);
    botones.push(b);
  }

  // La habilidad: la que llevas, qué hace y su recarga; los cuadros, las tres (las cerradas, con el jefe que las abre).
  const QUE_HABILIDAD = { congelar: 'Los bichos y el jefe se quedan quietos {n} s', ctrlz: 'Recupera el {n} % del café', despido: 'Daño enorme a todo lo que tengas cerca' };
  function filaHabilidad(g, AJ, p, x, y, w, h, botones) {
    const id = B.habilidadDe(AJ, p), d = AJ.habilidades[id], abiertas = B.habilidadesAbiertas(AJ, p);
    UI.pergamino(g, x, y, w, h);
    textos(g, x, y, w, h, tr('HABILIDAD') + ' · ' + tr('recarga {n} s', { n: d.recarga }), tr(d.nombre), C.azul, tr(QUE_HABILIDAD[id], { n: d.dura || Math.round((d.cafe || 0) * 100) }));
    cuadros(x, arriba(y, h), w).slice(0, 3).forEach((b, i) => {
      const k = Object.keys(AJ.habilidades)[i], abierta = abiertas.includes(k);
      cuadro(g, b, abierta ? C.azul : null, abierta ? (cx, cy) => UI.textoCabe(g, tr(AJ.habilidades[k].corto), cx, cy, 13, b.w - 6, '#ffffff', 'center', 3) : null, id === k);
      if (abierta) botones.push({ ...b, accion: 'habilidad', id: k });
    });
  }

  UI.pestanaEquipo = function (g, W, H, AJ, p, botones) {
    const { y0, y1 } = UI.zonaMesa(H), h = Math.min(150, Math.floor((y1 - y0) / 6) - 8);
    let y = y0;
    filaArma(g, AJ, p, 12, y, W - 24, h, botones); y += h + 8;
    for (const hueco of Object.keys(AJ.equipo)) { filaHueco(g, AJ, p, hueco, 12, y, W - 24, h, botones); y += h + 8; }
    filaMascotas(g, AJ, p, 12, y, W - 24, h, botones); y += h + 8;
    filaHabilidad(g, AJ, p, 12, y, W - 24, h, botones);
  };

  // ---------- PAQUETES ----------
  function probabilidades(g, AJ, P, x, y, w) {
    const ancho = (w - 10) / 4;
    AJ.rarezas.forEach((r, i) => {
      const cx = x + i * ancho + (ancho - 6) / 2;   // el nombre arriba y el % debajo: así no hay que encogerlos
      UI.panel(g, x + i * ancho, y - 24, ancho - 6, 48, AJ.colorRareza[r], null, null, 3);
      UI.textoCabe(g, UI.nombreRareza(r), cx, y - 9, 14, ancho - 14, '#ffffff', 'center', 3);
      T(g, P.rarezas[r] + ' %', cx, y + 11, 17, '#ffffff', 'center', 3);
    });
    T(g, tr('Mascota {m} % · Arma {a} % · Equipo {e} %', { m: P.mascota, a: P.arma || 0, e: 100 - P.mascota - (P.arma || 0) }), x, y + 40, 17, C.cafe, 'left', 0);
  }

  function tarjetaPaquete(g, AJ, p, tipo, x, y, w, h, botones) {
    const P = AJ.paquetes[tipo], n = p.paquetes[tipo];
    UI.pergamino(g, x, y, w, h);
    V().pintaCosa(g, tipo === 'jefe' ? 'paqueteJefe' : 'paquete', x + 70, y + 74, null, tipo === 'jefe' ? 1.3 : 1.6);
    UI.textoCabe(g, tr(P.nombre), x + 130, y + 40, 26, w - 160, C.oro, 'left', 5);
    T(g, tr('Tienes: {n}', { n }), x + 130, y + 76, 20, C.gris, 'left', 0);
    if (P.coste == null) UI.lineas(g, tr('Lo suelta un jefe la primera vez que lo vences'), x + 130, y + 104, 15, w - 160, C.cafe, 'left', 0, 17);
    probabilidades(g, AJ, P, x + 24, y + h - 124, w - 48);
    const by = y + h - 66;
    if (P.coste != null) {
      const comprar = { x: x + 24, y: by, w: w / 2 - 32, h: 50, accion: 'comprarPaquete', id: tipo };
      UI.boton(g, comprar, p.monedas >= P.coste ? 'verde' : 'apagado', '', 0);
      UI.moneda(g, comprar.x + 26, by + 25, 2);
      T(g, tr('COMPRAR') + ' ' + P.coste, comprar.x + comprar.w / 2 + 14, by + 25, 20, '#ffffff', 'center', 4);
      botones.push(comprar);
    }
    const abrir = { x: x + w / 2 + 8, y: by, w: w / 2 - 32, h: 50, accion: 'abrirPaquete', id: tipo };
    UI.boton(g, abrir, n > 0 ? 'naranja' : 'apagado', tr('ABRIR'), 24);
    if (n > 0) botones.push(abrir);
  }

  UI.pestanaPaquetes = function (g, W, H, AJ, p, botones) {
    const { y0, y1 } = UI.zonaMesa(H), h = Math.min(300, Math.floor((y1 - y0) / 2) - 8);
    tarjetaPaquete(g, AJ, p, 'normal', 12, y0, W - 24, h, botones);
    tarjetaPaquete(g, AJ, p, 'jefe', 12, y0 + h + 14, W - 24, h, botones);
  };

  // ---------- abrir un paquete ----------
  const NOMBRE_PREMIO = (AJ, pr) => (pr.tipo === 'equipo' ? AJ.equipo[pr.hueco][pr.rareza].nombre : pr.tipo === 'arma' ? AJ.armas[pr.id].nombre : AJ.mascotas[pr.id].nombre);
  UI.REVELA = 0.9;

  function rayos(g, x, y, color, t) {
    g.save(); g.translate(x, y); g.rotate(t * 0.6); g.globalAlpha = 0.4; g.fillStyle = color;
    for (let i = 0; i < 12; i++) { g.rotate(Math.PI / 6); g.beginPath(); g.moveTo(0, 0); g.lineTo(-30, -420); g.lineTo(30, -420); g.fill(); }
    g.restore();
  }

  function lineaPremio(pr) {
    if (!pr.nuevo) return tr('Repetido: +{n} monedas', { n: pr.monedas });
    if (pr.tipo !== 'equipo' && pr.nivel > 1) return tr('¡Sube a nivel {n}!', { n: pr.nivel });
    return tr('¡NUEVO!');
  }

  UI.apertura = function (g, W, H, t, AJ, a) {
    UI.fondoMenu(g, W, H, 'fondo-sede');
    g.fillStyle = 'rgba(10,5,20,0.82)'; g.fillRect(0, 0, W, H);
    const d = t - a.t0, pr = a.premio, cx = W / 2, cy = H * 0.4;
    if (d < UI.REVELA) {
      const k = d * 14;
      V().pintaCosa(g, a.tipo === 'jefe' ? 'paqueteJefe' : 'paquete', cx + Math.sin(d * 50) * k, cy + Math.cos(d * 43) * k * 0.5, null, a.tipo === 'jefe' ? 3.5 : 4);
      return [];
    }
    const color = AJ.colorRareza[pr.rareza];
    rayos(g, cx, cy, color, t);
    if (pr.tipo === 'equipo') pintaHueco(g, pr.hueco, cx, cy, 2.5); else V().pintaCosa(g, pr.id, cx, cy, null, pr.tipo === 'arma' ? 3 : 2.5);
    UI.titulo(g, UI.nombreRareza(pr.rareza), cx, cy + 160, 50);
    UI.lineas(g, tr(NOMBRE_PREMIO(AJ, pr)), cx, cy + 222, 30, W - 60, '#ffffff', 'center', 5, 34);
    T(g, lineaPremio(pr), cx, cy + 300, 26, pr.nuevo ? C.oro : '#ffffff', 'center', 5);
    if (d > UI.REVELA + 0.6) UI.franja(g, tr('Toca para seguir'), cx, H - 80, 20);
    return d > UI.REVELA + 0.4 ? [{ x: 0, y: 0, w: W, h: H, accion: 'cerrarApertura' }] : [];
  };
})(BAS);
