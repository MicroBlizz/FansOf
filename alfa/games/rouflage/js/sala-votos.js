// Fans of Rouflage · ME GUSTA, NO ME GUSTA y REPORTAR el escenario del anfitrión en la sala CON AMIGOS (sala-escenario.js). Los invitados votan
// (uno por persona, se puede cambiar) o reportan (dibujo inapropiado, nombre ofensivo u otra cosa, con un texto corto) y el anfitrión ve sus me gusta.
// Si el escenario está oculto (3 reportes pendientes o el dueño baneado) se ve la sala de serie. Si el anfitrión está baneado, se le dice claro.
// Servidor: servidor/60-rouflage-votos.sql (rouflage_escenario_votar, rouflage_escenario_reportar; oculto y megusta llegan con el escenario).
// En la red de pruebas (?pvp=local) todo va simulado entre pestañas (localStorage); &baneado=1 (o =AAAA-MM-DD) hace de anfitrión baneado.
// Lo llaman salaEspPaso (salaVotosPaso, salaVotosLee, salaVotosError). Los iconos, dibujados aquí en SVG con el contorno del juego.
'use strict';
const SALA_VOTOS = { megusta: 0, mivoto: 0, oculto: false, baneo: '', retirado: false, enviando: false, motivo: '', codigo: '', avisado: '', vAnf: 0, tMira: 0, mirando: false };

/* ---------- la red: servidor de verdad y la simulada ---------- */
(() => {
  const S = RFRED.servidor, L = RFRED.local;
  S.escVotar = v => RFRED.rpc('rouflage_escenario_votar', { p_voto: v });
  S.escReportar = (m, t) => RFRED.rpc('rouflage_escenario_reportar', { p_motivo: m, p_texto: t || null });
  const yo = Math.random().toString(36).slice(2, 9), CLAVE = 'rf-pruebas-votos';
  const lee = () => { try { return JSON.parse(localStorage.getItem(CLAVE) || 'null') || { votos: {}, reportes: [] }; } catch (_) { return { votos: {}, reportes: [] }; } };
  const pon = p => { try { localStorage.setItem(CLAVE, JSON.stringify(p)); } catch (_) { /* sin guardar */ } };
  const oculto = p => new Set(p.reportes.map(r => r.quien)).size >= 3;
  const megusta = p => Object.values(p.votos).filter(v => v === 1).length;
  const baneo = () => { try { const q = new URLSearchParams(location.search).get('baneado'); return q ? 'baneado:' + (/^\d{4}-\d\d-\d\d$/.test(q) ? q : 'siempre') : ''; } catch (_) { return ''; } };
  const sube = L.escenario, ver = L.escenarioVer;
  L.escenario = d => {
    const b = baneo(); if (b) { try { localStorage.removeItem('rf-pruebas-escenario'); } catch (_) { /* nada */ } return Promise.reject(new Error(b)); }
    const p = lee(); if (oculto(p)) d = null;
    return sube(d).then(() => ({ oculto: oculto(p), megusta: megusta(p) }));
  };
  L.escenarioVer = v => ver(v).then(r => { const p = lee(), oc = oculto(p), x = Object.assign({}, r, { oculto: oc, megusta: megusta(p), mivoto: p.votos[yo] || 0 }); if (oc) x.datos = null; return x; });
  L.escVotar = v => { const p = lee(); if (v) p.votos[yo] = v; else delete p.votos[yo]; pon(p); return Promise.resolve({ ok: true, mivoto: v, megusta: megusta(p) }); };
  L.escReportar = (m, t) => {
    const p = lee();
    if (p.reportes.filter(r => r.quien === yo && Date.now() - r.creado < 864e5).length >= 5) return Promise.reject(new Error('tope_reportes'));
    let esc = null; try { esc = (JSON.parse(localStorage.getItem('rf-pruebas-escenario') || 'null') || {}).d || null; } catch (_) { /* nada */ }
    p.reportes.push({ quien: yo, motivo: m, texto: t || '', escenario: esc, creado: Date.now() }); pon(p);
    return Promise.resolve({ ok: true });
  };
  // un baneado que intenta CREAR una sala con amigos: el texto claro (el de la fecha sale en la sala, salaVotosAviso)
  const errorTexto = RFRED.errorTexto;
  RFRED.errorTexto = e => /baneado/.test(String((e && e.message) || e)) ? 'Microblizz te ha quitado lo de crear salas con amigos por un reporte. Puedes unirte a la sala de un amigo con su código.' : errorTexto(e);
})();

/* ---------- los iconos (SVG con el contorno grueso del juego) ---------- */
const SALA_VOTOS_ICO = (() => {
  const O = '#20102c', sv = (w, h, d) => `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true">${d}</svg>`;
  return {
    // el sello de APROBADO: tampón verde redondo con su visto bueno, un poco torcido
    si: sv(30, 30, `<g transform="rotate(-12 15 15)"><circle cx="15" cy="15" r="12.5" fill="#7ee04a" stroke="${O}" stroke-width="3"/><circle cx="15" cy="15" r="8.6" fill="none" stroke="#2f7a1a" stroke-width="1.6" stroke-dasharray="2.4 1.6"/><path d="M9.5 15.5l4 4 7.5-9" fill="none" stroke="${O}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></g>`),
    // el sello de DESPEDIDO: tampón rojo rectangular con su cruz
    no: sv(30, 30, `<g transform="rotate(9 15 15)"><rect x="3" y="6" width="24" height="18" rx="3.5" fill="#ff4b5c" stroke="${O}" stroke-width="3"/><rect x="6.4" y="9.2" width="17.2" height="11.6" rx="2" fill="none" stroke="#8a1626" stroke-width="1.5"/><path d="M11 11.5l8 7M19 11.5l-8 7" stroke="${O}" stroke-width="3.2" stroke-linecap="round"/></g>`),
    // el chivatazo: un banderín de aviso en su palo, con la exclamación
    rep: sv(30, 30, `<path d="M8 27V4" stroke="${O}" stroke-width="3.4" stroke-linecap="round"/><path d="M9 5h15.5l-4 5.5 4 5.5H9z" fill="#ffcb3d" stroke="${O}" stroke-width="3" stroke-linejoin="round"/><path d="M15.6 7.6v4" stroke="${O}" stroke-width="2.6" stroke-linecap="round"/><circle cx="15.6" cy="14" r="1.4" fill="${O}"/>`),
    // el sello grande de «RECIBIDO» del gracias
    sello: sv(120, 70, `<g transform="rotate(-8 60 35)"><rect x="6" y="10" width="108" height="50" rx="9" fill="#2e8bff" stroke="${O}" stroke-width="4"/><rect x="13" y="17" width="94" height="36" rx="5" fill="none" stroke="#fff6ea" stroke-width="2" stroke-dasharray="5 3"/><text x="60" y="43" text-anchor="middle" font-family="Luckiest Guy, Arial Black, sans-serif" font-size="21" fill="#fff6ea" stroke="${O}" stroke-width="3.5" paint-order="stroke">${tr('RECIBIDO')}</text></g>`),
  };
})();
function salaVotosIconos(raiz) { raiz.querySelectorAll('i[data-ico]:not(.puesto)').forEach(i => { i.innerHTML = SALA_VOTOS_ICO[i.dataset.ico] || ''; i.classList.add('puesto'); }); }

/* ---------- lo que llega con el escenario (de sala-escenario.js) ---------- */
// r: la respuesta de subirlo (soyAnf) o de leerlo. Oculto: los demás ven la sala de serie
function salaVotosLee(r, soyAnf) {
  if (!r) return;
  if (r.megusta != null) SALA_VOTOS.megusta = r.megusta | 0;
  if (!soyAnf && r.mivoto != null && !SALA_VOTOS.enviando) SALA_VOTOS.mivoto = r.mivoto | 0;
  SALA_VOTOS.oculto = !!r.oculto;
  if (soyAnf) { SALA_VOTOS.baneo = ''; SALA_VOTOS.retirado = false; if (r.v != null) SALA_VOTOS.vAnf = r.v; }
  if (!soyAnf && r.oculto) SALA_ESP.datos = null;
}
// al subirlo: ¿está baneado o le retiraron ese dibujo? Devuelve true si es eso (y no hay que reintentar enseguida)
function salaVotosError(e) {
  const m = String((e && e.message) || e), b = /baneado:?([\w-]*)/.exec(m);
  if (b) SALA_VOTOS.baneo = b[1] || 'siempre';
  else if (/escenario_retirado/.test(m)) SALA_VOTOS.retirado = true;
  else return false;
  const clave = SALA_VOTOS.baneo + '|' + SALA_VOTOS.retirado;
  if (SALA_VOTOS.avisado !== clave && typeof avisa === 'function') { SALA_VOTOS.avisado = clave; play('deny'); avisa(salaVotosAviso(true), 'malo'); }
  if (!E('p-busca').hidden) salaVotosPinta(true);
  return true;
}
// el aviso de la sala: al anfitrión, por qué no se ve su escenario; a los invitados, que está escondido
function salaVotosAviso(soyAnf) {
  if (soyAnf && SALA_VOTOS.baneo) return SALA_VOTOS.baneo === 'siempre'
    ? tr('Microblizz ha retirado tu escenario de las salas por un reporte, para siempre. Tus amigos ven la sala de serie.')
    : tr('Microblizz ha retirado tu escenario de las salas por un reporte hasta el {f}. Tus amigos ven la sala de serie.', { f: salaVotosFecha(SALA_VOTOS.baneo) });
  if (soyAnf && SALA_VOTOS.retirado) return tr('Microblizz ha retirado este dibujo por un reporte. Pinta otra cosa en MI ESCENARIO para volver a enseñarlo.');
  if (soyAnf && SALA_VOTOS.oculto) return tr('Tu escenario está en revisión por unos reportes: mientras, tus amigos ven la sala de serie.');
  if (!soyAnf && SALA_VOTOS.oculto) return tr('Este escenario está escondido mientras lo revisa Microblizz. Aquí tenéis la sala de serie.');
  return '';
}
function salaVotosFecha(iso) { try { return new Date(iso + 'T12:00:00Z').toLocaleDateString(IDIOMA.actual === 'en' ? 'en-GB' : 'es-ES', { day: 'numeric', month: 'long' }); } catch (_) { return iso; } }

/* ---------- la barra de votos ---------- */
function salaVotosPaso(i, soyAnf) {
  if (!i) { E('esc-votos').hidden = E('esc-mio').hidden = E('esc-aviso').hidden = true; salaVotosCierra(); return; }
  if (SALA_VOTOS.codigo !== i.codigo) { Object.assign(SALA_VOTOS, { megusta: 0, mivoto: 0, oculto: false, codigo: i.codigo }); salaVotosCierra(); }
  // el anfitrión mira sus me gusta cada 6 s (con la versión que subió, para que no le manden su propio escenario otra vez)
  const red = RFRED.red, V = SALA_VOTOS;
  if (soyAnf && red.escenarioVer && !V.mirando && Date.now() - (V.tMira || 0) > 6000) {
    V.tMira = Date.now(); V.mirando = true;
    Promise.resolve(red.escenarioVer(V.vAnf || 0)).then(r => { if (r && r.megusta != null) V.megusta = r.megusta | 0; if (r && r.oculto != null && !V.baneo) V.oculto = !!r.oculto; })
      .catch(() => { /* sin servidor nuevo: sin contador */ }).finally(() => { V.mirando = false; });
  }
  salaVotosPinta(soyAnf);
}
function salaVotosPinta(soyAnf) {
  salaVotosIconos(E('p-busca'));
  const hay = soyAnf || !!SALA_ESP.datos, V = SALA_VOTOS;
  E('esc-votos').hidden = soyAnf || !hay;
  E('esc-mio').hidden = !soyAnf || !!V.baneo;
  E('esc-mio-t').textContent = V.megusta === 1 ? tr('A 1 amigo le gusta tu escenario') : tr('A {n} amigos les gusta tu escenario', { n: V.megusta });
  E('ev-n').textContent = V.megusta;
  E('b-ev-si').classList.toggle('activo', V.mivoto === 1); E('b-ev-si').setAttribute('aria-pressed', String(V.mivoto === 1));
  E('b-ev-no').classList.toggle('activo', V.mivoto === -1); E('b-ev-no').setAttribute('aria-pressed', String(V.mivoto === -1));
  const av = salaVotosAviso(soyAnf), p = E('esc-aviso');
  p.hidden = !av; p.textContent = av; p.classList.toggle('malo', soyAnf && !!(V.baneo || V.retirado));
}
function salaVotosVota(v) {
  const V = SALA_VOTOS, red = RFRED.red; if (!red.escVotar || V.enviando) return;
  const nuevo = V.mivoto === v ? 0 : v, antes = { mivoto: V.mivoto, megusta: V.megusta };      // pulsar el que ya tienes lo quita
  V.megusta += (nuevo === 1 ? 1 : 0) - (V.mivoto === 1 ? 1 : 0); V.mivoto = nuevo; V.enviando = true;
  play(nuevo === 1 ? 'crown' : nuevo === -1 ? 'pop' : 'select'); salaVotosPinta(false);
  Promise.resolve(red.escVotar(nuevo)).then(r => { if (r && r.megusta != null) V.megusta = r.megusta | 0; })
    .catch(() => { Object.assign(V, antes); avisa(tr('No se ha podido votar. Prueba otra vez.'), 'malo'); })
    .finally(() => { V.enviando = false; if (!E('p-busca').hidden) salaVotosPinta(false); });
}

/* ---------- el cuadro de reportar ---------- */
function salaVotosAbre() {
  play('select'); SALA_VOTOS.motivo = '';
  E('esc-rep-form').hidden = false; E('esc-rep-gracias').hidden = true; E('esc-rep-error').hidden = true;
  E('esc-rep-texto').value = ''; E('b-rep-si').disabled = true;
  E('esc-rep').querySelectorAll('.ev-m').forEach(b => b.classList.remove('activo'));
  E('esc-rep').hidden = false;
}
function salaVotosCierra() { E('esc-rep').hidden = true; }
function salaVotosManda() {
  const V = SALA_VOTOS, red = RFRED.red; if (!V.motivo || V.enviando || !red.escReportar) return;
  V.enviando = true; E('b-rep-si').disabled = true;
  Promise.resolve(red.escReportar(V.motivo, E('esc-rep-texto').value.trim().slice(0, 200)))
    .then(() => { play('crown'); E('esc-rep-form').hidden = true; E('esc-rep-gracias').hidden = false; })
    .catch(e => {
      const m = String((e && e.message) || e), err = E('esc-rep-error'); err.hidden = false; play('deny');
      err.textContent = /tope_reportes/.test(m) ? tr('Ya has mandado muchos reportes hoy. Mañana más.') : /sin_escenario/.test(m) ? tr('Este escenario ya no está aquí.') : tr('No se ha podido mandar. Prueba otra vez.');
      E('b-rep-si').disabled = false;
    })
    .finally(() => { V.enviando = false; });
}
(() => {
  E('b-ev-si').onclick = () => salaVotosVota(1);
  E('b-ev-no').onclick = () => salaVotosVota(-1);
  E('b-ev-rep').onclick = salaVotosAbre;
  E('b-rep-no').onclick = () => { play('select'); salaVotosCierra(); };
  E('b-rep-ok').onclick = () => { play('select'); salaVotosCierra(); };
  E('b-rep-si').onclick = salaVotosManda;
  E('esc-rep').addEventListener('click', ev => {
    if (ev.target === E('esc-rep')) { salaVotosCierra(); return; }
    const b = ev.target.closest('.ev-m'); if (!b) return;
    play('select'); SALA_VOTOS.motivo = b.dataset.m; E('b-rep-si').disabled = false;
    E('esc-rep').querySelectorAll('.ev-m').forEach(x => x.classList.toggle('activo', x === b));
  });
})();
