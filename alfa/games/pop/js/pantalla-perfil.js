// Fans of Pop · PANTALLA «MI PERFIL» (tarea #41, ADR 130; Pepins, 17-11-2026): el botón PERFIL del menú abre esta ventana. Arriba, el
// panel tal cual lo verá el rival en el VS (js/pintar-perfil.js); debajo, ocho pestañas (personaje, marco, frase, título, pegatinas,
// efecto de pop, fondo y entrada) con todo el catálogo. Tocar algo que ya es tuyo te lo pone; tocar algo que no, pregunta si lo compras
// con perlas (precio fijo, sin azar). Las reglas y el servidor están en PP_MI (js/perfil-juego.js): aquí solo se pinta y se pregunta.
'use strict';
const PP_PF = { tab: 'personaje', ocupado: false, aviso: '', compra: null, reloj: 0 };
const PP_PF_TABS = [['personaje', 'Personaje'], ['marco', 'Marco'], ['frase', 'Frase'], ['titulo', 'Título'], ['pegatina', 'Pegatinas'], ['efecto', 'Efecto'], ['fondo', 'Fondo'], ['entrada', 'Entrada']];
const PP_PF_ERRORES = {
  faltan_perlas: 'Te faltan perlas', pegatinas_llenas: 'Solo caben 4 pegatinas: quita una primero', sin_red: 'Sin conexión: prueba otra vez en un rato',
  sin_cuenta: 'Para comprar hace falta conexión y tu cuenta', tienda_cerrada: 'La tienda del perfil está cerrada ahora mismo', no_lo_tienes: 'Eso todavía no es tuyo',
};
const ppPfError = e => tr(PP_PF_ERRORES[e] || 'No se ha podido. Prueba otra vez.');
const ppPfNombre = (tipo, d) => (tipo === 'personaje' ? tr(ppSlimeDe(d.id).nombre) : d.texto ? tr(d.texto) : d.nombre ? tr(d.nombre) : '');
const ppPfEl = (etiqueta, clase, html = '') => { const e = document.createElement(etiqueta); e.className = clase; e.innerHTML = html; return e; };
const ppPfAbierta = () => !$pp('#pp-modal').hidden && $pp('#pp-tarjeta').classList.contains('pp-perfil');
// el botón del menú: solo con el flag abierto
function ppPerfilBoton() {
  const b = $pp('#pp-perfil'); if (!b) return;
  b.hidden = !ppPerfilActivo(); ppBarraBoton('#pp-perfil', 'perfil', tr('PERFIL'));   // en la barra de la portada (js/portada-barra.js)
}
/* ---------- el panel de arriba, animado mientras la ventana está abierta ---------- */
function ppPfPanel() {
  const cv = document.createElement('canvas'), px = Math.min(2, window.devicePixelRatio || 1), W = 206, H = 272;
  cv.className = 'pp-pf-panel'; cv.width = W * px; cv.height = H * px; cv.style.width = W + 'px'; cv.style.height = H + 'px';
  const c = cv.getContext('2d'), turno = ++PP_PF.reloj;
  const pinta = t => {
    if (turno !== PP_PF.reloj || !cv.isConnected) return;   // otra ventana o un repintado: este lienzo ya no se usa
    c.setTransform(px, 0, 0, px, 0, 0); c.clearRect(0, 0, W, H);
    ppPerfilPanel(c, PP_MI.perfil(), PP_MI.cat, PP_MI.nombre, 13, 13, W - 26, H - 26, t / 1000);
    requestAnimationFrame(pinta);
  };
  requestAnimationFrame(() => requestAnimationFrame(pinta));   // cuando ya está en la página
  return cv;
}
// las perlas que valen para el perfil (las del servidor, PP_MI.yo().perlas), no el saldo del juego, que suma las de prueba (Pepins,
// 18-11-2026: veía 5.000 y solo podía gastar 10). Si hay de prueba, un aviso pequeño de que aquí no valen
function ppPfSaldo(tam) {
  const valen = PP_MI.yo().perlas, deMas = (SAVE.perlas || 0) > valen;
  return ppPerlasHtml(valen, tam) + (deMas ? `<br><small class="pp-pf-nota">${tr('Las perlas de prueba no valen aquí')}</small>` : '');
}
function ppPfResumen() {
  const P = PP_MI.perfil(), d = (tipo, id) => PP_MI.dato(tipo, id) || {};
  const r = ppPfEl('div', 'pp-pf-resumen', `<p class="pp-sub">${tr('Así te verán en los duelos.')}</p>
    <p class="pp-pf-saldo">${tr('Tienes:')} ${ppPfSaldo(28)}</p>
    <p class="pp-pf-linea"><b>${tr('Efecto')}</b> ${tr(d('efecto', P.efecto).nombre || '')}</p>
    <p class="pp-pf-linea"><b>${tr('Entrada')}</b> ${tr(d('entrada', P.entrada).nombre || '')}</p>`);
  if (!PP_SRV.puedeComprar()) r.insertAdjacentHTML('beforeend', `<p class="pp-pf-nota">${tr('Para comprar hace falta conexión y tu cuenta')}</p>`);
  const b = ppBoton('', 'pp-btn2 pp-oro pp-pf-mas', () => ppTienda(() => ppVentanaPerfil(), 'perlas'));
  b.innerHTML = `${ppIcono('i-perlas', 26, '#ffd1ec')}${tr('MÁS PERLAS')}`;
  r.appendChild(b);
  return r;
}
/* ---------- una cosa del catálogo ---------- */
function ppPfEstado(tipo, id) {
  if (PP_MI.puesto(tipo, id)) return `<b class="pp-pf-puesto">${tr('Puesto')}</b>`;
  if (PP_MI.loTengo(tipo, id)) return `<b class="pp-pf-tuyo">${tr(tipo === 'pegatina' ? 'Añadir' : 'Ponerlo')}</b>`;
  if (PP_MI.dato(tipo, id).logro) return `<b class="pp-pf-tuyo">${tr('Con un logro')}</b>`;   // no se vende (tarea 396)
  return ppPerlasPrecioHtml(PP_MI.precio(tipo, id), 22);
}
function ppPfCosa(tipo, d) {
  const b = document.createElement('button'), muestra = ppPerfilMuestra(tipo, d, 76), nombre = ppPfNombre(tipo, d);
  b.type = 'button'; b.className = 'pp-pf-cosa' + (PP_MI.puesto(tipo, d.id) ? ' pp-on' : '') + (muestra ? '' : ' pp-pf-texto') + (PP_MI.loTengo(tipo, d.id) ? '' : ' pp-pf-venta');
  if (muestra) b.appendChild(muestra);
  if (nombre) b.insertAdjacentHTML('beforeend', `<span>${ppEsc(nombre)}</span>`);
  b.insertAdjacentHTML('beforeend', ppPfEstado(tipo, d.id));
  b.onclick = () => { play('select'); ppPerfilToca(tipo, d.id); };
  return b;
}
function ppPerfilToca(tipo, id) {
  if (PP_PF.ocupado) return;
  PP_PF.aviso = '';
  if (!PP_MI.loTengo(tipo, id) && PP_MI.dato(tipo, id).logro) { PP_PF.aviso = tr('Se consigue con un logro de combo: míralos en el Pase.'); ppVentanaPerfil(); return; }
  if (!PP_MI.loTengo(tipo, id)) { ppPerfilConfirma(tipo, id); return; }
  if (tipo !== 'pegatina' && PP_MI.puesto(tipo, id)) return;
  PP_PF.ocupado = true;
  PP_MI.pon(tipo, id).then(r => {
    PP_PF.ocupado = false;
    if (!r.ok && !(r.error === 'no_lo_tienes' && ppCompraDePrueba())) PP_PF.aviso = ppPfError(r.error);   // una cosa de prueba no existe en el servidor: se lleva solo en este móvil
    if (ppPfAbierta()) ppVentanaPerfil();
  });
}
/* ---------- la ventana ---------- */
function ppVentanaPerfil(tab) {
  if (tab) { PP_PF.tab = tab; PP_PF.aviso = ''; }
  const antes = ppPfAbierta() && !tab && $pp('.pp-pf-lista') ? $pp('.pp-pf-lista').scrollTop : 0;
  PP_PF.compra = null; PP_MI.pideNombre();
  const t = ppAbre(`<h2>${tr('Mi perfil')}</h2>`, true);
  t.classList.add('pp-perfil');
  const arriba = ppPfEl('div', 'pp-pf-arriba'); arriba.append(ppPfPanel(), ppPfResumen()); t.appendChild(arriba);
  if (PP_PF.aviso) t.appendChild(ppPfEl('p', 'pp-pf-aviso', ppEsc(PP_PF.aviso)));
  const tabs = ppPfEl('div', 'pp-tabs pp-pf-tabs');
  for (const [k, txt] of PP_PF_TABS) {
    const b = ppPfEl('button', 'pp-tab' + (PP_PF.tab === k ? ' pp-on' : ''), tr(txt)); b.type = 'button';
    b.onclick = () => { play('select'); ppVentanaPerfil(k); }; tabs.appendChild(b);
  }
  t.appendChild(tabs);
  const lista = ppPfEl('div', 'pp-pf-lista' + (PP_PF.tab === 'frase' || PP_PF.tab === 'titulo' ? ' pp-pf-ancha' : ''));
  // los del álbum, solo si los tienes (tarea #142); los de logro de combo, con el flag 'combos' o si ya son tuyos (tarea 396)
  const sale = d => (!d.coleccion && (!d.logro || PP_COMBO.activo())) || PP_MI.loTengo(PP_PF.tab, d.id);
  for (const d of PP_MI.cat[PP_PF.tab]) if (sale(d)) lista.appendChild(ppPfCosa(PP_PF.tab, d));
  t.appendChild(lista);
  if (PP_PF.tab === 'pegatina') t.appendChild(ppPfEl('p', 'pp-sub', `<small>${tr('Llevas {n} de {t} pegatinas para lanzar en el duelo.', { n: PP_MI.perfil().pegatinas.length, t: PP_PERFIL.PEGATINAS })}</small>`));
  ppBotonVolver(t, ppCierra);
  lista.scrollTop = antes;
}
// lo llama el libro de perlas cuando cambia algo (el saldo que llega del servidor, una compra): repinta si la ventana está a la vista
function ppPerfilRepinta() {
  if (!ppPfAbierta() || PP_PF.ocupado) return;
  if (PP_PF.compra) ppPerfilConfirma(PP_PF.compra.tipo, PP_PF.compra.id); else ppVentanaPerfil();
}
/* ---------- comprar ---------- */
function ppPerfilCompra(tipo, id) {
  if (PP_PF.ocupado) return;
  PP_PF.ocupado = true; PP_PF.aviso = '';
  PP_MI.compra(tipo, id).then(r => {
    PP_PF.ocupado = false;
    if (r.ok) { play('ppPremio'); ppVibra([20, 30, 20]); PP_PF.aviso = tr('¡Ya es tuyo!'); ppVentanaPerfil(); return; }
    PP_PF.aviso = ppPfError(r.error); ppPerfilConfirma(tipo, id);
  });
}
function ppPerfilConfirma(tipo, id) {
  const d = PP_MI.dato(tipo, id), precio = PP_MI.precio(tipo, id), tengo = PP_MI.yo().perlas, muestra = ppPerfilMuestra(tipo, d, 120), nombre = ppPfNombre(tipo, d);
  if (PP_MI.loTengo(tipo, id)) { ppVentanaPerfil(); return; }
  PP_PF.compra = { tipo, id };
  const t = ppAbre(`<h2>${tr('¿Lo quieres?')}</h2>`);
  t.classList.add('pp-perfil');
  if (muestra) t.appendChild(muestra);
  if (nombre) t.appendChild(ppPfEl('p', muestra ? 'pp-sub' : 'pp-pf-cita', `<b>${ppEsc(nombre)}</b>`));
  t.appendChild(ppPfEl('p', 'pp-premio', ppPerlasPrecioHtml(precio, 36)));
  t.appendChild(ppPfEl('p', 'pp-sub', `${tr('Tienes:')} ${ppPfSaldo(24)}<br><small>${tr('Precio fijo y sin azar: te llevas justo esto.')}</small>`));
  if (PP_PF.aviso) t.appendChild(ppPfEl('p', 'pp-pf-aviso', ppEsc(PP_PF.aviso)));
  if (!PP_SRV.puedeComprar()) t.appendChild(ppPfEl('p', 'pp-pf-nota', tr('Para comprar hace falta conexión y tu cuenta')));
  else if (tengo < precio) t.appendChild(ppBoton(tr('CONSEGUIR PERLAS'), 'pp-btn', () => ppTienda(() => ppPerfilConfirma(tipo, id), 'perlas')));
  else t.appendChild(ppBoton(tr('COMPRAR'), 'pp-btn', () => ppPerfilCompra(tipo, id)));
  ppBotonVolver(t, () => { PP_PF.aviso = ''; ppVentanaPerfil(); });
}
