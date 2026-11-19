// Fans of Asalto · ADAPTADORES · Lo que se ve de los LEGENDARIOS fuera de la batalla (tarea #109), en las ventanas de pergamino:
// la pantalla «¡NACE UN LEGENDARIO!» y la de «¡SER SECRETO!» (al aviso de la partida: destello y columna de luz donde está, y luego su
// cartel con su nombre y sus poderes), la ventana del DESPERTAR (3 cartas, se toca una y se confirma; otras 3 con anuncio), el camino del
// héroe en su ficha (Superior, Legendario y los tres Despertares) y las filas del Poder Dormido en las mejoras del menú.
// Llama a los casos de uso y enseña lo que devuelven: no decide reglas.
'use strict';
AS.ventanas.leyendas = (() => {
  const V = AS.ventanas, D = AS.dibujos, fx = AS.fx, LG = AS.legendario, ico = V.ico, btn = V.btn;
  const L = () => ASALTO.legendarios;
  const ROMANO = ['I', 'II', 'III'];
  const S = { cola: [], mostrando: false, espera: false };
  const heroeDe = (E, id) => AS.equipo.todos(E.casos.partida.equipo).find(x => x.h.id === id) || null;
  const retrato = (h, k) => `<i class="as-retrato as-pix${h.dorado ? ' as-dorado' : ''}" style="${D.cssRetrato(D.cual(AS.aspecto.deHeroe(ASALTO, h), h.tipo), k)}"></i>`;
  const poder = (icono, titulo, txt) => `<div class="as-ley-poder">${icono}<div><b>${titulo}</b><span>${txt}</span></div></div>`;
  const cumbre = rama => poder(ico('clase-' + rama, 'as-ico2'), tr(L().cumbres[rama].nombre), tr(L().cumbres[rama].txt));

  /* ---------- nace un legendario, nace un ser: primero la luz en el campo, luego su cartel ---------- */
  function luz(E, a, ser) {
    const s = AS.pantalla.puntoDe(a.sitio);
    AS.pantalla.E.ascensos.set(a.id, 1.4);
    const cols = ser ? [[255, 90, 210], [90, 224, 255]] : [[255, 215, 90], [255, 243, 214]];
    for (const c of cols) fx.columna(s.x, s.y, c, 760);
    fx.onda(s.x, s.y - 40, 130, ser ? '#ff7a1a' : '#ffd23a'); fx.onda(s.x, s.y - 40, 90, ser ? '#5ae0ff' : '#fff3d6');
    for (let i = 0; i < 4; i++) fx.brasas(s.x, s.y - 20 - i * 30, 12, ser ? '#5ae0ff' : '#ffd23a', 50);
    fx.fogonazo(ser ? 0.9 : 0.7, '#fff3d6'); fx.sacude(ser ? 16 : 12);
    AS.suena('gordo');
  }
  function htmlNace(h) {
    const d = LG.datosDe(ASALTO, h);
    return `<h2>${tr('¡NACE UN LEGENDARIO!')}</h2><div class="as-ley-cara">${retrato(h, 3)}</div><p class="as-ley-nombre">${tr(d.nombre)}</p>
      <p class="as-nota">${ASALTO.heroes[h.tipo].nombre} · ${tr(ASALTO.ramas[h.rama].titulo)}</p>
      <h3>${tr('PODER CUMBRE')}</h3>${cumbre(h.rama)}<h3>${tr('HABILIDAD ÚNICA')}</h3>${poder('', tr('Solo suya'), tr(d.txt))}`;
  }
  function htmlSer(h) {
    const d = LG.datosDe(ASALTO, h), lista = h.ser.padres.map(k => L().lista[k]);
    return `<h2>${tr('¡SER SECRETO!')}</h2><div class="as-ley-cara as-ley-ser">${retrato(h, 3)}</div><p class="as-ley-nombre">${tr(d.nombre)}</p>
      <p class="as-nota">${tr('Dos legendarios unidos en uno: más grande y más fuerte')}</p>
      <h3>${tr('SUS DOS HABILIDADES')}</h3>${lista.map(x => poder('', tr(x.nombre), tr(x.txt))).join('')}
      <h3>${tr('SUS PODERES CUMBRE')}</h3>${d.cumbres.map(cumbre).join('')}`;
  }
  function cartel(E, a) {
    const x = heroeDe(E, a.id);
    if (!x) { S.mostrando = false; sigue(E); return; }
    const ser = a.tipo === 'ser', modal = $('#as-modal');
    modal.classList.add('as-modal-luz');
    V.abre((ser ? htmlSer(x.h) : htmlNace(x.h)) + btn('as-ley-seguir', tr('¡VAMOS!'), 'as-oro as-enorme'), 'as-leyenda' + (ser ? ' as-ley-de-ser' : ''));
    AS.suena(ser ? 'asciende' : 'premio', 3);
    V.alPulsar('as-ley-seguir', () => { modal.classList.remove('as-modal-luz'); V.cierra(); S.mostrando = false; sigue(E); });
  }
  // enseña el siguiente aviso de la cola cuando no haya otra ventana delante
  function sigue(E) {
    if (S.mostrando || S.espera || !S.cola.length) return;
    if (V.abierta()) { S.espera = true; setTimeout(() => { S.espera = false; sigue(E); }, 400); return; }
    const a = S.cola.shift();
    S.mostrando = true;
    luz(E, a, a.tipo === 'ser');
    setTimeout(() => cartel(E, a), 900);
  }
  // un aviso de la partida: si es de un legendario o de un ser, a la cola (devuelve true); si no, no es suyo
  function avisa(E, a) {
    if (a.tipo !== 'legendario' && a.tipo !== 'ser') return false;
    S.cola.push(a);
    sigue(E);
    return true;
  }

  /* ---------- el Despertar: elegir una de 3 cartas ---------- */
  const htmlCarta = (c, extra) => `<button class="as-carta as-ley-carta" data-carta="${c.id}" type="button"><b>${tr(c.nombre)}</b><span>${tr(c.txt)}</span>${extra || ''}</button>`;
  const romanoDe = (E, o) => { const x = heroeDe(E, o.id); return ROMANO[Math.min(2, x ? x.h.cartas.length : 0)]; };
  function despertar(E) {
    const o = E.casos.oferta();
    if (!o) return;
    AS.consejos.hecho(E, 'despertar');
    const t = V.abre(`<h2>${tr('DESPERTAR {r}', { r: romanoDe(E, o) })}</h2><p class="as-ley-nombre">${tr(o.nombre)}</p>
      <p class="as-nota">${tr('Elige una carta: la tendrá toda la partida.')}</p>${o.cartas.map(c => htmlCarta(c)).join('')}
      ${o.puedeCambiar ? btn('as-ley-otras', tr('OTRAS 3 CARTAS · ANUNCIO'), 'as-oro') : ''}<br>${btn('as-ley-luego', tr('LUEGO'), 'as-azul as-chico')}
      <p class="as-nota">${tr('Hasta que elijas, no se puede luchar.')}</p>`, 'as-leyenda');
    for (const b of t.querySelectorAll('[data-carta]')) b.onclick = () => { AS.suena('clic'); confirma(E, o, o.cartas.find(c => c.id === b.dataset.carta)); };
    V.alPulsar('as-ley-otras', () => V.anuncio(() => { E.casos.cambiaCartas(); despertar(E); }));
    V.alPulsar('as-ley-luego', V.cierra);
  }
  // como al UNIR: la carta elegida, en grande, y se confirma o se vuelve a las 3
  function confirma(E, o, c) {
    V.abre(`<h2>${tr('¿ESTA CARTA?')}</h2><p class="as-ley-nombre">${tr(o.nombre)}</p>${htmlCarta(c)}<p class="as-nota">${tr('Después no se puede cambiar.')}</p>
      <div class="as-fila">${btn('as-ley-si', tr('ELEGIR'), 'as-verde')}${btn('as-ley-no', tr('OTRA'), 'as-naranja')}</div>`, 'as-leyenda');
    V.alPulsar('as-ley-no', () => despertar(E));
    V.alPulsar('as-ley-si', () => {
      const r = E.casos.eligeCarta(c.id);
      V.cierra();
      if (!r.ok) return;
      const s = AS.pantalla.puntoDe(o.sitio);
      AS.pantalla.E.ascensos.set(o.id, 1);
      fx.columna(s.x, s.y, [255, 215, 90], 420); fx.onda(s.x, s.y - 40, 100, '#ffd23a'); fx.brasas(s.x, s.y - 20, 20, '#ffd23a', 40); fx.fogonazo(0.35, '#ffe9a0'); fx.sacude(6);
      AS.pantalla.cartel(tr('¡DESPERTAR!'), tr(c.nombre), '#c8901c', 1.6);
      AS.suena('asciende');
      if (E.casos.oferta()) setTimeout(() => despertar(E), 1700);   // otro legendario (o él) aún tiene un Despertar por elegir
    });
  }
  // al tocar a un héroe: si es el que espera a elegir su carta, se abre el Despertar en vez de su ficha (devuelve true)
  function abreSiEspera(E, h) {
    const o = E.casos.oferta();
    if (!o || o.id !== h.id) return false;
    despertar(E);
    return true;
  }

  /* ---------- el camino del héroe, en su ficha ---------- */
  function hitos(h, abiertos) {
    const N = ASALTO.niveles.ascenso, es = LG.es(ASALTO, h), d = LG.datosDe(ASALTO, h), nv = n => tr('Nivel {n}', { n });
    const lista = [{ titulo: tr('Superior'), n: N, hecho: !!h.rama, txt: h.rama ? tr(ASALTO.ramas[h.rama].titulo) : nv(N) },
      { titulo: tr('Legendario'), n: L().nivel, hecho: es, txt: es && d ? tr(d.nombre) : nv(L().nivel) }];
    L().despertar.forEach((n, i) => {
      const carta = h.cartas[i], cerrado = i >= abiertos;
      const txt = carta ? tr(L().cartas[carta].nombre) : cerrado ? tr('Se abre con plumas: Poder Dormido') : nv(n);
      lista.push({ titulo: tr('Despertar {r}', { r: ROMANO[i] }), n, hecho: !!carta, cerrado: cerrado && !carta, txt });
    });
    return lista;
  }
  function htmlPoderes(h) {
    if (!LG.es(ASALTO, h)) return '';
    const d = LG.datosDe(ASALTO, h);
    if (h.ser) return h.ser.padres.map(k => poder('', tr(L().lista[k].nombre), tr(L().lista[k].txt))).join('') + d.cumbres.map(cumbre).join('');
    return cumbre(h.rama) + poder('', tr('Habilidad única'), tr(d.txt));
  }
  // abiertos: los Despertares abiertos con plumas en esta partida
  function camino(h, abiertos) {
    const filas = hitos(h, abiertos).map(x => `<li class="as-hito ${x.hecho ? 'as-si' : x.cerrado ? 'as-cerrado' : 'as-no'}"><i class="as-pip"></i><div><b>${x.titulo} <small>${tr('Nv {n}', { n: x.n })}</small></b><span>${x.txt}</span></div></li>`).join('');
    return `<h3>${tr('CAMINO DEL HÉROE')}</h3><ol class="as-camino">${filas}</ol>${htmlPoderes(h)}`;
  }

  /* ---------- el Poder Dormido, en las mejoras del menú ---------- */
  function filaDormido(casos, plumas, i) {
    const abiertos = casos.progreso.dormido, sig = casos.dormidoSiguiente();
    let fin = `<span class="as-candado">${tr('CERRADO')}</span>`, nota = tr('Los legendarios eligen carta al nivel {n}', { n: L().despertar[i] }), estado = 'as-cerrado';
    if (i < abiertos) { fin = `<span class="as-hecho">${tr('ABIERTO')}</span>`; estado = 'as-si'; }
    else if (sig && i === sig.i - 1) {
      fin = `<button class="as-btn as-oro as-chico" id="as-abre-dormido" type="button">${ico('pluma')}${plumas}</button>`; estado = 'as-no';
      if (sig.falta) nota += `<em class="as-ley-falta">${tr('Te faltan {n} plumas', { n: plumas - casos.progreso.plumas })}</em>`;
    }
    return `<li class="as-item as-dormido ${estado}"><i class="as-pip"></i><div><b>${tr('Despertar {r}', { r: ROMANO[i] })}</b><span>${nota}</span></div>${fin}</li>`;
  }
  function dormido(casos) {
    return `<h2>${tr('PODER DORMIDO')}</h2><p class="as-nota">${tr('Abre los Despertares de tus legendarios: en cada uno eligen una carta de poder. Vale para las partidas nuevas.')}</p>
      <ul class="as-lista">${L().dormido.map((p, i) => filaDormido(casos, p, i)).join('')}</ul>`;
  }
  // ¿hay un legendario o un ser por enseñar? (mientras tanto no salen los consejos)
  const ocupada = () => S.mostrando || S.cola.length > 0;
  return { avisa, ocupada, despertar, abreSiEspera, camino, dormido };
})();
