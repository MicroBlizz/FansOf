// Fans of Asalto · DOMINIO · El equipo del jugador: el campo (6 huecos: 0-2 el frente de arriba abajo, 3-5 atrás; los que no están
// abiertos no se usan) y el banquillo (los recién llegados que no caben; no pelean). Un sitio es { donde: 'campo' | 'banquillo', i }.
// Es un valor congelado: recibir, mover, absorber o ascender devuelven otro equipo, o un error con nombre.
'use strict';
AS.equipo = (() => {
  const congela = e => Object.freeze({ abiertos: e.abiertos, tope: e.tope, campo: Object.freeze(e.campo.slice()), banquillo: Object.freeze(e.banquillo.slice()) });
  // abiertos: cuántos huecos del campo valen (los primeros del orden ABRE); tope: lo que cabe en el banquillo
  const ABRE = [0, 1, 3, 4, 2, 5];   // el orden en que se abren: con 5, queda cerrado el de atrás abajo
  const abierto = (e, i) => ABRE.indexOf(i) < e.abiertos;

  function vacio(datos, abiertos) {
    const C = datos.campo, n = Math.max(1, Math.min(C.huecos, abiertos || C.abiertos));
    return congela({ abiertos: n, tope: C.banquillo, campo: Array(C.huecos).fill(null), banquillo: [] });
  }
  const leer = (e, s) => (s.donde === 'campo' ? e.campo[s.i] : e.banquillo[s.i]) || null;
  const enCampo = e => e.campo.map((h, i) => (h ? { h, i } : null)).filter(Boolean);
  const todos = e => [...enCampo(e).map(x => ({ h: x.h, sitio: { donde: 'campo', i: x.i } })), ...e.banquillo.map((h, i) => ({ h, sitio: { donde: 'banquillo', i } }))];
  const libres = e => ABRE.slice(0, e.abiertos).filter(i => !e.campo[i]);
  const hayHueco = e => libres(e).length > 0 || e.banquillo.length < e.tope;

  // un héroe nuevo: a un hueco libre de su fila preferida, o a cualquier otro; si no hay, al banquillo
  function recibe(datos, e, h) {
    const fila = datos.heroes[h.tipo].fila === 'atras' ? [3, 4, 5] : [0, 1, 2];
    const l = libres(e), i = l.find(x => fila.includes(x));
    const hueco = i !== undefined ? i : l[0];
    if (hueco !== undefined) { const campo = e.campo.slice(); campo[hueco] = h; return AS.ok(congela({ ...e, campo })); }
    if (e.banquillo.length >= e.tope) return AS.error('sin-sitio');
    return AS.ok(congela({ ...e, banquillo: [...e.banquillo, h] }));
  }
  function quita(e, s) {
    const campo = e.campo.slice(), banquillo = e.banquillo.slice();
    if (s.donde === 'campo') campo[s.i] = null; else banquillo.splice(s.i, 1);
    return { ...e, campo, banquillo };
  }
  // mover a un hueco vacío y abierto del campo, o al banquillo si cabe
  function mueve(e, desde, hasta) {
    const h = leer(e, desde);
    if (!h) return AS.error('nadie-ahi');
    if (hasta.donde === 'campo') {
      if (!abierto(e, hasta.i)) return AS.error('hueco-cerrado');
      if (e.campo[hasta.i]) return AS.error('hueco-ocupado');
      const n = quita(e, desde); n.campo[hasta.i] = h;
      return AS.ok(congela(n));
    }
    if (desde.donde === 'banquillo') return AS.ok(e);
    if (e.banquillo.length >= e.tope) return AS.error('banquillo-lleno');
    const n = quita(e, desde); n.banquillo.push(h);
    return AS.ok(congela(n));
  }
  // el de `hasta` absorbe al de `desde` (que desaparece)
  function absorbe(datos, e, desde, hasta) {
    const a = leer(e, desde), b = leer(e, hasta);
    if (!a || !b) return AS.error('nadie-ahi');
    const r = AS.heroe.absorbe(datos, b, a);
    if (!r.ok) return r;
    // primero se coloca al que queda y luego se quita al absorbido (si los dos son del banquillo, el índice se corrige)
    const n = { ...e, campo: e.campo.slice(), banquillo: e.banquillo.slice() };
    if (hasta.donde === 'campo') n.campo[hasta.i] = r.valor; else n.banquillo[hasta.i] = r.valor;
    if (desde.donde === 'campo') n.campo[desde.i] = null; else n.banquillo.splice(desde.i, 1);
    return AS.ok({ equipo: congela(n), heroe: r.valor });
  }
  // cambia al héroe de un sitio por otro (el mismo, ya crecido)
  function pon(e, sitio, h) {
    const n = { ...e, campo: e.campo.slice(), banquillo: e.banquillo.slice() };
    if (sitio.donde === 'campo') n.campo[sitio.i] = h; else n.banquillo[sitio.i] = h;
    return congela(n);
  }
  const sitioDe = (e, id) => { const x = todos(e).find(t => t.h.id === id); return x ? x.sitio : null; };
  function asciende(datos, e, sitio, clase) {
    const h = leer(e, sitio);
    if (!h) return AS.error('nadie-ahi');
    const r = AS.heroe.asciende(datos, h, clase);
    if (!r.ok) return r;
    return AS.ok({ equipo: pon(e, sitio, r.valor), heroe: r.valor });
  }
  // los puntos de cada clase con los héroes del campo, y el nivel de cada habilidad de clase (0 = apagada)
  function sinergias(datos, e) {
    const puntos = {}, nivel = {};
    for (const { h } of enCampo(e)) { const p = AS.heroe.puntos(datos, h); for (const k in p) puntos[k] = (puntos[k] || 0) + p[k]; }
    for (const k in datos.clases) nivel[k] = datos.clases[k].umbral.filter(u => (puntos[k] || 0) >= u).length;
    return { puntos, nivel };
  }
  function deJSON(datos, j) {
    const e = vacio(datos, j && j.abiertos);
    const campo = e.campo.slice(), banquillo = [];
    for (let i = 0; i < campo.length; i++) {
      const jh = j && j.campo && j.campo[i];
      if (!jh) continue;
      const r = AS.heroe.deJSON(datos, jh);
      if (!r.ok || !abierto(e, i)) return AS.error('equipo-invalido');
      campo[i] = r.valor;
    }
    for (const jh of ((j && j.banquillo) || []).slice(0, e.tope)) { const r = AS.heroe.deJSON(datos, jh); if (!r.ok) return AS.error('equipo-invalido'); banquillo.push(r.valor); }
    return AS.ok(congela({ ...e, campo, banquillo }));
  }
  return { ABRE, vacio, abierto, leer, enCampo, todos, libres, hayHueco, recibe, mueve, absorbe, pon, sitioDe, asciende, sinergias, deJSON };
})();
