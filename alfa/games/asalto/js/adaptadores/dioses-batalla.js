// Fans of Asalto · ADAPTADORES · Lo que se ve en la BATALLA de los 16 DIOSES (tarea #156): convierte sus eventos 'divino' (la lista
// está en la cabecera de dominio/batalla-dioses.js) en efectos y sonidos, en blanco y oro: el nombre del dios al empezar, el rayo divino,
// la lluvia de luz, el meteorito enorme, el que renace, las monedas que explotan, el golpe final… Dibujo provisional por código, a píxel.
// leyendas-batalla.js le pasa cada evento 'divino' y le presta su cartel corto y lo que cae del cielo (ayudas).
'use strict';
AS.diosesBatalla = (() => {
  const fx = AS.fx, ORO = '#ffd23a', BLANCO = '#ffffff';
  const D = () => ASALTO.dioses.lista;
  const pos = (E, e) => E.P.aPantalla(e.x, e.y);
  const escala = E => E.P.W / 540;
  const unidad = (E, id) => E.batalla.u.find(u => u.id === id) || null;
  // los tocados (ids en e.a) que siguen en la batalla, con su sitio en la pantalla
  const tocados = (E, e) => (e.a || []).map(id => unidad(E, id)).filter(Boolean).map(u => pos(E, u));
  const enemigos = E => E.batalla.u.filter(u => u.lado === 'enemigo' && !u.muerta).map(u => pos(E, u));
  const heroes = E => E.batalla.u.filter(u => u.lado === 'heroe' && !u.muerta).map(u => pos(E, u));

  // un rayo blanco y dorado que baja del cielo sobre (x, y)
  function rayoDelCielo(x, y) {
    fx.rayo(x + 20, y - 420, x, y - 40, BLANCO); fx.rayo(x - 16, y - 380, x, y - 40, ORO);
    fx.columna(x, y, [255, 243, 214], 380); fx.chispas(x, y - 30, 8, ORO, 160, true);
  }
  // al empezar: su nombre en un cartel y una columna de luz sobre él
  function inicio(E, e, A) {
    const s = pos(E, e);
    A.cartel(E, e, tr(D()[e.cual].nombre), 'divino');
    fx.columna(s.x, s.y, [255, 255, 255], 520); fx.columna(s.x, s.y, [255, 215, 90], 420); fx.onda(s.x, s.y - 40, 120, ORO);
    if (INICIO[e.cual]) INICIO[e.cual](E, e);
    AS.suena('asciende');
  }
  const INICIO = {
    lunes(E) { for (const s of enemigos(E)) fx.numero(s.x, s.y - 110, 'Zzz', '#8fd0f8', 36); },
    apagon() { fx.fogonazo(0.6, '#22140e'); fx.sacude(6); },
    jefe(E) { for (const s of heroes(E)) fx.onda(s.x, s.y - 40, 60, ORO); },
    cafe(E) { for (const s of heroes(E)) fx.brasas(s.x, s.y - 30, 6, '#a06a3c', 16); },
    direccion(E) { for (const s of heroes(E)) fx.columna(s.x, s.y, [255, 215, 90], 240); },
    organigrama(E) { for (const s of heroes(E)) fx.onda(s.x, s.y - 40, 50, BLANCO); },
  };
  // lo que hace cada dios durante el combate (el evento sin `inicio`)
  const DURANTE = {
    jefe(E, e, A) { A.cartel(E, e, tr('¡Rayo divino!'), 'divino'); for (const s of tocados(E, e)) rayoDelCielo(s.x, s.y); fx.fogonazo(0.35, BLANCO); fx.sacude(8); AS.suena('magia'); },
    nomina(E, e, A) {
      if (e.todo) { A.cartel(E, e, tr('¡Paga entera!'), 'divino'); for (const s of heroes(E)) { fx.columna(s.x, s.y, [150, 255, 150], 320); fx.brasas(s.x, s.y - 30, 12, '#b8ff7a', 20); } AS.suena('asciende'); return; }
      for (const s of heroes(E)) fx.brasas(s.x, s.y - 120, 8, ORO, 24);
      for (const s of enemigos(E)) fx.chispas(s.x, s.y - 30, 6, BLANCO, 120);
      fx.fogonazo(0.15, '#fff3d6'); AS.suena('cura');
    },
    lunes(E, e) { for (const s of tocados(E, e)) { fx.numero(s.x, s.y - 110, 'Zzz', '#8fd0f8', 32); fx.onda(s.x, s.y - 30, 50, '#8fd0f8'); } },
    dragon(E, e, A) {
      const s = pos(E, e);
      if (e.renace) { A.cartel(E, e, tr('¡RENACE!'), 'divino'); fx.columna(s.x, s.y, [255, 150, 60], 520); fx.brasas(s.x, s.y - 30, 24, '#ff8a2a', 30); fx.fogonazo(0.5, '#ffe9a0'); AS.suena('asciende'); return; }
      const r = e.radio * escala(E);
      AS.suena('magia');
      A.cae(E, s.x, s.y, 'meteorito', 0.45, () => { A.revienta(s.x, s.y, r, '#ff8a2a', 5); fx.onda(s.x, s.y - 10, r * 0.6, ORO); fx.fogonazo(0.5, '#ffe9a0'); AS.suena('bomba'); });
    },
    ceo(E, e) { const s = pos(E, e); fx.onda(s.x, s.y - 40, 70, ORO); fx.numero(s.x, s.y - 140, tr('¡AGUANTA!'), ORO, 40); },
    paga(E, e) { const s = pos(E, e); fx.onda(s.x, s.y - 20, e.radio * escala(E), ORO); fx.chispas(s.x, s.y - 30, 10, ORO, 170, true); },
    reorganizador(E, e, A) { A.cartel(E, e, tr('¡Reorganización!'), 'divino'); for (const s of tocados(E, e)) { fx.chispas(s.x, s.y - 30, 10, BLANCO, 140); fx.numero(s.x, s.y - 110, '?', ORO, 40); } fx.sacude(6); AS.suena('empuja'); },
    reunion(E, e, A) { A.cartel(E, e, tr('¡Reunión!'), 'divino'); for (const s of tocados(E, e)) fx.onda(s.x, s.y - 30, 56, '#8fd0f8'); AS.suena('escudo'); },
    correo(E, e, A) { A.cartel(E, e, tr('¡Último correo!'), 'divino'); for (const s of tocados(E, e)) rayoDelCielo(s.x, s.y); fx.fogonazo(0.5, BLANCO); fx.sacude(10); AS.suena('bomba'); },
    teletrabajo(E, e) { const s = pos(E, e); for (const t of tocados(E, e)) fx.rayo(s.x, s.y - 40, t.x, t.y - 40, ORO); },
    actualizando(E, e, A) { A.cartel(E, e, tr('¡Actualizado!'), 'divino'); for (const s of heroes(E)) fx.columna(s.x, s.y, [150, 255, 150], 300); AS.suena('cura'); },
  };
  // un evento 'divino' de la batalla. A: las ayudas de leyendas-batalla.js { cartel, cae, revienta }
  function trata(E, e, A) {
    if (e.inicio) { inicio(E, e, A); return; }
    if (DURANTE[e.cual]) DURANTE[e.cual](E, e, A);
  }
  return { trata };
})();
