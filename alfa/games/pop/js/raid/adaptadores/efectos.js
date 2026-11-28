// Fans of Pop · RAID, los efectos (adaptador de pantalla, tarea 448, nodo n4; Pepins: «reventar con zumo», «ver jugar al otro», «cofres con lluvia
// de monedas»): lo que se mueve encima del tablero. Guarda y pinta:
// · los POPS: cada burbuja reventada suelta un aro que crece (blanco y rosa las tuyas, AZUL las de otro jugador) y unas chispas (PP_CHISPAS);
// · los COFRES que esperan la confirmación del servidor (bailan en su casilla hasta que llega, tarde lo que tarde) y la LLUVIA DE MONEDAS;
// · los TEXTOS que flotan (+5, +45 monedas), el letrero de la RACHA (el kawaii de los combos) y el TEMBLOR de la pantalla.
// Los pops y los cofres van en casillas del tablero (siguen a la cámara); lo demás, en píxeles de diseño. Sin reloj: avanza(dt) lo mueve.
// · crea({ azar, chispas, imagen, combo, colorDe }) → objeto; `chispas(x, y)` da las partículas de un pop (PP_CHISPAS.chispas con su azar);
//   `combo` pinta el letrero de combos (ppComboJunto); `colorDe(x, y)` = el color de la burbuja de esa casilla (gotitas y aplastado).
//   Depende de PP_RAID_CAMARA.
'use strict';
const PP_RAID_FX = (() => {
  const POP_DUR = 0.34, TOPE_POPS = 140, TOPE_PARTS = 420;
  const MIA = Object.freeze({ aro: '#ffffff', relleno: 'rgba(255, 110, 199, 0.55)' });
  const AJENA = Object.freeze({ aro: '#6fb8ff', relleno: 'rgba(143, 212, 255, 0.6)' });

  function crea({ azar, chispas, imagen = () => null, combo = null, colorDe = () => '#ff9ccf' }) {
    const e = { pops: [], parts: [], textos: [], cofres: [], temblor: 0, racha: { n: 0, t: 9 } };
    const entre = (a, b) => a + azar() * (b - a);

    // una burbuja reventada en la casilla (x, y); `ajena` = la reventó otro jugador
    // `tocada`: una burbuja doble que se queda con su primer pop (sigue viva): solo el aro, sin gotitas ni aplastado
    function pop(x, y, ajena = false, tocada = false) {
      if (e.pops.length >= TOPE_POPS) e.pops.shift();
      e.pops.push({ x, y, t: 0, ajena, tocada, hechas: false });
    }
    function flota(s, x, y, col = '#fff', tam = 30) { e.textos.push({ s, x, y, col, tam, t: 0 }); }
    function cofreEspera(x, y, monedas) { e.cofres.push({ x, y, monedas, t: 0 }); }
    // el cofre de (x, y) se abre: deja de esperar; devuelve si estaba
    function cofreQuita(x, y) {
      const antes = e.cofres.length;
      e.cofres = e.cofres.filter(k => k.x !== x || k.y !== y);
      return e.cofres.length < antes;
    }
    // lluvia de monedas: un surtidor desde (px, py) y otras que caen desde arriba a lo ancho de la ventana
    function lluvia(px, py, vista, cuantas) {
      for (let k = 0; k < cuantas; k++) {
        const arriba = k % 2 === 0;
        e.parts.push(arriba
          ? { x: entre(vista.x + 20, vista.x + vista.w - 20), y: vista.y - entre(10, 160), vx: entre(-40, 40), vy: entre(120, 260), g: 520, r: entre(7, 11), t: 0, vida: entre(1.3, 2.1), moneda: true, giro: entre(0, 6) }
          : { x: px, y: py, vx: entre(-230, 230), vy: entre(-520, -220), g: 900, r: entre(6, 10), t: 0, vida: entre(0.9, 1.5), moneda: true, giro: entre(0, 6) });
      }
    }
    // deja solo los cofres que cumplen sigue(x, y)
    function cofresSolo(sigue) { e.cofres = e.cofres.filter(k => sigue(k.x, k.y)); }
    function confeti(lista) { e.parts.push(...lista); }
    function tiembla(fuerza) { e.temblor = Math.max(e.temblor, fuerza); }
    function racha(n, x, y) { e.racha = { n, t: 0, x, y }; }   // (x, y): el dedo, en píxeles de diseño: el letrero sale junto a él

    function avanza(dt) {
      for (const p of e.pops) p.t += dt;
      e.pops = e.pops.filter(p => p.t < POP_DUR);
      for (const p of e.parts) { p.t += dt; p.vy += (p.g === undefined ? 0 : p.g) * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
      e.parts = e.parts.filter(p => p.t < p.vida).slice(-TOPE_PARTS);
      for (const x of e.textos) { x.t += dt; x.y -= 70 * dt; }
      e.textos = e.textos.filter(x => x.t < 1);
      for (const k of e.cofres) k.t += dt;
      e.temblor = Math.max(0, e.temblor - dt * 3);
      e.racha.t += dt;
    }

    // las gotitas del color de la burbuja que saltan y caen, como al hacer pop en un nivel (ppFxToque, js/efectos.js)
    function gotitas(px, py, col, n) {
      for (let k = 0; k < n; k++) {
        const a = entre(0, Math.PI * 2), v = entre(80, 200);
        e.parts.push({ x: px, y: py - 6, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 150, g: 700, r: entre(3, 6), t: 0, vida: entre(0.35, 0.6), col });
      }
    }
    // la burbuja se aplasta antes de hundirse: un óvalo de su color que se ensancha y baja (solo las tuyas y de cerca, la primera mitad del pop)
    function aplasta(c, px, py, r, col, k) {
      if (k > 0.5) return;
      const q = k / 0.5;
      c.globalAlpha = 1;
      c.fillStyle = col; c.beginPath(); c.ellipse(px, py + r * 0.3 * q, r * (0.9 + 0.35 * q), r * (0.9 - 0.65 * q), 0, 0, Math.PI * 2); c.fill();
    }
    function pintaPops(c, cam, vista) {
      for (const p of e.pops) {
        const [px, py] = PP_RAID_CAMARA.aPantalla(cam, vista, p.x + 0.5, p.y + 0.5);
        const k = p.t / POP_DUR, est = p.ajena ? AJENA : MIA, r = Math.max(5, cam.z * 0.5) * (0.5 + k * 0.9);
        if (!p.hechas && cam.z >= 12) { p.hechas = true; e.parts.push(...chispas(px, py).slice(0, p.ajena ? 3 : 8)); if (!p.ajena && !p.tocada) gotitas(px, py, colorDe(p.x, p.y), 5); }
        if (!p.ajena && !p.tocada && cam.z >= 12) aplasta(c, px, py, cam.z * 0.42, colorDe(p.x, p.y), k);
        c.globalAlpha = 1 - k;
        c.fillStyle = est.relleno; c.beginPath(); c.arc(px, py, r * 0.8, 0, Math.PI * 2); c.fill();
        c.lineWidth = Math.max(2, cam.z * 0.09); c.strokeStyle = est.aro; c.beginPath(); c.arc(px, py, r, 0, Math.PI * 2); c.stroke();
      }
      c.globalAlpha = 1;
    }
    // el cofre de Pop (i-cofre) bailando, centrado en (px, py); si su dibujo no está cargado, uno pintado por código
    function cofre(c, px, py, tam, t) {
      const im = imagen('i-cofre');
      c.save(); c.translate(px, py); c.rotate(Math.sin(t * 22) * 0.16);
      if (im) { c.drawImage(im, -tam * 0.65, -tam * 0.65, tam * 1.3, tam * 1.3); c.restore(); return; }
      c.scale(tam / 40, tam / 40);
      c.fillStyle = '#7a4a00'; c.fillRect(-17, -12, 34, 27);
      c.fillStyle = '#ffb800'; c.fillRect(-14, -9, 28, 21);
      c.fillStyle = '#c27a00'; c.fillRect(-17, -2, 34, 5);
      c.fillStyle = '#fff3a0'; c.fillRect(-4, -4, 8, 9);
      c.restore();
    }
    function pintaCofres(c, cam, vista) {
      for (const k of e.cofres) {
        const [px, py] = PP_RAID_CAMARA.aPantalla(cam, vista, k.x + 0.5, k.y + 0.5);
        cofre(c, px, py - Math.abs(Math.sin(k.t * 9)) * cam.z * 0.25, Math.max(16, cam.z * 0.95), k.t);
      }
    }
    // `paso`: se pinta una de cada `paso` (el «Ahorro de batería» del juego da 2: PP_AHORRO.pasoParticulas)
    function pintaParts(c, paso = 1) {
      for (let i = 0; i < e.parts.length; i += paso) {
        const p = e.parts[i];
        const k = 1 - p.t / p.vida;
        if (!p.moneda) { c.fillStyle = p.col; c.beginPath(); c.arc(p.x, p.y, p.r * k, 0, Math.PI * 2); c.fill(); continue; }
        const ancho = Math.abs(Math.cos(p.giro + p.t * 9)) * p.r + 1.5;
        c.globalAlpha = Math.min(1, k * 3);
        const im = imagen('i-moneda');   // la moneda de Pop, girando (se estrecha y se ensancha)
        if (im) { c.drawImage(im, p.x - ancho * 1.5, p.y - p.r * 1.5, ancho * 3, p.r * 3); continue; }
        c.fillStyle = '#c27a00'; c.beginPath(); c.ellipse(p.x, p.y + 1.5, ancho, p.r, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#ffd23a'; c.beginPath(); c.ellipse(p.x, p.y, ancho, p.r, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#fff3a0'; c.beginPath(); c.ellipse(p.x - ancho * 0.25, p.y - p.r * 0.3, ancho * 0.3, p.r * 0.3, 0, 0, Math.PI * 2); c.fill();
      }
      c.globalAlpha = 1;
    }
    // `texto(c, s, x, y, tam, col, borde)` es el de Pop (ppTexto): letra gordita con borde
    function pintaTextos(c, texto) {
      for (const x of e.textos) {
        c.globalAlpha = Math.min(1, (1 - x.t) * 2.5);
        texto(c, x.s, x.x, x.y, x.tam * (1 + Math.max(0, 0.18 - x.t) * 2.5), x.col, '#7a2a5a');
      }
      c.globalAlpha = 1;
    }
    // el letrero de la RACHA: el mismo letrero kawaii de los combos de los niveles (`combo` = ppComboJunto, js/combo-letrero.js), junto al
    // último toque y dentro de `caja` = { arriba, abajo }; salta al subir y se apaga solo si no sigues
    function pintaRacha(c, caja) {
      if (!combo || e.racha.n < 2) return;
      combo(c, e.racha.n, e.racha.t, e.racha.x, e.racha.y, caja);
    }
    // el desplazamiento del temblor en este fotograma
    const sacudida = () => (e.temblor > 0 ? [entre(-1, 1) * e.temblor * 9, entre(-1, 1) * e.temblor * 9] : [0, 0]);
    const hayCofre = (x, y) => e.cofres.some(k => k.x === x && k.y === y);

    return Object.freeze({
      pop, flota, cofreEspera, cofreQuita, cofresSolo, hayCofre, lluvia, confeti, tiembla, racha, avanza, sacudida,
      pintaPops, pintaCofres, pintaParts, pintaTextos, pintaRacha, cuenta: () => ({ pops: e.pops.length, parts: e.parts.length, cofres: e.cofres.length }),
    });
  }
  return Object.freeze({ crea });
})();
