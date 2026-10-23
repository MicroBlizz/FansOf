// Fans of Rouflage · AVISOS AL MÓVIL (solo dentro de la app de Android; boceto 3 aprobado por Daniel el 23-10-2026): notificaciones que el propio móvil
// enseña a su hora, sin servidor. Las mismas normas que en Rumble (games/rumble/js/20d-avisos.js): como mucho 2 al día, nunca entre las 22:00 y las 9:00,
// y solo los próximos 3 días. Se programan al dejar la app en segundo plano y se borran al volver.
// · El permiso se pide con una ventana del juego (no la de Android de golpe) la primera vez que recoges el premio diario estando en racha.
//   SAVE.avisos: undefined (aún no se ha preguntado) · true · false. En OPCIONES hay un interruptor (solo en la app).
// · En la web no programa nada (avisosPlan se puede probar igual).
'use strict';
const AVR = { tarde: 20, tardeMin: 30, manana: 10, silencioDesde: 22, silencioHasta: 9, maxDia: 2, dias: 3, ausencia: 48 };
const AVR_PRIO = { racha: 3, ausencia: 2, manana: 1 };
const avrPlugin = () => (window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform() && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) || null;
const avrDia = t => { const d = new Date(t); return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(); };
function avrHorario(t) { const d = new Date(t), h = d.getHours(); if (h >= AVR.silencioDesde) { d.setDate(d.getDate() + 1); d.setHours(AVR.silencioHasta, 0, 0, 0); } else if (h < AVR.silencioHasta) d.setHours(AVR.silencioHasta, 0, 0, 0); return d.getTime(); }
const avrA = (dias, h, m, desde) => { const d = new Date(desde); d.setDate(d.getDate() + dias); d.setHours(h, m || 0, 0, 0); return d.getTime(); };

// el plan: [{ id, at, title, body, tipo }]
function avisosPlan(now = Date.now()) {
  const L = [], s = diarioEstado(), rh = rachaHoy(), r = rh.hecha ? rh.r : (rh.perdida ? 0 : rh.r - 1);      // la racha que tienes ahora mismo
  // 1) la racha: por la tarde del día en que aún no has recogido (hoy, si no has recogido; si ya, mañana)
  if (r >= 2) {
    const d = rh.hecha ? 1 : 0, at = avrA(d, AVR.tarde, AVR.tardeMin, now);
    if (at > now + 10 * 60000) L.push({ tipo: 'racha', at, title: tr('¡TU RACHA SE SECA!'), body: tr('Tu racha de {n} días se apaga a medianoche. Phony dice que hoy nadie te encuentra.', { n: r }) });
  }
  // 2) si no vuelves en 2 días
  L.push({ tipo: 'ausencia', at: avrHorario(now + AVR.ausencia * 3600000), title: 'Fans of Rouflage', body: tr('Microblizz ha vuelto a mover los muebles. Los becarios ya no se acuerdan de ti: buen momento para colarse.') });
  // 3) por la mañana: misiones nuevas y premio diario, por turnos
  for (let d = 1; d <= AVR.dias; d++) {
    const at = avrA(d, AVR.manana, 0, now);
    L.push(d % 2 ? { tipo: 'manana', at, title: tr('MISIONES NUEVAS'), body: tr('Misiones nuevas en la oficina. Recursos Humanos ya está afilando las cartas de despido.') }
      : { tipo: 'manana', at, title: tr('PREMIO DIARIO'), body: tr('Tu premio diario te espera. Contabilidad todavía no se ha dado cuenta.') });
  }
  const fin = avrA(AVR.dias + 1, 0, 0, now), porDia = {}, out = [];
  for (const a of L.filter(x => x.at > now && x.at < fin).sort((x, y) => AVR_PRIO[y.tipo] - AVR_PRIO[x.tipo] || x.at - y.at)) {
    const k = avrDia(a.at); if ((porDia[k] || 0) >= AVR.maxDia) continue;
    porDia[k] = (porDia[k] || 0) + 1; out.push(a);
  }
  return out.sort((x, y) => x.at - y.at).map((a, i) => Object.assign(a, { id: 8101 + i }));
}
async function avisosBorra() {
  const P = avrPlugin(); if (!P) return;
  try { const p = await P.getPending(); if (p && p.notifications && p.notifications.length) await P.cancel({ notifications: p.notifications.map(n => ({ id: n.id })) }); } catch (e) { /* sin avisos */ }
}
async function avisosProgramar() {
  const P = avrPlugin(); if (!P) return;
  await avisosBorra();
  if (SAVE.avisos !== true) return;
  try {
    const perm = await P.checkPermissions(); if (perm.display !== 'granted') return;
    const plan = avisosPlan(); if (!plan.length) return;
    await P.schedule({ notifications: plan.map(a => ({ id: a.id, title: a.title, body: a.body, schedule: { at: new Date(a.at) }, smallIcon: 'ic_stat_aviso', iconColor: '#ffcb3d' })) });
  } catch (e) { /* si el móvil no deja, no pasa nada */ }
}
// pedir el permiso con nuestra ventana (la primera vez que recoges estando en racha)
function avisosOfrece() {
  if (!avrPlugin() || SAVE.avisos !== undefined) return;
  setTimeout(() => { if (E('p-titulo').hidden && E('p-diario').hidden) return; pantalla('p-avisos'); }, 1200);
}
async function avisosSi() {
  const P = avrPlugin(); play('select');
  let ok = false; try { const r = await P.requestPermissions(); ok = r && r.display === 'granted'; } catch (e) { ok = false; }
  SAVE.avisos = ok; guardaPartida(); avisa(ok ? tr('Te avisaremos antes de que se seque tu racha') : tr('Sin avisos. Puedes activarlos en OPCIONES.'), ok ? 'bueno' : 'aviso'); irTitulo();
}
function preparaAvisos() {
  if (!PANTALLAS.includes('p-avisos')) PANTALLAS.push('p-avisos');
  E('b-avisos-si').onclick = avisosSi;
  E('b-avisos-no').onclick = () => { play('select'); SAVE.avisos = false; guardaPartida(); irTitulo(); };
  // el interruptor de OPCIONES (solo en la app)
  const fila = E('op-fila-avisos'); if (fila) fila.hidden = !avrPlugin();
  const pinta = () => { for (const b of document.querySelectorAll('#op-avisos button')) b.classList.toggle('activo', (b.dataset.v === '1') === (SAVE.avisos === true)); };
  for (const b of document.querySelectorAll('#op-avisos button')) b.onclick = async () => { if (b.dataset.v === '1') await avisosSi(); else { SAVE.avisos = false; guardaPartida(); avisosBorra(); } pinta(); };
  pinta();
  // al irse se programan; al volver se borran (se recalculan la próxima vez)
  document.addEventListener('visibilitychange', () => { if (document.hidden) avisosProgramar(); else avisosBorra(); });
  avisosBorra();
}
