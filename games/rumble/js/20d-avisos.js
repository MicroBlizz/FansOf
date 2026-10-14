// Fans of Rumble · Avisos al móvil (solo dentro de la app de Android): notificaciones que el propio móvil enseña a su hora.
// No usan servidor ni internet. Textos elegidos por Daniel (9-10-2026).
'use strict';
/* ---------- cómo funciona ----------
   · Al dejar la app en segundo plano (o cerrarla) se calcula el plan (avisosPlan) y se programan con el plugin
     @capacitor/local-notifications. Al volver a la app se borran todos: se recalculan al salir otra vez.
   · Normas: como mucho 2 al día, nunca entre las 22:00 y las 9:00 (lo que caiga ahí se mueve a las 9:00 o 10:00),
     y solo los próximos 3 días. Si hay más, se quedan los más importantes (horas extra > ausencia > pase > los de la mañana).
   · El permiso de Android se pide después de la primera victoria con el tutorial hecho, con una ventana de Lola (no al abrir).
     SAVE.avisos: undefined (aún no se ha preguntado) · true · false. Interruptor en Opciones (solo en la app).
   · En la web este archivo no programa nada; avisosPlan() se puede probar igual. */
const AVISOS = { manana: 10, mananaMin: 0, tarde: 19, silencioDesde: 22, silencioHasta: 9, maxDia: 2, dias: 3, ausencia: 48 };
const AV_PRIO = { idle: 4, ausencia: 3, pase: 2, manana: 1 };
const avPlugin = () => (NATIVE && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) || null;
const avDia = t => { const d = new Date(t); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };
function avHorario(t) {   // lo que cae de noche se pasa a la mañana
  const d = new Date(t), h = d.getHours();
  if (h >= AVISOS.silencioDesde) { d.setDate(d.getDate() + 1); d.setHours(AVISOS.silencioHasta, 0, 0, 0); }
  else if (h < AVISOS.silencioHasta) d.setHours(AVISOS.silencioHasta, 0, 0, 0);
  return d.getTime();
}
function avAlas(dias, hora, min, desde) { const d = new Date(desde); d.setDate(d.getDate() + dias); d.setHours(hora, min || 0, 0, 0); return d.getTime(); }
const avLider = fac => { const k = FACTIONS[fac] && FACTIONS[fac].leader; return (k && CFG.cards[k] && CFG.cards[k].name) || tr('Tu líder'); };

// el plan: [{ id, at (ms), title, body, tipo }]
function avisosPlan(now = Date.now()) {
  const L = [];
  // 1) horas extra llenas
  if (typeof idleState === 'function') {
    if (typeof idleTick === 'function') idleTick();
    const I = idleState(), falta = (IDLE.cap - I.h) * 3600000, at = I.last + falta;
    if (falta > 60000) L.push({ tipo: 'idle', at: avHorario(at), title: tr('¡ALMACÉN LLENO!'), body: tr('%1 ha llenado el almacén y amenaza con montar un sindicato. Ven a RECOGER.').replace('%1', avLider(I.fac)) });
  }
  // 2) si no vuelves en 2 días
  L.push({ tipo: 'ausencia', at: avHorario(now + AVISOS.ausencia * 3600000), title: 'Fans Of: Rumble', body: tr('Microblizz ha notado tu ausencia. Y se ha alegrado. Vuelve a fastidiarles.') });
  // 3) premios del pase sin cobrar
  if (typeof passClaimable === 'function' && passClaimable() > 0) L.push({ tipo: 'pase', at: avHorario(now + 24 * 3600000), title: tr('PASE DE BATALLA'), body: tr('Tienes premios del pase sin cobrar. Microblizz se los quedará si no vienes.') });
  // 4) por la mañana: el lunes, la Mítica (si la tienes abierta); los demás días, el regalo de la tienda y las misiones nuevas, por turnos
  const miticaAbierta = typeof worldOpenD === 'function' && (() => { try { return worldOpenD(0, 'm'); } catch (e) { return false; } })();
  for (let d = 0; d <= AVISOS.dias; d++) {
    const at = avAlas(d, AVISOS.manana, AVISOS.mananaMin, now); if (at <= now + 10 * 60000) continue;
    if (d === 0 && SAVE.giftDay === todayStr()) continue;   // hoy ya lo ha cogido
    const dia = new Date(at), lunes = dia.getDay() === 1, n = Math.floor(at / 86400000) % 3;
    if (lunes && miticaAbierta) L.push({ tipo: 'manana', at, title: tr('MÍTICA SEMANAL'), body: tr('Es lunes: la Mítica ha vuelto a empezar. Las estrellas no se ganan solas.') });
    else if (n === 0) L.push({ tipo: 'manana', at, title: tr('REGALO DIARIO'), body: tr('Tu regalo diario te espera. Contabilidad aún no se ha dado cuenta.') });
    else if (n === 1) L.push({ tipo: 'manana', at, title: tr('MISIONES NUEVAS'), body: tr('Misiones nuevas. Microblizz ha encontrado más trabajo para ti.') });
    else L.push({ tipo: 'manana', at, title: tr('REGALO DIARIO'), body: tr('Hay algo GRATIS en la tienda. Microblizz jura que no es una trampa.') });
  }
  // normas: dentro de los próximos días, como mucho 2 al día, los más importantes primero
  const fin = avAlas(AVISOS.dias + 1, 0, 0, now), porDia = {}, out = [];
  for (const a of L.filter(x => x.at > now && x.at < fin).sort((x, y) => AV_PRIO[y.tipo] - AV_PRIO[x.tipo] || x.at - y.at)) {
    const k = avDia(a.at); if ((porDia[k] || 0) >= AVISOS.maxDia) continue;
    porDia[k] = (porDia[k] || 0) + 1; out.push(a);
  }
  return out.sort((x, y) => x.at - y.at).map((a, i) => Object.assign(a, { id: 7101 + i }));
}

async function avisosBorra() {
  const P = avPlugin(); if (!P) return;
  try { const p = await P.getPending(); if (p && p.notifications && p.notifications.length) await P.cancel({ notifications: p.notifications.map(n => ({ id: n.id })) }); } catch (e) { /* sin avisos pendientes */ }
}
async function avisosProgramar() {
  const P = avPlugin(); if (!P) return;
  await avisosBorra();
  if (SAVE.avisos !== true) return;
  try {
    const perm = await P.checkPermissions(); if (perm.display !== 'granted') return;
    const plan = avisosPlan(); if (!plan.length) return;
    await P.schedule({ notifications: plan.map(a => ({ id: a.id, title: a.title, body: a.body, schedule: { at: new Date(a.at) }, smallIcon: 'ic_stat_aviso', iconColor: '#ffcb3d' })) });
  } catch (e) { /* si el móvil no deja, no pasa nada */ }
}
// pedir el permiso (ventana de Lola y, si dice que sí, la de Android)
function avisosPregunta() {
  if (!avPlugin() || SAVE.avisos !== undefined) return;
  SAVE.avisos = false; saveGame();   // solo se pregunta una vez; si dice que sí, pasa a true
  confirmBox('¿TE AVISO?', `<b>Lola</b>: ¿quieres que te avise cuando tu líder llene el almacén de horas extra, cuando tengas regalos o misiones nuevas…?<small>Como mucho 2 avisos al día y nunca de noche. Se quitan cuando quieras en Opciones.</small>`, '¡SÍ, AVÍSAME!', async () => {
    try { const r = await avPlugin().requestPermissions(); SAVE.avisos = r.display === 'granted'; } catch (e) { SAVE.avisos = false; }
    saveGame(); avisosOpcion(); toast(SAVE.avisos ? 'Te avisaré. Microblizz no.' : 'Sin permiso del móvil no puedo avisarte. Puedes darlo en Opciones.', true);
  });
}

/* ---------- en la app: al salir se programan, al volver se borran; el permiso, tras la primera victoria ---------- */
if (NATIVE) {
  const AppP = window.Capacitor.Plugins && window.Capacitor.Plugins.App;
  if (AppP) { AppP.addListener('pause', () => { avisosProgramar(); }); AppP.addListener('resume', () => { avisosBorra(); }); }
  avisosBorra();
  let antes = '';
  setInterval(() => {
    if (G.state === 'end' && antes !== 'end' && G.mode !== 'pvp' && SAVE.tut && SAVE.tut.done && G.winner === verEquipo() && SAVE.avisos === undefined) setTimeout(() => { if (curScreen() === 'scr-end') avisosPregunta(); }, 2200);
    antes = G.state;
  }, 300);
}

/* ---------- Opciones (solo en la app): avisos sí / no ---------- */
function avisosOpcion() { const b = $('#btn-avisos'); if (b) b.textContent = SAVE.avisos ? 'SÍ' : 'NO'; }
(function avisosFila() {
  if (!NATIVE || $('#btn-avisos')) return;
  const fila = document.querySelector('#btn-chat') && document.querySelector('#btn-chat').closest('.opt-row'); if (!fila) return;
  fila.insertAdjacentHTML('beforebegin', '<div class="opt-row"><span><b>Avisos al móvil</b><br>Horas extra llenas, regalos, misiones y el pase. Como mucho 2 al día y nunca de noche.</span><button class="btn-ghost ol" id="btn-avisos">NO</button></div>');
  $('#btn-avisos').addEventListener('click', async () => {
    play('select');
    if (SAVE.avisos) { SAVE.avisos = false; saveGame(); avisosOpcion(); avisosBorra(); return; }
    try { const r = await avPlugin().requestPermissions(); SAVE.avisos = r.display === 'granted'; } catch (e) { SAVE.avisos = false; }
    saveGame(); avisosOpcion();
    if (!SAVE.avisos) toast('Android no deja: activa las notificaciones de la app en los ajustes del móvil', true);
  });
  $('#btn-options').addEventListener('click', avisosOpcion); avisosOpcion();
})();
