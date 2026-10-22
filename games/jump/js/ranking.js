// Fans of Jump · El RANKING MUNDIAL (servidor/63-jump-ranking.sql), en la pestaña «Ranking mundial» de Mis récords: los 50 primeros
// y, si estás más abajo, tu puesto aparte (de cuántos), sin cargar a todos. Tu mejor marca se sube al acabar una partida con récord
// (y al arrancar, si aún no está subida); el servidor rechaza las imposibles. En el ranking solo sale tu apodo y tu marca: el nombre
// que pongas aquí (sin palabrotas ni datos de contacto: lo filtra el servidor) o, si no, «Fan#XXXX».
'use strict';

const RANKING = { datos: null, cargando: false, error: false, t: -99, reto: { datos: null, cargando: false, error: false, t: -99, dia: '' } };   // reto: la clasificación del reto del día (73)
const hayRanking = () => typeof CUENTA !== 'undefined' && CUENTA.activa;
const ahoraS = () => performance.now() / 1000;

function subeMarca(puntos, metros, seg) {
  if (!hayRanking() || puntos <= 0) return;
  CUENTA.rpc('jump_marca', { p_puntos: Math.round(puntos), p_metros: Math.round(metros), p_segundos: Math.max(1, Math.round(seg)) })
    .then(() => { GUARDA.marcaSubida = Math.max(GUARDA.marcaSubida || 0, puntos); salvaGuarda(); RANKING.t = -99; })
    .catch(e => {
      // el servidor dice que la marca es imposible: se da por subida (no se reintenta para siempre); sin red, se reintenta al volver la conexión
      if (/marca_imposible/.test(String(e && (e.message || e)))) { GUARDA.marcaSubida = Math.max(GUARDA.marcaSubida || 0, puntos); salvaGuarda(); }
    });
}
if (window.addEventListener) window.addEventListener('online', () => setTimeout(subePendiente, 1500));
// la marca del reto del día (servidor/73-jump-reto.sql): se sube al acabar un reto con récord del día; si no hay red, al arrancar o al volver la red
function subeMarcaReto() {
  const r = GUARDA.reto;
  if (!hayRanking() || !r || !r.mejor || r.subida) return;
  CUENTA.rpc('jump_reto_marca', { p_dia: r.dia, p_puntos: Math.round(r.mejor), p_metros: Math.round(r.metros || 0), p_segundos: Math.max(1, Math.round(r.seg || Math.max(10, (r.metros || 0) / 3))) })
    .then(() => { if (GUARDA.reto === r) { r.subida = true; salvaGuarda(); } RANKING.reto.t = -99; })
    .catch(e => { if (/marca_imposible|dia_no_vale/.test(String(e && (e.message || e)))) { r.subida = true; salvaGuarda(); } });
}
// al arrancar: la mejor marca que aún no esté en el servidor (las de antes del ranking no tienen su tiempo: se estima por lo alto)
function subePendiente() {
  subeMarcaReto();
  if ((GUARDA.marcaSubida || 0) < GUARDA.mejor) subeMarca(GUARDA.mejor, GUARDA.mejorM, GUARDA.mejorSeg || Math.max(10, GUARDA.mejorM / 3));
}
// cual: RANKING (mundial) o RANKING.reto (el día de hoy: si cambia el día, se vuelve a pedir)
function cargaRanking(cual = RANKING) {
  const reto = cual === RANKING.reto, dia = hoy();
  if (reto && cual.dia !== dia) { cual.dia = dia; cual.datos = null; cual.t = -99; }
  if (!hayRanking() || cual.cargando || ahoraS() - cual.t < 30) return;
  cual.cargando = true;
  (reto ? CUENTA.rpc('jump_reto_ranking', { p_dia: dia }) : CUENTA.rpc('jump_ranking', {}))
    .then(d => { cual.datos = d; cual.error = false; cual.t = ahoraS(); })
    .catch(() => { cual.error = true; cual.t = ahoraS() - 20; })
    .then(() => { cual.cargando = false; });
}

/* ---------- tu nombre (una ventanita encima del juego) ---------- */
function pideNombre() {
  if (document.getElementById('jm-nombre')) return;
  const d = document.createElement('div');
  d.id = 'jm-nombre';
  d.style.cssText = 'position:fixed;inset:0;display:grid;place-items:center;background:rgba(40,25,60,.45);z-index:50;font-family:"Baloo 2",system-ui,sans-serif';
  d.innerHTML = `<form style="background:#fbf4ff;border:3px solid #3d2a5c;border-radius:18px;padding:16px 18px;width:min(84vw,320px);box-shadow:0 5px 0 rgba(40,25,60,.35);text-align:center;color:#4a3070">
    <div style="font:800 18px/1.1 'Baloo 2',sans-serif;margin-bottom:6px">${tr('Tu nombre en el ranking')}</div>
    <div style="font:700 13px/1.25 'Baloo 2',sans-serif;color:#7a62a0;margin-bottom:10px">${tr('De 3 a 14 letras. Sin tu nombre real ni datos de contacto: lo verá todo el mundo.')}</div>
    <input maxlength="14" style="width:100%;box-sizing:border-box;font:800 18px 'Baloo 2',sans-serif;padding:8px 10px;border:2px solid #cdb6f7;border-radius:12px;background:#fff;color:#4a3070;text-align:center;outline:none">
    <div style="display:flex;gap:8px;margin-top:12px"><button type="button" data-no style="flex:1;font:800 15px 'Baloo 2',sans-serif;padding:8px;border:2px solid #3d2a5c;border-radius:12px;background:#f1e8fb;color:#7a62a0">${tr('Cancelar')}</button>
    <button style="flex:1;font:800 15px 'Baloo 2',sans-serif;padding:8px;border:2px solid #3d2a5c;border-radius:12px;background:#ffb38a;color:#fff">${tr('Guardar')}</button></div></form>`;
  document.body.appendChild(d);
  const f = d.querySelector('form'), i = d.querySelector('input');
  i.value = GUARDA.name || '';
  setTimeout(() => i.focus(), 50);
  const cierra = () => d.remove();
  d.querySelector('[data-no]').onclick = cierra;
  f.onsubmit = e => {
    e.preventDefault();
    const n = i.value.replace(/[^\p{L}\p{N} _.\-]/gu, '').trim().slice(0, 14);
    if (n.length < 3) { i.style.borderColor = '#e0703e'; return; }
    GUARDA.name = n; salvaGuarda(); SONIDO.compra();
    if (hayRanking() && CUENTA.invitado === false) CUENTA.ponNombre(n).catch(() => { /* nombre ya cogido o sin red: vale el de la partida */ });
    RANKING.t = -99; RANKING.reto.t = -99; setTimeout(cargaRanking, 1500);
    cierra();
  };
}

/* ---------- la pestaña ---------- */
function filaRanking(f, x, y, w) {
  const yo = f.yo;
  if (yo) caja(x - 2, y - 6, w + 4, 12.5, 4, 'rgba(205,182,247,0.55)', null);
  const medalla = ['#ffd86a', '#dfe3ee', '#f0b48a'][f.puesto - 1];
  if (medalla) { elipse(x + 7, y, 5.4, 5.4, vol(x + 7, y, 5.4, 5.4, medalla), OLC, 0.6); letras(String(f.puesto), x + 7, y + 0.5, 6.4, PASTEL.texto); }
  else letras(f.puesto.toLocaleString('es-ES') + '.º', x + 7, y + 0.4, 6.2, PASTEL.suave, { peso: 800 });
  letras(f.nombre, x + 16, y + 0.4, 7.2, yo ? PASTEL.lilaO : PASTEL.texto, { alin: 'left', peso: yo ? 800 : 700 });
  letras(f.puntos.toLocaleString('es-ES') + ' €', x + w - 2, y + 0.4, 7.2, PASTEL.texto, { alin: 'right' });
}
function pintaRanking(x, y, w, h, cual = RANKING) {
  cargaRanking(cual);
  const D = cual.datos, W = PAN.W;
  // tu nombre, arriba
  const nom = (D && D.yo && D.yo.nombre) || GUARDA.name || tr('sin nombre');
  letras(tr('Tu nombre') + ': ' + nom, x + 4, y + 6, 7, PASTEL.texto, { alin: 'left', peso: 800 });
  const bt = tr('Cambiar'), bw = anchoLetras(bt, 6.6) + 12;
  caja(x + w - bw, y, bw, 12, 4, PASTEL.melocoton, OLC, 0.7); letras(bt, x + w - bw / 2, y + 6.4, 6.6, '#ffffff', { borde: PASTEL.melocotonO, bw: 1.6 });
  boton(x + w - bw - 3, y - 3, bw + 6, 18, pideNombre);
  const y0 = y + 17;
  const aviso = t => envuelve(t, w - 10, 7).forEach((l, i) => letras(l, W / 2, y0 + 26 + i * 9, 7, PASTEL.suave, { peso: 700 }));
  if (!hayRanking()) return aviso(tr('El ranking necesita conexión a internet.'));
  if (!D) return aviso(cual.error ? tr('Sin conexión: el ranking vuelve cuando haya red.') : tr('Cargando…'));
  const lista = D.lista || [], yo = D.yo, fuera = yo && yo.puesto > lista.length;
  if (!lista.length) return aviso(cual === RANKING.reto ? tr('Hoy aún no hay nadie. ¡Juega el reto del día y sé el primero!') : tr('Aún no hay nadie. ¡Juega una partida y sé el primero!'));
  const pie = fuera ? 26 : 12;
  contenido(x, y0, w, h - 17 - pie, z => { lista.forEach((f, i) => filaRanking(f, x + 2, z + 7 + i * 13, w - 4)); return z + 7 + lista.length * 13; });
  // abajo: tu puesto, aunque estés muy abajo, y cuántos hay
  const yp = y + h - pie;
  caja(x, yp - 3, w, 0.6, 0, PASTEL.raya, null);
  if (fuera) filaRanking(yo, x + 2, yp + 6, w - 4);
  letras(yo ? tr('Tu puesto: {p} de {n}', { p: yo.puesto.toLocaleString('es-ES'), n: (+D.total || 0).toLocaleString('es-ES') }) : cual === RANKING.reto ? tr('Juega el reto del día para salir aquí.') : tr('Juega una partida para salir en el ranking.'), W / 2, yp + (fuera ? 18 : 5), 6.6, PASTEL.suave, { peso: 700 });
}
