// Fans of Rally · adaptador · PANTALLAS: los menús en HTML encima del juego. Inicio, elegir piloto, elegir tramo (contrarreloj), la
// previa de cada tramo del campeonato, la pausa y los resultados. Solo hay una a la vez en #ra-menu; durante la carrera se esconde y
// se ve el marcador. Botones de colores de Fans Of (naranja, azul, verde, amarillo; nada de lila ni de gris).
'use strict';
RA.creaPantallas = ({ raiz, sesion, juego, vista }) => {
  const menu = raiz.querySelector('#ra-menu'), hud = raiz.querySelector('#ra-hud');
  const crea = (tag, props = {}, ...hijos) => { const e = Object.assign(document.createElement(tag), props); e.append(...hijos.filter(h => h !== null)); return e; };
  const boton = (texto, clase, accion) => crea('button', { className: `ra-boton ${clase}`, textContent: texto, onclick: () => { RA.sonido.suena('boton'); accion(); } });
  const ordinal = n => tr('Puesto {n}', { n });   // el «º» no está en la letra de píxel
  const nombreDe = id => (id === 'jugador' ? sesion.piloto().nombre : (RA.RIVALES.find(r => r.id === id) || {}).nombre || id);
  let modo = 'campeonato';

  function ve(...hijos) {
    juego.sal(); hud.hidden = true; menu.hidden = false;
    menu.replaceChildren(crea('div', { className: 'ra-pantalla' }, ...hijos));
    menu.scrollTop = 0;
  }
  function retrato(colores, tam = 96) {
    const cv = crea('canvas', { className: 'ra-retrato', width: 40, height: 44 });
    cv.style.width = tam + 'px'; cv.style.height = Math.round(tam * 1.1) + 'px';
    vista.retrato(cv, colores);
    return cv;
  }
  // ---- inicio
  function inicio() {
    RA.musica.quiere('raTitulo');
    const r = sesion.records, p = sesion.piloto();
    ve(crea('h1', { className: 'ra-logo' }, crea('small', { textContent: 'FANS OF' }), crea('b', { textContent: 'RALLY' })),
      crea('p', { className: 'ra-lema', textContent: tr('Rally de recreativa con los Animales Locos contra los coches de empresa de Microblizz.') }),
      crea('div', { className: 'ra-piloto-actual' }, retrato(p.colores, 84), crea('div', {}, crea('span', { textContent: tr('Tu piloto') }), crea('b', { textContent: p.nombre }))),
      crea('div', { className: 'ra-botones' },
        boton(tr('Campeonato'), 'ra-naranja', () => { modo = 'campeonato'; sesion.empiezaCampeonato(); previa(); }),
        boton(tr('Contrarreloj'), 'ra-azul', () => { modo = 'contrarreloj'; tramos(); }),
        boton(tr('Cambiar de piloto'), 'ra-verde', pilotos)),
      r.campeonato ? crea('p', { className: 'ra-nota', textContent: tr('Mejor campeonato: {p} puntos con {n}', { p: r.campeonato.puntos, n: (RA.PILOTOS.find(x => x.id === r.campeonato.piloto) || p).nombre }) }) : null);
  }
  // ---- pilotos
  function barra(nombre, v) { return crea('div', { className: 'ra-barra' }, crea('span', { textContent: tr(nombre) }), crea('i', { style: `--v:${Math.round((v - 0.88) / 0.24 * 100)}%` })); }
  function pilotos() {
    const lista = RA.PILOTOS.map(p => crea('button', { className: `ra-ficha${p.id === sesion.piloto().id ? ' ra-elegido' : ''}`, onclick: () => { RA.sonido.suena('boton'); sesion.eligePiloto(p.id); inicio(); } },
      retrato(p.colores, 64),
      crea('div', { className: 'ra-ficha-texto' }, crea('b', { textContent: p.nombre }), crea('small', { textContent: tr(p.lema) }),
        barra('Velocidad', p.velocidad), barra('Agarre', p.agarre), barra('Aceleración', p.aceleracion))));
    ve(crea('h2', { className: 'ra-titulo', textContent: tr('Elige piloto') }), crea('div', { className: 'ra-lista' }, ...lista), boton(tr('Volver'), 'ra-azul', inicio));
  }
  // ---- contrarreloj: elegir tramo
  function tramos() {
    const lista = RA.TRAMOS.map((t, i) => {
      const mejor = sesion.mejorVuelta(i);
      return crea('button', { className: `ra-tramo ra-tramo-${t.id}`, onclick: () => { RA.sonido.suena('boton'); corre(i); } },
        crea('b', { textContent: tr(t.nombre) }), crea('small', { textContent: tr(t.lema) }),
        crea('span', { textContent: mejor ? tr('Mejor vuelta: {t}', { t: RA.reloj(mejor) }) : tr('Sin tiempo todavía') }));
    });
    ve(crea('h2', { className: 'ra-titulo', textContent: tr('Contrarreloj') }),
      crea('p', { className: 'ra-lema', textContent: tr('Tres vueltas tú solo. Tu mejor vuelta se queda como fantasma para la próxima.') }),
      crea('div', { className: 'ra-lista' }, ...lista), boton(tr('Volver'), 'ra-azul', inicio));
  }
  // ---- campeonato: la previa de cada tramo
  function previa() {
    const t = sesion.temporada, tr0 = RA.TRAMOS[t.tramo];
    ve(crea('p', { className: 'ra-etiqueta', textContent: tr('Tramo {a} de {b}', { a: t.tramo + 1, b: RA.TRAMOS.length }) }),
      crea('h2', { className: `ra-titulo ra-grande ra-tramo-${tr0.id}`, textContent: tr(tr0.nombre) }),
      crea('p', { className: 'ra-lema', textContent: tr(tr0.lema) }),
      crea('ul', { className: 'ra-reglas' }, crea('li', { textContent: tr('Dos vueltas. Sales el último.') }),
        crea('li', { textContent: tr('Cada control y cada paso por meta suman tiempo. Si llega a cero, se acabó.') }),
        crea('li', { textContent: tr('Fuera de la carretera se frena mucho. En tierra, barro y nieve se derrapa.') })),
      boton(tr('¡A correr!'), 'ra-naranja', () => corre(t.tramo)), boton(tr('Abandonar'), 'ra-azul', inicio));
  }
  function corre(i) {
    menu.hidden = true; hud.hidden = false; vista.ajusta();
    juego.empieza(modo, i, carrera => (modo === 'campeonato' ? resultado(carrera) : finContrarreloj(carrera, i)));
  }
  // ---- resultados
  function tabla(filas) {
    return crea('ol', { className: 'ra-tabla' }, ...filas.map(([id, txt]) => crea('li', { className: id === 'jugador' ? 'ra-yo' : '' }, crea('span', { textContent: nombreDe(id) }), crea('b', { textContent: txt }))));
  }
  function resultado(carrera) {
    const sin = carrera.estado === 'sinTiempo', clasif = carrera.clasificacion();
    sesion.apuntaCarrera(clasif, sin);
    const t = sesion.temporada;
    if (t.acabado) return finCampeonato();
    RA.musica.jingle('raGana');
    ve(crea('p', { className: 'ra-etiqueta', textContent: tr('Tramo {a} terminado', { a: t.tramo }) }),
      crea('h2', { className: 'ra-titulo ra-grande', textContent: ordinal(carrera.puesto) }),
      crea('p', { className: 'ra-lema', textContent: tr('Puntos del campeonato') }),
      tabla(sesion.tabla().map(([id, p]) => [id, String(p)])),
      boton(tr('Siguiente tramo'), 'ra-naranja', previa), boton(tr('Abandonar'), 'ra-azul', inicio));
  }
  function finCampeonato() {
    const t = sesion.temporada, puesto = sesion.tabla().findIndex(([id]) => id === 'jugador') + 1;
    if (t.sinTiempo) {
      RA.musica.jingle('raPierde');
      return ve(crea('h2', { className: 'ra-titulo ra-grande ra-rojo', textContent: tr('SIN TIEMPO') }),
        crea('p', { className: 'ra-lema', textContent: tr('Game over. ¿Yeah? Microblizz se queda la copa y la pone en recepción.') }),
        boton(tr('Reintentar el campeonato'), 'ra-naranja', () => { sesion.empiezaCampeonato(); previa(); }), boton(tr('Menú'), 'ra-azul', inicio));
    }
    RA.musica.jingle(puesto === 1 ? 'raGana' : 'raPierde');
    ve(crea('p', { className: 'ra-etiqueta', textContent: tr('Campeonato terminado') }),
      crea('h2', { className: 'ra-titulo ra-grande', textContent: puesto === 1 ? tr('¡CAMPEÓN!') : ordinal(puesto) }),
      t.record ? crea('p', { className: 'ra-nota ra-amarillo', textContent: tr('¡Nuevo récord de puntos!') }) : null,
      tabla(sesion.tabla().map(([id, p]) => [id, String(p)])),
      boton(tr('Otro campeonato'), 'ra-naranja', () => { sesion.empiezaCampeonato(); previa(); }), boton(tr('Menú'), 'ra-azul', inicio));
  }
  function finContrarreloj(carrera, i) {
    RA.musica.jingle('raGana');
    const vueltas = carrera.vueltasHechas, mejor = Math.min(...vueltas), record = sesion.mejorVuelta(i);
    ve(crea('p', { className: 'ra-etiqueta', textContent: tr(RA.TRAMOS[i].nombre) }),
      crea('h2', { className: 'ra-titulo ra-grande', textContent: RA.reloj(carrera.reloj) }),
      crea('ol', { className: 'ra-tabla' }, ...vueltas.map((v, k) => crea('li', { className: v === mejor ? 'ra-yo' : '' }, crea('span', { textContent: tr('Vuelta {n}', { n: k + 1 }) }), crea('b', { textContent: RA.reloj(v) })))),
      crea('p', { className: 'ra-nota', textContent: tr('Récord del tramo: {t}', { t: RA.reloj(record) }) }),
      boton(tr('Repetir'), 'ra-naranja', () => corre(i)), boton(tr('Otro tramo'), 'ra-verde', tramos), boton(tr('Menú'), 'ra-azul', inicio));
  }
  // ---- pausa (botón del marcador)
  function pausa() {
    if (!juego.enCarrera) return;
    juego.pausa(true);
    const capa = raiz.querySelector('#ra-pausa');
    capa.replaceChildren(crea('div', { className: 'ra-pantalla ra-centro' }, crea('h2', { className: 'ra-titulo', textContent: tr('Pausa') }),
      boton(tr('Seguir'), 'ra-naranja', () => { capa.hidden = true; juego.pausa(false); }),
      boton(tr('Reintentar'), 'ra-verde', () => { capa.hidden = true; modo === 'campeonato' ? previa() : corre(juego.tramo); }),
      boton(tr('Salir al menú'), 'ra-azul', () => { capa.hidden = true; inicio(); })));
    capa.hidden = false;
  }
  raiz.querySelector('#ra-boton-pausa').addEventListener('click', pausa);
  document.addEventListener('visibilitychange', () => { if (document.hidden && juego.enCarrera && raiz.querySelector('#ra-pausa').hidden) pausa(); });
  return { inicio, enPartida: () => juego.enCarrera };
};
// un tiempo como 1'05.32
RA.reloj = s => { if (s === null || s === undefined || !isFinite(s)) return '--'; const m = Math.floor(s / 60), r = s - m * 60; return `${m}'${r < 10 ? '0' : ''}${r.toFixed(2)}`; };
