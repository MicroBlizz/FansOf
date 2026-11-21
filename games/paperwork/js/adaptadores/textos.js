// Fans Of Paperwork · adaptador · TEXTOS: cómo se escriben los números y los tiempos en pantalla. Las cifras del idle crecen mucho: a partir del
// millar se abrevian (1,2 K, 3,4 M, 5,6 mil M…). Los textos pasan por tr() (los diccionarios de idioma/).
'use strict';
PW.txt = (() => {
  const SUF = [[1e12, 'B'], [1e9, 'mil M'], [1e6, 'M'], [1e3, 'K']];
  function num(n) {
    n = Math.floor(n || 0);
    if (Math.abs(n) < 10000) return fmt(n);
    const [d, s] = SUF.find(([div]) => Math.abs(n) >= div);
    const v = n / d;
    return fmtV(v >= 100 ? Math.floor(v) : Math.floor(v * 10) / 10) + ' ' + tr(s);
  }
  // segundos en texto: «45 s», «3 min 20 s», «1 h 5 min», y desde 2 días «2 d 23 h»
  function tiempo(s) {
    s = Math.max(0, Math.ceil(s));
    if (s < 60) return tr('{s} s', { s });
    const m = Math.floor(s / 60), h = Math.floor(m / 60);
    if (!h) return s % 60 ? tr('{m} min {s} s', { m, s: s % 60 }) : tr('{m} min', { m });
    if (h >= 48) { const d = Math.floor(h / 24); return h % 24 ? tr('{d} d {h} h', { d, h: h % 24 }) : tr('{d} d', { d }); }
    return m % 60 ? tr('{h} h {m} min', { h, m: m % 60 }) : tr('{h} h', { h });
  }
  // segundos en reloj corto, para los botones estrechos: «9:05», «1:02:30»
  function reloj(s) {
    s = Math.max(0, Math.ceil(s));
    const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, dd = v => String(v).padStart(2, '0');
    return (h ? h + ':' + dd(m) : m) + ':' + dd(s % 60);
  }
  const pct = p => fmtV(Math.round(p * 1000) / 10) + ' %';
  // lo que lee cada vistazo, en singular si sale una hoja (tarea #135): la cifra se redondea hacia abajo como en num()
  const hojasVistazo = v => (Math.floor(v || 0) === 1 ? tr('1 hoja por vistazo') : tr('{n} hojas por vistazo', { n: num(v) }));
  return { num, tiempo, reloj, pct, hojasVistazo };
})();
