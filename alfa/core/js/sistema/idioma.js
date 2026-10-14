// Fans Of · IDIOMA: traducir el juego. El español es el idioma de origen: todo el código y los datos están en español y, si el jugador
// usa otro, los diccionarios de core/idioma/ y de cada juego (games/<juego>/idioma/) dicen cómo se traduce cada frase tal cual está escrita.
//   · Una frase exacta:           'Volumen': 'Volume'
//   · Una frase con huecos (%1…): 'Nivel %1': 'Level %1'      (vale para lo que el juego escribe con números o nombres)
// Qué se traduce solo:
//   · todo lo que sale en pantalla (textos, title, aria-label…), aunque lo escriba el juego más tarde;
//   · los datos (cartas, habilidades, frases del chat…), con IDIOMA.datos(objeto, …) al arrancar.
// Lo que se dibuja en un canvas o se compara con un texto se traduce a mano con tr('frase', { dato: valor }).
// El idioma sale de NUCLEO.idioma (el del navegador, o el que el jugador elija en Opciones). En español no hace nada.
'use strict';
const IDIOMA = (() => {
  const actual = NUCLEO.idioma, exactas = new Map(), huecos = [], memo = new Map();
  // para completar los diccionarios: con esta marca en este navegador se apuntan los textos que siguen con pinta de español (herramientas/idioma.py)
  const depura = (() => { try { return localStorage.getItem('fansof-idioma-depura') === '1'; } catch (e) { return false; } })();
  const sin = new Set(), ESPANOL = /[áíóúñ¡¿]|\b(el|la|los|las|del|que|con|para|por|tu|tus|una|más|solo|cada|todos|sin|nivel|oro|gemas|de|en|y)\b/i;
  const ESPANOL_G = new RegExp(ESPANOL.source, 'gi');
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // los huecos del principio y del medio son cortos (nombres, números): así «%1 y %2 más» no se come una frase entera; el del final puede ser largo
  // Un hueco es un carácter o un trozo entre paréntesis (nunca deja un paréntesis a medias) y no cruza un « · » ni el final de una frase.
  // Con «%#1» el hueco es solo un número.
  const SIN_CORTE = '(?!\\s[·|]\\s|[.!?:;]\\s)', SIN_PUNTO = '(?!\\s[·|]\\s|[.!?]\\s)';
  const CARACTER_CORTO = '(?:' + SIN_CORTE + '[^()]|\\([^()]*\\))', CARACTER = '(?:' + SIN_PUNTO + '[^()]|\\([^()]*\\))';
  // los huecos del principio y del medio no cruzan ninguna puntuación; el del final (que es el resto del texto) puede cruzar comas y dos puntos
  const HUECO = /%(#?)(\d+)/g;
  const patron = k => {
    const trozos = k.split(/%#?\d+/), numericos = [...k.matchAll(HUECO)].map(m => !!m[1]); let o = '^';
    trozos.forEach((t, i) => {
      o += esc(t);
      if (i < trozos.length - 1) o += '(' + (numericos[i] ? '\\d[\\d.,]*' : (i === trozos.length - 2 && !trozos[trozos.length - 1] ? CARACTER + '+?' : CARACTER_CORTO + (i === 0 && !t ? '{1,25}?' : '{1,60}?'))) + ')';
    });
    return new RegExp(o + '$');
  };
  function add(tabla) {
    for (const k in tabla) {
      if (/%#?\d+/.test(k)) huecos.push({ k, fijo: /^%/.test(k) ? 0 : 1, lit: k.replace(/%#?\d+/g, '').length, re: patron(k), a: tabla[k], orden: [...k.matchAll(HUECO)].map(m => m[2]) });
      else exactas.set(k, tabla[k]);
    }
    huecos.sort((x, y) => (y.fijo - x.fijo) || (y.lit - x.lit));   // primero los que empiezan con texto fijo y, entre ellos, los que más texto fijo tienen: son los más concretos
    huecosPunto = huecos.filter(h => /[.!?:;,]$/.test(h.k));   // los que acaban en puntuación: son los que valen para «Texto.» pegado a su punto
    memo.clear(); arriba = null;
  }
  // una frase entera: exacta o con huecos. Devuelve undefined si no hay traducción. Lo que el juego escribe en MAYÚSCULAS se busca en mayúsculas
  let arriba = null, huecosPunto = [];
  const mayuscula = c => c === c.toUpperCase() && /[A-ZÁÉÍÓÚÑ]{2}/.test(c);
  function tablasMayusculas() {
    if (arriba) return arriba;
    arriba = { exactas: new Map(), huecos: [] };
    for (const [k, v] of exactas) arriba.exactas.set(k.toUpperCase(), v.toUpperCase());
    for (const h of huecos) arriba.huecos.push({ re: patron(h.k.toUpperCase()), a: h.a.toUpperCase(), orden: h.orden });
    return arriba;
  }
  function conHuecos(lista, c) {
    for (const h of lista) { const x = h.re.exec(c); if (x) return h.a.replace(/%(\d+)/g, (_, n) => trozo(x[h.orden.indexOf(n) + 1])); }
    return undefined;
  }
  const fraseRacha = c => exactas.get(c);   // varios trozos seguidos solo valen si la frase está tal cual en el diccionario: un hueco se comería los cortes
  const fraseConPunto = c => { const r = exactas.get(c); return r !== undefined ? r : conHuecos(huecosPunto, c); };
  function frase(c) {
    let r = exactas.get(c);
    const up = r === undefined && mayuscula(c) ? tablasMayusculas() : null;
    if (r === undefined && up) r = up.exactas.get(c);
    if (r === undefined) r = conHuecos(huecos, c);
    if (r === undefined && up) r = conHuecos(up.huecos, c);
    return r;
  }
  // lo que cae en un hueco: una frase, un nombre con número romano («Fan de Pulgas II») o con algo entre paréntesis («Mundo (Difícil)»)
  function trozo(g) {
    const e = /^(\s*)([\s\S]*?)(\s*)$/.exec(g); if (e[1] || e[3]) { const t = e[2] && trozo(e[2]); return t === undefined || t === e[2] ? g : e[1] + t + e[3]; }
    const r = frase(g); if (r !== undefined) return r;
    const m = /^(.*\S) (I{1,3}|IV|VI{0,3}|IX|XI{0,3})$/.exec(g);
    if (m) { const a = trozo(m[1]); if (a !== m[1]) return a + ' ' + m[2]; }
    const p = /^(.*?)\s*\((.+)\)$/.exec(g);   // «Nombre (algo)», con paréntesis dentro de los paréntesis si hace falta
    if (p) { const a = p[1] && trozo(p[1]), b = trozo(p[2]); if ((p[1] && a !== p[1]) || b !== p[2]) return (a ? a + ' ' : '') + '(' + b + ')'; }
    const q = /^\((.+)\)([^()]*)$/.exec(g);   // «(Nombre (algo))?»
    if (q) { const b = trozo(q[1]); if (b !== q[1]) return '(' + b + ')' + q[2]; }
    return g;
  }
  // los textos que el juego arma pegando varias frases («HABILIDAD: Cafeína, calidad Senior. Toca para cambiar») se traducen frase a frase
  // primero se corta por « · » y « | », después por frases (. ! ?) y por último por comas y dos puntos; cada trozo se busca con su puntuación pegada
  const CORTES = [/(\s+[·|]\s+|\s+[·|]$)/, /([.!?]+\s+|[.!?]+$)/, /([:;,]+\s+|[:;,]+$)/];
  function porNiveles(c, nivel) {
    const ps = c.split(CORTES[nivel]); let hay = false, out = '', k = 0;
    while (k < ps.length) {
      let usado = false, j = Math.min(ps.length - 1, k + 6); if ((j - k) % 2) j--;
      for (; j >= k && !usado; j -= 2) {   // primero la racha más larga de trozos seguidos (hay claves de varias frases), después cada trozo solo
        const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(ps.slice(k, j + 1).join('')); if (!m[2]) continue;
        const sep = ps[j + 1] !== undefined ? ps[j + 1] : '', punt = sep.trim(), esPunt = punt && !/[·|]/.test(punt);
        let r, consume = false;
        if (esPunt) { r = fraseConPunto(m[2] + punt); consume = r !== undefined; }   // «Texto.» con su punto, si así está en el diccionario
        if (r === undefined) r = j === k ? frase(m[2]) : fraseRacha(m[2]);
        if (r === undefined && j === k) {
          const t = trozo(m[2]); if (t !== m[2]) r = t;
          if (r === undefined && nivel + 1 < CORTES.length) r = porNiveles(m[2], nivel + 1);
        }
        if (r !== undefined) { out += m[1] + r + m[3] + (consume ? sep.slice(punt.length) : sep); hay = true; usado = true; k = j + 2; }
      }
      if (!usado) { out += ps[k] + (ps[k + 1] !== undefined ? ps[k + 1] : ''); k += 2; }
    }
    return hay ? out : undefined;
  }
  const porTrozos = c => porNiveles(c, 0);
  // lo que va delante de un texto («: » del chat) y los signos de apertura (¡ ¿) que en inglés no se ponen
  function envuelta(c) {
    const pre = /^([:;·|-]+\s+)([\s\S]+)$/.exec(c);
    if (pre) { const r = interior(pre[2]); return r === undefined ? undefined : pre[1] + r; }
    const ex = /^([¡¿])([\s\S]+?)([!?])$/.exec(c);
    if (ex) { const r = interior(ex[2]); return r === undefined ? undefined : r + ex[3]; }
    return undefined;
  }
  // varias maneras de traducir un texto que no está entero en el diccionario: se queda la que deja menos español
  const restos = s => (s.match(ESPANOL_G) || []).length;
  const interior = c => {
    const r = frase(c); if (r !== undefined) return r;
    const t = trozo(c), cands = t !== c ? [t] : [];
    for (const x of [envuelta(c), porTrozos(c)]) if (x !== undefined) cands.push(x);
    return cands.length ? cands.reduce((a, b) => (restos(b) < restos(a) ? b : a)) : undefined;
  };
  // una frase (con sus espacios de los lados, que se respetan); si no hay traducción, se queda como está
  function traduce(s) {
    if (actual === 'es' || typeof s !== 'string' || !/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(s)) return s;
    let r = memo.get(s); if (r !== undefined) return r;
    const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(s), c = m[2].replace(/\s+/g, ' ');   // los saltos de línea y los espacios de dentro valen como uno
    r = interior(c);
    r = r === undefined ? s : m[1] + r + m[3];
    if (depura && ESPANOL.test(r)) sin.add(s);
    if (memo.size > 6000) memo.clear();
    memo.set(s, r); memo.set(r, r);   // el resultado ya está traducido: si el navegador avisa de que ha cambiado, no se vuelve a tocar
    return r;
  }
  const tr = (s, datos) => { const r = traduce(s); return datos ? r.replace(/\{(\w+)\}/g, (m, k) => (k in datos ? datos[k] : m)) : r; };
  // traduce, dentro de un objeto o una lista, todo texto que tenga traducción (los datos del juego: cartas, habilidades, chat…)
  function datos(...cosas) {
    if (actual === 'es') return;
    const visto = new Set();
    const ir = o => {
      if (!o || typeof o !== 'object' || visto.has(o)) return; visto.add(o);
      for (const k of Array.isArray(o) ? o.keys() : Object.keys(o)) { const v = o[k]; if (typeof v === 'string') { const r = traduce(v); if (r !== v) o[k] = r; } else ir(v); }
    };
    cosas.forEach(ir);
  }
  /* ---------- lo que sale en pantalla ---------- */
  const ATRIBUTOS = ['title', 'aria-label', 'placeholder', 'alt'], SALTAR = /^(SCRIPT|STYLE|TEXTAREA|CANVAS|CODE)$/;
  function nodo(n) {
    if (n.nodeType === 3) { const r = traduce(n.nodeValue); if (r !== n.nodeValue) n.nodeValue = r; return; }
    if (n.nodeType !== 1) return;
    if (n.getAttribute('translate') === 'no') return;   // lo que lleva translate="no" (el panel de desarrollo) se deja como está
    for (const a of ATRIBUTOS) if (n.hasAttribute(a)) { const v = n.getAttribute(a), r = traduce(v); if (r !== v) n.setAttribute(a, r); }
    if (SALTAR.test(n.tagName)) return;   // de los canvas y los campos de texto solo se traducen los atributos
    for (let c = n.firstChild; c; c = c.nextSibling) nodo(c);
  }
  let vigia = null;
  function procesa(ms) {
    for (const m of ms) {
      if (m.type === 'characterData') nodo(m.target);
      else if (m.type === 'attributes') { const v = m.target.getAttribute(m.attributeName), r = traduce(v); if (r !== v) m.target.setAttribute(m.attributeName, r); }
      else for (const n of m.addedNodes) nodo(n);
    }
  }
  function pantalla() {
    if (actual === 'es' || vigia) return;
    nodo(document.documentElement);
    vigia = new MutationObserver(procesa);
    vigia.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATRIBUTOS });
  }
  // traduce ya lo que el juego acaba de escribir, sin esperar al aviso del navegador (lo usa el comparador de herramientas/pruebas/)
  const vacia = () => { if (vigia) procesa(vigia.takeRecords()); };
  return { actual, add, traduce, tr, datos, pantalla, vacia, pendientes: () => [...sin], cual: c => huecos.filter(h => h.re.test(c)).map(h => h.k) };
})();
const tr = IDIOMA.tr;
