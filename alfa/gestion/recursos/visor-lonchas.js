// Fans Of · RECURSOS · visor de lonchas (galería local y pestaña Recursos de /gestion): lee una tira (fila por postura; en cada fila, las lonchas de la del
// suelo a la de arriba) y su json {ancho, fondo, alto, lonchas, cubitos, posturas}, y la pinta con LONCHAS (lonchas.js, aquí al lado).
// Arrastrar gira; rueda o pellizco amplían (encajada, alejar con la rueda mueve la página) y Mayúsculas + arrastrar (o la rueda pulsada, o dos dedos) corre la vista (zoom.js); doble clic la encaja o,
// encajada, pide a la página de arriba la pantalla completa (mensaje «ampliar»). Los mandos comunes de la galería llegan por mandos-panel.js. Página: visor-lonchas.html. Guía: docs/guia/herramientas/galeria.md
'use strict';
const VISOR_LONCHAS = (() => {
  const $ = id => document.getElementById(id);
  const K0 = 0.72, VUELTA = 0.6, POR_POSTURA = 1 / 6, ARRASTRE = 0.012, MARGEN = 8;
  const e = { pilas: [], nombres: [], postura: 0, giro: 0, K: K0, alto: 1, vueltas: false, contorno: false, sep: 1, sepObj: 1, reproducir: false, reloj: 0, dedo: null, nombre: '' };
  const conBorde = new WeakMap();
  const op = () => ({ K: e.K, alto: e.alto, borde: false, sombra: 0.3 });
  const lienzo = (an, la) => { const c = document.createElement('canvas'); c.width = an; c.height = la; return c; };

  // ---- la tira: una pila por fila (postura)
  function pila(im, meta, fila) {
    const hojas = [];
    for (let z = 0; z < meta.lonchas; z++) { const c = lienzo(meta.ancho, meta.fondo); c.getContext('2d').drawImage(im, -z * meta.ancho, -fila * meta.fondo); hojas.push(c); }
    const sombra = lienzo(meta.ancho, meta.fondo), g = sombra.getContext('2d');
    hojas.forEach(h => g.drawImage(h, 0, 0)); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#000'; g.fillRect(0, 0, meta.ancho, meta.fondo);
    return { hojas, sombra, an: meta.ancho, la: meta.fondo };
  }
  function valida(meta, im) {
    if (![meta.ancho, meta.fondo, meta.lonchas].every(n => Number.isInteger(n) && n > 0)) return 'el json no trae ancho, fondo y lonchas';
    if (im.width < meta.ancho * meta.lonchas || im.height < meta.fondo) return `la tira mide ${im.width} x ${im.height} y el json pide ${meta.ancho * meta.lonchas} x ${meta.fondo}`;
    return '';
  }
  function posturas(meta, im) {   // los antiguos no traen posturas: una sola
    const lista = Array.isArray(meta.posturas) && meta.posturas.length ? meta.posturas : ['única'];
    const caben = Math.min(lista.length, Math.floor(im.height / meta.fondo));
    return lista.slice(0, caben).map((p, i) => (typeof p === 'string' ? p : (p && p.nombre) || 'postura ' + (i + 1)));
  }

  // ---- contorno oscuro de 1 píxel alrededor de lo dibujado (sobre el sprite ya girado)
  function bordea(d, w, h) {   // sobre los píxeles RGBA (w x h): pinta de oscuro lo vacío que toca algo dibujado (sus 4 vecinos)
    const a = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) a[i] = d[i * 4 + 3] > 0;
    for (let i = 0; i < w * h; i++) {
      const x = i % w;
      if (a[i] || !((x > 0 && a[i - 1]) || (x < w - 1 && a[i + 1]) || a[i - w] || a[i + w])) continue;
      d.set([16, 20, 28, 255], i * 4);
    }
    return d;
  }
  function contorno(cv) {
    const g = cv.getContext('2d'), img = g.getImageData(0, 0, cv.width, cv.height);
    bordea(img.data, cv.width, cv.height); g.putImageData(img, 0, 0);
  }
  function sprite(p) {
    const s = LONCHAS.sprite(p, e.giro, op());
    if (!e.contorno) return s;
    if (!conBorde.has(s)) {
      const sola = LONCHAS.sprite(p, e.giro, { ...op(), sombra: 0 }), borde = lienzo(s.cv.width, s.cv.height), junto = lienzo(s.cv.width, s.cv.height);
      borde.getContext('2d').drawImage(sola.cv, 0, 0); contorno(borde);
      const g = junto.getContext('2d'); g.drawImage(s.cv, 0, 0); g.drawImage(borde, 0, 0);
      conBorde.set(s, { cv: junto, cx: s.cx, cy: s.cy });
    }
    return conBorde.get(s);
  }

  // ---- pantalla: ampliado un número entero de veces (con K = 1, para que inclinar no cambie el tamaño)
  let cv, ctx, buf, b, esc = 1, zoom = null;   // el lienzo se coge al arrancar: así lo puro (valida, posturas, bordea) se carga y se prueba sin página
  function ajusta() {
    const p = e.pilas[0], caja = $('marco'), dpr = devicePixelRatio || 1, w = Math.floor(caja.clientWidth * dpr), h = Math.floor(caja.clientHeight * dpr);
    if (!p || !w || !h) return;
    const diag = Math.hypot(p.an, p.la), anchoMin = diag + MARGEN, altoMin = diag + p.hojas.length * e.alto + MARGEN;
    esc = Math.max(1, Math.floor(Math.min(w / anchoMin, h / altoMin)));
    buf.width = Math.floor(w / esc); buf.height = Math.floor(h / esc); cv.width = buf.width * esc; cv.height = buf.height * esc;
    cv.style.width = cv.width / dpr + 'px'; cv.style.height = cv.height / dpr + 'px';
    if (zoom) zoom.recoloca();   // el lienzo cambió de tamaño: el encuadre se vuelve a acotar con sus medidas nuevas
  }
  function dibuja() {
    b.clearRect(0, 0, buf.width, buf.height); b.imageSmoothingEnabled = false;
    const p = e.pilas[e.postura]; if (!p) return;
    const n = p.hojas.length * e.alto, x = buf.width >> 1, y = Math.round(buf.height / 2 + n / 2 + (e.sep - 1) * n / 2);
    const abierta = Math.min(1, Math.max(0, (e.sep - 1) / 2));
    if (abierta > 0.02) LONCHAS.pintaAbierta(b, p, x, y, e.giro, op(), e.sep, abierta * 0.4);
    else { const s = sprite(p); b.drawImage(s.cv, x - s.cx, y - s.cy); }
    ctx.imageSmoothingEnabled = false; ctx.clearRect(0, 0, cv.width, cv.height); ctx.drawImage(buf, 0, 0, cv.width, cv.height);
  }
  let antes = performance.now();
  function bucle(t) {
    const dt = Math.max(0, Math.min(0.05, (t - antes) / 1000)); antes = t;
    if (e.vueltas && !e.dedo) e.giro += dt * VUELTA;
    if (e.reproducir && e.pilas.length > 1 && (e.reloj += dt) >= POR_POSTURA) { e.reloj = 0; ponPostura(e.postura + 1); }
    e.sep += (e.sepObj - e.sep) * Math.min(1, dt * 5);
    dibuja(); requestAnimationFrame(bucle);
  }

  // ---- mandos (los de abajo y los comunes de la galería hacen lo mismo)
  function pulsa(id, si) { $(id).setAttribute('aria-pressed', String(si)); }
  function rotulo() {
    const p = e.pilas[e.postura], postura = e.pilas.length > 1 ? ` · ${e.postura + 1}/${e.pilas.length} ${e.nombres[e.postura]}` : '';
    $('info').textContent = `${e.nombre} · ${p.an} x ${p.la} y ${p.hojas.length} lonchas${postura}`;
    $('postura').textContent = `Postura ${e.postura + 1}/${e.pilas.length}`;
  }
  function ponPostura(i) { if (!e.pilas.length) return; e.postura = ((i % e.pilas.length) + e.pilas.length) % e.pilas.length; rotulo(); }
  const pon = {
    girar: d => { if (Number.isFinite(d)) e.giro += d; },
    vueltas: si => { e.vueltas = !!si; pulsa('vueltas', e.vueltas); },
    contorno: si => { e.contorno = !!si; pulsa('contorno', e.contorno); },
    reproducir: si => { e.reproducir = !!si; pulsa('reproducir', e.reproducir); },
    postura: () => ponPostura(e.postura + 1),
    'vista-inicial': () => { if (zoom) zoom.encaja(); e.giro = 0; e.K = K0; e.sepObj = 1; $('inclinar').value = K0; pulsa('separar', false); },
  };
  const corre = ev => ev.shiftKey || ev.button === 1;   // arrastrar así corre la vista ampliada en vez de girar
  function enciende() {
    const pliega = si => { $('mandos').classList.toggle('plegado', si); $('plegar').setAttribute('aria-expanded', String(!si)); };
    pliega(innerWidth < 320 || innerHeight < 320);   // en un panel pequeño, plegados: manda la vista (los comunes siguen arriba)
    $('plegar').onclick = () => pliega(!$('mandos').classList.contains('plegado'));
    $('vueltas').onclick = () => pon.vueltas(!e.vueltas);
    $('contorno').onclick = () => pon.contorno(!e.contorno);
    $('reproducir').onclick = () => pon.reproducir(!e.reproducir);
    $('postura').onclick = () => pon.postura();
    $('separar').onclick = () => { e.sepObj = e.sepObj > 1 ? 1 : 3; pulsa('separar', e.sepObj > 1); };
    $('inclinar').oninput = () => { e.K = Number($('inclinar').value); };
    $('inclinar').onchange = () => LONCHAS.precalienta(e.pilas[e.postura], op());
    zoom = ZOOM.crea($('marco'), {
      elemento: () => cv, base: 'translate(-50%, -50%)', tactil: 'none', mueve: corre,
      alDoble: () => MANDOS_PANEL.manda('ampliar'), alCambiar: enc => { $('encajar').hidden = ENCUADRE.encajada(enc); },
    });
    $('encajar').onclick = () => zoom.encaja();
    cv.addEventListener('pointerdown', ev => {
      if (e.dedo !== null) { e.dedo = null; return; }   // el segundo dedo: pellizco, ya no gira
      if (!corre(ev)) { e.dedo = ev.clientX; cv.setPointerCapture(ev.pointerId); }
    });
    cv.addEventListener('pointermove', ev => {
      if (e.dedo === null || zoom.dedos() > 1) return;
      const d = -(ev.clientX - e.dedo) * ARRASTRE; e.dedo = ev.clientX; e.giro += d; MANDOS_PANEL.manda('girar', d);
    });
    for (const fin of ['pointerup', 'pointercancel']) cv.addEventListener(fin, () => { e.dedo = null; });
    new ResizeObserver(ajusta).observe($('marco'));
  }
  async function carga() {
    const q = new URLSearchParams(location.search);
    e.nombre = q.get('nombre') || 'lonchas';
    if (!q.get('png') || !q.get('json')) throw new Error('falta ?png= o ?json= (la tira no tiene su lonchas.json en la rama)');
    const r = await fetch(q.get('json'));
    if (!r.ok) throw new Error('no se pudo leer el json (' + r.status + ')');
    const meta = await r.json(), im = new Image(); im.src = q.get('png'); await im.decode();
    const error = valida(meta, im); if (error) throw new Error(error);
    e.alto = meta.alto > 0 ? meta.alto / meta.lonchas : 1;
    e.nombres = posturas(meta, im); e.pilas = e.nombres.map((_, i) => pila(im, meta, i));
    $('postura').hidden = $('reproducir').hidden = e.pilas.length < 2;
    LONCHAS.precalienta(e.pilas[0], op());
    rotulo(); ajusta();
  }
  function arranca() {
    cv = $('lienzo'); ctx = cv.getContext('2d'); buf = lienzo(1, 1); b = buf.getContext('2d');
    enciende(); MANDOS_PANEL.escucha(pon);
    carga().then(() => requestAnimationFrame(bucle)).catch(err => { $('info').textContent = 'No se pudieron abrir las lonchas: ' + err.message; });
  }
  return { arranca, valida, posturas, bordea };
})();
if (typeof module !== 'undefined') module.exports = VISOR_LONCHAS;   // en node (tests/herramientas/galeria/ y tests/gestion/) solo se carga
else VISOR_LONCHAS.arranca();
