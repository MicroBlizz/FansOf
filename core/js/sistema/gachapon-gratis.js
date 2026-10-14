// Fans Of · TIRADAS GRATIS del gashapón: una x1 cada 3 horas (con cuenta atrás) y una x10 cada domingo (hora de Madrid); la x50 no tiene.
// No se acumulan: el reloj de la x1 arranca al cobrarla y la x10 solo se cobra en domingo, una vez.
// Con cuenta las cobra el servidor (tirada_gratis_cobrar, servidor/29-tirada-gratis.sql) y manda su reloj; sin cuenta se apuntan en SAVE.gratisT y SAVE.gratisD.
// Si el servidor aún no tiene las funciones, los botones no salen. El cobro da las entradas y se gastan enseguida con pull(n).
'use strict';
const GRATIS = (() => {
  const horas = () => ECON.gratisH || 3;
  const est = { ok: false, sin: false, proxima: 0, desfase: 0, x10: false };   // proxima y desfase en ms del servidor (desfase = su reloj menos el de aquí)
  let cobrando = false, reloj = 0, aviso = 0;
  const nube = () => ECO.servidor('gachapon');
  const madrid = () => {   // la fecha y el día de la semana de Madrid (0 = domingo) del reloj de aquí
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).map(x => [x.type, x.value]));
    return { fecha: `${p.year}-${p.month}-${p.day}`, dom: p.weekday === 'Sun', dow: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), pasado: ((+p.hour % 24) * 3600 + +p.minute * 60 + +p.second) * 1000 };
  };
  const fija = r => { est.ok = true; est.proxima = r.proxima; est.desfase = r.ahora - Date.now(); est.x10 = !!r.x10_listo; programa(); };
  // ms que faltan para la x1; Infinity si aún no se sabe (con cuenta, hasta que el servidor conteste)
  function falta() {
    if (nube()) return est.ok ? est.proxima - (Date.now() + est.desfase) : Infinity;
    return (SAVE.gratisT || 0) + horas() * 3600000 - Date.now();
  }
  function x10() {   // { listo, falta } de la x10 de los domingos: lista = hasta que acabe el domingo; si no, hasta que empiece el próximo (hora de Madrid)
    const m = madrid(), listo = nube() ? est.ok && est.x10 : m.dom && SAVE.gratisD !== m.fecha;
    return { listo, falta: listo ? 86400000 - m.pasado : ((m.dom ? 7 : 7 - m.dow) * 86400000) - m.pasado };
  }
  const visible = () => !est.sin && (!nube() || est.ok);
  const listo1 = () => visible() && falta() <= 0;
  const listo10 = () => visible() && x10().listo;
  const sinFuncion = e => /Could not find|HTTP 404|PGRST202/i.test(String((e && e.message) || e));
  function programa() {   // cuando llegue la hora, el punto rojo del menú se enciende solo
    clearTimeout(aviso); const f = falta();
    if (f > 0 && f < 2147483647) aviso = setTimeout(() => { updateBadges(); pintar(); }, f + 300);
  }
  async function refrescar() {
    if (!nube() || est.sin) { pintar(); return; }
    try { fija(await CUENTA.rpc('tirada_gratis_estado', { p_juego: AJUSTES.id })); }
    catch (e) { if (sinFuncion(e)) est.sin = true; }
    pintar(); updateBadges();
  }
  const cuenta = ms => { const s = Math.max(0, Math.ceil(ms / 1000)), p = n => String(n).padStart(2, '0'), d = Math.floor(s / 86400), h = Math.floor(s / 3600) % 24; return `${d ? d + ' d ' : ''}${p(d ? h : Math.floor(s / 3600))}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}`; };
  function boton(id, tipo) {
    let b = $('#' + id); if (b) return b;
    const fila = document.querySelector('#scr-gacha .pull-row'); if (!fila) return null;
    fila.insertAdjacentHTML('beforebegin', `<button class="btn-gratis ol" id="${id}" hidden>${TICKET_SVG}<span class="bg-t"></span><b></b></button>`);
    b = $('#' + id); b.onclick = () => cobrar(tipo); return b;
  }
  function pon(b, listo, titulo, espera, cuentaTxt) {
    b.hidden = !visible(); if (b.hidden) return;
    b.classList.toggle('lista', listo); b.disabled = !listo;
    b.querySelector('.bg-t').textContent = tr(listo ? titulo : espera); b.querySelector('b').textContent = listo && !cuentaTxt ? tr('¡LISTA!') : cuentaTxt;
  }
  function pintar() {
    const b1 = boton('btn-gratis-1', 'x1'), b10 = boton('btn-gratis-10', 'x10'); if (!b1 || !b10) return;
    pon(b1, listo1(), 'TIRADA GRATIS x1', 'PRÓXIMA x1 GRATIS EN', listo1() ? '' : cuenta(falta()));
    const x = x10(); pon(b10, listo10(), '¡RECLAMA TU x10 GRATIS! CADUCA EN', 'x10 GRATIS EL DOMINGO EN', cuenta(x.falta));
  }
  async function cobrar(tipo) {
    const n = tipo === 'x10' ? 10 : 1;
    if (cobrando || gachaAnim || gachaEsperando || !(tipo === 'x10' ? listo10() : listo1())) return;
    cobrando = true;
    try {
      if (nube()) fija(await ECO.pedir('tirada_gratis_cobrar', { p_tipo: tipo }));
      else { if (tipo === 'x10') SAVE.gratisD = madrid().fecha; else SAVE.gratisT = Date.now(); ECO.ganar('tirada-gratis', { tickets: n }); }
      saveGame(); updateWallets(); updateBadges(); pintar();
    } catch (e) {
      cobrando = false; if (sinFuncion(e)) { est.sin = true; pintar(); return; }
      play('deny'); if (/todavia_no/.test(String((e && e.message) || e))) { toast(tr('Todavía no toca. Aguanta un poco.')); refrescar(); } else toast(ECO.errorTexto(e));
      return;
    }
    cobrando = false; buildGachaText(); pull(n);
  }
  let avisado = '';   // el aviso de que caduca, una vez por domingo y sesión
  function avisa() { const f = madrid().fecha; if (!listo10() || avisado === f) return; avisado = f; play('crown'); toast(tr('¡Hoy es domingo! Reclama tu x10 gratis en el gashapón antes de que caduque.'), true); }
  hook('gacha.abierto', () => { pintar(); refrescar(); avisa(); clearInterval(reloj); reloj = setInterval(() => { if ($('#scr-gacha').hidden) clearInterval(reloj); else pintar(); }, 1000); });
  hook('insignias', () => {
    if (!listo1() && !listo10()) return;
    $('#gacha-badge').hidden = false;
    if (!(SAVE.tickets || 0)) $('#feat-gacha').textContent = tr(listo10() ? '¡Tirada x10 gratis!' : '¡Tirada gratis lista!');
  });
  setTimeout(() => { if (nube()) refrescar().then(avisa); else avisa(); }, 3000);   // en el menú: el punto rojo y el aviso del domingo   // con cuenta: el menú sabe enseguida si hay una esperando
  return { listo1, listo10, falta, refrescar };
})();
