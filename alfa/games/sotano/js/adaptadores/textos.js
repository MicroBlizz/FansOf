// Fans Of Sótano · adaptador · TEXTOS: cómo se escriben los números y los tiempos en pantalla. Las cifras del idle crecen mucho: a partir del
// millar se abrevian (1,2 K, 3,4 M, 5,6 mil M…). Los textos pasan por tr() (los diccionarios de idioma/).
'use strict';
SO.txt = (() => {
  const SUF = [[1e12, 'B'], [1e9, 'mil M'], [1e6, 'M'], [1e3, 'K']];
  function num(n) {
    n = Math.floor(n || 0);
    if (Math.abs(n) < 10000) return fmt(n);
    const [d, s] = SUF.find(([div]) => Math.abs(n) >= div);
    const v = n / d;
    return fmtV(v >= 100 ? Math.floor(v) : Math.floor(v * 10) / 10) + ' ' + tr(s);
  }
  // segundos en texto: «45 s», «3 min 20 s», «1 h 5 min»
  function tiempo(s) {
    s = Math.max(0, Math.ceil(s));
    if (s < 60) return tr('{s} s', { s });
    const m = Math.floor(s / 60), h = Math.floor(m / 60);
    if (!h) return s % 60 ? tr('{m} min {s} s', { m, s: s % 60 }) : tr('{m} min', { m });
    return m % 60 ? tr('{h} h {m} min', { h, m: m % 60 }) : tr('{h} h', { h });
  }
  const pct = p => fmtV(Math.round(p * 1000) / 10) + ' %';
  return { num, tiempo, pct };
})();
