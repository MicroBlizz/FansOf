// Fans Of Decks · JUGAR CON AMIGOS: la sala de hasta 4 (salas de core, core/js/sistema/salas.js). En obras: solo con NUCLEO.desarrollo (o ?salas=local para probar con pestañas).
// Se crea una sala o se entra con su código (o con el enlace ?sala=CODIGO); cada persona elige un líder distinto, el anfitrión elige el nivel
// (solo los que tienen abiertos todos los líderes elegidos) y la arranca. Al empezar, la reunión en equipo (equipo.js; docs/decks/PLAN-DUO.md).
// Mis datos en la sala: { lider, paro } (paro = el más alto abierto con ese líder). Los de la sala: { paro } (el nivel elegido) y, al empezar, { semilla }.
'use strict';
const DC_SALA_MAX = 4;
let dcRed = null;
const dcAmigosAbierto = () => typeof SALAS !== 'undefined' && (NUCLEO.desarrollo || SALAS.local());
// el nivel más alto que pueden jugar todos: el menor de los paros abiertos de los líderes elegidos
const dcSalaTope = s => Math.min(DC_PARO_MAX, ...s.jugadores.filter(j => j.datos && j.datos.lider).map(j => j.datos.paro | 0));
function dcSalaSale() { dcEqSale(); if (dcRed) dcRed.salir(); dcRed = null; }
function dcAmigos(codigo) {
  const s = dcPanel(tr('Jugar con amigos'));
  s.append(dcEl('p', 'dc-nota', tr('Hasta 4 personas en la misma sala, cada una con un líder distinto. Crea la sala y comparte el código o el enlace.')));
  if (!SALAS.puede()) {
    s.append(dcEl('p', 'dc-nota dc-sala-aviso', tr('Para jugar con amigos entra con tu cuenta (en Opciones).')));
  } else {
    const crear = dcEl('button', 'btn-big ol', tr('CREAR SALA'));
    crear.onclick = () => { play('select'); dcSalaEntra(r => r.crear(DC_SALA_MAX, { lider: null, paro: 0 })); };
    const fila = dcEl('div', 'dc-sala-unirse'), campo = dcEl('input', 'dc-sala-codigo'), unirse = dcEl('button', 'btn-mode ol', tr('ENTRAR'));
    campo.maxLength = 4; campo.placeholder = tr('CÓDIGO'); campo.autocapitalize = 'characters'; campo.spellcheck = false; campo.setAttribute('aria-label', tr('Código de la sala'));
    campo.oninput = () => { campo.value = campo.value.toUpperCase().replace(/[^A-Z]/g, ''); };
    unirse.onclick = () => { if (campo.value.length !== 4) return toast(tr('El código tiene 4 letras.')); play('select'); dcSalaEntra(r => r.unirse(campo.value, { lider: null, paro: 0 })); };
    fila.append(campo, unirse); s.append(crear, fila);
  }
  const v = dcEl('button', 'btn-ghost ol', tr('VOLVER')); v.onclick = () => { play('select'); dcPortada(); }; s.append(v);
  if (codigo && SALAS.puede()) { SALAS.quitaCodigoUrl(); dcSalaEntra(r => r.unirse(codigo, { lider: null, paro: 0 })); }
}
function dcSalaEntra(como) {
  dcSalaSale(); const red = dcRed = SALAS.red('decks');
  const s = dcPanel(tr('Jugar con amigos')); s.append(dcEl('p', 'dc-nota', tr('Entrando en la sala...')));
  como(red).then(() => dcSalaEspera()).catch(e => { if (dcRed === red) dcSalaSale(); toast(tr(SALAS.errorTexto(e)), true); dcAmigos(); });
}
// ---------- la espera: quién está, con qué líder, el nivel y EMPEZAR ----------
function dcSalaEspera() {
  const red = dcRed; if (!red) return dcPortada();
  let visto = '', eligiendo = false, empezada = false;
  red.seguir((sala, error) => {
    if (dcRed !== red) return;
    if (!sala) { dcSalaSale(); toast(tr(SALAS.errorTexto(error)), true); return dcPortada(); }
    if (sala.estado === 'jugando') { if (!empezada) { empezada = true; dcSalaEmpieza(sala); } return; }
    if (eligiendo) return;
    const clave = JSON.stringify([sala.jugadores, sala.datos, sala.anfitrion]); if (clave === visto) return; visto = clave;
    pinta(sala);
  });
  function pinta(sala) {
    const s = dcPanel(tr('Sala {c}', { c: sala.codigo })), yo = sala.jugadores.find(j => j.yo) || {}, mio = (yo.datos || {}).lider;
    const comparte = dcEl('button', 'btn-mode ol', tr('COMPARTIR ENLACE'));
    comparte.onclick = () => {
      play('select'); const url = SALAS.enlace(sala.codigo), texto = tr('Únete a mi sala de Fans Of Decks: {c}', { c: sala.codigo });
      if (navigator.share) navigator.share({ title: 'Fans Of Decks', text: texto, url }).catch(() => { /* cancelado */ });
      else if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => toast(tr('Enlace copiado.'))).catch(() => toast(url));
      else toast(url);
    };
    s.append(dcEl('p', 'dc-nota', tr('Código: {c} · {n} de {m}', { c: sala.codigo, n: sala.jugadores.length, m: sala.max })), comparte);
    for (const j of sala.jugadores) {
      const L = j.datos && DC_LIDERES[j.datos.lider], caja = dcEl('div', 'dc-opcion dc-lider-op dc-sala-jugador' + (j.vivo ? '' : ' dc-cerrada'));
      const arte = dcEl('span', 'dc-lider-op-arte'); if (L) arte.append(dcSprite(L.arte, 48));
      const txt = dcEl('span', 'dc-lider-op-txt');
      txt.append(dcEl('b', '', j.nombre + (j.yo ? ' ' + tr('(tú)') : '')), dcEl('small', 'dc-riesgo', L ? tr(L.nombre) + ' · ' + (j.datos.paro ? tr('Abierto hasta el paro +{n}', { n: j.datos.paro }) : tr('Sin paro todavía')) : tr('Eligiendo líder...')));
      if (j.orden === Math.min(...sala.jugadores.filter(x => x.vivo || x.yo).map(x => x.orden))) txt.append(dcEl('small', 'dc-lider-estado', tr('Anfitrión')));
      if (!j.vivo) txt.append(dcEl('small', 'dc-lider-estado', tr('Se ha ido: puede volver con el código')));
      caja.append(arte, txt); s.append(caja);
    }
    const lider = dcEl('button', (mio ? 'btn-mode' : 'btn-big') + ' ol', tr(mio ? 'CAMBIAR DE LÍDER' : 'ELEGIR LÍDER'));
    lider.onclick = () => { play('select'); eligiendo = true; dcSalaLider(sala, k => { eligiendo = false; visto = ''; if (k) red.misDatos({ lider: k, paro: dcParoAbierto(k) }); if (dcRed === red && red.sala) pinta(red.sala); }); };
    s.append(lider);
    // el nivel: el anfitrión lo elige entre los que tienen abiertos todos los líderes elegidos
    const tope = dcSalaTope(sala), nivel = Math.min(sala.datos.paro | 0, tope);
    s.append(dcEl('p', 'dc-nota', tr('Nivel: {n}', { n: dcParoNombre(nivel) }) + ' · ' + tr(sala.anfitrion ? 'Solo salen los niveles que tienen abiertos todos los líderes elegidos.' : 'Lo elige el anfitrión, entre los que tenéis abiertos todos.')));
    if (sala.anfitrion && tope > 0) {
      const fila = dcEl('div', 'dc-sala-niveles');
      for (let n = 0; n <= tope; n++) { const b = dcEl('button', 'dc-chip' + (n === nivel ? ' dc-elegida' : ''), n ? '+' + n : tr('Normal')); b.dataset.paro = n; b.onclick = () => { play('select'); red.poner({ paro: n }).catch(e => toast(tr(SALAS.errorTexto(e)), true)); }; fila.append(b); }
      s.append(fila);
    }
    if (sala.anfitrion) {
      const vivos = sala.jugadores.filter(j => j.vivo || j.yo), lideres = vivos.map(j => j.datos && j.datos.lider);
      const falta = vivos.length < 2 ? tr('Hacen falta al menos dos personas para empezar.') : lideres.some(x => !x) ? tr('Falta que todos elijan líder.') : new Set(lideres).size < lideres.length ? tr('Cada persona lleva un líder distinto.') : '';
      const ok = dcEl('button', 'btn-big ol', tr('EMPEZAR')); ok.disabled = !!falta;
      ok.onclick = () => { play('levelup'); red.poner({ paro: nivel, semilla: Math.floor(Math.random() * 1e9), equipo: vivos.map(j => ({ orden: j.orden, nombre: j.nombre, lider: j.datos.lider })) }, true).catch(e => toast(tr(SALAS.errorTexto(e)), true)); };
      if (falta) s.append(dcEl('p', 'dc-nota', falta));
      s.append(ok);
    } else s.append(dcEl('p', 'dc-nota', tr('Esperando a que el anfitrión empiece.')));
    const sal = dcEl('button', 'btn-ghost ol', tr('SALIR DE LA SALA')); sal.onclick = () => { play('select'); dcSalaSale(); dcPortada(); }; s.append(sal);
  }
}
// elegir líder en la sala: los que llevan los demás salen cerrados con su nombre
function dcSalaLider(sala, alElegir) {
  const s = dcPanel(tr('Elige tu líder'));
  s.append(dcEl('p', 'dc-nota', tr('Cada persona de la sala lleva un líder distinto.')));
  const otros = {}; for (const j of sala.jugadores) if (!j.yo && j.datos && j.datos.lider) otros[j.datos.lider] = j.nombre;
  for (const k of DC_LIDERES_ORDEN.filter(x => DC_LIDERES[x])) {
    const L = DC_LIDERES[k], abierto = dcLiderAbierto(k), libre = !otros[k], b = dcEl('button', 'dc-opcion dc-lider-op' + (abierto && libre ? '' : ' dc-cerrada'));
    const arte = dcEl('span', 'dc-lider-op-arte'); arte.append(dcSprite(L.arte, 48));
    const txt = dcEl('span', 'dc-lider-op-txt'), paro = dcParoAbierto(k);
    txt.append(dcEl('b', '', tr(L.nombre)), dcEl('small', 'dc-riesgo', tr(DC_FACCIONES[L.faccion].nombre) + ' · ' + (paro ? tr('Abierto hasta el paro +{n}', { n: paro }) : tr('Sin paro todavía'))));
    if (!abierto) txt.append(dcEl('small', 'dc-lider-estado dc-lider-candado', dcCandadoLider(k)));
    else if (!libre) txt.append(dcEl('small', 'dc-lider-estado', tr('Lo lleva {n}', { n: otros[k] })));
    b.append(arte, txt); b.dataset.lider = k; b.disabled = !abierto || !libre; b.onclick = () => { play('levelup'); alElegir(k); }; s.append(b);
  }
  const v = dcEl('button', 'btn-ghost ol', tr('VOLVER')); v.onclick = () => { play('select'); alElegir(null); }; s.append(v);
}
// ---------- al empezar: a la reunión en equipo (equipo.js y equipo-ui.js) ----------
function dcSalaEmpieza(sala) { dcEqEntra(dcRed, sala); }
