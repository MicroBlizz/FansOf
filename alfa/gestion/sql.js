// Fans Of · /gestion → Global → SQL (ADR 110): los SQL del servidor que esperan APROBACIÓN. Un hilo de Claude propone el fichero; aquí se lee entero, con su nota
// en llano y su huella, y Arkioner o Pepins lo aprueban o lo rechazan. Aprobar no lo ejecuta desde el navegador: lo deja marcado y el servicio de Yoshi
// (herramientas/sql/aplica.sh) lo aplica en un minuto, con copia previa si borra algo, y deja aquí el resultado. Aprobar pide dos toques: el segundo confirma.
// Al aprobar se vuelve a leer ese fichero de main: si ya no está o cambió, no se aprueba.
// Al abrir (y con «Refrescar») mira también los SQL nuevos de main y los deja en la lista (sql-main.js): lo que se aprueba es el fichero de main.
// Datos (servidor/130-sql-pendiente.sql): gestion_sql_pendientes, gestion_sql_aprobar (con la huella del texto leído) y gestion_sql_rechazar.
// Usa lo de gestion/index.html: rpc(), leerToken(), esc(), fecha(), textoError() y $(); GESTION_NAV (nav.js).
'use strict';
const GESTION_SQL = (() => {
  const ESTADOS = { esperando: 'espera tu aprobación', aprobado: 'aprobado: lo aplicará Yoshi en un minuto', aplicando: 'aplicándose ahora', aplicado: 'aplicado', fallido: 'falló: no se aplicó', rechazado: 'rechazado' };
  let armado = null;   // el fichero cuyo «Aprobar» ya se pulsó una vez
  const pan = document.createElement('div'); pan.id = 'pan-sql'; pan.hidden = true;
  $('pan-config').parentNode.appendChild(pan);

  const etiqueta = n => 'SQL' + (n > 0 ? ' (' + n + ')' : '');
  const corta = h => String(h || '').slice(0, 12);
  function botones(s) {
    if (s.estado === 'esperando') {
      const seguro = armado === s.fichero;
      return `<div class="accion"><button class="${s.destructivo ? 'peligro' : 'fuerte'}" data-sql="aprobar" data-fichero="${esc(s.fichero)}" data-huella="${esc(s.huella)}">`
        + `${seguro ? 'Seguro: aplicar en producción' : 'Aprobar'}</button><button data-sql="rechazar" data-fichero="${esc(s.fichero)}">Rechazar</button></div>`;
    }
    return s.estado === 'aprobado' ? `<div class="accion"><button data-sql="rechazar" data-fichero="${esc(s.fichero)}">Retirar la aprobación</button></div>` : '';
  }
  function pendiente(s) {
    return `<article class="cuenta"><div class="cab"><span class="codigo">${esc(s.fichero)}</span><span class="estado si">${esc(ESTADOS[s.estado] || s.estado)}</span>`
      + `<span class="meta">propuesto por ${esc(s.propuesto_por)} el ${fecha(s.propuesto)} · huella ${esc(corta(s.huella))}</span></div>`
      + (s.destructivo ? '<div class="meta"><b>Borra algo.</b> Antes de aplicarlo Yoshi hace una copia de la base; si la copia o el ensayo fallan, no se aplica.</div>' : '')
      + (s.nota ? `<div class="meta"><b>Qué hace:</b> ${esc(s.nota)}</div>` : '')
      + `<details${s.estado === 'esperando' ? ' open' : ''}><summary>El SQL entero</summary><pre>${esc(s.texto)}</pre></details>${botones(s)}</article>`;
  }
  function resuelto(s) {
    return `<article class="cuenta"><div class="cab"><span class="codigo">${esc(s.fichero)}</span><span class="estado">${esc(ESTADOS[s.estado] || s.estado)}</span>`
      + `<span class="meta">${s.aprobado_por ? 'aprobado por ' + esc(s.aprobado_por) + ' · ' : ''}${s.terminado ? fecha(s.terminado) : ''}</span></div>`
      + (s.resultado ? `<details${s.estado === 'fallido' ? ' open' : ''}><summary>Resultado</summary><pre>${esc(s.resultado)}</pre></details>` : '')
      + (s.estado === 'fallido' ? `<div class="meta">Mientras siga fallido no se puede aprobar ningún SQL con número mayor. Si el fichero se corrige en main vuelve solo a la lista; si no se va a aplicar, descártalo.</div><div class="accion"><button data-sql="rechazar" data-fichero="${esc(s.fichero)}">Descartar</button></div>` : '') + '</article>';
  }
  const aplicado = a => `<tr><td>${esc(a.fichero)}</td><td>${esc(a.estado)}</td><td>${fecha(a.aplicado)}</td><td>${esc(a.via || '-')}</td><td>${esc(a.aprobacion || '-')}</td><td>${esc(corta(a.huella) || '-')}</td></tr>`;
  function vista(d, aviso) {
    const P = d.pendientes || [], R = d.resueltos || [], A = d.aplicados || [];
    return '<div class="caja ayuda"><b>SQL del servidor.</b> Lo que cambia la base de datos de producción pasa por aquí: lee el SQL y aprueba. Aprobar no lo ejecuta al momento: '
      + 'el servicio de Yoshi lo aplica en un minuto y deja el resultado. Si Yoshi está apagado, espera. Se aplican en orden, por su número. Los SQL nuevos salen solos de la carpeta servidor/ de main.'
      + '<div class="accion"><button data-sql="refrescar">Refrescar</button></div></div>'
      + `<div class="aviso" id="sql-aviso" role="alert">${esc(aviso || '')}</div>`
      + (P.length ? P.map(pendiente).join('') : '<div class="caja">No hay ningún SQL esperando.</div>')
      + (R.length ? '<h3>Últimos resueltos</h3>' + R.map(resuelto).join('') : '')
      + (A.length ? '<h3>Últimos apuntados en la base</h3><div class="caja"><table><thead><tr><th>Fichero</th><th>Estado</th><th>Cuándo</th><th>Por dónde</th><th>Aprobación</th><th>Huella</th></tr></thead><tbody>' + A.map(aplicado).join('') + '</tbody></table></div>' : '');
  }
  // un servidor sin el SQL 130 no tiene la función: se dice claro en vez de un error técnico
  const sinFuncion = e => /Could not find the function|PGRST202|does not exist/.test(String(e && e.message));
  const esperan = d => (d.pendientes || []).filter(s => s.estado === 'esperando').length;
  async function cargar() {
    try {
      let d = await rpc('gestion_sql_pendientes', { p_token: leerToken() });
      const m = await GESTION_SQL_MAIN.sincronizar(d);
      if (m.propuestos.length) d = await rpc('gestion_sql_pendientes', { p_token: leerToken() });
      pan.innerHTML = vista(d, m.aviso); GESTION_NAV.etiqueta('sql', etiqueta(esperan(d)));
    } catch (e) { pan.innerHTML = `<div class="caja">${sinFuncion(e) ? 'Esta pantalla necesita el SQL 130 del servidor, que aún no está aplicado.' : esc(textoError(e))}</div>`; }
  }
  const MOTIVOS = { huella_cambiada: () => 'El SQL ha cambiado desde que lo abriste: vuelve a leerlo.', estado: () => 'Ese SQL ya no está esperando.', no_existe: () => 'Ese SQL ya no está en la lista.',
    antes_va: r => `Van en orden: antes hay que aplicar o descartar ${r.antes}.`, fuera_de_orden: r => `Llega tarde: ya está aplicado ${r.antes}, que tiene un número mayor. Hay que darle el siguiente número libre.` };
  async function pulsar(b) {
    const { sql, fichero, huella } = b.dataset;
    if (sql === 'refrescar') { armado = null; b.disabled = true; b.textContent = 'Leyendo…'; await cargar(); return; }
    if (sql === 'aprobar' && armado !== fichero) { armado = fichero; b.textContent = 'Seguro: aplicar en producción'; return; }
    armado = null; b.disabled = true;
    if (sql === 'aprobar') {   // lo que se aprueba tiene que ser, ahora mismo, el fichero de main
      const pega = await GESTION_SQL_MAIN.comprobar(fichero, huella);
      if (pega) { await cargar(); if ($('sql-aviso')) $('sql-aviso').textContent = pega; return; }
    }
    const r = sql === 'aprobar' ? await rpc('gestion_sql_aprobar', { p_token: leerToken(), p_fichero: fichero, p_huella: huella })
      : await rpc('gestion_sql_rechazar', { p_token: leerToken(), p_fichero: fichero, p_motivo: null });
    await cargar();
    if (r && r.ok === false && $('sql-aviso')) $('sql-aviso').textContent = MOTIVOS[r.motivo] ? MOTIVOS[r.motivo](r) : 'No se pudo.';
  }
  pan.onclick = async ev => {
    const b = ev.target.closest('button[data-sql]'); if (!b) return;
    try { await pulsar(b); } catch (e) { if ($('sql-aviso')) $('sql-aviso').textContent = textoError(e); b.disabled = false; }
  };
  GESTION_NAV.seccion({ id: 'sql', pan: 'pan-sql', etiqueta: 'SQL', orden: 7.5, cargar });
  return { cargar, etiqueta, vista, pendiente, resuelto, pulsar };
})();
