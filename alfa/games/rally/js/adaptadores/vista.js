// Fans of Rally · adaptador · VISTA: la cámara inclinada y el dibujo de cada imagen. Pinta en un lienzo pequeño (píxeles de juego) y lo
// amplía a la pantalla con un número entero de veces y a su tamaño exacto en píxeles del móvil: así cada píxel se ve nítido, sin
// difuminar. El suelo ya viene aplastado (suelo.js); encima van, de arriba abajo, los adornos, los arcos, los coches y el fantasma,
// cada uno como su pila de hojas (hojas.js), más el polvo, el barro y la nieve que levantan las ruedas.
'use strict';
RA.creaVista = lienzo => {
  const K = 0.72, ALTO = 1;                        // lo que aplasta la cámara y lo que sube cada hoja
  const ctx = lienzo.getContext('2d'), buf = document.createElement('canvas'), b = buf.getContext('2d');
  let esc = 3, cam = null, mundo = null, particulas = [], temblor = 0;
  const cacheCoches = new Map();

  function ajusta() {
    const dpr = window.devicePixelRatio || 1, w = Math.round(lienzo.parentElement.clientWidth * dpr), h = Math.round(lienzo.parentElement.clientHeight * dpr);
    esc = Math.max(2, Math.round(Math.min(w, h) / 190));
    buf.width = Math.floor(w / esc); buf.height = Math.floor(h / esc);
    lienzo.width = buf.width * esc; lienzo.height = buf.height * esc;
    lienzo.style.width = lienzo.width / dpr + 'px'; lienzo.style.height = lienzo.height / dpr + 'px';   // tamaño exacto: nada de reescalar
  }
  // una pila de hojas sin girar, aplastada una sola vez (los adornos no giran)
  function aplasta(p) {
    const la = Math.max(1, Math.round(p.la * K));
    const una = h => { const c = document.createElement('canvas'); c.width = p.an; c.height = la; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(h, 0, 0, p.an, la); return c; };
    return { hojas: p.hojas.map(una), sombra: una(p.sombra), an: p.an, la };
  }
  const cocheDe = colores => { if (!cacheCoches.has(colores)) cacheCoches.set(colores, RA.Hojas.coche(colores)); return cacheCoches.get(colores); };

  // cosas: lo que reparte RA.Paisaje (la sesión lo calcula una vez por tramo)
  function prepara(pista, tramo, cosas) {
    const limites = RA.Paisaje.limites(pista, 420);
    const sprites = RA.Hojas.adornos(tramo.adornos), planos = {};
    for (const [n, l] of Object.entries(sprites)) planos[n] = l.map(aplasta);
    const arcos = { meta: RA.Hojas.arco(true, pista.ancho), control: RA.Hojas.arco(false, pista.ancho) };
    mundo = { pista, tramo, suelo: RA.Suelo.crea(pista, tramo, limites, K), planos, arcos, cosas };
    cam = null; particulas = [];
  }

  // ---- dónde cae en la pantalla un punto del mundo
  const enPantalla = (x, y) => [Math.round(x - cam.x0), Math.round(y * K - cam.y0)];
  function mueveCamara(c, dt) {
    const tx = c.x + c.vx * 0.45, ty = c.y + c.vy * 0.45;
    if (!cam) cam = { x: tx, y: ty };
    const k = Math.min(1, dt * 4);
    cam.x += (tx - cam.x) * k; cam.y += (ty - cam.y) * k;
    temblor = Math.max(0, temblor - dt * 12);
    const t = () => Math.round((Math.random() - 0.5) * 2 * temblor);
    cam.x0 = Math.round(cam.x - buf.width / 2) + t(); cam.y0 = Math.round(cam.y * K - buf.height * 0.56) + t();
  }
  // un golpe fuerte sacude la cámara (fuerza en píxeles de juego)
  function sacude(fuerza) { temblor = Math.max(temblor, fuerza); }

  // ---- pilas: girada (coches y arcos) o ya aplastada (adornos)
  function pilaGirada(p, x, y, giro, alfa = 1, sombra = true) {
    if (sombra) { b.save(); b.globalAlpha = 0.33 * alfa; b.translate(x + 2, y + 1); b.scale(1, K); b.rotate(giro); b.drawImage(p.sombra, -p.an / 2, -p.la / 2); b.restore(); }
    b.globalAlpha = alfa;
    for (let z = 0; z < p.hojas.length; z++) { b.save(); b.translate(x, y - z * ALTO); b.scale(1, K); b.rotate(giro); b.drawImage(p.hojas[z], -p.an / 2, -p.la / 2); b.restore(); }
    b.globalAlpha = 1;
  }
  function pilaPlana(p, x, y) {
    const x0 = x - (p.an >> 1), y0 = y - (p.la >> 1);
    b.globalAlpha = 0.2; b.drawImage(p.sombra, x0 + 3, y0 + 2); b.globalAlpha = 1;
    for (let z = 0; z < p.hojas.length; z++) b.drawImage(p.hojas[z], x0, y0 - z * ALTO);
  }

  // ---- polvo, barro y nieve
  const COLOR_POLVO = { tierra: ['#d9a066', '#c08048'], barro: ['#5a3a1e', '#7f5a37'], nieve: ['#ffffff', '#dfe9f5'], fuera: null, asfalto: ['#9a9aa4', '#c8c8d0'] };
  const COLOR_MARCA = { asfalto: '#1c1c22', tierra: '#8a5528', barro: '#3c2814', nieve: '#a8b8cc' };
  function levanta(c, suelo, dt) {
    const v = Math.hypot(c.coche.vx, c.coche.vy), base = suelo === 'fuera' ? 'tierra' : suelo;
    const cols = COLOR_POLVO[mundo.tramo.id === 'montana' && suelo === 'fuera' ? 'nieve' : base];
    const fuerza = (suelo === 'asfalto' ? c.coche.derrape * 2 : 0.5 + c.coche.derrape) * Math.min(1, v / 120);
    if (!cols || Math.random() > fuerza * dt * 30) return;
    const atras = c.coche.ang + Math.PI, lado = (Math.random() - 0.5) * 18;
    particulas.push({ x: c.coche.x + Math.cos(atras) * 20 + Math.cos(atras + Math.PI / 2) * lado, y: c.coche.y + Math.sin(atras) * 20 + Math.sin(atras + Math.PI / 2) * lado,
      z: 1, vx: -c.coche.vx * 0.15 + (Math.random() - 0.5) * 20, vy: -c.coche.vy * 0.15 + (Math.random() - 0.5) * 20, vz: 12 + Math.random() * 18, vida: 0.7 + Math.random() * 0.5,
      color: cols[Math.random() < 0.5 ? 0 : 1], t: Math.random() < 0.3 ? 2 : 1 });
  }
  function marcas(c, suelo) {
    if (c.coche.derrape < 0.22 || Math.hypot(c.coche.vx, c.coche.vy) < 60) return;
    const color = COLOR_MARCA[suelo] || mundo.tramo.paisaje.fuera2;
    for (const lado of [-9, 9]) {
      const a = c.coche.ang, x = c.coche.x - Math.cos(a) * 14 + Math.cos(a + Math.PI / 2) * lado, y = c.coche.y - Math.sin(a) * 14 + Math.sin(a + Math.PI / 2) * lado;
      RA.Suelo.marca(mundo.suelo, x, y, color);
    }
  }
  function mueveParticulas(dt) {
    for (const p of particulas) { p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.vz -= 30 * dt; p.vida -= dt; }
    particulas = particulas.filter(p => p.vida > 0 && p.z >= 0).slice(-260);
  }

  // ---- todo lo que se ve, ordenado de arriba abajo
  function visibles(carrera, fantasma, colores) {
    const out = [], margen = 60;
    const dentro = (x, y) => { const [sx, sy] = enPantalla(x, y); return sx > -margen && sx < buf.width + margen && sy > -margen && sy < buf.height + margen * 2; };
    for (const c of mundo.cosas) if (dentro(c.x, c.y)) out.push({ y: c.y, dibuja: () => dibujaCosa(c) });
    for (const c of carrera.coches) if (dentro(c.coche.x, c.coche.y)) out.push({ y: c.coche.y, dibuja: () => dibujaCoche(c.coche, colores(c), 1) });
    if (fantasma && dentro(fantasma.x, fantasma.y)) out.push({ y: fantasma.y, dibuja: () => dibujaCoche(fantasma, colores(carrera.jugador), 0.42) });
    return out.sort((a, b2) => a.y - b2.y);
  }
  function dibujaCosa(c) {
    const [sx, sy] = enPantalla(c.x, c.y);
    if (c.tipo === 'meta' || c.tipo === 'control') return pilaGirada(mundo.arcos[c.tipo], sx, sy, c.ang + Math.PI / 2, 1, false);
    const p = mundo.planos[c.tipo];
    if (p) pilaPlana(p[c.variante % p.length], sx, sy);
  }
  function dibujaCoche(c, colores, alfa) { const [sx, sy] = enPantalla(c.x, c.y); pilaGirada(cocheDe(colores), sx, sy, c.ang + Math.PI / 2, alfa, alfa === 1); }
  function dibujaParticulas() {
    for (const p of particulas) { const [sx, sy] = enPantalla(p.x, p.y); b.fillStyle = p.color; b.fillRect(sx, Math.round(sy - p.z), p.t, p.t); }
  }

  // un fotograma: carrera (dominio), dt, el fantasma (o null) y colores(c) del coche de cada participante
  function pinta(carrera, dt, fantasma, colores) {
    if (!mundo) return;
    mueveCamara(carrera.jugador.coche, dt);
    for (const c of carrera.coches) { if (c.suelo) { levanta(c, c.suelo, dt); marcas(c, c.suelo); } }
    mueveParticulas(dt);
    b.imageSmoothingEnabled = false;
    b.fillStyle = mundo.tramo.paisaje.fuera; b.fillRect(0, 0, buf.width, buf.height);
    b.drawImage(mundo.suelo.cv, Math.round(mundo.suelo.x0 - cam.x0), Math.round(mundo.suelo.y0 * K - cam.y0));
    for (const d of visibles(carrera, fantasma, colores)) d.dibuja();
    dibujaParticulas();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(buf, 0, 0, lienzo.width, lienzo.height);
  }
  // un coche suelto, de cara y centrado (para las fichas de los pilotos)
  function retrato(cv, colores) {
    const g = cv.getContext('2d'), p = cocheDe(colores);
    g.clearRect(0, 0, cv.width, cv.height); g.imageSmoothingEnabled = false;
    const x = cv.width / 2, y = cv.height / 2 + 6;
    for (let z = 0; z < p.hojas.length; z++) { g.save(); g.translate(x, y - z); g.scale(1, K); g.rotate(Math.PI); g.drawImage(p.hojas[z], -p.an / 2, -p.la / 2); g.restore(); }
  }
  addEventListener('resize', ajusta);
  ajusta();
  return { prepara, pinta, ajusta, retrato, sacude, get K() { return K; } };
};
