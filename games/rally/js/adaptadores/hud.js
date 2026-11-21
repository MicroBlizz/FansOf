// Fans of Rally · adaptador · MARCADOR: lo que se ve encima de la carrera, en HTML para que las letras salgan nítidas. Arriba el
// tiempo que queda (o el crono en la contrarreloj), la vuelta y el puesto; en medio la cuenta atrás, los letreros y lo que canta el
// copiloto; abajo la velocidad. Arriba a la derecha, un mapa pequeño del tramo con un punto por coche.
'use strict';
RA.creaMarcador = raiz => {
  const $ = s => raiz.querySelector(s), ult = {};
  const pon = (sel, txt) => { if (ult[sel] !== txt) { ult[sel] = txt; $(sel).textContent = txt; } };
  let pista = null, mapa = null, escala = 1, origen = [0, 0], temporizador = null, tCopiloto = null;
  const reloj = s => { const m = Math.floor(s / 60), r = s - m * 60; return `${m}'${r < 10 ? '0' : ''}${r.toFixed(2)}`; };

  function dibujaMapa() {
    const cv = $('#ra-mapa'), g = cv.getContext('2d'), lim = RA.Paisaje.limites(pista, 30);
    escala = Math.min(cv.width / (lim[2] - lim[0]), cv.height / (lim[3] - lim[1])); origen = [lim[0], lim[1]];
    mapa = document.createElement('canvas'); mapa.width = cv.width; mapa.height = cv.height;
    const m = mapa.getContext('2d');
    m.beginPath();
    for (let i = 0; i <= pista.n; i += 4) { const k = i % pista.n, x = (pista.x[k] - origen[0]) * escala, y = (pista.y[k] - origen[1]) * escala; if (i) m.lineTo(x, y); else m.moveTo(x, y); }
    m.lineWidth = 7; m.strokeStyle = '#10141c'; m.lineJoin = 'round'; m.stroke();
    m.lineWidth = 3; m.strokeStyle = '#fff4dc'; m.stroke();
  }
  function prepara(p, modo) {
    pista = p; raiz.dataset.modo = modo;
    $('#ra-tiempo-titulo').textContent = modo === 'campeonato' ? tr('TIEMPO') : tr('CRONO');
    for (const k of Object.keys(ult)) delete ult[k];
    dibujaMapa();
    aviso(''); copiloto('');
  }
  function puntos(carrera) {
    const g = $('#ra-mapa').getContext('2d');
    g.clearRect(0, 0, mapa.width, mapa.height); g.drawImage(mapa, 0, 0);
    for (const c of carrera.coches) {
      const x = (c.coche.x - origen[0]) * escala, y = (c.coche.y - origen[1]) * escala, r = c.jugador ? 4 : 3;
      g.fillStyle = '#10141c'; g.fillRect(x - r - 1, y - r - 1, r * 2 + 2, r * 2 + 2);
      g.fillStyle = c.jugador ? '#ffd23f' : '#2f8fd8'; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
  }
  function pinta(carrera, coche, ficha) {
    const t = carrera.modo === 'campeonato' ? Math.ceil(carrera.queda) : null;
    pon('#ra-tiempo', t === null ? reloj(carrera.reloj) : String(t));
    raiz.classList.toggle('ra-poco', t !== null && t <= 10 && carrera.estado === 'corriendo');
    pon('#ra-vuelta', `${carrera.vueltaActual}/${carrera.vueltas}`);
    pon('#ra-puesto', carrera.modo === 'campeonato' ? `${carrera.puesto}/${carrera.total}` : reloj(carrera.tiempoVuelta));
    pon('#ra-velocidad', String(RA.Coche.kmh(coche, ficha)));
    puntos(carrera);
  }
  function aviso(texto, clase = '') {
    const el = $('#ra-aviso');
    el.textContent = texto; el.className = clase; el.hidden = !texto;
    clearTimeout(temporizador);
    if (texto) temporizador = setTimeout(() => { el.hidden = true; }, 1600);
  }
  function copiloto(texto) {
    const el = $('#ra-copiloto');
    el.textContent = texto; el.hidden = !texto;
    clearTimeout(tCopiloto);
    if (texto) tCopiloto = setTimeout(() => { el.hidden = true; }, 1400);
  }
  function cuenta(n) { const el = $('#ra-cuenta'); el.textContent = n || ''; el.hidden = !n; }
  return { prepara, pinta, aviso, copiloto, cuenta, reloj };
};
