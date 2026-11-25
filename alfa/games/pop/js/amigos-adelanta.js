// Fans of Pop · «TE HA ADELANTADO UN AMIGO», reglas (dominio; tarea 384, ADR 224). Funciones puras: sin reloj, azar, SAVE, red ni dibujo.
// · foto(amigos, yo): por dónde ibais tú y cada amigo, para guardarla en la partida ({ yo: [mundo, nivel], amigos: { codigo: [mundo, nivel] } }).
// · revisa(fotoVieja, amigos, yo): compara la foto guardada con el latido de ahora y devuelve { adelanto, foto }: adelanto es el amigo que NO iba
//   por delante de ti en la foto y ahora sí (si son varios, el más cercano a ti), o null; foto es la nueva. Sin foto vieja (la primera vez), con
//   un amigo que no salía en ella (amigo nuevo) o si tú vas por detrás de donde ibas (empezaste de nuevo) no hay adelanto. Una foto rota no cuenta.
// Mundo y nivel en base 0, como los trae pop_amigos (js/amigos-reglas.js) y ppAmigosPosicion. Lo que sale va congelado; las entradas no se tocan.
'use strict';
const PP_ADELANTA = Object.freeze((() => {
  const MAX_AMIGOS = 100;
  const entero = n => (typeof n === 'number' && Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : null);
  // [mundo, nivel] de un { mundo, nivel } o de un par guardado; null si no vale
  const par = p => {
    const [m, n] = Array.isArray(p) ? p : [p && p.mundo, p && p.nivel];
    const mundo = entero(m), nivel = entero(n);
    return mundo === null || nivel === null ? null : Object.freeze([mundo, nivel]);
  };
  // a va por delante de b
  const delante = (a, b) => a[0] > b[0] || (a[0] === b[0] && a[1] > b[1]);
  // cuántos niveles «de distancia» para elegir el más cercano: primero el mundo, luego el nivel
  const cerca = (a, b) => (a[0] - b[0]) || (a[1] - b[1]);
  const lista = x => (Array.isArray(x) ? x : []);
  const codigoDe = a => (a && typeof a.codigo === 'string' && a.codigo ? a.codigo : null);
  function foto(amigos, yo) {
    const p = par(yo);
    if (!p) return null;
    const dic = {};
    for (const a of lista(amigos).slice(0, MAX_AMIGOS)) {
      const c = codigoDe(a), q = par(a);
      if (c && q) dic[c] = q;
    }
    return Object.freeze({ yo: p, amigos: Object.freeze(dic) });
  }
  // la foto guardada, limpia; null si no sirve
  function leeFoto(f) {
    const yo = f && typeof f === 'object' ? par(f.yo) : null;
    if (!yo || !f.amigos || typeof f.amigos !== 'object') return null;
    return { yo, amigos: f.amigos };
  }
  function revisa(fotoVieja, amigos, yo) {
    const nueva = foto(amigos, yo), vieja = leeFoto(fotoVieja);
    // si tú has ido hacia atrás (empezar de nuevo, partida borrada), nadie te ha adelantado: solo se rehace la foto
    if (!nueva || !vieja || delante(vieja.yo, nueva.yo)) return Object.freeze({ adelanto: null, foto: nueva });
    let mejor = null, mejorPar = null;
    for (const a of lista(amigos).slice(0, MAX_AMIGOS)) {
      const c = codigoDe(a), ahora = par(a), antes = c && Object.prototype.hasOwnProperty.call(vieja.amigos, c) ? par(vieja.amigos[c]) : null;
      if (!ahora || !antes || delante(antes, vieja.yo) || !delante(ahora, nueva.yo)) continue;
      if (!mejorPar || cerca(ahora, mejorPar) < 0) { mejor = a; mejorPar = ahora; }
    }
    return Object.freeze({ adelanto: mejor, foto: nueva });
  }
  return { foto, revisa, delante };
})());
if (typeof module !== 'undefined') module.exports = PP_ADELANTA;
