// Fans Of · Comparador: esta parte se ejecuta DENTRO del juego (en su marco), cuando ya ha arrancado.
// Quita todo lo que haría que dos pasadas del mismo guion salieran distintas (el azar, la hora, las animaciones y el sonido)
// y deja en `T` las herramientas con las que el guion maneja el juego y apunta lo que ve.
(function () {
  'use strict';
  const W = window, D = document;

  /* ---------- azar con semilla: cada paso del guion empieza con la suya ---------- */
  let seed = 1;
  Math.random = function () { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  /* ---------- reloj y temporizadores de mentira: el tiempo solo pasa cuando el guion llama a T.avanza ---------- */
  const RD = Date, T0 = new RD(2026, 9, 7, 12, 0, 0).getTime();   // miércoles 7 de octubre de 2026, a mediodía
  let vnow = 100000;
  class FD extends RD { constructor(...a) { if (a.length) super(...a); else super(T0 + vnow); } static now() { return T0 + vnow; } }
  W.Date = FD;
  performance.now = () => vnow;
  const Q = []; let ids = 1e6;
  const realST = W.setTimeout.bind(W), realCT = W.clearTimeout.bind(W), realCI = W.clearInterval.bind(W);
  W.setTimeout = (fn, ms, ...a) => { const id = ++ids; Q.push({ id, at: vnow + (+ms || 0), fn: () => fn(...a) }); return id; };
  W.setInterval = (fn, ms, ...a) => { const id = ++ids, arm = () => Q.push({ id, at: vnow + Math.max(1, +ms || 0), fn: () => { arm(); fn(...a); } }); arm(); return id; };
  W.clearTimeout = W.clearInterval = id => { let hit = false; for (let i = Q.length - 1; i >= 0; i--) if (Q[i].id === id) { Q.splice(i, 1); hit = true; } if (!hit) { realCT(id); realCI(id); } };
  W.requestAnimationFrame = () => 0; W.cancelAnimationFrame = () => {};
  function avanza(ms) {
    const end = vnow + ms;
    for (let n = 0; n < 200000; n++) {
      let bi = -1; for (let i = 0; i < Q.length; i++) if (Q[i].at <= end && (bi < 0 || Q[i].at < Q[bi].at || (Q[i].at === Q[bi].at && Q[i].id < Q[bi].id))) bi = i;
      if (bi < 0) break;
      const q = Q.splice(bi, 1)[0]; vnow = Math.max(vnow, q.at);
      try { q.fn(); } catch (e) { T.errores.push('temporizador: ' + (e && e.stack || e)); }
    }
    vnow = end;
  }

  /* ---------- animaciones paradas en su primer fotograma y transiciones al instante ---------- */
  const st = D.createElement('style'); st.textContent = '*, *::before, *::after { animation-play-state: paused !important; animation-delay: 0s !important; transition-duration: 0s !important; transition-delay: 0s !important; scroll-behavior: auto !important; }';
  D.head.appendChild(st);

  /* ---------- el juego cree que se le está viendo, aunque el comparador lo tenga fuera de la vista ---------- */
  Object.defineProperty(D, 'hidden', { get: () => false, configurable: true }); Object.defineProperty(D, 'visibilityState', { get: () => 'visible', configurable: true });

  /* ---------- sonido de mentira: no suena nada; se apunta lo que el juego le pide al altavoz ---------- */
  const audio = [];
  const r = x => (typeof x === 'number' ? +x.toPrecision(6) : x);
  function FakeAC() {
    let n = 0;
    const param = (owner, name, v0) => { let v = v0; return { get value() { return v; }, set value(x) { v = x; audio.push(`${owner}.${name}=${r(x)}`); },
      setValueAtTime(x, t) { audio.push(`${owner}.${name} set ${r(x)} @${r(t)}`); }, linearRampToValueAtTime(x, t) { audio.push(`${owner}.${name} lin ${r(x)} @${r(t)}`); },
      exponentialRampToValueAtTime(x, t) { audio.push(`${owner}.${name} exp ${r(x)} @${r(t)}`); }, setTargetAtTime(x, t, c) { audio.push(`${owner}.${name} tgt ${r(x)} @${r(t)} ${r(c)}`); }, cancelScheduledValues() {} }; };
    const node = (kind, params) => {
      const id = kind + (++n), o = { id, connect(d) { audio.push(`${id} -> ${d.id || '?'}`); return d; }, disconnect() { audio.push(`${id} -x`); },
        start(t, off) { audio.push(`${id} start @${r(t)}${off ? ' +' + r(off) : ''}`); }, stop(t) { audio.push(`${id} stop @${r(t)}`); } };
      for (const p in params) o[p] = param(id, p, params[p]);
      let type = ''; Object.defineProperty(o, 'type', { get: () => type, set: v => { type = v; audio.push(`${id}.type=${v}`); } });
      return o;
    };
    this.currentTime = 10; this.sampleRate = 64; this.state = 'running'; this.destination = { id: 'altavoz' };
    this.createGain = () => node('g', { gain: 1 });
    this.createOscillator = () => node('o', { frequency: 440, detune: 0 });
    this.createBiquadFilter = () => node('f', { frequency: 350, Q: 1, gain: 0 });
    this.createBufferSource = () => node('s', {});
    this.createDynamicsCompressor = () => node('c', { threshold: -24, knee: 30, ratio: 12, attack: 0.003, release: 0.25 });
    this.createBuffer = (ch, len) => ({ getChannelData: () => new Float32Array(len) });
    this.resume = () => Promise.resolve(); this.suspend = () => Promise.resolve();
    FakeAC.ultimo = this;
  }
  W.AudioContext = W.webkitAudioContext = FakeAC;

  /* ---------- fotos de lo que hay en pantalla ---------- */
  const hash = s => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } return (h >>> 0).toString(16); };
  const PROPS = ['display', 'position', 'top', 'right', 'bottom', 'left', 'z-index', 'float', 'box-sizing', 'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
    'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width', 'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style',
    'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'border-top-left-radius', 'border-top-right-radius', 'border-bottom-left-radius', 'border-bottom-right-radius',
    'outline-style', 'outline-width', 'outline-color', 'outline-offset', 'background-color', 'background-image', 'background-size', 'background-position', 'background-repeat', 'background-clip',
    'color', 'opacity', 'visibility', 'overflow-x', 'overflow-y', 'font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'letter-spacing', 'text-align', 'text-transform',
    'text-decoration-line', 'text-shadow', 'text-overflow', 'white-space', 'word-break', 'overflow-wrap', 'vertical-align', 'box-shadow', 'transform', 'transform-origin', 'filter', 'backdrop-filter',
    'flex-direction', 'flex-wrap', 'flex-grow', 'flex-shrink', 'flex-basis', 'justify-content', 'align-items', 'align-content', 'align-self', 'justify-self', 'row-gap', 'column-gap', 'order',
    'grid-template-columns', 'grid-template-rows', 'grid-auto-flow', 'grid-column-start', 'grid-column-end', 'grid-row-start', 'grid-row-end',
    'cursor', 'pointer-events', 'user-select', 'touch-action', 'animation-name', 'animation-duration', 'animation-iteration-count', 'transition-property',
    '-webkit-text-stroke-width', '-webkit-text-stroke-color', 'paint-order', 'object-fit', 'aspect-ratio', 'list-style-type', 'content', 'clip-path', 'mix-blend-mode', 'isolation', 'appearance'];
  const dic = [], idx = new Map();
  const styleId = (el, pseudo) => { const cs = getComputedStyle(el, pseudo || null); let s = ''; for (const p of PROPS) s += cs.getPropertyValue(p) + ';'; let i = idx.get(s); if (i == null) { i = dic.length; dic.push(s); idx.set(s, i); } return i; };
  const sig = el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).join('.') : '');
  function estilos(root) {
    const out = [];
    for (const el of [root, ...root.querySelectorAll('*')]) {
      if (el.closest('svg') && el.tagName.toLowerCase() !== 'svg') continue;   // los dibujos de dentro de un icono no cambian con los estilos
      let line = sig(el) + '\t' + styleId(el);   // elemento, estilo y, si los tiene, los de sus ::before y ::after
      for (const ps of ['::before', '::after']) { const c = getComputedStyle(el, ps).getPropertyValue('content'); if (c && c !== 'none' && c !== 'normal') line += '\t' + ps + '\t' + styleId(el, ps); }
      out.push(line);
    }
    return out.join('\n');
  }
  function lienzos(root) {
    const out = [];
    for (const c of root.querySelectorAll('canvas')) { let h = '?'; try { h = c.width && c.height ? hash(c.toDataURL()) : 'vacío'; } catch (e) { h = 'error'; } out.push(`${c.id ? '#' + c.id : c.dataset.k || c.dataset.art || c.dataset.dk || ''} ${c.width}x${c.height} ${h}`); }
    return out.join('\n');
  }

  const T = W.T = {
    pasos: [], errores: [], dic, vistos: {}, tapados: [],
    semilla(n) { seed = n; },
    avanza,                                                      // pasa el tiempo y saltan los temporizadores que toquen
    salta(ms) { vnow += ms; },                                   // pasa el tiempo de golpe (horas), sin recorrerlo
    tic: () => new Promise(res => realST(res, 0)),              // deja pasar lo que el juego tenga pendiente de verdad (promesas)
    espera: ms => new Promise(res => realST(res, ms)),
    $: s => D.querySelector(s), $$: s => [...D.querySelectorAll(s)],
    /* empieza un paso del guion: semilla nueva, para que un cambio en un paso no arrastre a los siguientes */
    paso(nombre) { T.actual = nombre; seed = 1000 + T.pasos.length * 7919; audio.length = 0; },
    apunta(que, v) { let n = T.actual + ' · ' + que; const veces = T.vistos[n] = (T.vistos[n] || 0) + 1; if (veces > 1) n += ' (' + veces + ')'; T.pasos.push([n, typeof v === 'string' ? v : JSON.stringify(v, null, 1)]); },
    /* apunta todo lo que se ve: cada pantalla abierta (su HTML, sus estilos y sus dibujos), el aviso y la burbuja del tutorial */
    tapa(...sel) { T.tapados.push(...sel); },                    // textos que cambian a propósito de una versión a otra (el número de versión): no se comparan
    /* la huella: qué claves, y en qué orden, tienen los objetos grandes de core (dibujos, cartas, facciones…). Si una pieza no se carga o cambia el orden, sale aquí */
    huella() {
      const ev = x => { try { return (0, W.eval)(x); } catch (e) { return undefined; } };
      for (const n of ['ART', 'BOX', 'SPR', 'CFG.cards', 'CFG.units', 'CFG.enemyCards', 'CFG.passives', 'FAC_BAL', 'FACTIONS', 'TYPES', 'ROLES', 'TOPS']) {
        const o = ev(n), k = o && typeof o === 'object' ? (Array.isArray(o) ? o.map(String) : (n === 'ART' || n === 'SPR') ? Object.keys(o).sort() : Object.keys(o)) : null;   // ART y SPR van por orden alfabético: su orden solo importa a buildSprites, y core/js/serie/arte/ lo rellena por facciones
        T.apunta('huella · ' + n, k ? k.length + ': ' + k.join(',') : String(o));
        if (k && n !== 'ART' && n !== 'SPR') T.apunta('huella · ' + n + ' · valores', hash(JSON.stringify(o, (kk, v) => (typeof v === 'function' ? v.toString() : v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map(x => [x, v[x]])) : v))));   // y lo que vale cada clave (dentro de cada objeto, por orden alfabético: el orden de las claves de fuera ya va en la línea de arriba)
      }
    },
    foto(que) {
      const tap = T.tapados.flatMap(s => [...D.querySelectorAll(s)]).map(e => [e, e.textContent]); for (const [e] of tap) e.textContent = '·';
      const vis = [...D.querySelectorAll('.screen')].filter(s => !s.hidden), extra = ['#toast', '#coach', '#banner', '#hud', '#tray', '#chat', '#tut', '#panel', '#info', '#feed', '#hud-mods', '#card-tip', '#tut-tip', '#ad-screen', '#btn-wave', '#btn-mode', '#count'].map(s => D.querySelector(s)).filter(e => e && !e.hidden);
      const els = vis.concat(extra), q = que ? que + ' · ' : '';
      T.apunta(q + 'abierto', els.map(sig).join(' | '));
      T.apunta(q + 'html', els.map(e => e.outerHTML).join('\n'));
      T.apunta(q + 'estilos', els.map(estilos).join('\n'));
      T.apunta(q + 'dibujos', els.map(e => (e.tagName === 'CANVAS' ? '' : lienzos(e))).join('\n'));
      for (const [e, t] of tap) e.textContent = t;
    },
    sonido(que) { T.apunta(que || 'sonido', audio.join('\n')); audio.length = 0; },
    altavoz: () => FakeAC.ultimo,
    clic(sel) { const el = typeof sel === 'string' ? D.querySelector(sel) : sel; if (!el) throw new Error('no encuentro ' + sel); if (el.disabled) throw new Error('está apagado: ' + sel); el.click(); },
    pon(sel, valor, ev) { const el = D.querySelector(sel); if (!el) throw new Error('no encuentro ' + sel); el.value = valor; el.dispatchEvent(new Event(ev || 'input', { bubbles: true })); },
    lienzo: c => (c && c.width && c.height ? `${c.width}x${c.height} ${hash(c.toDataURL())}` : 'vacío'),
    hash,
  };
  W.addEventListener('error', e => T.errores.push('error: ' + e.message + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno));
  W.addEventListener('unhandledrejection', e => T.errores.push('promesa: ' + (e.reason && e.reason.stack || e.reason)));
  const ce = console.error.bind(console); console.error = (...a) => { T.errores.push('console.error: ' + a.join(' ')); ce(...a); };
})();
