// Fans of Pop · RAID, la entrada desde el camino (adaptador de pantalla, tarea 448, nodo n5, ADR 243): el botón del lateral del camino, el
// enlace `?raid=1` que abre la raid al llegar y el botón de compartir de cuando te quedas sin toques. Todo tras el flag 'raid' (abierto primero
// en la alfa, servidor/207); con el flag cerrado no sale nada y el enlace se ignora.
// · activa(): ¿está abierta la raid para este jugador? · boton(L): pinta el botón en el lateral (lo llama ppPintaLateral, js/ofertas.js); lleva
//   punto rojo mientras no hayas abierto la raid de esta semana; en una partida nueva se abre al ganar el nivel 13 y Lola la estrena con una bomba. · entra(): abre la raid de la semana y apunta la visita.
// · enlaceArranca(): lo llama el arranque (js/principal.js). · comparte(boton): el toque de PEDIR AYUDA (comparte, copia o enseña el enlace).
// Lee de Pop: ppPrimerosLado, ppPrimerosVe, ppPrimerosToca, SAVE, ppGuarda, ppIcono, ppPintaLateral, ppPedirComparte, ppFlota, PP_PANT, $pp, play, tr.
'use strict';
const PP_RAID_CAMINO = (() => {
  const ESPERA_MS = 500, INTENTOS = 120, FLAGS_MS = 2600;   // los flags se leen al arrancar: el enlace espera como los botones de la portada (js/principal.js)
  const activa = () => NUCLEO.flag('raid', 'Pop: raid entre todos, con su botón en el camino y el enlace ?raid (tarea 448, ADR 243)', false);
  const hoy = () => new Date(typeof HORA !== 'undefined' ? HORA.ahora() : Date.now()).toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
  const lunes = () => PP_RAID_SEMANA.lunes(hoy());
  const texto = () => tr('¡Me he quedado sin toques en la raid de Fans of Pop! Ven a hacer pop conmigo.');

  // abre la raid de la semana; si no se puede, lo dice
  function entra() {
    const pero = PP_RAID_PANTALLA.abre(null);
    if (pero) { ppFlota(tr(pero), 270, 300, '#ff8a2a'); return false; }
    if (SAVE.raidVista !== lunes()) { SAVE.raidVista = lunes(); ppGuarda(); }
    return true;
  }
  function boton(L) {
    if (!activa()) return;
    const b = document.createElement('button'); b.type = 'button';
    b.className = 'pp-lado pp-lado-raid' + (ppPrimerosVe('raid') && PP_RAID_ENLACE.nueva(SAVE.raidVista, lunes()) ? ' pp-aviso' : '');
    b.innerHTML = `<span class="pp-lado-raid-luz"></span>${ppIcono('sl-ceo', 70, '#ffd64a')}<b>${tr('Raid')}</b>`;
    b.onclick = () => { play('select'); entra(); };
    L.appendChild(ppPrimerosLado(b, 'raid'));   // en una partida nueva, cerrada con candado hasta ganar su nivel (PP_CFG.primeros, js/primeros-pasos-juego.js)
  }
  const enCamino = () => PP_PANT.actual === 'titulo' || PP_PANT.actual === 'mapa';
  const libre = () => enCamino() && $pp('#pp-modal').hidden;
  // con ?raid=1 en la dirección: cuando la portada o el camino estén libres (sin otra ventana), se abre la raid y se quita de la barra
  async function enlaceArranca() {
    if (!PP_RAID_ENLACE.pide(location.search)) return;
    await new Promise(ok => setTimeout(ok, FLAGS_MS));
    if (!activa()) return;
    // si hay otra ventana delante se espera un poco; si el jugador se va a jugar (o tarda), el enlace se da por perdido: no se le abre luego por sorpresa
    for (let k = 0; k < INTENTOS && enCamino() && !libre(); k++) await new Promise(ok => setTimeout(ok, ESPERA_MS));
    history.replaceState(null, '', location.pathname + PP_RAID_ENLACE.limpia(location.search) + location.hash);
    if (libre() && ppPrimerosToca('raid')) entra();   // aún con candado: Lola dice a qué nivel se abre
  }
  const comparte = b => ppPedirComparte(b, PP_RAID_ENLACE.url(location.origin + location.pathname), texto());
  return Object.freeze({ activa, boton, entra, enlaceArranca, comparte });
})();
if (typeof module !== 'undefined') module.exports = PP_RAID_CAMINO;
