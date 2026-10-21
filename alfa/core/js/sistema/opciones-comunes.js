// Fans Of · COMPONENTE de OPCIONES: las filas que repite la pantalla de Opciones de casi todos los juegos (volumen, interruptores, idioma, cuenta, novedades, instalar, versión),
// hechas una sola vez, con el mismo aspecto (la lista `.opt-list` de core/css) y los mismos textos (ya traducidos en core/idioma). Es de core: ningún `if` de juego.
// Qué pone el juego: sus datos y sus acciones, como funciones (leer y guardar el volumen, abrir sus novedades…); el componente pone el aspecto y el orden.
//   OPCIONES.lista({ filas: [...], versionTexto, claseVersion, alCerrar, cerrarTexto })  →  { lista, version, cerrar }   la lista entera, en orden, para colocarla en la ventana del juego
//   OPCIONES.fila(titulo, texto, control)                 una fila «.opt-row» con un título, una explicación (opcional) y su control (un botón, una barra…)
//   OPCIONES.volumen(titulo, leer, guardar, [texto])      barra 0-100; leer() y guardar(v) trabajan con 0 a 1
//   OPCIONES.interruptor(titulo, texto, leer, guardar, [[si, no]])   botón ENCENDIDO / APAGADO (o los dos textos que se pasen)
//   OPCIONES.idioma()  OPCIONES.cuenta()  OPCIONES.novedades(abre, [texto])  OPCIONES.instalar()  OPCIONES.versionTexto(texto, [clase])
// En `filas` de lista() va cada fila ya hecha (con OPCIONES.xxx) o un texto: 'idioma', 'cuenta', 'instalar'. Las filas propias del juego se hacen con OPCIONES.fila().
// Qué trae core ya hecho y NO está aquí (porque depende de cada partida): «Datos de partida anónimos» (core/js/sistema/datos-partida.js) viaja dentro de la fila de Cuenta; la música del menú y el
// progreso (copiar, cargar, borrar) siguen en core/js/sistema/opciones.js para los juegos con la lista de Opciones en el HTML. Pendiente: llevar también esos al componente (core/LEEME.md).
'use strict';
const OPCIONES = (() => {
  const t = (x, d) => (typeof IDIOMA !== 'undefined' && IDIOMA.tr ? IDIOMA.tr(x, d) : x);
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; };
  function fila(titulo, texto, control) {
    const f = el('div', 'opt-row'), s = el('span'); s.append(el('b', '', titulo));
    if (texto) s.append(document.createElement('br'), document.createTextNode(texto));
    f.append(s); if (control) f.append(control); return f;
  }
  function volumen(titulo, leer, guardar, texto) {
    const r = document.createElement('input'); r.type = 'range'; r.min = 0; r.max = 100; r.value = Math.round(leer() * 100);
    r.oninput = () => guardar(r.value / 100); r.onchange = () => { if (typeof play === 'function') play('select'); };
    return fila(titulo, texto || '', r);
  }
  function interruptor(titulo, texto, leer, guardar, etiquetas) {
    const [si, no] = etiquetas || ['ENCENDIDO', 'APAGADO'], b = el('button', 'btn-ghost ol'), pinta = () => { b.textContent = t(leer() ? si : no); };
    b.onclick = () => { guardar(!leer()); if (typeof play === 'function') play('select'); pinta(); }; pinta();
    return fila(titulo, texto, b);
  }
  function idioma() {
    const banderas = el('span', 'idioma-fl'); banderas.id = 'idioma-banderas';
    const f = fila(t('Idioma / Language'), t('Automático: el del navegador. Al cambiarlo se recarga la página.'), banderas);
    try { pintarBanderas(banderas)(); } catch (e) { /* sin banderas */ }
    return f;
  }
  const cuenta = () => window.filaCuenta || null;   // la fila de cuenta (con el interruptor de datos dentro) que pone core cuando hay cuenta
  function novedades(abre, texto) { const b = el('button', 'btn-ghost ol', t('VER')); b.onclick = abre; return fila(t('Novedades'), texto || t('Lo nuevo de cada versión.'), b); }
  const instalar = () => (typeof installApp === 'function' ? (() => { const b = el('button', 'btn-ghost ol', t('INSTALAR')); b.onclick = installApp; return fila(t('Instalar en el móvil'), t('Ábrelo como una app: a pantalla completa y sin la barra del navegador.'), b); })() : null);
  const versionTexto = (txt, clase) => el('p', clase || 'opt-ver', txt);   // el pie con la versión (core/css/menus.css: .opt-ver); un juego puede pasar su propia clase
  function lista(o) {
    const l = el('div', 'opt-list'), mapa = { idioma, cuenta, instalar };
    for (const x of o.filas || []) { const f = typeof x === 'string' ? (mapa[x] ? mapa[x]() : null) : x; if (f) l.append(f); }
    const version = o.versionTexto ? versionTexto(o.versionTexto, o.claseVersion) : null;
    let cerrar = null; if (o.alCerrar) { cerrar = el('button', 'btn-big ol', t(o.cerrarTexto || 'CERRAR')); cerrar.onclick = () => { if (typeof play === 'function') play('select'); o.alCerrar(); }; }
    return { lista: l, version, cerrar };
  }
  return { fila, volumen, interruptor, idioma, cuenta, novedades, instalar, versionTexto, lista };
})();
