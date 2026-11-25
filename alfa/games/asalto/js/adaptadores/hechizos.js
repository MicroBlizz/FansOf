// Fans of Asalto · ADAPTADORES · Los hechizos de las clases: el efecto propio de cada una de las 7 clases cuando ataca o usa su
// habilidad, para que la batalla se vea espectacular. Tanque: burbuja de escudo que brilla al recibir golpes. Luchador: estallido con
// chispas (más gordo en los golpes fuertes). Asesino: cortes rápidos en cruz. Tirador: estela tras la flecha y chispa al clavarse.
// Mago: chispazo de rayos (y rayos con ramas en la cadena). Sanador: cruces verdes que suben. Brujo: nube verdosa de maldición.
// Un golpe usa la clase PRINCIPAL del que pega (la primera); una habilidad, la suya. Críticos y golpes gordos hacen temblar un poco.
// También los efectos de los objetos en la batalla: la Bomba de confeti (el enemigo que cae revienta en confeti de colores), el atontado
// (estrellitas sobre la cabeza) y el «salvado» del Contrato y del Amuleto (destello dorado al quedarse con 1 de vida).
// No dibuja nada directamente: llama a los efectos (fx, efectos.js) que le pasan, y no decide nada del juego.
'use strict';
AS.hechizos = (() => {
  // qué efecto toca a cada clase
  const RECETA = Object.freeze({ tanque: 'burbuja', luchador: 'estallido', asesino: 'cortes', tirador: 'estela', mago: 'chispazo', sanador: 'cruces', brujo: 'maldicion' });
  // la luz de cada efecto, en [r, g, b]
  const LUZ = Object.freeze({ burbuja: [120, 200, 255], estallido: [255, 150, 60], cortes: [120, 255, 230], estela: [190, 255, 140], chispazo: [150, 230, 255], cruces: [140, 255, 140], maldicion: [150, 230, 90] });
  const GORDO = 1.6;   // un golpe es «gordo» si quita al menos 1,6 veces el daño normal del que pega

  const recetaDe = clase => RECETA[clase] || null;
  // la clase que pinta el golpe de una unidad: la principal de un héroe; los enemigos no tienen
  const claseDe = u => (u && u.lado === 'heroe' && u.clases && u.clases[0]) || null;
  const gordo = (e, de) => !!(e.crit || (de && de.dano > 0 && e.d >= de.dano * GORDO));
  // cuánto tiembla la pantalla con un golpe: algo con los críticos, poco con los gordos, nada con el resto
  const temblorDe = (e, de) => (e.crit ? 4 : gordo(e, de) ? 2 : 0);
  // la receta del golpe: la de la clase del que pega; los misiles de sombra siempre son del brujo
  const recetaGolpe = (e, de) => (e.tipo === 'sombra' ? 'maldicion' : recetaDe(claseDe(de)));

  /* ---------- lo que pinta cada receta en el sitio del golpe (s: punto en pantalla, a la altura del pecho) ---------- */
  const GOLPE = {
    // el tanque que pega: un escudazo azul (su burbuja la enseña al recibir, en brillaEscudo)
    burbuja(fx, s, fuerte) { fx.chispas(s.x, s.y, fuerte ? 10 : 5, '#8fd0f8', 130, fuerte); fx.onda(s.x, s.y, fuerte ? 44 : 30, '#8fd0f8'); },
    estallido(fx, s, fuerte) {
      fx.chispas(s.x, s.y, fuerte ? 16 : 7, '#ff8a2a', fuerte ? 240 : 150, fuerte);
      fx.chispas(s.x, s.y, fuerte ? 6 : 2, '#ffe9a0', 120);
      if (fuerte) fx.onda(s.x, s.y, 50, '#ff8a2a');
    },
    cortes(fx, s, fuerte) {
      fx.corte(s.x, s.y, -0.8, 40, '#2fd6c6'); fx.corte(s.x, s.y, 0.8, fuerte ? 46 : 34, '#2fd6c6');
      fx.chispas(s.x, s.y, 4, '#b8fff4', 90);
    },
    estela(fx, s) { fx.chispas(s.x, s.y, 5, '#c8ff8a', 110); fx.corte(s.x, s.y, 0, 26, '#5fb83a'); },
    chispazo(fx, s) {
      for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + (i - 1) * 0.9; fx.rayo(s.x, s.y, s.x + Math.cos(a) * 26, s.y + Math.sin(a) * 26, '#bff4ff', 2); }
      fx.chispas(s.x, s.y, 4, '#bff4ff', 100);
    },
    cruces(fx, s) { fx.cruces(s.x, s.y, 3, '#8fe07a'); },
    maldicion(fx, s) { fx.nube(s.x, s.y, 3, '#7fbf3a'); fx.chispas(s.x, s.y, 3, '#c6ff7a', 70); },
  };
  // un golpe que hay que pintar. s: dónde (pantalla); e: el evento 'golpe'; de: la unidad que pega (o null); a: la que lo recibe.
  // Devuelve la receta usada (o null)
  function golpe(fx, s, e, de, a) {
    if (a && claseDe(a) === 'tanque' && (e.escudo || a.escudo > 0)) { fx.burbuja(s.x, s.y, 26); fx.luz(s.x, s.y, 80, LUZ.burbuja, 0.2); }
    const r = recetaGolpe(e, de), fuerte = gordo(e, de);
    if (r) { GOLPE[r](fx, s, fuerte); fx.luz(s.x, s.y, fuerte ? 130 : 80, LUZ[r], fuerte ? 0.3 : 0.18); }
    const m = temblorDe(e, de);
    if (m) fx.sacude(m);
    return r;
  }
  // una cura: cruces verdes y un destello verde. de: quien cura (si es sanador, más cruces)
  function cura(fx, s, de) {
    const sanador = claseDe(de) === 'sanador';
    fx.cruces(s.x, s.y, sanador ? 5 : 2, '#8fe07a');
    fx.luz(s.x, s.y, sanador ? 110 : 70, LUZ.cruces, 0.3);
    return sanador ? 'cruces' : null;
  }

  /* ---------- las habilidades: el efecto sobre cada héroe que la lanza (s: su pecho) ---------- */
  const HABILIDAD = {
    burbuja(fx, s) { fx.burbuja(s.x, s.y, 34, '#8fd0f8'); fx.onda(s.x, s.y, 56, '#8fd0f8'); },
    estallido(fx, s) { fx.chispas(s.x, s.y, 10, '#ff8a2a', 180, true); },
    cortes(fx, s) { fx.corte(s.x, s.y, -0.4, 50, '#2fd6c6'); fx.nube(s.x, s.y - 6, 2, '#3f9a3a'); },
    estela(fx, s) { fx.brasas(s.x, s.y, 6, '#c8ff8a', 14); },
    chispazo(fx, s) { fx.columna(s.x, s.y + 40, [150, 220, 255], 120); fx.chispas(s.x, s.y, 8, '#bff4ff', 160, true); },
    cruces(fx, s) { fx.cruces(s.x, s.y, 6, '#8fe07a'); fx.columna(s.x, s.y + 40, [140, 255, 140], 110); },
    maldicion(fx, s) { fx.nube(s.x, s.y, 5, '#6a9a2a'); fx.nube(s.x, s.y - 14, 2, '#8a1f4a'); },
  };
  // una clase usa su habilidad: puntos = dónde está cada héroe que la lanza. Devuelve la receta
  function habilidad(fx, clase, puntos) {
    const r = recetaDe(clase);
    if (!r) return null;
    for (const s of puntos) { HABILIDAD[r](fx, s); fx.luz(s.x, s.y, 120, LUZ[r], 0.4); }
    return r;
  }
  // los rayos en cadena del mago: el rayo, una rama corta que sale de su mitad y el chasquido al llegar
  function rayo(fx, a, b) {
    fx.rayo(a.x, a.y, b.x, b.y);
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    fx.rayo(mx, my, mx + (b.y - a.y) * 0.25, my - (b.x - a.x) * 0.25, '#bff4ff', 2);
    fx.chispas(b.x, b.y, 6, '#bff4ff', 140, true);
    fx.luz(a.x, a.y, 70, LUZ.chispazo, 0.2);
  }

  /* ---------- los efectos de los objetos (s: el punto en pantalla) ---------- */
  // la Bomba de confeti: radio = el alcance de la explosión en pantalla
  function confeti(fx, s, radio) {
    fx.confeti(s.x, s.y, 28, 260); fx.chispas(s.x, s.y, 8, '#fff3d6', 160, true);
    fx.onda(s.x, s.y, radio, '#ff7ad9'); fx.onda(s.x, s.y, radio * 0.6, '#ffd23a');
    fx.luz(s.x, s.y, 150, [255, 200, 140], 0.35); fx.sacude(3);
  }
  // atontado: estrellitas que dan vueltas sobre la cabeza el segundo que dura
  function atonta(fx, s, dura) { fx.estrellas(s.x, s.y, 5, '#ffe14a', dura); fx.luz(s.x, s.y, 50, [255, 225, 74], 0.3); }
  // salvado con 1 de vida (Contrato indefinido o Amuleto de la segunda oportunidad): destello dorado, columna de luz y el aviso
  function salva(fx, s) {
    fx.columna(s.x, s.y + 40, [255, 215, 90], 170); fx.onda(s.x, s.y, 64, '#ffd23a'); fx.brasas(s.x, s.y, 12, '#ffe9a0', 22);
    fx.luz(s.x, s.y, 170, [255, 215, 90], 0.7); fx.numero(s.x, s.y - 70, tr('¡SALVADO!'), '#ffd23a', 40);
  }
  // las estelas de los proyectiles de los héroes en vuelo (una por proyectil y fotograma). aPantalla(p) da su punto en pantalla
  const ESTELA = Object.freeze({ flecha: '#e8ffd0', bomba: '#b9a77c', magia: '#ffd23a', sombra: '#9fd04a', dardo: '#7fff9a' });
  function estelas(fx, proy, aPantalla) {
    let n = 0;
    for (const p of proy) {
      const col = ESTELA[p.tipo];
      if (p.t < 0 || !col || !p.de || p.de.lado !== 'heroe') continue;
      const s = aPantalla(p);
      fx.estela(s.x, s.y, col, p.tipo === 'flecha' ? 2 : 4); n++;
    }
    return n;
  }
  return { RECETA, LUZ, recetaDe, claseDe, gordo, temblorDe, recetaGolpe, golpe, cura, habilidad, rayo, confeti, atonta, salva, estelas };
})();
