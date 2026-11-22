// Fans Of · PROMO de nuestros juegos: mientras no haya anuncios pagados, el anuncio de prueba enseña la miniatura de OTRO juego activo
// (al azar, nunca el actual) y al pulsarla se abre su ficha en la biblioteca de la web. Cada juego solo llama a PROMO.html() y PROMO.enlaza(raiz).
// Los juegos salen del catálogo biblioteca/juegos.json (ADR 198), que se pide una vez al cargar: salen los vivos (sin alfa ni Archivo) y más a menudo los más
// votados; la regla y la validación del catálogo están en promo-reglas.js (ADR 109). Un juego que /gestion → Juegos quita del anuncio no sale (ADR 203).
// Sin catálogo, html() devuelve '' y sale el anuncio de prueba.
'use strict';
const PROMO = (() => {
  const nativa = () => !!(window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform());
  // la biblioteca está dos carpetas por encima del juego (también en /alfa/); en la app de Android, la web de verdad
  const base = () => nativa() ? 'https://fansof.games/' : '../../';
  // el catálogo de juegos: se pide una sola vez, al cargar el script y sin esperar a la cuenta.
  // estado: 'cargando' → 'listo' | 'sin-catalogo' (sin fetch, sin red, 404, JSON que no vale o ningún juego vivo bueno)
  let juegos = [], estado = 'cargando';
  const sinCatalogo = () => { juegos = []; estado = 'sin-catalogo'; };
  const recibe = datos => { juegos = PROMO_REGLAS.catalogo(datos); estado = juegos.length ? 'listo' : 'sin-catalogo'; };
  const pideCatalogo = () => {
    if (typeof fetch !== 'function') { sinCatalogo(); return; }
    estado = 'cargando';
    fetch(base() + 'biblioteca/juegos.json').then(r => { if (!r.ok) throw new Error('catálogo ' + r.status); return r.json(); })
      .then(recibe, sinCatalogo);   // solo la red, el 404 o un JSON roto dejan sin catálogo; un fallo de programación en recibe sale a la caja negra
  };
  pideCatalogo();
  // paso aparte: los candidatos del anuncio, o sea los vivos válidos del catálogo (PROMO_REGLAS.catalogo) que los cambios de /gestion → Juegos dejan anunciar
  // en esta plataforma (JUEGOS_PORTADA.anunciables con las filas de JUEGOS_PORTADA_DATOS, ADR 203); sus ids van luego a PROMO_REGLAS.elige.
  const candidatos = () => {
    const vivos = juegos.map(j => ({ id: j.id, estado: 'vivo', favorito: j.favorito }));
    const si = new Set(JUEGOS_PORTADA.anunciables(vivos, JUEGOS_PORTADA_DATOS.filas(), JUEGOS_PORTADA_DATOS.plataforma()));
    return juegos.filter(j => si.has(j.id));
  };
  // los votos públicos de la portada (solo números): se piden una vez por sesión, la primera vez que hace falta; sin ellos todos pesan igual
  let votos = null, pedidos = false;
  const pideVotos = () => {
    if (pedidos || typeof CUENTA === 'undefined' || !CUENTA.activa) return;
    pedidos = true;
    // sin red o con una respuesta que no es el mapa { id: { puntos, ultimo } }: al azar sin pesos, y se reintenta en el siguiente anuncio
    CUENTA.rpc('votos_destacados', {}).then(d => { if (d && typeof d === 'object' && !Array.isArray(d)) votos = d; else pedidos = false; }).catch(() => { pedidos = false; });
  };
  const elige = () => { pideVotos(); const id = PROMO_REGLAS.elige(candidatos().map(j => j.id), votos, AJUSTES.id, Math.random()); return candidatos().find(j => j.id === id) || null; };
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
      + '.promo-marca { position: absolute; top: calc(12px + env(safe-area-inset-top, 0px)); right: 12px; z-index: 1; padding: 3px 10px; border-radius: 999px; border: 2px solid #20102c; background: rgba(255,210,74,.92); color: #20102c; font-size: 12px; font-weight: 900; letter-spacing: .12em; }'
      + '.promo-pie { position: absolute; left: 14px; right: 14px; bottom: 150px; z-index: 1; display: flex; flex-direction: column; gap: 2px; text-shadow: 0 2px 0 #20102c, 0 0 8px #20102c; }'
      + '.promo-pie b { font-size: 20px; line-height: 1.1; } .promo-pie span { font-size: 13px; font-weight: 800; color: #7df3ff; }'
      + V + ' { background: #20102c !important; justify-content: flex-end !important; pointer-events: none; }'
      + V + ' > * { pointer-events: none; background: transparent !important; border: 0 !important; box-shadow: none !important; }'
      + V + ' button, ' + V + ' a:not(.promo-ad) { pointer-events: auto; }'
      + V + ' :is(.ad-top, .ad-body, .ad-note, .en-ad-card > p, .en-ad-card > small, .en-ad-flag, .anuncio-cuerpo) { display: none !important; }'
      + V + ' .anuncio-et, ' + V + ' .ad-bar, ' + V + ' .en-ad-bar { z-index: 1; }';
    document.head.appendChild(s);
  };
  const escapa = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  // el anuncio (vacío si no hay catálogo o no hay otro juego): un pase de imágenes con el banner del juego primero y sus capturas después; uno nuevo cada vez que sale
  // sin catálogo (por ejemplo, sin red al abrir el juego) se vuelve a pedir en el siguiente anuncio, como los votos; este sale sin juego
  const html = () => {
    if (estado === 'sin-catalogo') pideCatalogo();
    const j = elige(); if (!j) return '';
    estilo();
    const r = `${base()}biblioteca/`, fotos = (j.cartel ? [`${r}anuncios/${j.id}.jpg`] : []).concat(j.capturas.map(c => `${r}capturas/${c}`));
    const sl = fotos.map((f, i) => `<div class="promo-sl${i ? '' : ' on'}" style="background-image:url('${f}')"><img src="${f}" alt="" onerror="this.parentNode.remove()"></div>`).join('');
    return `<a class="promo-ad" data-promo="${j.id}" href="${base()}#juego-${j.id}" target="_blank" rel="noopener"><div class="promo-pase">${sl}</div>`
      + `${j.favorito ? '' : `<i class="promo-marca">${tr('PROTOTIPO')}</i>`}<div class="promo-pie"><b>${escapa(j.nombre)}</b><span>${tr('Pulsa para conocerlo')}</span></div></a>`;
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
  if (typeof hook === 'function') hook('cuenta', pideVotos);   // con la sesión lista, para que ya el primer anuncio salga con sus pesos
  return { elige, html, enlaza, estado: () => estado };
})();
