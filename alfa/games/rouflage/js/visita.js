// Fans of Rouflage · VISITAR ESCENARIOS (25-10-2026, «sí con todo» de Daniel): el escenario de un AMIGO (botón VER de la lista de amigos) y EL
// ESCENARIO DE LA SEMANA (arriba de la lista de amigos). Entras con tu colado y paseas, te congelas, te pintas y usas tu habilidad sin límite (la
// fase 'sala' de sala-viva.js, pero tú solo y sin red), y le dejas un ME GUSTA o lo REPORTAS (el cuadro de siempre, sala-votos.js).
// Tu escenario se publica al salir del editor (escPublica: solo si ha cambiado). Servidor: servidor/92-rouflage-escenario-visitas.sql
// (rouflage_escenario_publicar, _visitar, _destacado; votar y reportar son los de 60-rouflage-votos.sql). En ?pvp=local va simulado en este navegador.
'use strict';

const VISITA = { activa: false, nombre: '', megusta: 0, mivoto: 0, vuelve: null, ui: null, enviando: false, destacado: null, tDest: 0 };

/* ---------- la red ---------- */
(() => {
  const S = RFRED.servidor, L = RFRED.local, CLAVE = 'rf-pruebas-pub';
  S.escPublicar = d => RFRED.rpc('rouflage_escenario_publicar', { p_datos: d });
  S.escVisitar = c => RFRED.rpc('rouflage_escenario_visitar', { p_codigo: c });
  S.escDestacado = () => RFRED.rpc('rouflage_escenario_destacado', {});
  const lee = () => { try { return JSON.parse(localStorage.getItem(CLAVE) || 'null'); } catch (_) { return null; } };
  L.escPublicar = d => { try { localStorage.setItem(CLAVE, JSON.stringify(d)); } catch (_) { /* sin guardar */ } return Promise.resolve({ ok: true }); };
  const ver = () => { const d = lee(); return d ? Promise.resolve({ datos: d, nombre: 'Pruebas', megusta: 3, mivoto: 0, oculto: false }) : Promise.reject(new Error('sin_escenario')); };
  L.escVisitar = () => ver();
  L.escDestacado = () => ver().then(r => Object.assign(r, { semana: 3 })).catch(() => ({ nada: true }));
})();

/* ---------- publicar el mío: al salir del editor, si ha cambiado ---------- */
function escPublica() {
  const red = RFRED.red; if (!red.escPublicar || (!RFRED.esLocal() && !RFRED.conSesion())) return;
  let d; try { d = escenarioDatos(); } catch (_) { return; }
  if (SAVE.escNoSemana) d.ns = 1;      // no quiere salir en el ESCENARIO DE LA SEMANA (OPCIONES; servidor/101-rouflage-semana-privada.sql)
  const txt = JSON.stringify(d), h = hashTexto(txt);
  let antes = ''; try { antes = localStorage.getItem('rouflage-esc-publicado') || ''; } catch (_) { /* nada */ }
  if (antes === h) return;
  Promise.resolve(red.escPublicar(d)).then(() => { try { localStorage.setItem('rouflage-esc-publicado', h); } catch (_) { /* nada */ } })
    .catch(e => { if (/retirado/.test(String((e && e.message) || e))) avisa(tr('Microblizz ha retirado tu escenario por un reporte: cámbialo para que tus amigos lo vean'), 'malo'); });
}

/* ---------- entrar y salir ---------- */
function visitaAbre(pide, vuelve) {
  play('select');
  Promise.resolve(pide()).then(r => {
    if (!r || r.nada) { avisa(tr('Aún no hay escenario de la semana: ¡dale me gusta a los de tus amigos!'), 'aviso'); return; }
    if (r.oculto || !r.datos) { avisa(tr('Este escenario no se puede ver ahora'), 'malo'); return; }
    visitaEntra(r, vuelve);
  }).catch(e => {
    const m = String((e && e.message) || e);
    avisa(/sin_escenario/.test(m) ? tr('Tu amigo aún no ha decorado su escenario') : /no_es_amigo/.test(m) ? tr('Solo puedes visitar a tus amigos') : tr('Necesitas conexión'), 'malo');
  });
}
function visitaEntra(r, vuelve) {
  limpiaPartida();
  cargaMapa(mapaDeEscenario(r.datos));
  Object.assign(VISITA, { activa: true, nombre: r.nombre || '', megusta: r.megusta | 0, mivoto: r.mivoto | 0, mio: !!r.mio, vuelve: vuelve || null });
  J.pvp = false; J.fase = 'sala'; J.tFase = 0; J.modo = 'camaleon'; J.t = 0; J.reloj = 0;
  const [x, y] = sitioLibreCerca(...SALIDA_CAMALEONES[0]), yo = nuevoEnte('camaleon', 'bunny', tr('Tú'), x, y);
  yo.jugador = true; yo.slot = 0; J.yo = yo; J.cuenta = yo.pts; vistePartida(yo, ropaPartida());
  talentosReparte(); salaVivaInfinito();
  visitaUI(); pantalla(null); document.body.classList.add('sala-viva', 'visita');
  avanzaCamara(0, true); refrescaHud(true);
}
function visitaSale() {
  if (!VISITA.activa) return;
  VISITA.activa = false; play('select');
  if (TALLER.abierto) cierraTaller();
  document.body.classList.remove('sala-viva', 'visita'); if (VISITA.ui) VISITA.ui.hidden = true;
  visitaReporteDevuelve();
  limpiaPartida(); const f = VISITA.vuelve; VISITA.vuelve = null;
  irTitulo(); if (f) f();
}
// cada fotograma (avanzaPartida): la habilidad y la granada se recargan solas, como en la sala con amigos
function visitaAvanza(dt) {
  const yo = J.yo; if (!yo) return;
  if (yo.hab) { if (yo.habUsos < 50) yo.habUsos = 99; if (yo.habEspera > SV_ESPERA) yo.habEspera = SV_ESPERA; }
  if ((!yo.hab || yo.hab === 'granada') && !(yo.granada > 0) && !(yo.invis > 0)) { SV.tGr += dt; if (SV.tGr > 1.5) { yo.granada = 1; SV.tGr = 0; } } else SV.tGr = 0;
}

/* ---------- lo de encima: volver, de quién es, ME GUSTA y REPORTAR ---------- */
function visitaUI() {
  let d = VISITA.ui;
  if (!d) {
    d = VISITA.ui = document.createElement('div'); d.className = 'visita-ui'; d.id = 'visita-ui';
    d.innerHTML = `<div class="sv-arriba"><button type="button" class="sv-atras" id="vis-atras">${SV_ICO.atras}</button><div class="sv-chip vis-de"><b id="vis-nombre"></b></div><span class="sv-hueco"></span></div>`
      + `<div class="vis-abajo"><button type="button" class="ev-b ev-si" id="vis-si"><i data-ico="si"></i><span></span><b id="vis-n">0</b></button><button type="button" class="ev-b ev-rep" id="vis-rep"><i data-ico="rep"></i><span></span></button></div>`;
    document.body.appendChild(d);
    E('vis-atras').onclick = visitaSale;
    E('vis-si').onclick = visitaVota;
    E('vis-rep').onclick = visitaReporta;
  }
  E('vis-nombre').textContent = VISITA.mio ? tr('Tu escenario') : tr('El escenario de {n}', { n: VISITA.nombre });
  E('vis-si').querySelector('span').textContent = tr('ME GUSTA'); E('vis-rep').querySelector('span').textContent = tr('REPORTAR');
  E('vis-atras').setAttribute('aria-label', tr('Volver'));
  d.querySelector('.vis-abajo').hidden = VISITA.mio;      // a tu propio escenario no se le vota
  if (typeof salaVotosIconos === 'function') salaVotosIconos(d);
  visitaPinta(); d.hidden = false;
}
function visitaPinta() { E('vis-n').textContent = VISITA.megusta; E('vis-si').classList.toggle('activo', VISITA.mivoto === 1); E('vis-si').setAttribute('aria-pressed', String(VISITA.mivoto === 1)); }
function visitaVota() {
  const red = RFRED.red; if (!red.escVotar || VISITA.enviando) return;
  const nuevo = VISITA.mivoto === 1 ? 0 : 1, antes = { mivoto: VISITA.mivoto, megusta: VISITA.megusta };
  VISITA.megusta += nuevo === 1 ? 1 : -1; VISITA.mivoto = nuevo; VISITA.enviando = true; play(nuevo ? 'crown' : 'select'); visitaPinta();
  Promise.resolve(red.escVotar(nuevo)).then(r => { if (r && r.megusta != null) VISITA.megusta = r.megusta | 0; })
    .catch(() => { Object.assign(VISITA, antes); avisa(tr('No se ha podido votar. Prueba otra vez.'), 'malo'); })
    .finally(() => { VISITA.enviando = false; visitaPinta(); });
}
// REPORTAR: el cuadro de siempre (sala-votos.js), que vive en la sala; se trae aquí mientras dura la visita
function visitaReporta() {
  const rep = E('esc-rep'); if (!rep) return;
  if (!VISITA.repSitio) VISITA.repSitio = { padre: rep.parentNode, sig: rep.nextSibling };
  VISITA.ui.appendChild(rep); salaVotosAbre();
}
function visitaReporteDevuelve() {
  const s = VISITA.repSitio, rep = E('esc-rep'); if (!s || !rep) return;
  rep.hidden = true; s.padre.insertBefore(rep, s.sig); VISITA.repSitio = null;
}

/* ---------- en la lista de amigos: VER su escenario, y arriba el ESCENARIO DE LA SEMANA ---------- */
function visitaAmigos() {
  const caja = E('p-amigoslista').querySelector('.caja'); if (!caja) return;
  let dest = E('vis-semana');
  if (!dest) {
    dest = document.createElement('div'); dest.className = 'vis-semana'; dest.id = 'vis-semana'; dest.hidden = true;
    dest.innerHTML = '<span><small></small><b></b></span><button type="button" class="boton peq azul" id="b-vis-semana"></button>';
    caja.querySelector('.amg-cod').after(dest);
    E('b-vis-semana').onclick = () => visitaAbre(() => RFRED.red.escDestacado(), abreAmigos);
  }
  dest.querySelector('small').textContent = tr('ESCENARIO DE LA SEMANA'); E('b-vis-semana').textContent = tr('VISITAR');
  // se pregunta como mucho cada 5 minutos
  if (Date.now() - VISITA.tDest > 300000 && RFRED.red.escDestacado && (RFRED.esLocal() || RFRED.conSesion())) {
    VISITA.tDest = Date.now();
    Promise.resolve(RFRED.red.escDestacado()).then(r => { VISITA.destacado = r && !r.nada && !r.oculto && r.datos ? r : null; visitaAmigos(); }).catch(() => { /* sin conexión */ });
  }
  const r = VISITA.destacado; dest.hidden = !r;
  if (r) dest.querySelector('b').textContent = tr('De {n} · {m} me gusta esta semana', { n: r.nombre || '', m: r.semana | 0 });
}
// el botón VER en cada fila (lo llama amgPinta)
function visitaBotonAmigo(fila, a) {
  if (!a || !a.codigo) return;
  const b = document.createElement('button'); b.type = 'button'; b.className = 'boton peq vis-ver'; b.textContent = tr('VER');
  b.title = tr('Visitar su escenario'); b.onclick = () => visitaAbre(() => RFRED.red.escVisitar(a.codigo), abreAmigos);
  fila.insertBefore(b, fila.lastChild);
}
