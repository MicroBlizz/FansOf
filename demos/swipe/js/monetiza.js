// Fans of Swipe · LO QUE AYUDA A PAGAR EL JUEGO, siempre voluntario y a precio fijo (nada con azar se paga):
// · Revivir con un anuncio: una vez por subida, si caes en el Acto 2, Lola te readmite con media vida. El anuncio lo pone la capa
//   común de core (ANUNCIOS.ver). Por ahora solo sale en la alfa y en desarrollo, como en Snakes: en la web de verdad no aparece
//   hasta que estén AdMob y el sí de Arkioner.
// · El atajo al Acto 2: empezar directamente en el piso 16 (con el mazo inicial, oro y tres cartas). Gratis una vez al día; las demás
//   veces cuesta gemas (la moneda comprada, a precio fijo). Las gemas se guardan en SAVE.gemas; venderlas con dinero real llegará
//   con Google Play Billing (core/js/sistema/pagos.js) y el sí de Arkioner.
'use strict';
const swHayAnuncios = () => !!(NUCLEO.alfa || NUCLEO.desarrollo) && typeof ANUNCIOS !== 'undefined';

/* ---------- revivir ---------- */
function swPuedeRevivir(P) { return !!P && P.acto === 2 && !P.revivido && swHayAnuncios(); }
function swOfreceRevivir(P) {
  SW_PANT.pausa = true;
  const t = swModal(`<span data-mini="ev-lola"></span><h2>${tr('¡Lola te readmite!')}</h2>
    <p class="sw-sub">${tr('Has caído en el piso {n}. Lola conoce a alguien en Recursos Humanos: mira un anuncio y sigues con media vida. Solo una vez por subida.', { n: P.piso })}</p>
    <button class="sw-btn sw-enorme" id="sw-rev-si" type="button">${tr('VER ANUNCIO Y SEGUIR')}</button>
    <button class="sw-btn2 sw-rojo" id="sw-rev-no" type="button">${tr('NO, GRACIAS')}</button>`);
  const m = t.querySelector('[data-mini]'); if (m) m.append(swMiniatura('ev-lola', 1));
  const rinde = () => { P.revivido = true; swCierraModal(); SW_PANT.pausa = false; swCae(); };
  $('#sw-rev-no').onclick = () => { play('select'); rinde(); };
  $('#sw-rev-si').onclick = () => {
    play('select');
    ANUNCIOS.ver('swipe-revivir').then(r => { if (r && r.visto) swRevive(P); else rinde(); });
  };
}
function swRevive(P) {
  P.revivido = true; P.vida = Math.ceil(P.vidaMax / 2);
  swCierraModal(); SW_PANT.pausa = false;
  swAviso(tr('¡READMITIDO!'), '#6ee36a'); swFx('cura', { n: P.vida }); play('swReliquia');
  P.fase = 'carta';
  if (P.C && P.C.vida > 0) { P.carta = swRoba(P); swNuevaMecha(); }   // caíste en combate: sigue el combate
  else { P.C = null; swSiguiente(); }                                 // caíste en un evento: al piso siguiente
  swGuardaSubida();
}

/* ---------- el atajo al Acto 2 ---------- */
const swHoy = () => new Date().toISOString().slice(0, 10);
const swAtajoGratis = () => SAVE.atajoDia !== swHoy();
function swPreparaAtajo(P) {
  P.acto = 2; P.mapa = swNuevoMapa(1).concat(swNuevoMapa(2)); P.piso = SW_ACTOS[1].desde; P.revivido = false;
  P.oro += SW_CFG.atajo.oro; P.vidaMax += SW_CFG.atajo.vida; P.vida = P.vidaMax;
  for (let i = 0; i < SW_CFG.atajo.cartas; i++) P.mazo.push({ id: swCartaPremio(P), mejor: false });
}
function swAtajo() {
  const gratis = swAtajoGratis(), precio = SW_CFG.atajo.gemas, gemas = SAVE.gemas || 0;
  const t = swModal(`<span data-mini="n-jefe2"></span><h2>${tr('Atajo al Acto 2')}</h2>
    <p class="sw-sub">${tr('Empiezas en el piso 16, contra Phony, con tu mazo inicial, {o} de oro, {c} cartas nuevas y una reliquia a elegir.', { o: SW_CFG.oroInicio + SW_CFG.atajo.oro, c: SW_CFG.atajo.cartas })}</p>
    <p class="sw-nuevo">${gratis ? tr('Hoy es gratis (una vez al día).') : tr('Cuesta {p} gemas. Tienes {g}.', { p: precio, g: gemas })}</p>
    <button class="sw-btn sw-enorme" id="sw-at-si" type="button">${gratis ? tr('¡VAMOS!') : tr('USAR {p} GEMAS', { p: precio })}</button>
    <button class="sw-btn2 sw-azul" id="sw-at-no" type="button">${tr('VOLVER')}</button>`);
  const m = t.querySelector('[data-mini]'); if (m) m.append(swMiniatura('n-jefe2', 4));
  $('#sw-at-no').onclick = () => { play('select'); swCierraModal(); };
  $('#sw-at-si').onclick = () => {
    if (!gratis && gemas < precio) { play('swNoVale'); toast(tr('Te faltan {n} gemas', { n: precio - gemas })); return; }
    if (gratis) SAVE.atajoDia = swHoy(); else SAVE.gemas = gemas - precio;
    swGuarda(); swEmpieza(false, true);
  };
}
