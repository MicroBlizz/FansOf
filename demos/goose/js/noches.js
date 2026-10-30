// Fans of Goose · La ESCALERA DE NOCHES: la dificultad que se abre al ganar (como el Calor de Hades). La Noche 1 es la de siempre;
// ganar la Noche N abre la N+1, hasta la 10. Cada noche suma su regla a las de antes (ocas más duras, más ocas, derrumbe más rápido,
// jefes de hierro…) y paga más monedas. Se elige en el selector de personaje. En Con amigos y en el Tablero del día no cuenta:
// allí la noche la pone el modo (1 con amigos; la del día, en js/desafios.js).
'use strict';

const NOCHES = [
  null,
  { n: 1,  regla: 'La noche de siempre.' },
  { n: 2,  regla: 'Ocas duras: tienen un 30 % más de vida.' },
  { n: 3,  regla: 'La horda: un 25 % más de ocas.' },
  { n: 4,  regla: 'Tablero impaciente: el derrumbe va un 25 % más rápido.' },
  { n: 5,  regla: 'Jefes de hierro: los minijefes y la Parca con un 50 % más de vida.' },
  { n: 6,  regla: 'Picotazos: las ocas hacen un 30 % más de daño.' },
  { n: 7,  regla: 'Sin piedad: curas la mitad.' },
  { n: 8,  regla: 'Élites: ocas gordas y bandadas el doble de a menudo.' },
  { n: 9,  regla: 'Prisa eterna: las ocas van un 20 % más rápido.' },
  { n: 10, regla: 'La Noche de la Oca: la Oca Madre con un 60 % más de vida y tú empiezas con un 25 % menos.' },
];
const NOCHE_MAX = 10;

// la noche de esta partida (la guarda nuevaPartida en JUEGO.noche)
const nocheDe = () => JUEGO.noche || 1;
// todo lo que cambia la noche, acumulado: lo consultan las ocas, las oleadas, el derrumbe, los jefes, la cura y las monedas
function modNoche() {
  const n = nocheDe();
  return {
    vida: n >= 2 ? 1.3 : 1,
    oleada: n >= 3 ? 1.25 : 1,
    derrumbe: n >= 4 ? 1.25 : 1,
    jefes: n >= 5 ? 1.5 : 1,
    dano: n >= 6 ? 1.3 : 1,
    cura: n >= 7 ? 0.5 : 1,
    elites: n >= 8 ? 2 : 1,
    vel: n >= 9 ? 1.2 : 1,
    madre: n >= 10 ? 1.6 : 1,
    tuVida: n >= 10 ? 0.75 : 1,
    monedas: 1 + (n - 1) * 0.2,
  };
}
// se aplica a cada oca al nacer (lo llama creaEnemigo)
function nocheEnemigo(e) {
  const M = JUEGO.mod; if (!M) return;
  if (e.tipo === 'jefe') { e.hpMax = e.hp = e.hp * M.madre; return; }
  e.hpMax = e.hp = e.hp * M.vida; e.dano *= M.dano; e.vel *= M.vel;
}

// al ganar: se abre la noche siguiente
function ganaNoche() {
  const n = nocheDe();
  if (n >= (SAVE.nocheMax || 1) && n < NOCHE_MAX) { SAVE.nocheMax = n + 1; SAVE.noche = n + 1; return n + 1; }
  return 0;
}

// el selector de noche (en la pantalla de elegir personaje): flechas y la regla nueva de esa noche
function pintaSelectorNoche(x, y, w) {
  const max = SAVE.nocheMax || 1, n = Math.min(SAVE.noche || 1, max);
  caja(x, y, w, 26, 6, '#1a0e1a', n > 1 ? '#ff4d4d' : '#6e4426', 1.4);
  icono('luna', x + 12, y + 13, 9);
  texto2(tr('NOCHE {n}', { n }), x + 24, y + 9, 8, n > 1 ? '#ff8a6b' : '#f6e7b8', 'left', FUENTE_G, 400, 0.25);
  texto2(n > 1 ? tr('+{n} % de monedas', { n: (n - 1) * 20 }) : tr('Gana para abrir la siguiente'), x + 24, y + 19, 5, '#c9b98a', 'left', FUENTE, 700, 0);
  if (max > 1) {
    const flecha = (fx, dir, puede) => {
      caja(fx, y + 3, 20, 20, 5, puede ? '#e8742a' : '#2a1610', '#120808', 1.2);
      texto2(dir < 0 ? '<' : '>', fx + 10, y + 13.5, 10, puede ? '#fff4dc' : '#6e4426');
      if (puede) BOTONES.push({ x: fx, y: y + 3, w: 20, h: 20, accion: () => { SAVE.noche = n + dir; guarda(); SONIDO.elige(false); } });
    };
    flecha(x + w - 46, -1, n > 1); flecha(x + w - 23, 1, n < max);
  }
  return n;
}
// la regla de la noche, en una línea bajo el selector
function reglaNoche(n) { return n > 1 ? tr(NOCHES[n].regla) + (n > 2 ? ' ' + tr('(y las de antes)') : '') : ''; }
