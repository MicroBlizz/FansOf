// Fans of Pop · PANTALLA DE VICTORIA, 2.ª vuelta (tarea #157, boceto aprobado por Pepins el 19-11-2026): la barra de arriba propia
// y nítida (corazones, monedas y perlas, por encima del velo), el fondo al azar entre los colores de la nota, el compañero del
// equipo celebrando (o triste al perder), el desglose de las monedas, la racha y la hucha en el panel, y las monedas que vuelan
// del panel a la barra mientras el número sube contando. La ventana, en js/pantalla-victoria.js; las reglas, en js/victoria.js.
'use strict';
const PP_VIC_VUELO = Object.freeze({ monedas: 8, dura: 650, cada: 70, espera: 1500 });   // cuántas monedas vuelan y cuándo (ms)
/* ---------- el fondo ---------- */
// el velo toma los colores de un fondo de la nota, al azar (PP_VICTORIA.fondo); sin toques, tonos fríos
function ppVicFondo(estrellas) { return ppVicFondoPon(PP_VICTORIA.fondo(estrellas, Math.random())); }
function ppVicFondoPon(f) {
  const m = $pp('#pp-modal');
  if (!f) return f;
  const forma = f.lineal ? 'linear-gradient(180deg' : 'radial-gradient(circle at 50% 28%';
  m.style.setProperty('--vic-fondo', `${forma}, ${f.c1}, ${f.c2} 85%)`); m.style.setProperty('--vic-panel', f.panel);
  return f;
}
/* ---------- la barra de arriba ---------- */
// `monedas`: lo que se ve al abrir (sin lo ganado: lo suben las monedas al llegar volando). La barra es la misma pastilla que en el camino
// y el nivel (tarea #373, js/barra-recursos.js); los corazones, como los eligió Pepins en el reporte 53 (tarea #344)
const ppVicBarraHtml = monedas => ppBarraRecursosHtml(monedas);
// la barra va en la ventana (#pp-modal), fuera de la tarjeta, para que no se mueva con ella; se cambia en cada victoria
function ppVicBarra(monedas) {
  const m = $pp('#pp-modal');
  m.querySelectorAll('.pp-vic-arriba').forEach(b => b.remove());
  m.insertAdjacentHTML('afterbegin', ppVicBarraHtml(monedas));
}
/* ---------- el compañero ---------- */
// el primero del equipo de ese modo; si no hay, Lola
function ppVicCompanero(T) {
  const eq = typeof ppEquipoDe === 'function' && T && T.d ? ppEquipoDe(ppModoDeNivel(T.d)) : [];
  return (eq && eq[0]) || 'lola';
}
function ppVicSlimeHtml(T, feliz) {
  const id = ppVicCompanero(T), dibujo = typeof ppViaDibujoHtml === 'function' ? ppViaDibujoHtml(id, 96) : ppIcono('sl-' + id, 96);
  return `<div class="pp-vic-slime ${feliz ? 'pp-feliz' : 'pp-triste'}">${dibujo}${feliz ? '<i></i><i></i><i></i>' : '<b></b>'}</div>`;
}
/* ---------- el desglose, la racha y la hucha ---------- */
function ppVicDesglose(p) {
  if (!p || !p.monedas) return '';
  const base = p.monedas - (p.sobran || 0);
  const partes = [tr('Nivel +{n}', { n: base })];
  if (p.sobran) partes.push(tr('Toques extra +{n}', { n: p.sobran }));
  return `<span class="pp-vic-desglose">${partes.join(' · ')}</span>`;
}
function ppVicRacha(a) {
  const max = PP_CFG.racha.max, n = ppRachaToques();
  if (!n && !a.racha) return '';
  let pips = '';
  for (let k = 0; k < max; k++) pips += `<i class="${k < n ? 'pp-on' : ''}${a.nuevo && k === n - 1 && n > a.racha ? ' pp-vic-nueva' : ''}"></i>`;
  const txt = !n ? '' : n === 1 ? tr('+1 toque al empezar') : tr('+{n} toques al empezar', { n });
  return `<div class="pp-vic-extra">${ppIcono('i-racha', 50, '#ff9a4a')}<div><b>${tr('Victorias seguidas')}</b><span class="pp-vic-pips">${pips}</span><small>${txt}</small></div></div>`;
}
function ppVicHucha(a) {
  if (typeof ppPrimerosVe === 'function' && !ppPrimerosVe('hucha')) return '';
  const H = PP_CFG.hucha, n = SAVE.hucha || 0, mas = n - (a.hucha || 0), pct = Math.round(Math.min(1, n / H.max) * 100);
  return `<div class="pp-vic-extra">${ppIcono('i-hucha', 50, '#ffd1ec')}<div><b>${tr('Hucha')}${mas > 0 ? ` <em>+${mas}</em>` : ''}</b>`
    + `<span class="pp-vic-mini"><span style="width:${pct}%"></span></span><small>${tr('{a} / {b} perlas', { a: n, b: H.max })}</small></div></div>`;
}
// la fila de racha y hucha (solo en un nivel del camino, no en duelos sueltos)
function ppVicExtras(T) {
  const a = T && T.antes; if (!a) return '';
  const h = ppVicRacha(a) + ppVicHucha(a);
  return h ? `<div class="pp-vic-extras">${h}</div>` : '';
}
// en «¡Casi!»: si al perder el corazón se ha ido la racha, se dice
function ppVicRachaPerdida(T) {
  const antes = T && T.rachaAntes;
  const ahora = SAVE.racha || 0;
  if (!antes || ahora >= antes) return '';   // sin racha, o a salvo (Racha a salvo): nada que decir
  // la racha baja un escalón (tarea #186): si aún queda, se dice cuánto; si era de 1, se ha ido
  const [titulo, pie] = ahora > 0
    ? [tr('Bajan tus victorias seguidas'), ppTextoRacha(ahora)]
    : [tr('Se acabaron las victorias seguidas'), tr('Gana sin perder corazones para recuperarlas')];
  return `<div class="pp-vic-aviso">${ppIcono('i-racha', 50, '#ff9a4a')}<div><b>${titulo}</b><small>${pie}</small></div></div>`;
}
const ppTextoRacha = n => (n === 1 ? tr('Ahora empiezas los niveles con +1 toque') : tr('Ahora empiezas los niveles con +{n} toques', { n }));
// en la ventana de «¡Sin toques!» (js/tienda.js): una línea con lo que te da la racha, sin avisar de lo que se pierde (tarea #186)
// sin «Ahora»: aquí no ha cambiado nada, solo se recuerda lo que da la racha (Pepins, 20-11-2026)
function ppVicAvisoRacha() {
  const n = SAVE.racha || 0;
  return `<p class="pp-sub">${n === 1 ? tr('Tu racha: +1 toque al empezar cada nivel') : tr('Tu racha: +{n} toques al empezar cada nivel', { n })}</p>`;
}
/* ---------- las monedas que vuelan a la barra ---------- */
// una moneda (u otro dibujo `ico`, p. ej. el regalo de un estreno) que vuela de `a` a `b` (rectángulos de pantalla) en curva; al llegar, `llega()`
function ppVicMoneda(a, b, retraso, llega, ico = 'i-moneda') {
  const img = document.createElement('img');
  img.src = (PP_LISO ? 'img-liso' : 'img') + '/' + ico + '.png'; img.alt = '';
  ppVicVuelaNodo(img, a, b, retraso, llega);
}
// lo mismo con cualquier icono (`nodo`, que se copia si está en la página): también lo usa RECOGER TODO del pase (js/pase.js)
function ppVicVuelaNodo(nodo, a, b, retraso, llega) {
  const img = nodo.isConnected ? nodo.cloneNode(true) : nodo, lado = a.width;
  img.classList.add('pp-vic-vuela');
  Object.assign(img.style, { left: a.left + 'px', top: a.top + 'px', width: lado + 'px', height: lado + 'px', margin: '0' });   // sin pisar su color (bolita)
  document.body.appendChild(img);
  const dx = b.left + b.width / 2 - (a.left + lado / 2), dy = b.top + b.height / 2 - (a.top + lado / 2);
  const anim = img.animate([{ transform: 'translate(0, 0) scale(1)', opacity: 1 },
    { transform: `translate(${dx * 0.25 - 60}px, ${dy * 0.5}px) scale(1.15)`, opacity: 1, offset: 0.45 },
    { transform: `translate(${dx}px, ${dy}px) scale(0.75)`, opacity: 0.9 }], { duration: PP_VIC_VUELO.dura, delay: retraso, easing: 'ease-in', fill: 'both' });
  anim.onfinish = () => { img.remove(); llega(); };
}
// todas las monedas de `ganado`; el número de la barra cuenta de `desde` a `desde + ganado` mientras llegan
function ppVicVuela(t, desde, ganado, espera = PP_VIC_VUELO.espera) {
  const ori = t.querySelector('.pp-vic-premio .pp-ico'), barra = $pp('#pp-modal .pp-vic-caja-mon'), num = $pp('#pp-modal .pp-vic-mon');
  if (!ori || !barra || !num || !ganado) return;
  setTimeout(() => {
    if (!ori.isConnected) return;
    const a = ori.getBoundingClientRect(), b = barra.querySelector('.pp-ico').getBoundingClientRect(), n = Math.min(PP_VIC_VUELO.monedas, ganado);
    let llegadas = 0;
    const llega = () => {
      if (llegadas++ === 0) ppVicCuenta(num, desde, desde + ganado, (n * PP_VIC_VUELO.cada + 200) / 1000, 0);
      barra.classList.remove('pp-brilla'); void barra.offsetWidth; barra.classList.add('pp-brilla');
      play('ppPop', llegadas);
    };
    for (let k = 0; k < n; k++) ppVicMoneda(a, b, k * PP_VIC_VUELO.cada, llega);
  }, espera);
}
/* ---------- que quepa sin desplazar ---------- */
// En una pantalla baja la ventana no cabía y salía la barra gris de desplazamiento (Pepins, 19-11-2026, alfa b1314: «es horrible»;
// eligió que quepa siempre). Primero se aprieta (.pp-vic-justa: menos huecos, estrellas y letras algo menores) y, si aún no
// cabe, se encoge entera con zoom (--vic-zoom). Va un fotograma después, cuando ya están los botones que pone cada ventana.
function ppVicEncaja(t) {
  requestAnimationFrame(() => {
    if (!t.isConnected || !t.classList.contains('pp-gana')) return;
    const m = t.parentElement, cs = getComputedStyle(m);
    const libre = m.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    t.style.setProperty('--vic-zoom', '1');
    if (t.scrollHeight <= libre) return;
    t.classList.add('pp-vic-justa');
    if (t.scrollHeight > libre) t.style.setProperty('--vic-zoom', String(Math.max(0.6, libre / t.scrollHeight)));
  });
}
