// Fans Of · /gestion → Global → SQL (ADR 110, «main manda»): cómo van los SQL del servidor. Un SQL se aplica solo al llegar a main: el servicio de Yoshi
// (herramientas/sql/aplica.py) lo ensaya con su vuelta atrás y lo aplica, en orden. Aquí se ve la señal del servicio, el fichero que toca y lo último aplicado.
// Solo lo que puede perder datos espera aquí la aprobación de Arkioner o de Pepins (dos toques: el segundo confirma), con copia de la base justo antes.
// Si uno falla o se rechaza, la cola se para en él: se corrige el fichero en main o se pulsa «Reintentar». Nada se ejecuta desde el navegador.
// Datos (servidor/133-sql-en-orden.sql): gestion_sql_estado, gestion_sql_aprueba (con la huella del texto leído), gestion_sql_rechaza y gestion_sql_reintenta.
// Usa lo de gestion/index.html: rpc(), leerToken(), esc(), fecha(), textoError() y $(); GESTION_NAV (nav.js).
'use strict';
const GESTION_SQL = (() => {
  const ESTADOS = { pendiente: 'le toca: Yoshi lo coge en la siguiente vuelta', esperando: 'puede perder datos: espera tu aprobación', aprobado: 'aprobado: Yoshi lo aplica en la siguiente vuelta',
    aplicando: 'ensayándose y aplicándose ahora', fallido: 'falló: no se aplicó', rechazado: 'rechazado', deshecho: 'deshecho' };
  const MOTOR = { al_dia: 'Al día: todo lo de main está aplicado.', aplicando: 'Aplicando un SQL.', espera_boton: 'Esperando una aprobación.', bloqueado: 'Parado: algo impide seguir.' };
  const CALLADO = 5 * 60 * 1000;   // sin señal más de este tiempo, el servicio se da por caído
  let armado = null;   // el fichero cuyo «Aprobar» ya se pulsó una vez
  const pan = document.createElement('div'); pan.id = 'pan-sql'; pan.hidden = true;
  $('pan-config').parentNode.appendChild(pan);

  const etiqueta = n => 'SQL' + (n > 0 ? ' (' + n + ')' : '');
  const corta = h => String(h || '').slice(0, 12);
  const boton = (accion, s, texto, clase) => `<button${clase ? ` class="${clase}"` : ''} data-sql="${accion}" data-fichero="${esc(s.fichero)}" data-huella="${esc(s.huella)}">${texto}</button>`;
  // qué se puede hacer con el fichero que toca, según su estado
  const ACCIONES = {
    esperando: s => boton('aprobar', s, armado === s.fichero ? 'Seguro: aplicar en producción' : 'Aprobar', 'peligro') + boton('rechazar', s, 'Rechazar'),
    aprobado: s => boton('rechazar', s, 'Retirar la aprobación'),
    fallido: s => boton('reintentar', s, 'Reintentar'),
    rechazado: s => boton('reintentar', s, 'Volver a ponerlo en espera'),
    deshecho: s => boton('reaplicar', s, armado === s.fichero ? 'Seguro: aplicar en producción' : 'Volver a aplicarlo', 'peligro'),
  };
  const PARADA = { fallido: 'La cola está parada aquí: los SQL posteriores no se aplican hasta que este se corrija en main (vuelve a intentarse solo) o pulses «Reintentar».',
    rechazado: 'La cola está parada aquí hasta que el fichero cambie o salga de main.', deshecho: 'No se vuelve a aplicar hasta que el fichero cambie o salga de main, o pulses «Volver a aplicarlo» (dos toques).' };
  // la hora con la que se mide el silencio del servicio es la de la base (viene en la respuesta), no la del reloj de quien mira
  const horaDe = d => (d.generado && new Date(d.generado).getTime()) || Date.now();
  function motor(m, ahora) {
    if (!m) return '<div class="caja"><b>Servicio de Yoshi:</b> todavía no ha dado señal.</div>';
    const callado = ahora - new Date(m.visto).getTime() > CALLADO;
    return `<div class="caja"><b>Servicio de Yoshi:</b> ${esc(MOTOR[m.estado] || m.estado)}`
      + (m.detalle ? `<div class="meta">${esc(m.detalle)}</div>` : '')
      + `<div class="meta">Última señal: ${fecha(m.visto)}${m.commit_main ? ' · main en ' + esc(String(m.commit_main).slice(0, 7)) : ''}</div>`
      + (callado ? '<div class="aviso" role="alert">Lleva más de cinco minutos sin dar señal: Yoshi está apagado o el servicio svc-aplica-sql está parado. Mientras tanto no se aplica nada.</div>' : '') + '</div>';
  }
  function enCola(s) {
    const acciones = ACCIONES[s.estado] ? `<div class="accion">${ACCIONES[s.estado](s)}</div>` : '';
    return `<article class="cuenta"><div class="cab"><span class="codigo">${esc(s.fichero)}</span><span class="estado si">${esc(ESTADOS[s.estado] || s.estado)}</span>`
      + `<span class="meta">${s.boton ? 'con botón' : 'automático'} · huella ${esc(corta(s.huella))}${s.aprobado_por ? ' · aprobado por ' + esc(s.aprobado_por) : ''}</span></div>`
      + (s.boton ? `<div class="meta"><b>Puede perder datos:</b> ${esc(s.motivos || 'lo declara el fichero')}. Antes de aplicarlo Yoshi hace una copia de la base y lo ensaya; si algo falla, no se aplica.</div>` : '')
      + (s.texto ? `<details${s.estado === 'esperando' ? ' open' : ''}><summary>El SQL entero</summary><pre>${esc(s.texto)}</pre></details>` : '')
      + (s.resultado ? `<details open><summary>Resultado</summary><pre>${esc(s.resultado)}</pre></details>` : '')
      + (PARADA[s.estado] ? `<div class="meta">${PARADA[s.estado]}</div>` : '') + acciones + '</article>';
  }
  const aplicado = a => `<tr><td>${esc(a.fichero)}</td><td>${fecha(a.aplicado)}</td><td>${esc(a.via || '-')}</td><td>${esc(a.aprobacion || '-')}</td><td>${esc(a.nota || '-')}</td><td>${esc(corta(a.huella) || '-')}</td></tr>`;
  function vista(d, aviso, ahora) {
    const C = d.cola || [], A = d.aplicados || [];
    return '<div class="caja ayuda"><b>SQL del servidor.</b> Un SQL se aplica solo al llegar a main: el servicio de Yoshi lo ensaya en una copia de la base (lo aplica, lo deshace con su vuelta atrás '
      + 'y comprueba que queda igual) y después lo aplica en producción, siempre en orden. Solo lo que puede perder datos espera aquí tu aprobación.'
      + '<div class="accion"><button data-sql="refrescar">Refrescar</button></div></div>'
      + `<div class="aviso" id="sql-aviso" role="alert">${esc(aviso || '')}</div>` + motor(d.motor, ahora == null ? horaDe(d) : ahora)
      + (C.length ? '<h3>El que toca</h3>' + C.map(enCola).join('') : '')
      + (A.length ? '<h3>Últimos aplicados</h3><div class="caja"><table><thead><tr><th>Fichero</th><th>Cuándo</th><th>Por dónde</th><th>Con qué permiso</th><th>Ensayo</th><th>Huella</th></tr></thead><tbody>' + A.map(aplicado).join('') + '</tbody></table></div>' : '');
  }
  // un servidor sin el SQL 133 no tiene la función: se dice claro en vez de un error técnico
  const sinFuncion = e => /Could not find the function|PGRST202|does not exist/.test(String(e && e.message));
  const esperan = d => (d.cola || []).filter(s => s.estado === 'esperando').length;
  async function cargar() {
    try {
      const d = await rpc('gestion_sql_estado', { p_token: leerToken() });
      pan.innerHTML = vista(d, ''); GESTION_NAV.etiqueta('sql', etiqueta(esperan(d)));
    } catch (e) {
      pan.innerHTML = `<div class="caja">${sinFuncion(e) ? 'Esta pantalla necesita el SQL 133 del servidor, que aún no está aplicado: lo aplica solo el servicio de Yoshi en cuanto arranque con la versión nueva.' : esc(textoError(e))}</div>`;
    }
  }
  const MOTIVOS = { huella_cambiada: 'El SQL ha cambiado en main desde que lo abriste: vuelve a leerlo.', estado: 'Ese SQL ya no está esperando.', no_existe: 'Ese SQL ya no está en la cola.' };
  const LLAMADAS = {
    aprobar: (fichero, huella) => rpc('gestion_sql_aprueba', { p_token: leerToken(), p_fichero: fichero, p_huella: huella }),
    rechazar: fichero => rpc('gestion_sql_rechaza', { p_token: leerToken(), p_fichero: fichero, p_motivo: null }),
    reintentar: fichero => rpc('gestion_sql_reintenta', { p_token: leerToken(), p_fichero: fichero }),
    reaplicar: fichero => rpc('gestion_sql_reintenta', { p_token: leerToken(), p_fichero: fichero }),
  };
  async function pulsar(b) {
    const { sql, fichero, huella } = b.dataset;
    if (sql === 'refrescar') { armado = null; b.disabled = true; b.textContent = 'Leyendo…'; await cargar(); return; }
    if ((sql === 'aprobar' || sql === 'reaplicar') && armado !== fichero) { armado = fichero; b.textContent = 'Seguro: aplicar en producción'; return; }
    armado = null; b.disabled = true;
    const r = await LLAMADAS[sql](fichero, huella);
    await cargar();
    if (r && r.ok === false && $('sql-aviso')) $('sql-aviso').textContent = MOTIVOS[r.motivo] || 'No se pudo: la lista ha cambiado.';
  }
  pan.onclick = async ev => {
    const b = ev.target.closest('button[data-sql]'); if (!b) return;
    try { await pulsar(b); } catch (e) { if ($('sql-aviso')) $('sql-aviso').textContent = textoError(e); b.disabled = false; }
  };
  GESTION_NAV.seccion({ id: 'sql', pan: 'pan-sql', etiqueta: 'SQL', orden: 7.5, cargar });
  return { cargar, etiqueta, vista, enCola, motor, pulsar };
})();
