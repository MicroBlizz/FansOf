// Fans of Asalto · DOMINIO · Los legendarios y el Despertar DENTRO de la partida (tarea #109; reglas sueltas en legendario.js).
// Cada vez que el equipo cambia, la partida llama a revisa: el héroe que llega al nivel de legendario se hace legendario si cabe en el
// tope (uno en la partida normal, dos en la larga) y deja un aviso; y si un legendario tiene un Despertar por elegir (solo los abiertos
// con plumas fuera de la partida: el Poder Dormido), se abre UNA oferta de 3 cartas. Mientras hay oferta no se lucha.
// El estado es un valor congelado: { abiertos: Despertares abiertos (0 a 3), oferta: null | { id del héroe, cartas, cambiada } }.
// Avisos para la pantalla: { tipo: 'legendario', id, sitio, clave }, { tipo: 'ser', id, sitio, clave } y (tarea #156)
// { tipo: 'dios', id, sitio, clave: id del dios }. Puro: el azar se pasa.
'use strict';
AS.despertar = (() => {
  const LG = AS.legendario;
  const congelaOferta = o => (o ? Object.freeze({ id: o.id, cartas: Object.freeze(o.cartas.slice()), cambiada: !!o.cambiada }) : null);
  const congela = (abiertos, oferta) => Object.freeze({ abiertos, oferta: congelaOferta(oferta) });
  const tope = datos => datos.legendarios.despertar.length;
  // abiertos: los Despertares abiertos con plumas (0 a 3; lo que no valga, 0)
  const nuevo = (datos, abiertos) => congela(Math.min(tope(datos), Math.max(0, Math.floor(abiertos) || 0)), null);
  // la partida es larga (caben más legendarios) en el modo sin fin o desde la segunda dificultad
  const larga = (sinFin, dificultad) => !!sinFin || dificultad >= 1;
  const heroes = e => AS.equipo.todos(e).map(x => x.h);
  const buscaHeroe = (e, id) => AS.equipo.todos(e).find(x => x.h.id === id) || null;

  // los que ya pueden ser legendarios lo son: { equipo, avisos }
  function nacen(datos, equipo, esLarga) {
    let e = equipo;
    const avisos = [];
    for (const { h, sitio } of AS.equipo.todos(equipo)) {
      if (LG.es(datos, h) || !LG.puedeSer(datos, heroes(e), h, esLarga)) continue;
      const r = LG.hazLegendario(datos, h);
      if (!r.ok) continue;
      e = AS.equipo.pon(e, sitio, r.valor);
      avisos.push({ tipo: 'legendario', id: h.id, sitio, clave: LG.clave(h) });
    }
    return { equipo: e, avisos };
  }
  // el primer legendario con un Despertar por elegir (o null)
  const pendiente = (datos, equipo, abiertos) => AS.equipo.todos(equipo).find(x => LG.pendientes(datos, x.h, abiertos) > 0) || null;
  // abre la oferta si no hay ninguna y alguien la espera (sin azar no se abre: se abrirá en la siguiente acción con azar)
  function abre(datos, equipo, s, azar) {
    if (s.oferta || !azar) return s;
    const x = pendiente(datos, equipo, s.abiertos);
    if (!x) return s;
    const cartas = LG.oferta(datos, x.h, azar);
    return cartas.length ? congela(s.abiertos, { id: x.h.id, cartas, cambiada: false }) : s;
  }
  // lo que la partida hace cada vez que cambia el equipo: { equipo, estado, avisos, cambio (si hay que olvidar el deshacer) }
  function revisa(datos, equipo, s, esLarga, azar) {
    const n = nacen(datos, equipo, esLarga), estado = abre(datos, n.equipo, s, azar);
    return { equipo: n.equipo, estado, avisos: n.avisos, cambio: n.avisos.length > 0 || estado !== s };
  }
  // el aviso de un ser o de un dios recién nacido al unir (antes: el que se quedaba, tal como era; heroe: el que ha quedado)
  function avisoSer(antes, heroe, sitio) {
    if (heroe.dios && !(antes && antes.dios)) return [{ tipo: 'dios', id: heroe.id, sitio, clave: heroe.dios }];
    return heroe.ser && !(antes && antes.ser) ? [{ tipo: 'ser', id: heroe.id, sitio, clave: heroe.ser.clave }] : [];
  }
  // por qué no se puede luchar (o null)
  const bloquea = s => (s.oferta ? 'elige-carta' : null);

  // elegir una de las 3 cartas: el legendario la gana, se cierra la oferta y, si le quedan Despertares (a él o a otro), se abre la siguiente
  function elige(datos, equipo, s, carta, azar) {
    if (!s.oferta) return AS.error('sin-oferta');
    if (!s.oferta.cartas.includes(carta)) return AS.error('no-esta-en-la-oferta');
    const x = buscaHeroe(equipo, s.oferta.id);
    if (!x) return AS.error('nadie-ahi');
    const r = AS.heroe.conCarta(datos, x.h, carta);
    if (!r.ok) return r;
    const e = AS.equipo.pon(equipo, x.sitio, r.valor);
    return AS.ok({ equipo: e, estado: abre(datos, e, congela(s.abiertos, null), azar), heroe: r.valor });
  }
  // otras 3 cartas (el anuncio: AS.anuncios mira que sea una vez por oferta). Si quedan, distintas de las de ahora
  function cambia(datos, equipo, s, azar) {
    const x = s.oferta && buscaHeroe(equipo, s.oferta.id);
    if (!x) return s;
    const otras = LG.oferta(datos, { cartas: [...x.h.cartas, ...s.oferta.cartas] }, azar);
    const cartas = otras.length >= s.oferta.cartas.length ? otras : LG.oferta(datos, x.h, azar);
    return congela(s.abiertos, { id: x.h.id, cartas, cambiada: true });
  }

  // la esencia de la Cosecha que trae el resultado de la batalla (B.cosecha; si no viene, 0)
  const cosecha = res => Math.max(0, Math.floor(res && res.cosecha) || 0);

  // de la partida guardada: la oferta vale si su héroe está, le queda un Despertar y sus cartas existen, son distintas y no las tiene
  function ofertaValida(datos, equipo, abiertos, j) {
    const x = j && typeof j.id === 'string' && buscaHeroe(equipo, j.id);
    if (!x || LG.pendientes(datos, x.h, abiertos) <= 0 || !Array.isArray(j.cartas)) return null;
    const vale = c => typeof c === 'string' && !!datos.legendarios.cartas[c] && !x.h.cartas.includes(c);
    const cartas = j.cartas.filter((c, i) => vale(c) && j.cartas.indexOf(c) === i);
    return cartas.length && cartas.length === j.cartas.length && cartas.length <= 3 ? { id: x.h.id, cartas, cambiada: j.cambiada === true } : null;
  }
  function deJSON(datos, equipo, j, abiertos) {
    const a = nuevo(datos, abiertos).abiertos;
    return congela(a, ofertaValida(datos, equipo, a, j));
  }
  return { nuevo, larga, nacen, abre, revisa, avisoSer, bloquea, elige, cambia, cosecha, deJSON };
})();
