// Fans Of · /gestion: la sección de DECKS dentro de su panel (menú de arriba → Decks). Telemetría anónima de las partidas de personas, para compararla con los bots
// (herramientas/pruebas/balance/decks/decks-equilibrio.js): partidas, victorias, turnos por reunión y dónde caen, por versión y líder. Datos: gestion_decks(token), servidor/68-decks-telemetria.sql.
// Une las estadísticas ya consolidadas (más de 7 días) con el resumen vivo de la última semana. Usa lo de gestion/index.html y juegos.js: rpc(), leerToken(), esc(), fmt(), textoError() y $().
'use strict';
GESTION_JUEGOS.decks = async cont => {
  let D;
  try { D = await rpc('gestion_decks', { p_token: leerToken() }); }
  catch (e) { cont.innerHTML = `<div class="caja aviso">${/Could not find the function|PGRST202/.test(String(e.message)) ? 'La telemetría de Decks aún no está aplicada en el servidor (servidor/68-decks-telemetria.sql).' : esc(textoError(e))}</div>`; return; }
  // una fila por (versión, líder): suma lo consolidado y lo de la semana
  const G = {}, vers = new Set();
  const suma = (r, de) => {
    const k = r.version + '|' + r.lider; vers.add(r.version);
    const x = G[k] = G[k] || { version: r.version, lider: r.lider, p: 0, vic: 0, der: 0, aba: 0, tu: 0, re: 0, mi: 0, mz: 0, as: 0, cap: {} };
    x.p += +r.partidas; x.tu += +r.turnos || 0; x.re += +r.reuniones || 0; x.mi += +r.minutos || 0; x.mz += +r.mazo || 0; x.as += +r.ascendidas || 0;
    if (r.estado === 'victoria') x.vic += +r.partidas; else if (r.estado === 'derrota') x.der += +r.partidas; else if (r.estado === 'abandonada') x.aba += +r.partidas;
    for (const [c, n] of Object.entries(r.caidas || {})) x.cap[c] = (x.cap[c] || 0) + +n;
  };
  (D.consolidado || []).forEach(r => suma(r)); (D.semana || []).forEach(r => suma(r));
  const lista = [...vers].sort().reverse();
  cont.innerHTML = '<div class="caja"><b>Partidas de personas</b><div class="meta">Anónimas y sin cuenta. Detalle 7 días; después se consolidan. «En curso» no sale aquí (todavía no sabemos cómo acaban).</div>'
    + `<div class="filtros" style="margin-top:8px"><label for="d-ver" style="display:block">Versión</label><select id="d-ver"><option value="">todas</option>${lista.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('')}</select></div></div><div id="d-tabla"></div>`;
  const pinta = () => {
    const ver = $('d-ver').value, por = {};
    Object.values(G).filter(x => !ver || x.version === ver).forEach(x => {   // si se mira «todas», se juntan las versiones de cada líder
      const y = por[x.lider] = por[x.lider] || { lider: x.lider, p: 0, vic: 0, der: 0, aba: 0, tu: 0, re: 0, mi: 0, mz: 0, as: 0, cap: {} };
      for (const k of ['p', 'vic', 'der', 'aba', 'tu', 're', 'mi', 'mz', 'as']) y[k] += x[k];
      for (const [c, n] of Object.entries(x.cap)) y.cap[c] = (y.cap[c] || 0) + n;
    });
    const L = Object.values(por).sort((a, b) => b.p - a.p), pct = (a, b) => b ? Math.round(a / b * 100) + ' %' : '—', med = (a, b) => b ? Math.round(a / b) : '—';
    const acab = x => x.vic + x.der;   // las abandonadas no cuentan para el porcentaje de victorias
    $('d-tabla').innerHTML = L.length ? `<div class="tabla-caja"><table class="tabla"><thead><tr><th>Líder</th><th>Partidas</th><th>Victorias</th><th>% de las acabadas</th><th>Abandonadas</th><th>Turnos</th><th>Reuniones</th><th>Turnos por reunión</th><th>Min</th><th>Mazo</th><th>Ascendidas</th><th>Caen en cap 0 / 1 / 2</th></tr></thead><tbody>`
      + L.map(x => `<tr><td>${esc(x.lider)}</td><td>${fmt(x.p)}</td><td>${fmt(x.vic)}</td><td>${pct(x.vic, acab(x))}</td><td>${fmt(x.aba)}</td><td>${med(x.tu, x.p)}</td><td>${med(x.re, x.p)}</td><td>${x.re ? (x.tu / x.re).toFixed(1) : '—'}</td><td>${med(x.mi, x.p)}</td><td>${med(x.mz, x.p)}</td><td>${med(x.as, x.p)}</td><td>${[0, 1, 2].map(c => x.cap[c] || 0).join(' / ')}</td></tr>`).join('')
      + '</tbody></table></div><div class="meta" style="margin-top:6px">Mismas columnas que el informe de los bots (herramientas/pruebas/balance/decks/decks-equilibrio.js), para compararlos.</div>'
      : '<div class="vacio"><b>Aún no hay partidas</b>El flag «decks-telemetria» tiene que estar abierto y el jugador, haber aceptado las estadísticas.</div>';
  };
  $('d-ver').onchange = pinta; pinta();
};
