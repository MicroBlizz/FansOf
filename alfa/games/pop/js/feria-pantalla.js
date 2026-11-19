// Fans of Pop · FERIA DEL FINDE (pantalla; tarea #97, ADR 151): el botón del lateral con su reloj, la ventana «camino de feria» con
// sus 10 paradas y Lola marcando por dónde vas, la bienvenida de Lola el viernes, los cofres, la línea «+N para la Feria del finde»
// de las victorias y la entrega sola de lo no recogido. Las reglas están en el dominio (js/feria.js, PP_FERIA); aquí solo se lee la
// hora del móvil (ppFeriaAhora, que el panel DEV puede adelantar), el azar de los cofres (Math.random) y la partida guardada (SAVE.feria).
'use strict';
// la hora del móvil; en la alfa o en localhost, el panel DEV la puede mover (SAVE.devFeria, en ms) sin tocar el dominio
const ppFeriaAhora = () => new Date(Date.now() + (ppEsPruebas() ? SAVE.devFeria || 0 : 0));
// las paradas del camino de feria (en % de la caja), de abajo arriba
const PP_FERIA_PUNTOS = [[20, 92], [50, 88], [80, 80], [70, 64], [40, 58], [18, 46], [42, 34], [74, 28], [58, 13], [26, 6]];
const ppTicketHtml = (grande = false) => `<span class="pp-tk${grande ? ' pp-tk-grande' : ''}"></span>`;

/* ---------- el estado al día ---------- */
// pone SAVE.feria al día con la hora de ahora y entrega solo lo que quedara sin recoger de un finde que ya acabó. Primero el estado
// nuevo y luego los premios, que se apuntan en `entregados` (guardado) para contarlos al llegar al camino aunque se cierre el juego antes
function ppFeriaAlDia() {
  const v = PP_FERIA.ventana(ppFeriaAhora());
  const F = SAVE.feria || {};
  const r = PP_FERIA.alDia(F.estado, v);
  SAVE.feria = { estado: r.estado, bienvenida: F.bienvenida || '', entregados: F.entregados || [] };
  for (const p of r.entregar) SAVE.feria.entregados.push(ppFeriaDa(p));
  if (r.entregar.length) ppGuarda();
  return v;
}
// da un premio de un tramo (un cofre se abre aquí, con azar: solo se gana jugando, ADR 004) y devuelve lo que se dio
function ppFeriaDa(premio) {
  const base = premio.cofre ? PP_FERIA.abreCofre(premio.cofre, Math.random).premio : premio, id = ppFeriaCompanero(premio);
  const p = id ? { ...base, companero: id } : base;
  ppDaPremio(p);
  return p;
}
// con el flag `companeros`, el compañero que da además un tramo (la Mariquita y la Mariposa; js/companeros-datos.js, VIAS); si no, null.
// `premio` es el objeto del propio tramo (PP_FERIA.coge y alDia devuelven los de PP_FERIA.TRAMOS), y por él se sabe qué tramo es
function ppFeriaCompanero(premio) {
  if (!ppCompanerosActivo()) return null;
  return PP_COLE.deFeria(PP_FERIA.TRAMOS.findIndex(t => t.premio === premio));
}

/* ---------- tras ganar un nivel (js/partida.js) ---------- */
// toda victoria, nueva o repetida, da tickets mientras la feria está abierta. Devuelve { n, subio } o null
// `extra`: tickets de más (el Feriante de los compañeros, js/habilidades-niveles.js)
function ppFeriaGana(estrellas, jefe, extra = 0) {
  const v = ppFeriaAlDia();
  if (!v.abierta) return null;
  const n = PP_FERIA.tickets(estrellas, jefe) + extra;
  const r = PP_FERIA.suma(SAVE.feria.estado, n);
  if (!r.ok) return null;
  SAVE.feria.estado = r.estado; ppGuarda();
  return { n, subio: r.subio };
}
// la línea de tickets de las ventanas de victoria (js/pantallas.js)
function ppFeriaLinea(T) {
  if (!T || !T.feria) return '';
  const sube = T.feria.subio > 0 ? `<p class="pp-sub"><b>${tr('¡Nuevo premio en la feria!')}</b></p>` : '';
  return `<div class="pp-gana-tk">${ppTicketHtml()} ${tr('+{n} para la Feria del finde', { n: T.feria.n })}</div>${sube}`;
}

/* ---------- el botón del lateral (js/ofertas.js) ---------- */
// «2d 14h», «5h 3m» o «12m»
function ppFeriaRelojCorto(ms) {
  const s = Math.max(0, Math.floor(ms / 1000)), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
  if (d) return tr('{d}d {h}h', { d, h });
  return h ? tr('{h}h {m}m', { h, m }) : tr('{m}m', { m });
}
function ppFeriaBotonLateral(L) {
  const v = ppFeriaAlDia(), E = SAVE.feria.estado;
  const aviso = v.abierta && PP_FERIA.pendientes(E).length > 0;
  const b = document.createElement('button'); b.type = 'button';
  b.className = 'pp-lado pp-lado-feria' + (v.abierta ? '' : ' pp-apagado') + (aviso ? ' pp-aviso' : '');
  b.innerHTML = `${ppTicketHtml(true)}<b>${v.abierta ? ppFeriaRelojCorto(v.cierraEn) : tr('Vie')}</b>`;
  b.onclick = () => { play('select'); if (v.abierta) ppVentanaFeria(); else ppVentanaFeriaCerrada(); };
  L.appendChild(b);
}

/* ---------- la ventana: camino de feria ---------- */
function ppVentanaFeria() {
  const v = ppFeriaAlDia();
  if (!v.abierta) { ppVentanaFeriaCerrada(); return; }
  const E = SAVE.feria.estado, ultima = v.cierraEn < 3 * 3600000;
  const t = ppAbre(`<h2>${tr('Feria del finde')}</h2>
    <span class="pp-feria-reloj">${ultima ? tr('¡Última hora! Acaba en {t}', { t: ppFeriaRelojCorto(v.cierraEn) }) : tr('Acaba en {t}', { t: ppFeriaRelojCorto(v.cierraEn) })}</span>
    <p class="pp-sub">${tr('Gana niveles para sumar tickets {tk}: 1 por nivel, 2 con tres estrellas y 3 un jefe.', { tk: ppTicketHtml() })}</p>`, true);
  t.appendChild(ppFeriaCamino(E));
  t.insertAdjacentHTML('beforeend', `<p class="pp-sub">${ppFeriaFaltan(E)}</p>`);
  t.appendChild(ppBoton(tr('VOLVER'), 'pp-btn2 pp-azul', () => { ppCierra(); ppPintaLateral(); }));
}
// qué falta para el siguiente premio (y si hay paradas por recoger)
function ppFeriaFaltan(E) {
  const sig = PP_FERIA.siguiente(E.tickets);
  const txt = sig ? tr('Tienes {n} {tk}. Faltan {f} para el siguiente premio.', { n: E.tickets, tk: ppTicketHtml(), f: sig.faltan }) : tr('¡Feria completa!');
  return txt + (PP_FERIA.pendientes(E).length ? ` <b>${tr('Toca las paradas verdes para recoger.')}</b>` : '');
}
// el icono de una parada: el cofre, la moneda, el infinito o la primera ayuda
function ppFeriaIcono(p, px) {
  const id = ppFeriaCompanero(p);
  if (id) return ppViaDibujoHtml(id, px + 10);   // el tramo con compañero lo enseña a él (flag `companeros`)
  if (p.cofre) return ppIcono('i-cofre', px + 10, '#ff9ccf');
  if (p.monedas) return ppIcono('i-moneda', px);
  if (p.infinitas) return ppIcono('i-infinito', px, '#ff4a6a');
  return ppIcono('i-' + Object.keys(p.ayudas)[0], px, '#ffd1ec');
}
function ppFeriaCamino(E) {
  const caja = document.createElement('div'); caja.className = 'pp-feria';
  const d = PP_FERIA_PUNTOS.map(([x, y], k) => `${k ? 'L' : 'M'}${x} ${y}`).join(' ');
  caja.innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none"><path d="${d}" class="pp-feria-via"/><path d="${d}" class="pp-feria-raya"/></svg>`;
  const alcanzados = PP_FERIA.tramo(E.tickets);
  PP_FERIA.TRAMOS.forEach((T, k) => caja.appendChild(ppFeriaParada(E, T, k, alcanzados)));
  caja.appendChild(ppFeriaLola(E, alcanzados));
  return caja;
}
function ppFeriaParada(E, T, k, alcanzados) {
  const cogido = E.cogidos.includes(k), listo = k < alcanzados && !cogido;
  const p = document.createElement('div');
  p.className = 'pp-parada' + (T.premio.cofre ? ' pp-parada-cofre' : '') + (k < alcanzados ? ' pp-alcanzado' : '') + (listo ? ' pp-listo' : '') + (cogido ? ' pp-cogido' : '');
  p.style.left = PP_FERIA_PUNTOS[k][0] + '%'; p.style.top = `calc(${PP_FERIA_PUNTOS[k][1]}% - 22px)`;
  p.innerHTML = `<div class="pp-bola">${ppFeriaIcono(T.premio, 30)}</div><small>${T.tk}</small>`;
  if (listo) p.onclick = () => ppFeriaRecoge(k);
  return p;
}
// Lola, entre la última parada alcanzada y la siguiente, según los tickets
function ppFeriaLola(E, n) {
  const P = PP_FERIA_PUNTOS, T = PP_FERIA.TRAMOS, a = n ? P[n - 1] : [8, 100], b = P[Math.min(n, P.length - 1)];
  const de = n ? T[n - 1].tk : 0, hasta = n < T.length ? T[n].tk : de, r = hasta > de ? (E.tickets - de) / (hasta - de) : 0;
  const yo = document.createElement('div'); yo.className = 'pp-feria-yo';
  yo.appendChild(ppMiniatura('sl-lola', 46));
  yo.style.left = (a[0] + (b[0] - a[0]) * r) + '%'; yo.style.top = (a[1] + (b[1] - a[1]) * r) + '%';
  return yo;
}
function ppFeriaRecoge(k) {
  const r = PP_FERIA.coge(SAVE.feria.estado, k);
  if (!r.ok) return;
  SAVE.feria.estado = r.estado;
  const dado = ppFeriaDa(r.premio);
  play('ppPremio'); ppPintaLateral(); ppBarraAyudas();
  if (r.premio.cofre) ppVentanaFeriaCofre(r.premio.cofre, dado); else ppVentanaFeria();
}
function ppVentanaFeriaCofre(cual, dado) {
  const gordo = cual === 'gordo';
  play('ppVictoria'); ppVibra([20, 30, 20]);
  const t = ppAbre(`<h2>${gordo ? tr('¡Cofre gordo!') : tr('¡Cofre!')}</h2><div class="pp-cofre">${ppIcono('i-cofre', gordo ? 120 : 92, '#ff9ccf')}</div>
    <p class="pp-sub">${tr('Ha salido:')}</p>${ppPremioCandyHtml(dado, 34)}`);
  t.appendChild(ppBoton(tr('¡GENIAL!'), 'pp-btn', ppVentanaFeria));
}

/* ---------- cerrada, bienvenida y entrega ---------- */
function ppVentanaFeriaCerrada() {
  const v = PP_FERIA.ventana(ppFeriaAhora());
  const t = ppAbre(`<h2>${tr('La feria vuelve el viernes')}</h2><p class="pp-sub">${tr('La Feria del finde abre cada viernes y cierra el domingo a medianoche.')}</p>
    <span class="pp-feria-reloj">${tr('Abre en {t}', { t: ppFeriaRelojCorto(v.abreEn) })}</span>`);
  t.appendChild(ppBoton(tr('VOLVER'), 'pp-btn2 pp-azul', ppCierra));
}
function ppVentanaFeriaBienvenida(v) {
  const t = ppAbre(`<div class="pp-feria-lola"></div><h2>${tr('¡Ha llegado la Feria del finde!')}</h2>
    <p class="pp-sub">${tr('Hasta el domingo a medianoche, cada nivel que ganes te da tickets {tk}. Júntalos y gana monedas, ayudas, corazones infinitos y dos cofres.', { tk: ppTicketHtml() })}</p>
    <span class="pp-feria-reloj">${tr('Acaba en {t}', { t: ppFeriaRelojCorto(v.cierraEn) })}</span>`);
  $pp('.pp-feria-lola').appendChild(ppMiniatura('sl-lola', 90));
  t.appendChild(ppBoton(tr('¡A JUGAR!'), 'pp-btn', ppCierra));
  t.appendChild(ppBoton(tr('VER PREMIOS'), 'pp-btn2 pp-oro', ppVentanaFeria));
}
function ppVentanaFeriaEntregada() {
  const lista = SAVE.feria.entregados.splice(0).map(p => ppPremioCandyHtml(p, 30)).join(''); ppGuarda();
  const t = ppAbre(`<h2>${tr('Feria del finde')}</h2><p class="pp-sub">${tr('Te quedaban premios sin recoger: ya están en tu cuenta.')}</p>${lista}`);
  t.appendChild(ppBoton(tr('¡GENIAL!'), 'pp-btn', () => { ppCierra(); ppPintaLateral(); }));
}
// al llegar al camino (js/pase.js): lo entregado solo y, el primer rato de cada finde, la bienvenida. true si abrió una ventana
function ppFeriaAlLlegar() {
  const v = ppFeriaAlDia();
  if (SAVE.feria.entregados.length) { ppVentanaFeriaEntregada(); return true; }
  if (!v.abierta || SAVE.feria.bienvenida === v.id) return false;
  SAVE.feria.bienvenida = v.id; ppGuarda(); ppVentanaFeriaBienvenida(v);
  return true;
}
