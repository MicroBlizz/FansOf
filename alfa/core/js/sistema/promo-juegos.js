// Fans Of · PROMO de nuestros juegos: mientras no haya anuncios pagados, el anuncio de prueba enseña la miniatura de OTRO juego activo
// (al azar, nunca el actual) y al pulsarla se abre su ficha en la biblioteca de la web. Cada juego solo llama a PROMO.html() y PROMO.enlaza(raiz).
// La lista es la de los juegos publicados con tarjeta en la biblioteca (sin los «en pausa» ni las demos): uno nuevo se apunta aquí.
'use strict';
const PROMO = (() => {
  // [id, nombre, capturas de la ficha de la biblioteca]
  const JUEGOS = [
    ['rumble', 'Fans Of Rumble', 2], ['td', 'Fans Of TD', 2], ['rouflage', 'Fans Of Rouflage', 2], ['karts', 'Fans Of Karts', 3], ['ratkov', 'Fans Of Ratkov', 2],
    ['jump', 'Fans Of Jump', 2], ['crush', 'Fans Of Crush', 2], ['survivors', 'Fans Of Survivors', 2], ['tacticas', 'Fans Of Rumble: Tácticas', 2],
    ['nova', 'Fans Of Nova', 5], ['decks', 'Fans Of Decks', 2], ['beams', 'Fans Of Beams', 3],
  ].map(([id, nombre, caps]) => ({ id, nombre, caps }));
  const nativa = () => !!(window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform());
  // la biblioteca está dos carpetas por encima del juego (también en /alfa/); en la app de Android, la web de verdad
  const base = () => nativa() ? 'https://fansof.games/' : '../../';
  const elige = () => { const l = JUEGOS.filter(j => j.id !== AJUSTES.id); return l[Math.floor(Math.random() * l.length)] || null; };
  const estilo = () => {
    if (document.getElementById('promo-css')) return;
    const s = document.createElement('style'); s.id = 'promo-css';
    // el anuncio ocupa toda la pantalla del anuncio de prueba (queda detrás de sus textos y botones; el enlace es toda la imagen)
    const V = ':is(.en-ad, .ad-screen, .anuncio):has(.promo-ad)';
    s.textContent = '.promo-ad { position: absolute; inset: 0; z-index: -1; display: block; overflow: hidden; background: #20102c; color: #fff; text-decoration: none; cursor: pointer; pointer-events: auto; }'
      + '.promo-pase { position: absolute; inset: 0; }'
      + '.promo-sl { position: absolute; inset: 0; opacity: 0; transition: opacity .6s; background-size: cover; background-position: center; }'
      + '.promo-sl::before { content: ""; position: absolute; inset: -20px; background: inherit; filter: blur(22px) brightness(.7); }'
      + '.promo-sl.on { opacity: 1; } .promo-sl img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }'
      + '.promo-ad::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 45%; background: linear-gradient(to top, rgba(8,4,14,.92), rgba(8,4,14,0)); }'
      + '.promo-pie { position: absolute; left: 14px; right: 14px; bottom: 150px; z-index: 1; display: flex; flex-direction: column; gap: 2px; text-shadow: 0 2px 0 #20102c, 0 0 8px #20102c; }'
      + '.promo-pie b { font-size: 20px; line-height: 1.1; } .promo-pie span { font-size: 13px; font-weight: 800; color: #7df3ff; }'
      + V + ' { background: #20102c !important; justify-content: flex-end !important; pointer-events: none; }'
      + V + ' > * { pointer-events: none; background: transparent !important; border: 0 !important; box-shadow: none !important; }'
      + V + ' button, ' + V + ' a:not(.promo-ad) { pointer-events: auto; }'
      + V + ' :is(.ad-top, .ad-body, .ad-note, .en-ad-card > p, .en-ad-card > small, .en-ad-flag, .anuncio-cuerpo) { display: none !important; }'
      + V + ' .anuncio-et, ' + V + ' .ad-bar, ' + V + ' .en-ad-bar { z-index: 1; }';
    document.head.appendChild(s);
  };
  // el anuncio (vacío si no hay otro juego): un pase de imágenes con el banner del juego primero y sus capturas después; uno nuevo cada vez que sale
  const html = () => {
    const j = elige(); if (!j) return '';
    estilo();
    const r = `${base()}biblioteca/`, fotos = [`${r}anuncios/${j.id}.jpg`];
    for (let i = 1; i <= j.caps; i++) fotos.push(`${r}capturas/${j.id}-${i}.jpg`);
    const sl = fotos.map((f, i) => `<div class="promo-sl${i ? '' : ' on'}" style="background-image:url('${f}')"><img src="${f}" alt="" onerror="this.parentNode.remove()"></div>`).join('');
    return `<a class="promo-ad" data-promo="${j.id}" href="${base()}#juego-${j.id}" target="_blank" rel="noopener"><div class="promo-pase">${sl}</div>`
      + `<div class="promo-pie"><b>${j.nombre}</b><span>${tr('Pulsa para conocerlo')}</span></div></a>`;
  };
  // las imágenes pasan solas cada pocos segundos; el pase se para al desaparecer el anuncio
  const pase = a => {
    if (!a.querySelector('.promo-sl.on')) { const f = a.querySelector('.promo-sl'); if (f) f.classList.add('on'); }
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
