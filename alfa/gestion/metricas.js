// Fans Of · /gestion: MÉTRICAS DE NEGOCIO, la parte COMÚN. La pestaña «Métricas» de Global (usuarios activos, cuentas nuevas, compras, errores) y las piezas que cada juego
// reutiliza para su propia pestaña «Métricas» (GESTION_METRICAS.pestana, como metricas-rouflage.js). Solo muestra números AGREGADOS que da el servidor (gestion_metricas*, servidor/109):
// nunca un usuario ni una huella. Decisión y definiciones: docs/decisiones/039-metricas-de-negocio-en-gestion.md. Usa lo de gestion/index.html: rpc(), leerToken(), esc(), fmt(), textoError() y $().
'use strict';
const GESTION_METRICAS = (() => {
  const SIN_SQL = /Could not find the function|PGRST202/;
  // una fila de cifras grandes: [[valor, 'qué es'], ...]
  const cifras = L => `<div class="cifras">${L.map(([n, t]) => `<div><b>${typeof n === 'number' ? fmt(n) : n}</b><span>${esc(t)}</span></div>`).join('')}</div>`;
  const caja = (titulo, cuerpo, nota) => `<div class="caja"><b>${esc(titulo)}</b>${nota ? `<div class="meta">${nota}</div>` : ''}<div style="margin-top:8px">${cuerpo}</div></div>`;
  const tabla = (cab, filas) => `<div class="tabla-caja"><table class="tabla"><thead><tr>${cab.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${filas.map(f => `<tr>${f.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const vacio = (t, d) => `<div class="vacio"><b>${esc(t)}</b>${esc(d)}</div>`;
  const pct = (a, b) => b ? Math.round(a / b * 100) + ' %' : '—';
  const diaCorto = d => { const x = String(d || '').split('-'); return x.length === 3 ? x[2] + '/' + x[1] : d; };
  // barras apiladas por día: series = [{ clave, nombre, color }]; filas = [{ dia, <clave>: n }]. Sin librerías: cada día es una columna de divs.
  function barras(filas, series) {
    const max = Math.max(1, ...filas.map(f => series.reduce((s, k) => s + (+f[k.clave] || 0), 0)));
    const col = f => `<div style="flex:1;min-width:14px;display:flex;flex-direction:column;align-items:center;gap:3px" title="${esc(diaCorto(f.dia))}: ${series.map(k => k.nombre + ' ' + (+f[k.clave] || 0)).join(' · ')}">`
      + `<div style="height:110px;width:100%;display:flex;flex-direction:column-reverse;border-bottom:1px solid var(--linea)">${series.map(k => `<div style="height:${(+f[k.clave] || 0) / max * 100}%;background:${k.color}"></div>`).join('')}</div>`
      + `<span class="meta" style="font-size:10px">${esc(diaCorto(f.dia))}</span></div>`;
    return `<div style="display:flex;gap:3px;align-items:flex-end">${filas.map(col).join('')}</div>`
      + `<div class="meta" style="margin-top:6px">${series.map(k => `<span style="display:inline-block;width:10px;height:10px;background:${k.color};margin-right:4px"></span>${esc(k.nombre)}`).join('&nbsp;&nbsp;&nbsp;')} · máximo del día: ${fmt(max)}</div>`;
  }
  // ---------- presencia (servidor/111, core/js/sistema/presencia.js): conectados, jugadores por día y retención ----------
  const suma = (L, f) => L.filter(f).reduce((t, x) => t + (+x.n || 0), 0);
  const ENTORNOS = [['Producción', false], ['Alfa', true]];
  // Conectados ahora y jugadores de hoy y de los últimos 14 días de UN juego ('*' = toda la web)
  function presenciaDe(P, juego) {
    const hoy = String(P.generado).slice(0, 10);   // el día del servidor (UTC), como las filas
    const dias = [...new Set(P.por_dia.filter(x => x.juego === juego).map(x => x.dia))];
    const filas = dias.map(dia => ({ dia, prod: suma(P.por_dia, x => x.dia === dia && x.juego === juego && !x.alfa), alfa: suma(P.por_dia, x => x.dia === dia && x.juego === juego && x.alfa) }));
    return caja('Conectados y jugadores por día',
      cifras([[suma(P.ahora, x => x.juego === juego && !x.alfa), 'conectados ahora (producción)'], [suma(P.ahora, x => x.juego === juego && x.alfa), 'conectados ahora (alfa)'],
        [suma(P.por_dia, x => x.dia === hoy && x.juego === juego && !x.alfa), 'jugaron hoy (producción)'], [suma(P.por_dia, x => x.dia === hoy && x.juego === juego && x.alfa), 'jugaron hoy (alfa)']])
      + (filas.length ? '<div style="margin-top:10px">' + barras(filas, [{ clave: 'prod', nombre: 'Producción', color: 'var(--acento)' }, { clave: 'alfa', nombre: 'Alfa', color: 'var(--suave)' }]) + '</div>' : ''),
      'Conectado: ha dado señales hace menos de 2 minutos, con la pestaña a la vista. Solo cuenta a quien tiene encendido «Datos de partida anónimos».');
  }
  const diasEntre = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);
  // Retención por cohorte: de los que jugaron el día en que se registraron, cuántos vuelven al día siguiente y a los 7 días
  function retencion(P) {
    const hoy = new Date().toISOString().slice(0, 10), ya = (c, n) => diasEntre(c, hoy) > n;   // el día N solo cuenta cuando ya ha acabado
    const filas = P.retencion.filter(x => x.d0 > 0).map(x => [fecha(x.cohorte).split(',')[0], x.alfa ? 'Alfa' : 'Producción', x.alfa ? '—' : fmt(x.tam), fmt(x.d0), ya(x.cohorte, 1) ? pct(x.d1 || 0, x.d0) : '—', ya(x.cohorte, 7) ? pct(x.d7 || 0, x.d0) : '—']);
    return caja('Retención por cohorte', filas.length ? tabla(['Cuentas creadas el', 'Entorno', 'Registradas ese día (todas)', 'Jugaron ese día', 'Volvieron al día siguiente', 'Volvieron a los 7 días'], filas) : vacio('Aún no hay cohortes', 'Aparecerán cuando el flag «presencia» lleve un día abierto.'),
      'Solo desde ' + esc(P.desde || 'que se abra el flag «presencia»') + '. No se guarda quién vuelve: el servidor solo suma. Porcentaje sobre los que jugaron el día de su registro.');
  }
  // Pide la presencia; si el SQL aún no está aplicado o el flag está cerrado, deja un aviso en vez de romper el resto
  async function cargaPresencia() {
    try { return { P: await rpc('gestion_presencia', { p_token: leerToken() }) }; }
    catch (e) { return { aviso: SIN_SQL.test(String(e.message)) ? 'La presencia aún no está aplicada en el servidor (servidor/111-presencia.sql).' : textoError(e) }; }
  }
  const avisoPresencia = t => `<div class="caja aviso">${esc(t)}</div>`;
  // Pestaña «Métricas» de un juego: pide la función del servidor y deja que el juego pinte sus datos. cont.innerHTML es del juego; los errores salen aquí.
  // Con presencia: true añade el bloque de conectados y jugadores por día de ese juego (la presencia es común a todos).
  function pestana({ juego, funcion, pinta, orden, presencia }) {
    const cargar = async () => {
      const cont = $('pan-metricas-juego'); cont.innerHTML = '<div class="caja ayuda">Cargando…</div>';
      try {
        const [D, pr] = await Promise.all([rpc(funcion, { p_token: leerToken() }), presencia ? cargaPresencia() : null]);
        cont.innerHTML = pinta(D) + (pr ? (pr.P ? presenciaDe(pr.P, juego) : avisoPresencia(pr.aviso)) : '');
      }
      catch (e) { cont.innerHTML = `<div class="caja aviso">${SIN_SQL.test(String(e.message)) ? `Las métricas aún no están aplicadas en el servidor (servidor/109-gestion-metricas.sql, función ${esc(funcion)}).` : esc(textoError(e))}</div>`; }
    };
    GESTION_NAV.seccion({ id: 'metricas', pan: 'pan-metricas-juego', juego, etiqueta: 'Métricas', orden: orden == null ? 3 : orden, cargar });
  }
  return { cifras, caja, tabla, vacio, pct, barras, pestana, presenciaDe, retencion, cargaPresencia, avisoPresencia, SIN_SQL };
})();

// ---------- Global: lo común a todos los juegos ----------
(() => {
  const M = GESTION_METRICAS, NOMBRE_ESTADO = { pagada: 'pagadas', reembolsada: 'reembolsadas' };
  function pintaUsuarios(U) {
    const a = U.activos, tot = (x) => x.invitados + x.cuenta;
    return M.caja('Usuarios activos', M.cifras([[tot(a.h24), 'activos en 24 h'], [tot(a.d7), 'en 7 días'], [tot(a.d30), 'en 30 días'], [U.total, 'cuentas en total']])
      + '<div style="margin-top:10px">' + M.tabla(['Ventana', 'Invitados', 'Con cuenta', '% con cuenta'], [['24 h', a.h24], ['7 días', a.d7], ['30 días', a.d30]]
        .map(([n, x]) => [n, fmt(x.invitados), fmt(x.cuenta), M.pct(x.cuenta, tot(x))])) + '</div>',
    'Cuentas que abrieron o renovaron sesión, o accedieron, dentro de la ventana. Quien juega sin que su sesión se renueve puede no contar todavía: es un mínimo, no un máximo.');
  }
  function pintaNuevos(N) {
    return M.caja('Cuentas nuevas por día (14 días)', M.barras(N, [{ clave: 'invitados', nombre: 'Invitados', color: 'var(--suave)' }, { clave: 'cuenta', nombre: 'Con cuenta', color: 'var(--acento)' }]));
  }
  function pintaCompras(C) {
    const euros = x => (+x || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
    return M.caja('Compras (30 días)', C.length ? M.tabla(['Juego', 'Plataforma', 'Estado', 'Compras', 'Importe'], C.map(x => [esc(x.juego), esc(x.plataforma), esc(NOMBRE_ESTADO[x.estado] || x.estado), fmt(x.compras), euros(x.eur)])) : M.vacio('Sin compras', 'Aún no hay compras en los últimos 30 días.'),
      'Importe bruto por estado: las reembolsadas no son ingreso.');
  }
  function pintaErrores(E) {
    return M.caja('Errores de los juegos (7 días)', E.length ? M.tabla(['Juego', 'Últimas 24 h', '7 días'], E.map(x => [esc(x.juego), fmt(x.h24), fmt(x.d7)])) : M.vacio('Sin errores', 'Ningún juego ha mandado errores esta semana.'),
      'Solo cuántos, de la caja negra (sin personas). El detalle está en cada juego.');
  }
  async function cargar() {
    const cont = $('pan-metricas'); cont.innerHTML = '<div class="caja ayuda">Cargando…</div>';
    try {
      const [D, pr] = await Promise.all([rpc('gestion_metricas', { p_token: leerToken() }), M.cargaPresencia()]);
      cont.innerHTML = '<div class="caja ayuda"><b>Métricas.</b> Números agregados de toda la web, sin ninguna persona identificada. Cada juego tiene su pestaña «Métricas» con las suyas.</div>'
        + pintaUsuarios(D.usuarios) + pintaNuevos(D.usuarios.nuevos) + (pr.P ? M.presenciaDe(pr.P, '*') + M.retencion(pr.P) : M.avisoPresencia(pr.aviso)) + pintaCompras(D.compras) + pintaErrores(D.errores)
        + `<div class="meta">Generado ${fecha(D.generado)}. <button type="button" id="met-recargar">Recargar</button></div>`;
      $('met-recargar').onclick = cargar;
    } catch (e) { cont.innerHTML = `<div class="caja aviso">${M.SIN_SQL.test(String(e.message)) ? 'Las métricas aún no están aplicadas en el servidor (servidor/109-gestion-metricas.sql).' : esc(textoError(e))}</div>`; }
  }
  GESTION_NAV.seccion({ id: 'metricas', pan: 'pan-metricas', etiqueta: 'Métricas', orden: 1.5, cargar });
})();
