// Fans of Island · LA PARTIDA: el estado de una vuelta al nivel (CrazyBunny, enemigos, zanahorias, peces, cangrejos, gaviotas…),
// el marcador de vidas y zanahorias, perder una vida y el final (meta o sin vidas).
'use strict';
let J, enemigos, zanas, total, jugando = false, meta, reloj = 0;
let cangrejos = [], peces = [], gotas = [], gaviotas = [], cocos = [], parts = [], tGav = 3;
const cam = { x: 0, z: 0 };
function nueva() {
  const x = (INICIO + 0.5) * T;
  J = IS.Jugador.crea(x, arribaCol(INICIO));
  enemigos = IS.creaBrotitos(mundo());
  zanas = ZANAS0.map(z => ({ x: z.x, z: z.z, cogida: false }));
  peces = IS.creaPeces(mundo());
  gotas = []; gaviotas = []; cocos = []; parts = []; tGav = 4;
  cangrejos = IS.creaCangrejos(mundo());
  meta = { x: (META + 0.5) * T, z: arribaCol(META) };
  total = zanas.length;
  cam.x = J.x - VW * 0.4; cam.z = 0;
  actualizaHud();
}
const cogidas = () => zanas.filter(z => z.cogida).length;
const CORAZON = '<svg viewBox="0 0 7 6" shape-rendering="crispEdges"><path fill="#2a1830" d="M1 0h2v1h1V0h2v1h1v3H6v1H5v1H2V5H1V4H0V1h1z"/><path fill="COLOR" d="M1 1h2v1h1V1h2v2H5v1H4v1H3V4H2V3H1z"/><path fill="#fff6e0" d="M1 1h1v1H1z"/></svg>';
function actualizaHud() {
  document.getElementById('vidas').innerHTML = [0, 1, 2].map(i => CORAZON.replace('COLOR', i < J.vidas ? '#f04b53' : '#56101e')).join('');
  document.getElementById('cuenta').textContent = cogidas() + '/' + total;
}
function daño() {   // true si de verdad quita una vida (no está parpadeando)
  if (!IS.Jugador.daña(J)) return false;
  efectosDaño();
  return true;
}
function acaba(gana) {
  jugando = false; musicSet(gana ? 'win' : 'lose');
  document.getElementById('finTitulo').textContent = gana ? tr('Meta') : tr('Otra vez será');
  document.getElementById('finTexto').textContent = tr('Zanahorias: {n} de {t}', { n: cogidas(), t: total });
  document.getElementById('fin').classList.remove('oculto');
}
