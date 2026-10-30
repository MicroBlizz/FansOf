// Fans of Ratkov · TEXTOS: en el código y en los datos todo va en español; el inglés está en idioma/en*.js y solo se carga si juegas
// en inglés. tr() es el de core; trf('Has usado: %1.', nombre) traduce y rellena los huecos. Para probar: ?idioma=en
'use strict';
function trf(s, ...v) { let t = tr(s); v.forEach((x, i) => { t = t.split('%' + (i + 1)).join(x); }); return t; }
