// Fans of Pop · RAID, la entrada desde el camino (adaptador de pantalla, tarea 448, nodo n5, ADR 243): el botón del lateral del camino, el
// enlace `?raid=1` que abre la raid al llegar y el botón de compartir de cuando te quedas sin toques. Todo tras el flag 'raid' (abierto primero
// en la alfa, servidor/207); con el flag cerrado no sale nada y el enlace se ignora.
// · activa(): ¿está abierta la raid para este jugador? · boton(L): pinta el botón en el lateral (lo llama ppPintaLateral, js/ofertas.js); lleva
//   punto rojo mientras no hayas abierto la raid de esta semana o quede un premio de raid por cobrar; en una partida nueva se abre al ganar el nivel 13 y Lola la estrena con una bomba. · entra(): abre la raid de la semana y apunta la visita (antes, el premio sin cobrar de la raid pasada). · lunes(atras): el id de la raid de esta semana o de `atras` semanas antes.
// · enlaceArranca(): lo llama el arranque (js/principal.js). · comparte(boton): el toque de PEDIR AYUDA (comparte, copia o enseña el enlace).
// · ayuda(): el párrafo de la raid para «Cómo se juega» ('' si aún no la tienes). · consejo(k): un globo de Lola de la raid, si está libre.
// Lee de Pop: ppPrimerosLado, ppPrimerosVe, ppPrimerosToca, SAVE, ppGuarda, ppIcono, ppPintaLateral, ppPedirComparte, ppFlota, PP_PANT, $pp, play, tr.
'use strict';
const PP_RAID_CAMINO = (() => {
  const ESPERA_MS = 500, INTENTOS = 120, FLAGS_MS = 2600;   // los flags se leen al arrancar: el enlace espera como los botones de la portada (js/principal.js)
  const activa = () => NUCLEO.flag('raid', 'Pop: raid entre todos, con su botón en el camino y el enlace ?raid (tarea 448, ADR 243)', false);
  const hoy = () => new Date(typeof HORA !== 'undefined' ? HORA.ahora() : Date.now()).toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
  const lunes = (atras = 0) => PP_RAID_SEMANA.lunes(hoy(), atras);
  const texto = () => tr('¡Me he quedado sin toques en la raid de Fans of Pop! Ven a hacer pop conmigo.');

  // abre la raid de la semana; si no se puede, lo dice
  function abreRaid() {
    const pero = PP_RAID_PANTALLA.abre(null);
    if (pero) { ppFlota(tr(pero), 270, 300, '#ff8a2a'); return false; }
    if (SAVE.raidVista !== lunes()) { SAVE.raidVista = lunes(); ppGuarda(); }
    return true;
  }
  // el botón del camino: si quedó sin cobrar el premio de la raid pasada, primero su ventana y al cerrarla, la raid de esta semana
  const entra = () => PP_RAID_PREMIO.anterior(abreRaid) || abreRaid();
  function boton(L) {
    if (!activa()) return;
    PP_RAID_PREMIO.alCamino();   // una vez por sesión: ¿hay un premio de raid por cobrar? (js/raid/adaptadores/premio.js)
    const aviso = ppPrimerosVe('raid') && (PP_RAID_ENLACE.nueva(SAVE.raidVista, lunes()) || PP_RAID_PREMIO.hay());
    const b = document.createElement('button'); b.type = 'button';
    b.className = 'pp-lado pp-lado-raid' + (aviso ? ' pp-aviso' : '');
    b.innerHTML = `<span class="pp-lado-raid-luz"></span>${ppIcono('sl-ceo', 70, '#ffd64a')}<b>${tr('Raid')}</b>`;
    b.style.setProperty('--fase', -(Date.now() % 18000) / 1000 + 's');   // el lateral se repinta cada segundo: las animaciones siguen donde iban (css/raid.css)
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
  // el párrafo de la raid en «Cómo se juega» (ppAyuda, js/pantallas.js): solo si ya la tienes abierta
  const ayuda = () => (activa() && ppPrimerosVe('raid') ? `<p class="pp-sub">${tr('La RAID: un tablero enorme que vaciamos entre todos en una semana. Gasta tus toques (se recargan solos), abre cofres, usa tus ayudas y vence al jefe CEO. Cuantas más burbujas hagas pop, mejor premio.')}</p>` : '');
  // un consejo de Lola de la raid (js/lola.js), solo si Lola está libre: si no, se deja para otra vez (sin apuntarlo como visto) en vez de
  // ponerlo en su cola, que solo se vacía al empezar un nivel y lo soltaría allí, fuera de sitio
  const consejo = k => { if (!PP_LOLA.actual && !PP_LOLA.cola.length) ppTutorial(k); };
  return Object.freeze({ activa, lunes, boton, entra, enlaceArranca, comparte, ayuda, consejo });
})();
if (typeof module !== 'undefined') module.exports = PP_RAID_CAMINO;
