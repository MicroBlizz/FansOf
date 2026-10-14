// Fans of Ratkov · EL BOTÍN Y LA MOCHILA (la mochila Tetris en la incursión). El contenedor o el cuerpo es una cuadrícula con sus cosas
// (aparecen poco a poco); tu mochila, otra; los bolsillos, tres casillas sueltas, y la riñonera, una cuadrícula de 2 x 2 que no se pierde.
// Se arrastra de una a otra (js/rejilla.js). COGER TODO solo mete lo que quepa. Aquí no hay ORDENAR: eso es del refugio.
// Ojo: mientras miras el botín o la mochila, el juego sigue. Solo la pausa lo para.
'use strict';
// el tamaño de casilla para que quepa todo en la ventana (de pie: una cuadrícula encima de otra; tumbado: una al lado de la otra)
function casillaVentana(columnasPie, filasPie, columnasTumbado, filasTumbado) {
  const tumbado = innerWidth > innerHeight && innerWidth >= 640;
  const ancho = Math.min(tumbado ? 980 : 620, innerWidth * (tumbado ? 0.97 : 0.94)) - (tumbado ? 260 : 32), alto = innerHeight * 0.9 - (tumbado ? 90 : 250);
  const [c, f] = tumbado ? [columnasTumbado, filasTumbado] : [columnasPie, filasPie];
  return Math.max(24, Math.min(52, Math.floor(Math.min(ancho / c, alto / f))));
}
// tu parte: la mochila, los bolsillos y la riñonera (el HTML y los sitios para REJ)
function htmlTuyo(dim) {
  const usadas = casillasUsadas(RAID.mochila), peso = pesoEncima(RAID.eq, RAID.mochila, RAID.bolsillos, RAID.rinonera);
  return '<div class="bloque-rej bloque-tuyo"><h4>' + esc(tr('TU MOCHILA')) + ' <small>' + esc(trf('%1 de %2 casillas · %3 kg', usadas, totalCasillas(dim), peso.toFixed(1))) + '</small></h4><div data-sitio="moch"></div>'
    + '<div class="fila-rej"><div><h5>' + esc(tr('BOLSILLOS')) + '</h5><div class="bols"><div data-sitio="b0"></div><div data-sitio="b1"></div><div data-sitio="b2"></div></div></div>'
    + '<div><h5>' + esc(tr('RIÑONERA')) + '</h5><div data-sitio="rin"></div></div></div></div>';
}
function sitiosTuyos(v, dim) {
  const q = id => v.querySelector('[data-sitio="' + id + '"]');
  return [{ id: 'moch', raiz: q('moch'), lista: RAID.mochila, dim },
    ...[0, 1, 2].map(i => ({ id: 'b' + i, raiz: q('b' + i), lista: RAID.bolsillos, i })),
    { id: 'rin', raiz: q('rin'), lista: RAID.rinonera, dim: DIM_RINONERA, acepta: o => !ARMAS[o.id] }];
}
// lo que se ve del objeto elegido y sus botones
function htmlInfo(o, botones) {
  if (!o) return '<p class="rej-pista">' + esc(tr('Toca un objeto para ver qué es. Arrástralo para moverlo; dos toques o R para girarlo.')) + '</p>';
  const D = OBJ[o.id];
  return imgObj(o.id) + '<div class="fo-t"><b>' + esc(tr(D.n)) + (o.n > 1 ? ' <i>×' + o.n + '</i>' : '') + (o.fir ? ' <u>' + esc(tr('ENCONTRADO')) + '</u>' : '') + '</b><span>' + celdasDe(o.id) + ' ' + esc(tr(celdasDe(o.id) === 1 ? 'casilla' : 'casillas')) + ' · ' + pesoDe(o).toFixed(1) + ' kg · ' + miles(valorDe(o)) + ' ' + esc(tr('chapas')) + '</span><span>' + esc(tr(D.d)) + '</span></div><div class="fo-b">' + botones + '</div>';
}
function pintaInfo(v, o, s, botonesDe, accion) {
  const caja = v.querySelector('.rej-info'); if (!caja) return;
  caja.innerHTML = htmlInfo(o, o ? botonesDe(o, s) : '');
  caja.querySelectorAll('[data-a]').forEach(b => (b.onclick = () => accion(b.dataset.a, o, s)));
}
const tomaComoEncontrado = o => { if (!RAID.tuto) o.fir = true; };

/* ---------- el botín ---------- */
function abreBotin(c, nuevo = false) {
  RAID.abierto = c; c.vistos = nuevo ? 0 : c.cosas.length; c.tRevela = 0;
  if (!c.dim) c.dim = dimContenedor(c);
  colocaTodo(c.cosas, c.dim, true);
  REJ.sel = null; pintaBotin();
}
function pintaBotin() {
  const c = RAID.abierto; if (!c) return;
  if (REJ.arr) { REJ.pendiente = true; return; }
  const titulo = c.tipo === 'cadaver' ? c.nombre : TABLAS[c.tipo] ? TABLAS[c.tipo].n : tr('Contenedor');
  const dim = casillasMochila(RAID.eq);
  let h = cabecera(tr(titulo), '');
  h += '<div class="rejillas"><div class="bloque-rej"><h4>' + esc(tr(c.tipo === 'cadaver' ? 'LO QUE LLEVA' : 'DENTRO')) + '</h4><div data-sitio="cont"></div>';
  if (!c.cosas.length) h += '<p class="vacio">' + esc(tr('Vacío. Alguien llegó antes.')) + '</p>';
  if (c.escondite && !c.escondite.hecho) h += '<button type="button" class="mini oro" data-a="rebusca">' + esc(tr('ALGO ABULTA… REBUSCAR')) + '</button>';
  h += '</div>' + htmlTuyo(dim) + '</div><div class="rej-info fila-obj"></div>';
  if (c.cosas.length && c.vistos >= c.cosas.length) h += '<div class="pie">' + (paseVip() ? boton('COGER TODO', 'todo', 0, 'bien grande') : botonVip('COGER TODO', 'todo', 'mini grande')) + '</div>';
  const v = abreVentana('v-botin', h); v.classList.add('rej-v'); enganchaCerrar(v, 'v-botin');
  const C = casillaVentana(Math.max(c.dim.w, dim.w), c.dim.h + dim.h + 2.4, c.dim.w + dim.w + 3.6, Math.max(c.dim.h, dim.h) + 0.6);
  const cont = { id: 'cont', raiz: v.querySelector('[data-sitio="cont"]'), lista: c.cosas, dim: c.dim, oculto: o => c.cosas.indexOf(o) >= c.vistos,
    alQuitar: (o, k) => { if (k < c.vistos) c.vistos--; }, alPoner: o => { c.cosas.splice(c.vistos, 0, o); c.vistos++; } };
  montaRejillas([cont, ...sitiosTuyos(v, dim)], { C, alCambiar: pintaBotin, alElegir: (o, s) => pintaInfo(v, o, s, botonesBotin, accionBotin), alMover: (o, de, a) => { if (de.id === 'cont' && a.id !== 'cont') tomaComoEncontrado(o); } });
  pintaInfo(v, REJ.sel, REJ.sel && sitioDePieza(REJ.sel), botonesBotin, accionBotin);
  v.querySelectorAll('.pie [data-a], [data-a="rebusca"]').forEach(b => (b.onclick = () => accionBotin(b.dataset.a)));
}
function botonesBotin(o, s) {
  let b = '';
  if (s && s.id === 'cont' && OBJ[o.id].t === 'mochila' && !RAID.eq.mochila) b += boton('PONÉRSELA', 'ponmochila', 0, 'bien');
  if (s && s.id === 'cont') b += boton('COGER', 'coger', 0, 'bien');
  else if (s) { if (OBJ[o.id].t === 'med' || OBJ[o.id].t === 'granada') b += boton('USAR', 'usar', 0, 'bien'); b += boton('DEJAR', 'dejar', 0); }
  if (s && s.dim) b += boton('GIRAR', 'girar', 0);
  return b;
}
function accionBotin(a, o, s) {
  const c = RAID.abierto; if (!c) return;
  const dim = casillasMochila(RAID.eq);
  const sacaDeCont = p => { const k = c.cosas.indexOf(p); if (k >= 0) { c.cosas.splice(k, 1); if (k < c.vistos) c.vistos--; } };
  if (a === 'todo' && !paseVip()) { avisoVip(); return; }   // aquí se juega al Tetris: COGER TODO es del PASE VIP
  if (a === 'todo' || a === 'coger') {
    const cosas = a === 'todo' ? c.cosas.slice(0, c.vistos).sort((x, y) => valorDe(y) - valorDe(x)) : [o];
    let algo = false, lleno = false;
    for (const p of cosas) {
      if (!p) continue; tomaComoEncontrado(p);
      let resto = meter(RAID.mochila, p, dim);
      if (resto === p.n && celdasDe(p.id) === 1) resto = meter(RAID.bolsillos, p, 3);
      if (resto === p.n) { lleno = true; continue; }
      algo = true; if (resto > 0) p.n = resto; else sacaDeCont(p); if (OBJ[p.id].r >= 3) play('raro');
    }
    if (algo) play('coge'); if (lleno) { avisa(tr(a === 'todo' ? 'No cabe todo. Elige o gira piezas.' : 'No cabe en la mochila.'), 'malo'); play('deny'); }
    REJ.sel = null;
  } else if (a === 'dejar') {
    quitaDe(s, o); while (!sitioPara(c.cosas, c.dim, o.id) && c.dim.h < 40) c.dim.h++; Object.assign(o, sitioPara(c.cosas, c.dim, o.id)); c.cosas.splice(c.vistos, 0, o); c.vistos++; REJ.sel = null; play('select');
  } else if (a === 'usar') { const lista = s.lista; if (usaObjeto(lista, lista.indexOf(o))) cierraVentana('v-botin'); return; }
  else if (a === 'girar') { giraEnSitio(o); return; }
  else if (a === 'rebusca') { abreRebuscar(c); return; }
  else if (a === 'ponmochila') { if (RAID.eq.mochila) return; sacaDeCont(o); RAID.eq.mochila = sinSitio(o); colocaTodo(RAID.mochila, casillasMochila(RAID.eq)); play('recarga'); REJ.sel = null; }
  pintaBotin();
}
// lo de dentro aparece poco a poco (más rápido con JunkCoon). Mientras arrastras, espera
function avanzaBotin(dt) {
  const c = RAID.abierto; if (!c || c.vistos >= c.cosas.length || REJ.arr) return;
  c.tRevela += dt; const paso = SAVE.animal === 'junkcoon' ? 0.2 : 0.45;
  if (c.tRevela >= paso) { c.tRevela = 0; c.vistos++; const o = c.cosas[c.vistos - 1]; play(o && OBJ[o.id].r >= 3 ? 'raro' : 'aparece'); pintaBotin(); }
}

/* ---------- la mochila ---------- */
function abreMochila() {
  if (REJ.arr) { REJ.pendiente = true; return; }
  const dim = casillasMochila(RAID.eq);
  let h = cabecera(tr('MOCHILA'), '');
  h += '<div class="rejillas"><div class="bloque-rej"><h4>' + esc(tr('LLEVAS PUESTO')) + '</h4><div class="lista corta">';
  for (const [k, n] of [['arma1', 'ARMA 1'], ['arma2', 'ARMA 2'], ['chaleco', 'CHALECO'], ['casco', 'CASCO'], ['mochila', 'MOCHILA']]) {
    const o = RAID.eq[k]; h += o ? filaObj(o, k !== 'mochila' ? boton('QUITAR', 'quitar', k) : boton('SOLTAR', 'soltar', k), '<em>' + esc(tr(n)) + '</em>') : '<div class="fila-obj hueco"><i class="ic"></i><div class="fo-t"><b>' + esc(tr(n)) + '</b><span>' + esc(tr('vacío')) + '</span></div></div>';
  }
  h += '</div></div>' + htmlTuyo(dim) + '</div><div class="rej-info fila-obj"></div>';
  const v = abreVentana('v-mochila', h); v.classList.add('rej-v'); enganchaCerrar(v, 'v-mochila');
  const C = casillaVentana(dim.w, dim.h + 2.4 + 4, dim.w + 3 + 6, dim.h + 0.6);
  montaRejillas(sitiosTuyos(v, dim), { C, alCambiar: abreMochila, alElegir: (o, s) => pintaInfo(v, o, s, botonesMochila, accionMochila) });
  pintaInfo(v, REJ.sel, REJ.sel && sitioDePieza(REJ.sel), botonesMochila, accionMochila);
  v.querySelectorAll('.lista [data-a]').forEach(b => (b.onclick = () => accionMochila(b.dataset.a, null, null, b.dataset.i)));
}
function botonesMochila(o, s) {
  const D = OBJ[o.id]; let b = '';
  if (D.t === 'med' || D.t === 'granada') b += boton('USAR', 'usar', 0, 'bien');
  if (D.t === 'arma' || D.t === 'chaleco' || D.t === 'casco') b += boton('EQUIPAR', 'equipar', 0, 'bien');
  if (s && s.dim) b += boton('GIRAR', 'girar', 0);
  return b + boton('TIRAR', 'tirar', 0, 'malo');
}
// tira algo al suelo (queda un montoncito que se puede volver a registrar)
function alSuelo(o) { contenedor('cadaver', JUG.x + entre(-0.4, 0.4), JUG.z + entre(-0.4, 0.4), { nombre: 'En el suelo', cosas: [sinSitio(o)], abierto: true }); }
function accionMochila(a, o, s, k) {
  const dim = casillasMochila(RAID.eq), M = RAID.mochila;
  if (a === 'usar') { if (usaObjeto(s.lista, s.lista.indexOf(o))) cierraVentana('v-mochila'); return; }
  if (a === 'girar') { giraEnSitio(o); return; }
  if (a === 'tirar') { quitaDe(s, o); alSuelo(o); REJ.sel = null; }
  if (a === 'equipar') {
    const D = OBJ[o.id], hueco = D.t === 'arma' ? (!RAID.eq.arma1 ? 'arma1' : !RAID.eq.arma2 ? 'arma2' : JUG.activa) : D.t;
    quitaDe(s, o); sinSitio(o); const viejo = RAID.eq[hueco]; RAID.eq[hueco] = o;
    if (viejo && meter(M, viejo, dim)) { alSuelo(viejo); avisa(tr('No cabía en la mochila: lo has dejado en el suelo.'), 'malo'); }
    if (hueco === JUG.activa || D.t === 'arma' && !RAID.eq[JUG.activa]) { JUG.activa = hueco; ponArma(JUG.mod, o.id); }
    REJ.sel = null; play('recarga');
  }
  if (a === 'soltar') { sueltaMochila(); cierraVentana('v-mochila'); return; }
  if (a === 'quitar') {
    const p = RAID.eq[k]; if (!p) return;
    if (meter(M, p, dim)) { avisa(tr('No cabe en la mochila.'), 'malo'); play('deny'); }
    else { RAID.eq[k] = null; if (JUG.activa === k) { const otra = k === 'arma1' ? 'arma2' : 'arma1'; JUG.activa = RAID.eq[otra] ? otra : k; ponArma(JUG.mod, armaJ() ? armaJ().id : null); } play('select'); }
  }
  compacta(M); abreMochila();
}
