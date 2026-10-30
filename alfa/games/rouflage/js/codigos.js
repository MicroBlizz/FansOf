// Fans of Rouflage · CÓDIGO REGALO (decidido por Daniel el 25-10-2026): en OPCIONES, el botón CÓDIGO REGALO abre una ventana para escribir los
// códigos que se dan en las redes sociales (HALLOWEEN26…). Cada jugador puede canjear cada código una vez; lo comprueba y lo da el servidor
// (rf_canjear, servidor/94-rouflage-codigos.sql): Gotas, Acciones, ropa del armario y pegatinas. Hace falta cuenta (con invitados se podría repetir
// sin fin): a un invitado se le pide crearla y al volver se le abre otra vez la ventana. Las Gotas salen con la mancha de pintura de las misiones
// (celebraGotas, misiones-celebra.js); la ropa y las pegatinas, dibujadas. Los códigos se crean en /gestion → Códigos. Va después de menu-barra.js.
'use strict';

PANTALLAS.push('p-codigo');
BARRA_MENU.volver['p-codigo'] = 'b-cod-volver'; preparaBarrasMenu();      // menu-barra.js ya puso las barras al cargarse: esta se añade ahora (no repite las otras)
ICONOS.regalo = '<rect x="3.5" y="9" width="17" height="11.5" rx="1.5"/><path d="M2.5 9h19v-3.5h-19z"/><path d="M12 5.5v15"/><path d="M12 5.5c-1.6-3.2-5.6-3-5.6-.8 0 1.6 2.6 1.4 5.6.8zM12 5.5c1.6-3.2 5.6-3 5.6-.8 0 1.6-2.6 1.4-5.6.8z"/>';

const COD = { ocupado: false, desde: null };
const COD_ERRORES = {
  no_existe: 'Ese código no existe. Revisa que esté bien escrito.',
  ya_usado: 'Ya has canjeado este código.',
  caducado: 'Este código ya ha caducado.',
  agotado: 'Este código ya se ha agotado.',
  espera: 'Demasiados intentos. Prueba otra vez dentro de un rato.',
  invitado: 'Para canjear códigos necesitas una cuenta.',
};
const codLimpio = t => String(t || '').toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 24);

function abreCodigo() {
  play('select'); pantalla('p-codigo');
  E('cod-aviso').textContent = ''; E('cod-premio').hidden = true; E('cod-premio').innerHTML = '';
  E('cod-gotas').textContent = String(SAVE.gotas || 0);
}
function codAviso(texto, malo) { const a = E('cod-aviso'); a.textContent = texto; a.classList.toggle('malo', !!malo); }

async function codCanjea() {
  if (COD.ocupado) return;
  const cod = codLimpio(E('cod-campo').value);
  if (cod.length < 3) { play('deny'); codAviso(tr('Escribe el código.'), true); return; }
  if (typeof CUENTA !== 'undefined' && CUENTA.invitado && typeof pedirCuenta === 'function') { play('select'); pedirCuenta(COD_ERRORES.invitado, 'codigo'); return; }
  if (!RFS.activo()) { play('deny'); codAviso(tr('Necesitas conexión para esto'), true); return; }
  COD.ocupado = true; const b = E('b-cod-canjear'); b.disabled = true; codAviso(tr('Comprobando…'));
  COD.desde = b.getBoundingClientRect();
  try {
    const r = await CUENTA.rpc('rf_canjear', { p_clave: 'codigo-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8), p_codigo: cod });
    if (r && r.error) {
      play('deny'); codAviso(tr(COD_ERRORES[r.error] || 'Ese código no existe. Revisa que esté bien escrito.'), true);
      if (r.error === 'invitado' && typeof pedirCuenta === 'function') pedirCuenta(COD_ERRORES.invitado, 'codigo');
      return;
    }
    const antes = SAVE.gotas || 0;
    RFS.aplica(r); guardaPartida(); E('cod-campo').value = '';
    codAviso(tr('¡Código canjeado!'));
    codPremio(r.premio || []);
    const ganadas = (SAVE.gotas || 0) - antes;
    if (ganadas > 0) celebraGotas(ganadas, COD.desde, E('cod-gotas'));
    else { play('crown'); E('cod-gotas').textContent = String(SAVE.gotas || 0); }
    if (typeof arPintaTodo === 'function') try { arPintaTodo(); } catch (_) { /* el armario se repinta al abrirlo */ }
  } catch (e) { RFS.error(e); codAviso(RFS.errorTexto(e), true); }
  finally { COD.ocupado = false; b.disabled = false; }
}
// lo que ha tocado: las piezas y pegatinas dibujadas, las Acciones y las Gotas (las Gotas, además, vuelan al contador)
function codPremio(lista) {
  const caja = E('cod-premio'); caja.innerHTML = '';
  const tarjeta = (dibujo, titulo, sub) => {
    const d = document.createElement('div'); d.className = 'cod-cosa';
    const k = arLienzo(64, 64); arPinta(k, dibujo); d.appendChild(k);
    const t = document.createElement('b'); t.className = 'ol'; t.textContent = titulo; d.appendChild(t);
    if (sub) { const s = document.createElement('small'); s.textContent = sub; d.appendChild(s); }
    caja.appendChild(d);
  };
  for (const h of lista) {
    const k = h.pieza || h.repetida;
    if (k) {
      const [c, i] = String(k).split(':'), it = arItem(c, i), cat = arCat(c);
      if (it) tarjeta((cv, w) => it.x(cv, w), tr(it.n), h.repetida ? tr('Ya la tenías: +{n} Gotas', { n: h.gotas }) : cat ? tr(cat.corto) : '');
    } else if (h.todo != null) {      // el código de desarrollo (servidor/95): todas las piezas y, aquí, todos los mapas abiertos
      SAVE.mapasDev = true; guardaPartida();
      tarjeta((cv, w) => ARD.ICONOS.candado(cv, w), tr('¡TODO DESBLOQUEADO!'), tr('{n} cosas nuevas y todos los mapas', { n: h.todo }));
    } else if (h.acciones) tarjeta((cv, w) => pintaAcciones(cv, w), '+' + h.acciones, tr('Acciones'));
    else if (h.gotas) tarjeta((cv, w) => pintaGotas(cv, w), '+' + h.gotas, tr('Gotas'));
  }
  caja.hidden = !caja.children.length;
}

function preparaCodigos() {
  const b = E('b-op-codigo'); if (!b) return;
  b.onclick = abreCodigo;
  E('b-cod-volver').onclick = () => { play('select'); pantalla('p-opciones'); };
  E('b-cod-canjear').onclick = codCanjea;
  const campo = E('cod-campo');
  campo.oninput = () => { const v = codLimpio(campo.value); if (v !== campo.value) campo.value = v; if (E('cod-aviso').classList.contains('malo')) codAviso(''); };
  campo.onkeydown = ev => { if (ev.key === 'Enter') { ev.preventDefault(); codCanjea(); } };
  // un invitado que crea la cuenta desde aquí vuelve a la ventana con su código escrito
  hook('cuenta-vuelta', d => { if (d === 'codigo') abreCodigo(); });
}
