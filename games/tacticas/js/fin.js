// Fans of Rumble: Tácticas · FINAL DEL COMBATE: victoria (premios y niveles), derrota (revivir con anuncio o gemas) y pausa.
'use strict';
/* =========================================================
   FIN DEL COMBATE
   ========================================================= */
function comprobarFin() {
  if (B.fin) return;
  if (!vivos(B.enemigos).length) { B.fin = true; cerrarMenu(); setTimeout(() => victoria(), 700); }
  else if (!vivos(B.heroes).length) { B.fin = true; cerrarMenu(); setTimeout(() => derrota(), 700); }
}
function guardarGrupo() { for (const h of B.heroes) { const g = SAVE.heroes[h.key]; g.hp = h.hp; g.mp = h.mp; } }
function victoria() {
  musicSet('win'); play('crown');
  const muertos = B.enemigos.map(e => ENEMIGOS[e.key]);
  const xp = muertos.reduce((s, e) => s + e.xp, 0);
  let oro = muertos.reduce((s, e) => s + e.oro, 0) * (SAVE.pase ? 2 : 1);
  const clave = B.wi + '-' + B.li, primera = !SAVE.hechos[clave];
  let gemas = primera ? 5 + muertos.reduce((s, e) => s + (e.gemas || 0), 0) : 0;
  const premioItem = Math.random() < 0.25 ? pick(['botiquin', 'botiquin', 'bebida']) : null;
  guardarGrupo();
  const subidas = [];
  for (const h of B.heroes) { const n = darXp(h.key, h.hp > 0 ? xp : Math.round(xp / 2)); if (n) subidas.push(`${h.nombre} sube a nivel ${SAVE.heroes[h.key].lvl}`); }
  SAVE.hechos[clave] = true; SAVE.oro += oro; SAVE.gemas += gemas; if (premioItem) SAVE.items[premioItem]++;
  const finJuego = B.wi === MUNDOS.length - 1 && B.li === MUNDOS[B.wi].niveles.length - 1;
  guardar(); evento('batalla_ganada', { mundo: B.wi, nivel: B.li, oro, gemas });
  const wi = B.wi;
  ventana(`<h3 class="ol">${finJuego ? '¡HAS SALVADO LOS JUEGOS!' : '¡VICTORIA!'}</h3>
    ${finJuego ? '<p>El CEO ha dimitido con una indemnización millonaria. Los fans recuperan sus juegos… hasta la próxima compra.</p>' : ''}
    <div class="premios">${moneda('oro', oro)}${gemas ? moneda('gemas', gemas) : ''}<span class="moneda">+${xp} XP</span>${premioItem ? `<span class="moneda">+1 ${OBJETOS[premioItem].nombre}</span>` : ''}</div>
    ${subidas.length ? `<div class="subidas">${subidas.map(s => `<span>${s}</span>`).join('')}</div>` : ''}
    <button class="btn dorado ol" id="v-x2">×2 ORO · ANUNCIO</button>
    <button class="btn naranja ol" id="v-ok">CONTINUAR</button>`, () => {
    $('#v-x2').onclick = () => verAnuncio('doblar_oro', () => { SAVE.oro += oro; guardar(); aviso('+' + oro + ' oro'); $('#v-x2').disabled = true; pintarCarteras(); });
    $('#v-ok').onclick = () => { cerrarVentana(); salirBatalla(); irMapa(wi); };
  });
  if (subidas.length) setTimeout(() => play('levelup'), 600);
}
function derrota() {
  musicSet('lose'); play('womp'); evento('batalla_perdida', { mundo: B.wi, nivel: B.li });
  const puedeAnuncio = !B.revivido, wi = B.wi;
  ventana(`<h3 class="ol mal">OS HAN DESPEDIDO</h3><p>Microblizz ha sustituido a tu grupo por un chatbot. ¿Lo intentas otra vez?</p>
    ${puedeAnuncio ? `<button class="btn verde ol" id="d-anuncio">REVIVIR · VER ANUNCIO</button>
    <button class="btn dorado ol" id="d-gemas">REVIVIR · ${AJUSTES.revivirGemas} GEMAS</button>` : ''}
    <button class="btn ol" id="d-salir">VOLVER AL MAPA</button>`, () => {
    const revive = () => { cerrarVentana(); B.revivido = true; B.fin = false; for (const h of B.heroes) revivir(h, 0.5); musicSet(MUNDOS[B.wi].niveles[B.li].jefe ? MUNDOS[B.wi].musica : HEROES[SAVE.grupo[0]].fac); };
    if (puedeAnuncio) {
      $('#d-anuncio').onclick = () => verAnuncio('revivir', revive);
      $('#d-gemas').onclick = () => { if (SAVE.gemas < AJUSTES.revivirGemas) { aviso('No tienes gemas suficientes.'); abrirTienda('gemas'); cerrarVentana(); salirBatalla(); return; } SAVE.gemas -= AJUSTES.revivirGemas; guardar(); revive(); };
    }
    $('#d-salir').onclick = () => { cerrarVentana(); for (const k of SAVE.grupo) { SAVE.heroes[k].hp = null; SAVE.heroes[k].mp = null; } guardar(); salirBatalla(); irMapa(wi); aviso('Recursos Humanos os ha readmitido: grupo curado.'); };
  });
}
function salirBatalla() { B = null; cerrarMenu(); }
function pausar() {
  if (!B || B.fin) return; B.pausa = true; M.lp && M.lp.frequency.setTargetAtTime(600, AC.currentTime, 0.08);
  ventana(`<h3 class="ol">PAUSA</h3>${ajustesHtml()}<button class="btn naranja ol" id="pz-seguir">SEGUIR</button><button class="btn ol" id="pz-huir">HUIR AL MAPA</button>`, () => {
    montarAjustes();
    $('#pz-seguir').onclick = () => { cerrarVentana(); B.pausa = false; M.lp && M.lp.frequency.setTargetAtTime(18000, AC.currentTime, 0.08); };
    $('#pz-huir').onclick = () => { const wi = B.wi; guardarGrupo(); guardar(); cerrarVentana(); M.lp && M.lp.frequency.setTargetAtTime(18000, AC.currentTime, 0.08); salirBatalla(); irMapa(wi); };
  });
}
$('#b-pausa').onclick = pausar;

