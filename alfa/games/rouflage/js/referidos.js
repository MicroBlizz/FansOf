// Fans of Rouflage · TRAE A UN COLADO (referidos, boceto 4 aprobado por Daniel el 23-10-2026). Cada cuenta tiene su código; el enlace ?inv=CODIGO
// lo apunta en quien llega nuevo (rouflage_ref_apuntar, servidor/80-rouflage-referidos.sql). Cuando el nuevo juega su SEGUNDA partida (rouflage_ref_partida,
// al acabar cada una), ganan los dos: él 300 Gotas y quien le invitó 200, y quien invita se lleva premios del armario al traer 1, 3, 5 y 10 amigos
// (las piezas «Trae amigos · N»). El código también viaja solo en los enlaces de reto (reto.js) y de sala (pvp-pantallas.js): cada cosa que compartes trae gente.
'use strict';

const REF = { codigo: '', datos: null, pidiendo: null };
const refUrl = c => location.origin + location.pathname + '?inv=' + c;
const refLee = k => { try { return localStorage.getItem(k) || ''; } catch (_) { return ''; } };
const refPon = (k, v) => { try { if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); } catch (_) { /* sin guardar */ } };
// añade tu código a un enlace que vas a compartir (si ya lo sabes)
const refEnlace = url => (REF.codigo ? url + (url.includes('?') ? '&' : '?') + 'inv=' + REF.codigo : url);

// tu código y tus amigos (la primera vez el servidor te da el código)
function refPide() {
  if (REF.pidiendo) return REF.pidiendo;
  if (!RFRED.conSesion()) return Promise.resolve(null);
  REF.pidiendo = Promise.resolve(RFRED.rpc('rouflage_ref_mio', {})).then(d => { REF.datos = d; REF.codigo = (d && d.codigo) || ''; refPon('rouflage-mi-codigo', REF.codigo); return d; })
    .catch(e => { console.warn('[referidos]', e); return null; }).finally(() => { REF.pidiendo = null; });
  return REF.pidiendo;
}

/* ---------- al llegar por un enlace ?inv= ---------- */
// lo llama el arranque: guarda el código (para apuntarlo en cuanto haya sesión) y lo quita de la dirección
function refEntrada() {
  const q = new URLSearchParams(location.search), c = (q.get('inv') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  if (c.length === 6 && !refLee('rouflage-inv-hecho')) refPon('rouflage-inv', c);
  if (q.has('inv')) { q.delete('inv'); history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '') + location.hash); }
  refApunta();
}
function refApunta() {
  const c = refLee('rouflage-inv'); if (!c || !RFRED.conSesion()) return;
  Promise.resolve(RFRED.rpc('rouflage_ref_apuntar', { p_codigo: c })).then(r => {
    refPon('rouflage-inv', ''); refPon('rouflage-inv-hecho', '1');
    if (r && r.ok) avisa(tr('Te ha invitado {n}: al jugar tu segunda partida, ganáis los dos', { n: r.nombre || tr('un amigo') }), 'bueno');
  }).catch(e => {
    const m = String((e && e.message) || e);
    if (/codigo_no_valido|es_tuyo|cuenta_antigua/.test(m)) { refPon('rouflage-inv', ''); refPon('rouflage-inv-hecho', '1'); }      // no vale: se olvida. Sin red: se intenta la próxima vez
  });
}
// al acabar cada partida: si llegaste invitado, se cuenta (en la segunda, premio para los dos)
function refPartida() {
  if (!refLee('rouflage-inv-hecho') || refLee('rouflage-inv-cobrado') || !RFRED.conSesion()) return;
  Promise.resolve(RFRED.rpc('rouflage_ref_partida', {})).then(r => {
    if (!r) return;
    if (r.premio) {
      refPon('rouflage-inv-cobrado', '1'); play('crown');
      avisa(tr('¡Premio de amigos! {g} Gotas para ti y otras para {n}', { g: r.gotas || 300, n: r.padrino || tr('tu amigo') }), 'bueno');
      if (typeof RFS !== 'undefined' && RFS.activo()) Promise.resolve(CUENTA.rpc('rf_estado', {})).then(e => { if (e) { RFS.aplica(e); if (!E('p-titulo').hidden) refrescaTitulo(); } }).catch(() => {});      // las Gotas nuevas, ya
    } else if (r.nada) refPon('rouflage-inv-cobrado', '1');
  }).catch(() => { /* sin red: la próxima */ });
}

/* ---------- la pantalla TRAE A UN COLADO ---------- */
// los premios de reclutador: las piezas del armario «Trae amigos · N», ordenadas
function refPremios() {
  const out = [];
  for (const c of CATALOGO_AR) for (const it of c.items) { const m = it.de === 'amigos' && /· (\d+)$/.exec(String(it.txt)); if (m) out.push({ cat: c.id, it, n: +m[1] }); }
  return out.sort((a, b) => a.n - b.n);
}
async function abreInvita() {
  pantalla('p-invita'); refPinta();
  if (!RFRED.conSesion()) { E('inv-codigo').textContent = '—'; E('inv-nota').textContent = tr('Necesitas conexión para tener tu código.'); return; }
  await refPide(); refPinta();
}
function refPinta() {
  const d = REF.datos || { amigos: [], cuentan: 0 }, n = d.cuentan || 0;
  E('inv-codigo').textContent = REF.codigo || '…';
  E('b-inv-compartir').disabled = !REF.codigo;
  E('inv-nota').textContent = '';
  const prem = refPremios(), sig = prem.find(p => p.n > n), tope = sig ? sig.n : (prem.length ? prem[prem.length - 1].n : 1);
  E('inv-escalera-t').textContent = tr('PREMIOS DE RECLUTADOR · {n} DE {t}', { n, t: tope });
  E('inv-barra').style.width = Math.round(Math.min(1, n / tope) * 100) + '%';
  const esc = E('inv-escalera'); esc.innerHTML = '';
  for (const p of prem) {
    const hecho = n >= p.n, el = document.createElement('div');
    el.className = 'inv-esc' + (hecho ? ' hecho' : p === sig ? ' siguiente' : '');
    const k = arLienzo(40, 40); arPinta(k, (c, w) => p.it.x(c, w)); el.appendChild(k);
    const s = document.createElement('small'); s.textContent = p.n === 1 ? tr('1 amigo') : tr('{n} amigos', { n: p.n }); el.appendChild(s);
    const b = document.createElement('b'); b.textContent = tr(p.it.n); el.appendChild(b);
    esc.appendChild(el);
  }
  const lista = E('inv-lista'); lista.innerHTML = '';
  for (const a of (d.amigos || []).slice(0, 6)) {
    const f = document.createElement('div'); f.className = 'inv-fila';
    const nom = document.createElement('span'); nom.textContent = a.nombre || tr('Fan'); f.appendChild(nom);
    const est = document.createElement('b'); est.textContent = a.cuenta ? tr('Ya cuenta') : tr('{n} de 2 partidas', { n: a.partidas || 0 }); est.className = a.cuenta ? 'si' : ''; f.appendChild(est);
    lista.appendChild(f);
  }
  lista.hidden = !(d.amigos || []).length;
}
function refComparte() {
  if (!REF.codigo) return;
  play('select');
  const url = refUrl(REF.codigo), texto = tr('Juega conmigo a Fans of Rouflage, el escondite con pintura. Con mi código {c} ganamos los dos.', { c: REF.codigo });
  if (navigator.share) { navigator.share({ title: 'Fans of Rouflage', text: texto, url }).catch(() => { /* cancelado */ }); return; }
  Promise.resolve(navigator.clipboard && navigator.clipboard.writeText(texto + ' ' + url)).then(() => avisa(tr('Enlace copiado: pégaselo a tus amigos'), 'bueno')).catch(() => avisa(url, 'bueno'));
}

function preparaReferidos() {
  if (!PANTALLAS.includes('p-invita')) PANTALLAS.push('p-invita');
  REF.codigo = refLee('rouflage-mi-codigo');
  E('b-inv-compartir').onclick = refComparte;
  E('b-inv-volver').onclick = () => { play('select'); irTitulo(); };
  // al acabar cada partida se cuenta para el premio de amigos (como el aviso de guardar el progreso, titulo.js)
  const fin = economiaPartida;
  economiaPartida = r => { refPartida(); return fin(r); };
}
