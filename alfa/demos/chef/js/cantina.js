// Fans of Chef · CANTINA: el servicio del día (versión sencilla del prototipo). Los clientes de la empresa llegan de uno en uno con
// su plato y su paciencia; tocar (o elegir con las teclas) un pedido lo cocina si la despensa tiene lo que lleva, tarda un poco y deja
// oro. El que se cansa de esperar se va sin pagar. Cuando no queda nadie (o se acaba el tiempo) cierra la cantina. Pintar: pantalla-2.js.
'use strict';

const CANTINA = { t: 0, cola: [], mesa: [], cocinando: null, sel: 0, servidos: 0, idos: 0, proximo: 0, aviso: null };

function empiezaServicio() {
  JORNADA.fase = 'servicio'; CANTINA.t = 0; CANTINA.mesa = []; CANTINA.cocinando = null; CANTINA.sel = 0; CANTINA.servidos = 0; CANTINA.idos = 0; CANTINA.proximo = 0.5; CANTINA.aviso = null;
  const nombres = CLIENTES.slice().sort(() => Math.random() - 0.5);
  CANTINA.cola = JORNADA.pedidos.map((r, i) => ({ receta: r, quien: nombres[i % nombres.length], paciencia: CIFRAS.pacienciaSeg, estado: 'espera' }));
  abreVentana('servicio'); SONIDO.campana();
}
const puedeCocinar = r => Object.keys(RECETAS[r].lleva).every(k => (JORNADA.despensa[k] || 0) >= RECETAS[r].lleva[k]);
const faltaPara = r => Object.keys(RECETAS[r].lleva).find(k => (JORNADA.despensa[k] || 0) < RECETAS[r].lleva[k]);

function avanzaServicio(dt) {
  CANTINA.t += dt;
  if (CANTINA.aviso) { CANTINA.aviso.t -= dt; if (CANTINA.aviso.t <= 0) CANTINA.aviso = null; }
  // llega el siguiente de la cola (hasta 3 en la mesa)
  CANTINA.proximo -= dt;
  if (CANTINA.proximo <= 0 && CANTINA.cola.length && CANTINA.mesa.length < 3) { CANTINA.mesa.push(CANTINA.cola.shift()); CANTINA.proximo = 4; SONIDO.campana(); }
  for (const c of CANTINA.mesa) {
    if (c.estado !== 'espera') continue;
    c.paciencia -= dt;
    if (c.paciencia <= 0) { c.estado = 'ido'; c.t = 0.8; CANTINA.idos++; SONIDO.no(); CANTINA.aviso = { txt: tr('{quien} se va sin comer', { quien: tr(c.quien) }), t: 1.6, color: PALETA.R }; }
  }
  if (CANTINA.cocinando) {
    const c = CANTINA.cocinando; c.coccion += dt;
    if (c.coccion >= CIFRAS.cocinarSeg) { c.estado = 'servido'; c.t = 0.9; CANTINA.cocinando = null; CANTINA.servidos++; SAVE.platos++; JORNADA.oroDia += RECETAS[c.receta].oro; SONIDO.servido(); }
  }
  for (const c of CANTINA.mesa) if (c.t !== undefined) c.t -= dt;
  CANTINA.mesa = CANTINA.mesa.filter(c => c.estado === 'espera' || c.estado === 'cocinando' || c.t > 0);
  if (CANTINA.sel >= CANTINA.mesa.length) CANTINA.sel = Math.max(0, CANTINA.mesa.length - 1);
  const quedan = CANTINA.cola.length + CANTINA.mesa.filter(c => c.estado === 'espera' || c.estado === 'cocinando').length;
  if (quedan === 0 && CANTINA.t > 1.5) { cierraJornada(); return; }
  if (CANTINA.t >= CIFRAS.servicioSeg) { for (const c of CANTINA.mesa) if (c.estado === 'espera') CANTINA.idos++; cierraJornada(); }
}
// tocar un pedido: cocinarlo si se puede
function cocina(i) {
  const c = CANTINA.mesa[i];
  if (!c || c.estado !== 'espera') return;
  if (CANTINA.cocinando) { CANTINA.aviso = { txt: tr('Ya hay un plato al fuego'), t: 1.2, color: PALETA.Y }; SONIDO.no(); return; }
  const falta = faltaPara(c.receta);
  if (falta) { CANTINA.aviso = { txt: tr('Falta: {que}', { que: tr(INGREDIENTES[falta].nombre) }), t: 1.6, color: PALETA.R }; SONIDO.no(); return; }
  for (const k in RECETAS[c.receta].lleva) JORNADA.despensa[k] -= RECETAS[c.receta].lleva[k];
  c.estado = 'cocinando'; c.coccion = 0; CANTINA.cocinando = c; SONIDO.cocina();
}
