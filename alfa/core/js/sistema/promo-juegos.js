// Fans Of · PROMO de nuestros juegos: mientras no haya anuncios pagados, el anuncio de prueba enseña la miniatura de OTRO juego activo
// (al azar, nunca el actual) y al pulsarla se abre su ficha en la biblioteca de la web. Cada juego solo llama a PROMO.html() y PROMO.enlaza(raiz).
// La lista es la de los juegos publicados con tarjeta en la biblioteca (sin los «en pausa» ni las demos): uno nuevo se apunta aquí.
'use strict';
const PROMO = (() => {
  // [id, nombre, capturas de la ficha de la biblioteca]
  const JUEGOS = [
    ['rumble', 'Fans Of Rumble', 2], ['td', 'Fans Of TD', 2], ['rouflage', 'Fans Of Rouflage', 2], ['karts', 'Fans Of Karts', 3], ['ratkov', 'Fans Of Ratkov', 2],
    ['jump', 'Fans Of Jump', 2], ['crush', 'Fans Of Crush', 2], ['survivors', 'Fans Of Survivors', 2], ['tacticas', 'Fans Of Rumble: Tácticas', 2],
    ['nova', 'Fans Of Nova', 5], ['decks', 'Fans Of Decks', 2],
  ].map(([id, nombre, caps]) => ({ id, nombre, caps }));
  const nativa = () => !!(window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform());
  // la biblioteca está dos carpetas por encima del juego (también en /alfa/); en la app de Android, la web de verdad
  const base = () => nativa() ? 'https://fansof.games/' : '../../';
  const elige = () => { const l = JUEGOS.filter(j => j.id !== AJUSTES.id); return l[Math.floor(Math.random() * l.length)] || null; };
  const estilo = () => {
    if (document.getElementById('promo-css')) return;
    const s = document.createElement('style'); s.id = 'promo-css';
    s.textContent = '.promo-ad { display: flex; flex-direction: column; align-items: center; gap: 6px; width: 100%; max-width: 360px; margin: 0 auto; padding: 8px; box-sizing: border-box; border-radius: 14px; border: 3px solid #20102c; background: rgba(8,4,14,.55); color: #fff; text-decoration: none; cursor: pointer; }'
      + '.promo-pase { position: relative; width: 100%; aspect-ratio: 16 / 9; border-radius: 9px; border: 2px solid #20102c; background: #20102c; overflow: hidden; }'
      + '.promo-sl { position: absolute; inset: 0; opacity: 0; transition: opacity .5s; background-size: cover; background-position: center; }'
      + '.promo-sl.on { opacity: 1; } .promo-sl img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }'
      + '.promo-pie { display: flex; width: 100%; align-items: center; justify-content: space-between; gap: 8px; }'
      + '.promo-pie b { font-size: 15px; line-height: 1.1; text-align: left; } .promo-pie span { font-size: 12px; font-weight: 800; color: #7df3ff; }'
      + '.promo-pun { display: flex; gap: 4px; } .promo-pun i { width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,.3); } .promo-pun i.on { background: #ffd24a; }';
    document.head.appendChild(s);
  };
  // el anuncio (vacío si no hay otro juego): un pase de imágenes con el banner del juego primero y sus capturas después; uno nuevo cada vez que sale
  const html = () => {
    const j = elige(); if (!j) return '';
    estilo();
    const r = `${base()}biblioteca/`, fotos = [`${r}anuncios/${j.id}.jpg`];
    for (let i = 1; i <= j.caps; i++) fotos.push(`${r}capturas/${j.id}-${i}.jpg`);
    const sl = fotos.map((f, i) => `<div class="promo-sl${i ? '' : ' on'}"><img src="${f}" alt="" onerror="this.parentNode.remove()"></div>`).join('');
    return `<a class="promo-ad" data-promo="${j.id}" href="${base()}#juego-${j.id}" target="_blank" rel="noopener"><div class="promo-pase">${sl}</div>`
      + `<div class="promo-pie"><b>${j.nombre}</b><span>${tr('Pulsa para conocerlo')}</span></div></a>`;
  };
  // las imágenes pasan solas cada pocos segundos; el pase se para al desaparecer el anuncio
  const pase = a => {
    const t = setInterval(() => {
      if (!a.isConnected) { clearInterval(t); return; }
      const l = a.querySelectorAll('.promo-sl'); if (l.length < 2) return;
      let k = [...l].findIndex(x => x.classList.contains('on')); l[k].classList.remove('on'); l[(k + 1) % l.length].classList.add('on');
    }, 2000);
  };
  // en la app de Android el enlace interno no sirve: se abre en el navegador externo
  const enlaza = raiz => {
    const a = raiz && raiz.querySelector('[data-promo]'); if (!a) return;
    pase(a);
    a.onclick = e => {
      if (typeof play === 'function') play('select');
      if (!nativa()) return;
      e.preventDefault();
      const Br = window.Capacitor.Plugins && window.Capacitor.Plugins.Browser;
      if (Br && Br.open) Br.open({ url: a.href }); else window.open(a.href, '_system');
    };
  };
  return { JUEGOS, elige, html, enlaza };
})();
