// Fans of Rouflage · LOS MENÚS DE PINTAR: el jugador elige cómo quiere el panel del taller y se guarda en su partida (SAVE.menuPintar).
//   clásico: el panel de siempre (todo a la vista).
//   A · pestañas: cuatro pestañas por pasos (Postura, Color, Pincel, Formas) y abajo una barra fija con Deshacer, Calco, el color y LISTO.
//   B · lados: herramientas en una columna a la izquierda, tamaño y retoques a la derecha (donde caen los pulgares); abajo solo colores y LISTO.
//   C · bandejas: cinco botones grandes abajo; cada uno abre su bandeja encima y, al cerrarla, la galleta se ve más grande.
// No se duplica ningún botón: los de siempre (con sus onclick de interfaz.js) se cambian de sitio. En los tres nuevos, el medidor
// de camuflaje sube arriba, bajo el reloj, y la barra de tinta solo sale con el señuelo.
'use strict';

const MENUS_PINTAR = ['clasico', 'a', 'b', 'c'];
const TMENU = { id: 'clasico', sec: 'color', volar: null, listo: false, N: null, C: null };

const menuPintar = () => (MENUS_PINTAR.includes(SAVE.menuPintar) ? SAVE.menuPintar : 'clasico');
const elMenu = (tag, clase, hijos = []) => { const e = document.createElement(tag); if (clase) e.className = clase; e.append(...hijos); return e; };
function botonMenu(icono, texto, clase, accion) {
  const b = elMenu('button', clase); b.type = 'button';
  const i = document.createElement('i'); ponIcono(i, icono);
  const s = document.createElement('small'); s.textContent = tr(texto); s.dataset.es = texto;
  b.append(i, s); b.onclick = accion; return b;
}

// una sola vez: se apuntan los botones de siempre y su orden, y se crean los huecos y botones que usan los menús nuevos
function preparaMenusPintar() {
  ICONOS.postura = '<circle cx="12" cy="4.6" r="2.6" fill="currentColor"/><path d="M12 8v7.5M8.4 9.6v5.2M15.6 9.6v5.2M10.4 15.5v5.6M13.6 15.5v5.6" stroke-width="2.8"/>';
  ICONOS.menus = '<rect x="3.5" y="4" width="17" height="4" rx="1.5"/><rect x="3.5" y="10" width="17" height="4" rx="1.5"/><rect x="3.5" y="16" width="17" height="4" rx="1.5"/>';
  const T = E('taller'), Q = s => T.querySelector(s), QA = s => [...T.querySelectorAll(s)];
  const N = TMENU.N = {
    plegar: E('t-plegar'), medidor: Q('.t-medidor:not(.t-tinta)'), tinta: Q('.t-tinta'), ayuda: E('t-ayuda'), posturas: Q('.t-posturas'), herr: Q('.t-herr'),
    gota: E('t-gota'), radios: QA('.t-radio'), cabezales: QA('.t-cabezal'), cubo: E('t-cubo'), figuras: QA('.t-figura'), senuelo: E('t-senuelo'),
    deshacer: E('t-deshacer'), calco: E('t-calco'), paleta: E('t-paleta'), colores: Q('.t-colores'), color: E('t-color'), recientes: E('t-recientes'), listo: E('t-listo'),
  };
  N.ordenTaller = [...T.children]; N.ordenHerr = [...N.herr.children]; N.ordenColores = [...N.colores.children];
  const C = TMENU.C = {};
  // la pestañita para elegir el menú (al lado de la de plegar)
  C.elige = elMenu('button', 't-menus'); C.elige.type = 'button'; C.elige.id = 't-menus';
  const ic = document.createElement('i'); ponIcono(ic, 'menus'); C.eligeTxt = document.createElement('b'); C.elige.append(ic, C.eligeTxt);
  C.elige.onclick = () => { play('select'); abreEligeMenu(); };
  C.arriba = elMenu('div', 't-arriba');
  C.nav = elMenu('div', 't-nav'); C.nav.setAttribute('role', 'tablist');
  C.cuerpo = elMenu('div', 't-cuerpo');
  C.sec = {}; for (const s of ['postura', 'color', 'pincel', 'formas']) { C.sec[s] = elMenu('div', 't-sec'); C.sec[s].dataset.sec = s; C.cuerpo.append(C.sec[s]); }
  C.filaColor = elMenu('div', 't-fila t-fila-color'); C.filaTam = elMenu('div', 't-fila t-fila-tam'); C.filaForma = elMenu('div', 't-fila t-fila-forma');
  C.barra = elMenu('div', 't-barra'); C.tira = elMenu('div', 't-tira');
  C.izq = elMenu('div', 't-riel t-izq'); C.der = elMenu('div', 't-riel t-der');
  C.volarPostura = elMenu('div', 't-volar t-volar-postura'); C.volarFormas = elMenu('div', 't-volar t-volar-formas');
  // al elegir algo dentro de un desplegable, se cierra (el onclick del botón ya ha hecho su trabajo)
  for (const v of [C.volarPostura, C.volarFormas]) v.addEventListener('click', e => { if (e.target.closest('button')) { TMENU.volar = null; refrescaMenuPintar(); } });
  // A: las pestañas por pasos
  C.tabs = [['postura', 'postura', '1 · Postura'], ['color', 'gota', '2 · Color'], ['pincel', 'pincel', '3 · Pincel'], ['formas', 'cuadro', '4 · Formas']]
    .map(([sec, ico, txt]) => { const b = botonMenu(ico, txt, 't-pest', () => { TMENU.sec = sec; play('select'); refrescaMenuPintar(); }); b.dataset.sec = sec; b.setAttribute('role', 'tab'); return b; });
  // B: los dos botones que abren desplegables
  C.bPostura = botonMenu('postura', 'Postura', 't-abre', () => { TMENU.volar = TMENU.volar === 'postura' ? null : 'postura'; play('select'); refrescaMenuPintar(); });
  C.bFormas = botonMenu('cuadro', 'Formas', 't-abre', () => { TMENU.volar = TMENU.volar === 'formas' ? null : 'formas'; play('select'); refrescaMenuPintar(); });
  // C: los botones grandes que abren su bandeja (el de color lleva dentro la muestra del color puesto)
  const bandeja = sec => () => { TMENU.sec = TMENU.sec === sec ? null : sec; play('select'); refrescaMenuPintar(); if (TALLER.abierto) encuadraTaller(); };
  C.cPostura = botonMenu('postura', 'Postura', 't-grande', bandeja('postura')); C.cPostura.dataset.sec = 'postura';
  C.cColor = botonMenu('gota', 'Color', 't-grande', bandeja('color')); C.cColor.dataset.sec = 'color'; C.cColor.querySelector('i').remove();
  C.cPincel = botonMenu('pincel', 'Pincel', 't-grande', bandeja('pincel')); C.cPincel.dataset.sec = 'pincel';
  TMENU.listo = true;
  ponMenuPintar(menuPintar(), false);
}

// coloca los botones según el menú elegido
function ponMenuPintar(id, guarda = true) {
  if (!TMENU.listo) return;
  if (!MENUS_PINTAR.includes(id)) id = 'clasico';
  const T = E('taller'), N = TMENU.N, C = TMENU.C;
  TMENU.id = id; TMENU.volar = null; TMENU.sec = 'color';
  if (guarda && SAVE.menuPintar !== id) { SAVE.menuPintar = id; guardaPartida(); }
  T.dataset.menu = id;
  for (const s of Object.values(C.sec)) s.textContent = '';
  for (const c of [C.arriba, C.nav, C.barra, C.tira, C.izq, C.der, C.volarPostura, C.volarFormas, C.filaColor, C.filaTam, C.filaForma]) c.textContent = '';
  if (id === 'clasico') {
    T.textContent = ''; T.append(C.elige, ...N.ordenTaller);
    N.herr.append(...N.ordenHerr); N.colores.append(...N.ordenColores);
  } else {
    T.textContent = '';
    C.arriba.append(N.medidor, N.tinta, N.ayuda);      // la ayuda se queda (oculta) para que refrescaTaller la encuentre
    if (id === 'a') {
      C.nav.append(...C.tabs);
      C.filaColor.append(N.gota, N.recientes);
      C.sec.postura.append(N.posturas); C.sec.color.append(C.filaColor, N.paleta);
      C.filaTam.append(...N.radios); C.sec.pincel.append(C.filaTam, elMenu('div', 't-fila t-fila-cab', N.cabezales));
      C.filaForma.append(...N.figuras, N.cubo, N.senuelo); C.sec.formas.append(C.filaForma);
      C.barra.append(N.deshacer, N.calco, N.color, N.listo);
      T.append(C.elige, N.plegar, C.arriba, C.nav, C.cuerpo, C.barra);
    } else if (id === 'b') {
      C.izq.append(C.bPostura, N.gota, C.bFormas, N.cubo, N.senuelo);
      C.der.append(...N.radios.slice().reverse(), ...N.cabezales, N.deshacer, N.calco);
      C.volarPostura.append(N.posturas); C.volarFormas.append(...N.figuras);
      C.tira.append(N.color, N.recientes, N.paleta);
      C.barra.append(C.tira, N.listo);
      T.append(C.elige, N.plegar, C.arriba, C.izq, C.der, C.volarPostura, C.volarFormas, C.barra);
    } else {
      C.filaColor.append(N.gota, N.recientes);
      C.sec.postura.append(N.posturas); C.sec.color.append(C.filaColor, N.paleta);
      C.filaTam.append(...N.radios, ...N.cabezales); C.filaForma.append(...N.figuras, N.cubo, N.senuelo);
      C.sec.pincel.append(C.filaTam, C.filaForma);
      C.cColor.prepend(N.color);
      C.nav.append(C.cPostura, C.cColor, C.cPincel, N.deshacer, N.listo);
      T.append(C.elige, N.plegar, C.arriba, N.calco, C.cuerpo, C.nav);      // en C no hay plegar (se cierra la bandeja), pero sigue ahí oculto
    }
  }
  refrescaMenuPintar();
  if (TALLER.abierto) { refrescaTaller(); encuadraTaller(); }
}

// lo que cambia con cada toque: pestaña o bandeja abierta, desplegables, botones encendidos y el nombre del menú en su pestañita
function refrescaMenuPintar() {
  if (!TMENU.listo) return;
  const T = E('taller'), C = TMENU.C, id = TMENU.id;
  T.dataset.sec = TMENU.sec || '';
  T.dataset.volar = TMENU.volar || '';
  T.classList.toggle('con-senuelo', TALLER.herr === 'senuelo');
  C.eligeTxt.textContent = id === 'clasico' ? tr('Menú') : tr('Menú') + ' ' + id.toUpperCase();
  C.elige.setAttribute('aria-label', tr('Elegir el menú de pintar'));
  for (const b of C.tabs) { const si = b.dataset.sec === TMENU.sec; b.classList.toggle('puesto', si); b.setAttribute('aria-selected', String(si)); }
  for (const b of [C.cPostura, C.cColor, C.cPincel]) { const si = b.dataset.sec === TMENU.sec; b.classList.toggle('abierto', si); b.setAttribute('aria-expanded', String(si)); }
  C.bPostura.classList.toggle('puesto', TMENU.volar === 'postura');
  C.bFormas.classList.toggle('puesto', TMENU.volar === 'formas' || FIGURAS.includes(TALLER.herr));
  // en C, el botón de pincel dice qué estás usando
  const nombres = { linea: 'Línea', cuadro: 'Cuadrado', circulo: 'Círculo', senuelo: 'Señuelo', gota: 'Color' }, tam = ['Muy fino', 'Fino', 'Medio', 'Gordo'][RADIOS.indexOf(TALLER.radio)] || 'Pincel';
  const s = C.cPincel.querySelector('small'), txt = nombres[TALLER.herr] || tam; s.dataset.es = txt; s.textContent = tr(txt);
  for (const sm of T.querySelectorAll('small[data-es]')) if (sm !== s) sm.textContent = tr(sm.dataset.es);
  // B: los desplegables salen al lado de su botón
  if (id === 'b' && TMENU.volar) {
    const boton = TMENU.volar === 'postura' ? C.bPostura : C.bFormas, v = TMENU.volar === 'postura' ? C.volarPostura : C.volarFormas, r = boton.getBoundingClientRect(), riel = C.izq.getBoundingClientRect();
    v.style.left = Math.round(riel.right + 6) + 'px'; v.style.top = Math.round(r.top - 6) + 'px';
  }
}

// la ventanita para elegir menú
function abreEligeMenu() {
  let caja = E('elige-menu');
  if (!caja) {
    caja = elMenu('div', 'elige-menu'); caja.id = 'elige-menu';
    caja.addEventListener('pointerdown', e => { e.stopPropagation(); if (e.target === caja) cierraEligeMenu(); });
    const tarjeta = elMenu('div', 'elige-tarjeta'), h = elMenu('h3', 'ol'), p = elMenu('p');
    h.dataset.es = 'MENÚ DE PINTAR'; p.dataset.es = 'Elige cómo quieres las herramientas. Se guarda para tus próximas partidas.';
    const lista = elMenu('div', 'elige-lista');
    for (const [id, nombre, texto] of [['clasico', 'Clásico', 'Todo a la vista, como siempre.'], ['a', 'A · Pestañas', 'Cuatro pasos: postura, color, pincel y formas.'],
      ['b', 'B · A los lados', 'Herramientas a izquierda y derecha, donde caen los pulgares.'], ['c', 'C · Bandejas', 'Cinco botones grandes; cada uno abre su bandeja. Para jugar con una mano.']]) {
      const b = elMenu('button', 'elige-op'); b.type = 'button'; b.dataset.menu = id;
      const t = elMenu('b'), d = elMenu('span'); t.dataset.es = nombre; d.dataset.es = texto; b.append(t, d);
      b.onclick = () => { play('select'); ponMenuPintar(id); cierraEligeMenu(); };
      lista.append(b);
    }
    const cerrar = elMenu('button', 'boton peq'); cerrar.type = 'button'; cerrar.dataset.es = 'Cerrar'; cerrar.onclick = () => { play('select'); cierraEligeMenu(); };
    tarjeta.append(h, p, lista, cerrar); caja.append(tarjeta); document.body.append(caja);
  }
  for (const el of caja.querySelectorAll('[data-es]')) el.textContent = tr(el.dataset.es);
  for (const b of caja.querySelectorAll('.elige-op')) b.classList.toggle('puesto', b.dataset.menu === TMENU.id);
  caja.hidden = false;
}
function cierraEligeMenu() { const c = E('elige-menu'); if (c) c.hidden = true; }

// para encuadraTaller: lo que tapan arriba el medidor y, en B, las columnas de los lados (en vertical)
function huecoMenuPintar() {
  if (!TMENU.listo || TMENU.id === 'clasico') return null;
  const C = TMENU.C, arriba = C.arriba.getClientRects().length ? C.arriba.getBoundingClientRect().bottom + 8 : 66;
  const lados = TMENU.id === 'b' && C.izq.getClientRects().length && getComputedStyle(C.izq).position === 'fixed' ? Math.max(C.izq.getBoundingClientRect().right, VW - C.der.getBoundingClientRect().left) : 0;
  return { arriba, lados };
}
