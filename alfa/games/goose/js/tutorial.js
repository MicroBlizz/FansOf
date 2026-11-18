// Fans of Goose · EL TUTORIAL DE LA OCA PARCA: la primera vez que pasa cada cosa (moverse, tirar el dado, caminar a la casilla, el
// derrumbe, las tiendas, el pozo, los guardianes…) la Parca te lo cuenta en un cartel tétrico arriba, con su retrato (los fotogramas
// del regateo, de Yoshi). No para la partida; se cierra solo o tocándolo, y cada lección sale una sola vez (SAVE.tuto).
// 5-11-2026, Daniel: un amigo no sabía cómo tirar el dado.
'use strict';

const enTienda = J => !!J.escena && (J.escena.tipo === 'posada' || J.escena.tipo === 'mercader');
const LECCIONES = [
  { id: 'mover', cuando: J => J.t > 0.6, txt: 'Arrastra el dedo para huir. Tus armas atacan solas… mientras sigas vivo.', dura: 5 },
  { id: 'dado', cuando: J => J.t > 4 && puedeTirar() && !enTienda(J), txt: 'Toca el dado de abajo, o toca dos veces la pantalla. Que el destino elija tu camino.', flecha: true, dura: 9 },
  { id: 'camino', cuando: J => J.fase === 'camino' && J.dado.rodando <= 0, txt: 'Camina hasta la casilla que te ha tocado. Las barreras se abren a tu paso.' },
  { id: 'pares', cuando: J => J.casilla >= 2 && J.fase === 'parado' && !J.escena, txt: 'Los pares bendicen; los impares, maldicen. Las plumas doradas llenan el aro del dado.' },
  { id: 'derrumbe', cuando: J => J.casilla >= 4 && J.fase === 'parado' && !J.escena, txt: '¿Oyes crujir? El tablero se hunde detrás de ti. Si el abismo te alcanza, eres mío.' },
  { id: 'tienda', cuando: J => enTienda(J), txt: 'Gasta tus monedas, si te atreves. Cuando acabes, pulsa IRSE.' },
  { id: 'encierro', cuando: J => !!J.escena && (J.escena.tipo === 'pozo' || J.escena.tipo === 'carcel') && J.escena.restan > 0, txt: 'Atrapado. Tumba a las ocas que caen del cielo y quedarás libre.' },
  { id: 'guardian', cuando: J => !!J.minijefe && !esParca(J.minijefe), txt: 'Un guardián cierra el paso. Mientras viva, el dado duerme.' },
  { id: 'parca', cuando: J => !!J.minijefe && esParca(J.minijefe), txt: 'Por fin nos vemos. Cuando alce la guadaña, salta con dos toques.' },
];

// cada fotograma de la partida: si no hay cartel, saca la primera lección pendiente que toque
function avanzaTutorial(dt) {
  const J = JUEGO; if (!SAVE.tuto) SAVE.tuto = {};
  const T = J.tuto;
  if (T) { T.t += dt; if (T.t > T.dura) J.tuto = null; return; }
  if (J.trato || J.muerto > 0 || J.victoria) return;
  const L = LECCIONES.find(l => !SAVE.tuto[l.id] && l.cuando(J)); if (!L) return;
  SAVE.tuto[L.id] = 1; guarda();
  J.tuto = { id: L.id, txt: L.txt, flecha: !!L.flecha, t: 0, dura: L.dura || 7 };
  SONIDO.posada();
}
// la lección de tirar se cierra en cuanto tiras
function cierraTutoDado() { const T = JUEGO.tuto; if (T && T.id === 'dado') JUEGO.tuto = null; }

// el cartel: arriba, bajo la casilla, con la Parca a la izquierda
function pintaTutorial() {
  const J = JUEGO, T = J.tuto; if (!T || J.modo !== 'juego') return;
  const W = PAN.W, x = 8, y = 60, w = W - 16, h = 44, k = Math.min(1, T.t * 4, (T.dura - T.t) * 3);
  G.globalAlpha = k;
  caja(x, y, w, h, 8, 'rgba(10,4,16,.93)', '#c9a0ff', 1.6);
  const S = SPR['parca-rg1'];
  if (S) pinta((T.t * 1.5 | 0) % 2 ? 'parca-rg2' : 'parca-rg1', x + 20, y + h / 2, false, false, Math.min(1, 38 / S.h), k);
  G.globalAlpha = k;
  texto2(tr('LA OCA PARCA'), x + 40, y + 8, 6, '#c9a0ff', 'left', FUENTE, 800, 0.3);
  parrafo(tr(T.txt), x + 40, y + 18, w - 48, 6.5, '#efe3c8');
  G.globalAlpha = 1;
  BOTONES.push({ x, y, w, h, accion: () => { J.tuto = null; } });
  if (T.flecha && !enTienda(J)) pintaFlechaDado();
}
// una flecha de píxeles que baila sobre el botón del dado
function pintaFlechaDado() {
  const J = JUEGO, cx = 26, base = PAN.H - 60 - 54 + Math.round(Math.sin(J.t * 8) * 3);
  for (let i = 0; i < 7; i++) { G.fillStyle = '#120808'; G.fillRect(cx - 8 + i - 1, base + i - 1, (8 - i) * 2 + 2, 2); }
  for (let i = 0; i < 7; i++) { G.fillStyle = (J.t * 6 | 0) % 2 ? '#ffd34d' : '#fff2a8'; G.fillRect(cx - 7 + i, base + i, (7 - i) * 2, 1); }
  G.fillStyle = '#120808'; G.fillRect(cx - 3, base - 9, 6, 10);
  G.fillStyle = '#ffd34d'; G.fillRect(cx - 2, base - 8, 4, 8);
}
