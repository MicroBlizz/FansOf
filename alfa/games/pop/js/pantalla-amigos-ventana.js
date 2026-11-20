// Fans of Pop · PESTAÑA AMIGOS, la ventana (tarea #145, ADR 189; boceto B «Regalos arriba»): arriba los regalos para ti (Lola la primera) con
// RECOGER TODO en dorado; debajo tus amigos con su personaje, por dónde van y su botón de corazón; luego los sugeridos de tus duelos con AÑADIR;
// y fijos abajo INVITAR (rosa) y CORAZÓN A TODOS (turquesa). Tocar a un amigo cambia lo de abajo por su hoja: CORAZÓN, RETAR (si ya existe
// ppAmigosRetar, js/amigos-reto.js) y QUITAR (con confirmación). Aquí solo se pinta; lo que pasa al tocar está en js/pantalla-amigos-regalos.js.
'use strict';
const ppAmAbierta = () => !$pp('#pp-modal').hidden && $pp('#pp-tarjeta').classList.contains('pp-am-lista');
const ppAmEl = (etiqueta, clase, texto = '') => { const e = document.createElement(etiqueta); e.className = clase; e.textContent = texto; return e; };
// el personaje que lleva puesto (perfil.personaje); sin perfil o desconocido, Lola
function ppAmCara(perfil, lado) {
  const id = perfil && PP_SLIME_IDS.includes(perfil.personaje) ? perfil.personaje : 'lola';
  const c = ppCompMini(id, lado); c.classList.add('pp-am-cara');
  return c;
}
const ppAmNombre = x => x.nombre || tr('Alguien');
const ppAmRotulo = a => { const r = PP_AMIGOS_REGLAS.rotuloNivel(a); return tr('Mundo {m} · nivel {n}', { m: r.mundo, n: r.nivel }); };
// un icono dibujado de la barra (corazón, caja, rayo…) en pequeño para los botones
const ppAmIco = (clave, clase = '') => `<svg class="pp-am-ico ${clase}" viewBox="0 0 48 48" aria-hidden="true">${PP_AM_ICONOS[clave]}</svg>`;
const PP_AM_ICONOS = Object.freeze({
  corazon: '<path d="M24 42 7 25a10 10 0 0 1 17-13 10 10 0 0 1 17 13z" class="pp-am-rosa"/>',
  rayo: '<path d="M27 4 11 27h11l-4 17 19-25H26z"/>',
  atras: '<path d="M30 8 12 24l18 16" fill="none" stroke-width="7" stroke-linecap="round"/>',
});
/* ---------- la cabeza: volver, el título y tus corazones ---------- */
function ppAmCabeza() {
  const cab = ppAmEl('div', 'pp-am-cab');
  const atras = ppBoton('', 'pp-btn2 pp-azul pp-am-atras', () => { PP_AM.hoja = null; ppCierra(); });
  atras.innerHTML = ppAmIco('atras'); atras.setAttribute('aria-label', tr('VOLVER'));
  const vidas = ppAmEl('span', 'pp-am-vidas' + (PP_AM.sube ? ' pp-am-sube' : ''));
  vidas.innerHTML = `${ppIcono(ppInfinitas() ? 'i-infinito' : 'i-vida', 30, '#ff4a6a')}<b>${ppInfinitas() ? '' : `${ppVidas()}/${PP_CFG.vida}`}</b>`;
  PP_AM.sube = false;
  cab.append(atras, ppAmEl('h2', '', tr('Amigos')), vidas);
  return cab;
}
/* ---------- los regalos para ti ---------- */
// cuántos han llegado hoy (los del buzón con fecha de hoy), como mucho el tope
function ppAmHoyN(l) {
  const dia = c => (c === null ? '' : new Date(c).toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' }));
  return Math.min(l.tope, l.regalos.filter(g => dia(g.creado) === l.hoy).length);
}
function ppAmSobre(cara, nombre, icono, clase, alTocar) {
  const b = ppBoton('', 'pp-am-sobre ' + clase, alTocar);
  b.append(cara, ppAmEl('b', '', nombre));
  b.insertAdjacentHTML('beforeend', icono);
  return b;
}
function ppAmSobres(l) {
  const pila = ppAmEl('div', 'pp-am-pila');
  if (ppAmLolaHay()) pila.appendChild(ppAmSobre(ppCompMini('lola', 64), tr('Lola'), ppIcono('i-regalo', 34, '#9cf0a0'), 'pp-am-lola', ppVentanaLola));
  for (const g of l ? l.regalos : []) pila.appendChild(ppAmSobre(ppAmCara(g.perfil, 64), ppAmNombre(g), ppIcono('i-vida', 34, '#ff4a6a'), '', () => ppVentanaRegaloAmigo(g)));
  return pila;
}
function ppAmRegalos() {
  const l = ppAmLatidoBueno(), caja = ppAmEl('section', 'pp-am-bloque');
  const tope = l ? l.tope : PP_AMIGOS_REGLAS.TOPE_DIA, n = l ? ppAmHoyN(l) : 0;
  caja.appendChild(ppAmEl('h3', 'pp-am-sec', tr('Regalos para ti ({n} de {tope} hoy)', { n, tope })));
  const pila = ppAmSobres(l);
  if (!pila.children.length) { caja.appendChild(ppAmEl('p', 'pp-am-vacio', tr('Hoy no hay más regalos. ¡Vuelve mañana!'))); return caja; }
  caja.append(pila, ppBoton(tr('RECOGER TODO'), 'pp-btn2 pp-oro pp-am-todo', ppAmRecogeTodo));
  return caja;
}
/* ---------- tus amigos ---------- */
// el botón de corazón de una fila: enviar (turquesa con el corazón), ENVIADO o LLENO (blancos, sin toque)
function ppAmBotonCorazon(a) {
  const e = PP_AMIGOS_REGLAS.estadoAmigo(a);
  if (e !== 'enviar') return ppAmEl('span', 'pp-am-hecho pp-am-' + e, e === 'lleno' ? tr('LLENO') : tr('ENVIADO'));
  const b = ppBoton('', 'pp-btn2 pp-am-mini', () => ppAmMandaCorazon(a, b));
  b.innerHTML = ppAmIco('corazon'); b.setAttribute('aria-label', tr('Mandar un corazón'));
  return b;
}
function ppAmFila(a) {
  const fila = ppAmEl('div', 'pp-am-fila' + (PP_AM.hoja === a.codigo ? ' pp-am-tocada' : ''));
  const toca = ppBoton('', 'pp-am-quien', () => { PP_AM.hoja = a.codigo; PP_AM.quitar = false; ppVentanaAmigos(); });
  const nom = ppAmEl('span', 'pp-am-nom');
  nom.append(ppAmEl('b', '', ppAmNombre(a)), ppAmEl('small', '', a.lleno ? tr('Hoy ya tiene sus 5') : ppAmRotulo(a)));
  toca.append(ppAmCara(a.perfil, 70), nom);
  fila.append(toca, ppAmBotonCorazon(a));
  return fila;
}
// sin amigos: Lola anima a invitar
function ppAmLolaVacio() {
  const fila = ppAmEl('div', 'pp-am-fila pp-am-lola');
  const nom = ppAmEl('span', 'pp-am-nom');
  nom.append(ppAmEl('b', '', tr('Lola')), ppAmEl('small', '', tr('¡Invita a tus amigos y mandaos corazones cada día!')));
  fila.append(ppCompMini('lola', 70), nom);
  return fila;
}
function ppAmAmigos() {
  const caja = ppAmEl('section', 'pp-am-bloque');
  caja.appendChild(ppAmEl('h3', 'pp-am-sec', tr('Tus amigos')));
  const l = PP_AM.latido;
  if (!l) caja.appendChild(ppAmEl('p', 'pp-am-vacio', tr('Cargando…')));
  else if (!l.ok) caja.appendChild(ppAmEl('p', 'pp-am-aviso', ppAmAviso(l.motivo)));
  else if (!l.amigos.length) caja.appendChild(ppAmLolaVacio());
  else for (const a of l.amigos) caja.appendChild(ppAmFila(a));
  return caja;
}
/* ---------- de tus duelos ---------- */
function ppAmSugerido(s) {
  const fila = ppAmEl('div', 'pp-am-fila');
  const nom = ppAmEl('span', 'pp-am-nom');
  nom.append(ppAmEl('b', '', ppAmNombre(s)), ppAmEl('small', '', tr('Jugasteis un duelo')));
  const quien = ppAmEl('span', 'pp-am-quien');
  quien.append(ppAmCara(s.perfil, 70), nom);
  const b = ppBoton(tr('AÑADIR'), 'pp-btn2 pp-am-mini pp-am-texto', () => ppAmAnade(s, b));
  fila.append(quien, b);
  return fila;
}
function ppAmSugeridos() {
  const l = ppAmLatidoBueno();
  if (!l || !l.sugeridos.length) return null;
  const caja = ppAmEl('section', 'pp-am-bloque');
  caja.appendChild(ppAmEl('h3', 'pp-am-sec', tr('De tus duelos')));
  for (const s of l.sugeridos) caja.appendChild(ppAmSugerido(s));
  return caja;
}
// el texto de cada frase ya hecha (PP_AMIGOS_REGLAS.FRASES), con tr('literal') para el control de idioma
const PP_AM_FRASES = { gracias: () => tr('¡Gracias!'), lomas: () => tr('¡Eres lo más!'), devuelvo: () => tr('¡Te devuelvo uno!'), alcanzo: () => tr('¡Te alcanzo!') };
const ppAmFraseTexto = id => (PP_AM_FRASES[id] ? PP_AM_FRASES[id]() : '');
// las gracias que te han dado desde la última vez (llegan una sola vez: se enseñan al abrir y se olvidan)
function ppAmGraciasVistas() {
  if (!PP_AM.gracias.length) return null;
  const caja = ppAmEl('div', 'pp-am-gracias');
  for (const g of PP_AM.gracias) {
    caja.appendChild(ppAmEl('p', '', tr('{nombre} te dice: {frase}', { nombre: ppAmNombre(g), frase: ppAmFraseTexto(g.frase) })));
  }
  PP_AM.gracias = [];
  return caja;
}
/* ---------- lo de abajo: los dos botones fijos o la hoja del amigo tocado ---------- */
function ppAmPieFijo(pie) {
  const invitar = ppBoton(tr('INVITAR'), 'pp-btn pp-am-invitar', () => ppAmInvita(invitar));
  const todos = ppBoton('', 'pp-btn2 pp-am-todos', ppAmCorazonATodos);
  todos.innerHTML = `${ppAmIco('corazon')}${tr('A TODOS')}`;
  todos.setAttribute('aria-label', tr('CORAZÓN A TODOS'));
  pie.append(invitar, todos);
}
const ppAmAmigoDe = codigo => { const l = ppAmLatidoBueno(); return l ? l.amigos.find(a => a.codigo === codigo) : null; };
function ppAmHojaBotones(a) {
  const fila = ppAmEl('div', 'pp-am-dos'), e = PP_AMIGOS_REGLAS.estadoAmigo(a);
  const cor = ppBoton('', 'pp-btn2 pp-am-hoja-b', () => ppAmMandaCorazon(a, cor));
  cor.innerHTML = e === 'enviar' ? `${ppAmIco('corazon')}${tr('CORAZÓN')}` : e === 'lleno' ? tr('LLENO') : tr('ENVIADO');
  cor.disabled = e !== 'enviar';
  fila.appendChild(cor);
  if (typeof ppAmigosRetar === 'function') {
    const retar = ppBoton('', 'pp-btn2 pp-am-hoja-b', () => ppAmigosRetar(a.codigo, ppAmNombre(a)));
    retar.innerHTML = `${ppAmIco('rayo')}${tr('RETAR')}`;
    fila.appendChild(retar);
  }
  return fila;
}
function ppAmHojaQuitar(pie, a) {
  pie.appendChild(ppAmEl('p', 'pp-am-pregunta', tr('¿Quitar a {nombre} de tus amigos?', { nombre: ppAmNombre(a) })));
  const fila = ppAmEl('div', 'pp-am-dos');
  fila.append(ppBoton(tr('SÍ, QUITAR'), 'pp-btn pp-am-hoja-b', () => ppAmQuita(a)),
    ppBoton(tr('NO'), 'pp-btn2 pp-azul pp-am-hoja-b', () => { PP_AM.quitar = false; ppVentanaAmigos(); }));
  pie.appendChild(fila);
}
function ppAmHoja(pie, a) {
  pie.classList.add('pp-am-hoja');
  pie.append(ppAmEl('h4', '', ppAmNombre(a)), ppAmEl('small', 'pp-am-tope', ppAmRotulo(a)));
  if (PP_AM.quitar) { ppAmHojaQuitar(pie, a); return; }
  pie.appendChild(ppAmHojaBotones(a));
  const fila = ppAmEl('div', 'pp-am-dos');
  fila.append(ppBoton(tr('QUITAR'), 'pp-am-quitar', () => { PP_AM.quitar = true; ppVentanaAmigos(); }),
    ppBoton(tr('VOLVER'), 'pp-btn2 pp-azul pp-am-hoja-b', () => { PP_AM.hoja = null; ppVentanaAmigos(); }));
  pie.appendChild(fila);
}
function ppAmPie() {
  const pie = ppAmEl('div', 'pp-am-pie'), a = PP_AM.hoja && ppAmAmigoDe(PP_AM.hoja);
  if (a) ppAmHoja(pie, a); else { PP_AM.hoja = null; ppAmPieFijo(pie); }
  pie.appendChild(ppAmEl('p', 'pp-am-estado', PP_AM.aviso));
  PP_AM.aviso = '';
  return pie;
}
/* ---------- la ventana ---------- */
function ppVentanaAmigos() {
  const antes = ppAmAbierta() ? $pp('#pp-tarjeta').scrollTop : 0;
  const t = ppAbre('', true);
  t.classList.add('pp-am', 'pp-am-lista');
  if (PP_AM.hoja) t.classList.add('pp-am-con-hoja');
  t.append(ppAmCabeza());
  const gracias = ppAmGraciasVistas(), sugeridos = ppAmSugeridos();
  if (gracias) t.appendChild(gracias);
  t.append(ppAmRegalos(), ppAmAmigos());
  if (sugeridos) t.appendChild(sugeridos);
  t.appendChild(ppAmPie());
  t.scrollTop = antes;
}
// lo que hace el botón AMIGOS: la ventana con lo último que se sabe, y el latido y el enlace pedidos ya (la ventana se repinta al llegar)
function ppAmigosAbre() {
  PP_AM.hoja = null; PP_AM.quitar = false; PP_AM.aviso = '';
  ppVentanaAmigos();
  ppAmigosLatido(true);
  ppAmEnlacePrepara();
}
