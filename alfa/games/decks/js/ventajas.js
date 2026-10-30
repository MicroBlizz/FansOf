// Fans Of Decks · Ventajas fiscales de la partida: las genéricas que da el paro y la pantalla de elegirlas. Las de siempre están en datos-objetos.js.
// Con los niveles de paro se llevan varias a la vez (huecos en paro.js); dcVentaja() las devuelve sumadas en un solo objeto, así cada efecto se lee igual que con una.
// Efectos: nominas (por reunión ganada), vidaMax, caosInicial, descuento, carga, manoInicial, y los nuevos: bloqueoInicial y fuerzaInicial (al empezar cada reunión),
// curaReunion (tras ganar una reunión), nominasIniciales, objetoInicial y meriendasIniciales (al empezar la partida).
'use strict';
// Las genéricas del paro (hito paroSuma: se abren sumando los niveles de paro superados con todos los líderes). Las de cada líder están en logros.js.
Object.assign(DC_VENTAJAS, {
  ticket: { nombre: 'Ticket restaurante', texto: 'Te curas 3 tras cada reunión ganada.', hito: { paroSuma: 1 }, curaReunion: 3 },
  teletrabajo: { nombre: 'Teletrabajo', texto: 'Empiezas cada reunión con 4 de bloqueo.', hito: { paroSuma: 2 }, bloqueoInicial: 4 },
  dietas: { nombre: 'Dietas de viaje', texto: 'Empiezas la partida con 60 de bonus.', hito: { paroSuma: 3 }, nominasIniciales: 60 },
  formacion: { nombre: 'Formación bonificada', texto: 'La habilidad de tu líder se carga con 1 de CAOS menos.', hito: { paroSuma: 5 }, carga: 1 },
  seguroVida: { nombre: 'Seguro de vida', texto: '+15 de vida máxima.', hito: { paroSuma: 7 }, vidaMax: 15 },
  gimnasio: { nombre: 'Gimnasio de empresa', texto: 'Empiezas cada reunión con 1 de Fuerza.', hito: { paroSuma: 10 }, fuerzaInicial: 1 },
  coche: { nombre: 'Coche de empresa', texto: 'Empiezas la partida con un objeto al azar.', hito: { paroSuma: 13 }, objetoInicial: 1 },
  cesta: { nombre: 'Cesta de Navidad', texto: 'Empiezas la partida con una Bebida energética XXL y un Botiquín de oficina.', hito: { paroSuma: 17 }, meriendasIniciales: ['energetica', 'botiquin'] },
  stock: { nombre: 'Stock options', texto: '+10 de bonus por cada reunión ganada.', hito: { paroSuma: 21 }, nominas: 10 },
  intensiva: { nombre: 'Jornada intensiva', texto: 'Robas 2 cartas más en el primer turno de cada reunión.', hito: { paroSuma: 26 }, manoInicial: 2 },
  despacho: { nombre: 'Despacho propio', texto: 'Empiezas cada reunión con 8 de bloqueo.', hito: { paroSuma: 32 }, bloqueoInicial: 8 },
  direccion: { nombre: 'Dirección por objetivos', texto: 'Empiezas cada reunión con 1 CAOS extra.', hito: { paroSuma: 40 }, caosInicial: 1 },
  blindado: { nombre: 'Contrato blindado', texto: '+25 de vida máxima.', hito: { paroSuma: 50 }, vidaMax: 25 },
  retencion: { nombre: 'Bonus de retención', texto: 'Te curas 6 tras cada reunión ganada.', hito: { paroSuma: 65 }, curaReunion: 6 },
  paracaidas: { nombre: 'Paracaídas dorado', texto: 'Empiezas cada reunión con 2 de Fuerza.', hito: { paroSuma: 80 }, fuerzaInicial: 2 },
});
// Las de la partida (claves) y todas sumadas (o null).
function dcVentajasPartida() { const r = DCP.run; if (!r) return []; return (r.ventajas || (r.ventaja ? [r.ventaja] : [])).filter(k => DC_VENTAJAS[k]); }
function dcVentaja() {
  const L = dcVentajasPartida(); if (!L.length) return null;
  const S = { nombre: DC_VENTAJAS[L[0]].nombre, texto: DC_VENTAJAS[L[0]].texto };
  for (const k of L) for (const [c, v] of Object.entries(DC_VENTAJAS[k])) {
    if (typeof v === 'number') S[c] = (S[c] || 0) + v; else if (Array.isArray(v)) S[c] = (S[c] || []).concat(v);
  }
  return S;
}
// Ganchos: al empezar la partida, al empezar cada reunión y al ganarla.
function dcVentajaPartida(r) {
  const V = dcVentaja(); if (!V) return;
  if (V.nominasIniciales) r.nominas += V.nominasIniciales;
  for (let i = 0; i < (V.objetoInicial || 0); i++) { const o = dcObjetoAlAzar(); if (o) r.objetos.push(o); }
  for (const m of V.meriendasIniciales || []) if (r.meriendas.length < 2) r.meriendas.push(m);
}
function dcVentajaReunion(C) { C.hpInicio = DCP.run.hp; const V = dcVentaja(); if (!V) return; if (V.bloqueoInicial) C.bloqueo += V.bloqueoInicial; if (V.fuerzaInicial) C.fuerza += V.fuerzaInicial; }
function dcVentajaTrasReunion() { const V = dcVentaja(); if (V && V.curaReunion) dcVida(V.curaReunion); }
// Las fichas de las ventajas de la partida (en la agenda).
function dcFichasVentaja() {
  return dcVentajasPartida().map(k => { const V = DC_VENTAJAS[k], o = dcEl('span', 'dc-chip dc-chip-ventaja', tr(V.nombre)); o.title = tr(V.texto); o.onclick = () => toast(tr(V.texto)); return o; });
}
// ---------- elegir las ventajas al empezar ----------
// Con un hueco, un toque la elige (como siempre). Con varios, se marcan hasta llenar los huecos y se pulsa EMPEZAR.
function dcEligeVentaja(lider, alElegir, volver) {
  const huecos = dcHuecosVentaja(lider), elegidas = [], s = dcPanel(tr(huecos > 1 ? 'Ventajas fiscales' : 'Ventaja fiscal'));
  s.append(dcEl('p', 'dc-nota', tr(huecos > 1 ? 'Elige hasta {n} ventajas para toda la partida. Los niveles de paro y los logros de cada líder abren más.' : 'Elige una ventaja para toda la partida. Jugando se desbloquean las demás.', { n: huecos })));
  const cuenta = dcEl('p', 'dc-nota dc-ventajas-cuenta'), ok = dcEl('button', 'btn-big ol', tr('EMPEZAR'));
  const pinta = () => { cuenta.textContent = tr('Elegidas: {a} de {b}', { a: elegidas.length, b: huecos }); s.querySelectorAll('.dc-ventaja[data-ventaja]').forEach(b => { const k = b.dataset.ventaja; b.classList.toggle('dc-elegida', elegidas.includes(k)); if (dcVentajaAbierta(k)) b.disabled = !elegidas.includes(k) && elegidas.length >= huecos; }); };
  if (huecos > 1) s.append(cuenta);
  const sigSuma = Math.min(Infinity, ...Object.values(DC_VENTAJAS).filter(V => V.hito && V.hito.paroSuma && !dcHitoCumplido(V.hito)).map(V => V.hito.paroSuma));
  for (const k in DC_VENTAJAS) {
    const H = DC_VENTAJAS[k].hito || {};
    if (DC_VENTAJAS[k].lider && DC_VENTAJAS[k].lider !== lider) continue;   // las de otro líder no salen
    if (H.paroSuma && H.paroSuma > sigSuma) continue;   // de las genéricas del paro, solo se enseña la siguiente cerrada
    const V = DC_VENTAJAS[k], abierta = dcVentajaAbierta(k), b = dcEl('button', 'dc-opcion dc-ventaja' + (huecos > 1 ? ' dc-varias' : '') + (abierta ? '' : ' dc-cerrada')); b.dataset.ventaja = k;
    b.append(dcEl('b', '', tr(V.nombre)), dcEl('small', 'dc-riesgo', abierta ? tr('Desbloqueada') : tr('Se desbloquea: {h}', { h: dcTextoHito(k) })), dcEl('span', '', tr(V.texto)));
    b.disabled = !abierta;
    b.onclick = () => {
      if (huecos === 1) { play('levelup'); return alElegir([k]); }
      play('select'); const i = elegidas.indexOf(k); if (i >= 0) elegidas.splice(i, 1); else if (elegidas.length < huecos) elegidas.push(k); pinta();
    };
    s.append(b);
  }
  if (huecos > 1) { ok.onclick = () => { play('levelup'); alElegir(elegidas.slice()); }; s.append(ok); pinta(); }
  else { const n = dcEl('button', 'btn-ghost ol', tr('SIN VENTAJA')); n.onclick = () => alElegir([]); s.append(n); }
  if (volver) { const v = dcEl('button', 'btn-ghost ol', tr('VOLVER')); v.onclick = () => { play('select'); volver(); }; s.append(v); }
}
