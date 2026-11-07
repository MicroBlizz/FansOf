// Fans of Zombies · EL HUD (pantalla): vida, hambre, sed, sueño e infección; la hora y el día; tu ruido; la nota del parche de
// Microblizz; la radio (los avisos); la mochila con sus teclas; el arma; y la etiqueta «F REGISTRAR» encima de lo que tienes al lado.
'use strict';
const HUD = { avisos: [], parche: null, tParche: 0, ruidoMax: 0 };
function montaHud() {
  el('zb').innerHTML = '<div id="h-ets"></div><div class="panel zb-necesidades" id="h-nec"></div><div class="panel zb-reloj" id="h-reloj"></div>' +
    '<div class="panel zb-ruido" id="h-ruido"></div><div class="zb-parche" id="h-parche" hidden></div><div class="zb-radio" id="h-radio" hidden></div>' +
    '<div class="zb-hotbar" id="h-mochila"></div><div class="panel zb-arma" id="h-arma"></div><div class="zb-ayuda" id="h-ayuda"></div>' +
    '<div class="zb-tuto" id="h-tuto" hidden></div><div class="zb-jefe" id="h-jefe" hidden></div><div class="panel zb-arma zb-coche" id="h-coche" hidden></div><b class="zb-et accion" id="h-accion" hidden></b><div class="zb-registro" id="h-registro" hidden><i></i></div>';
  el('h-ayuda').innerHTML = [['WASD', 'andar'], ['MAYÚS', 'correr'], ['C', 'agacharse'], ['CLIC', 'atacar'], ['CLIC DCHO / R', 'empujar'], ['1-6', 'arma'], ['Z', 'dormir'], ['F', 'registrar / puerta'], ['B', 'tablas'], ['TAB', 'mochila'], ['M', 'mapa'], ['ESC', 'pausa']]
    .map(([k, t]) => '<span><b>' + esc(tr(k)) + '</b>' + esc(tr(t)) + '</span>').join('');
  HUD.avisos.length = 0; HUD.parche = null;
}
function barraHud(nombre, v, color, nota) {
  return '<div class="zb-nec"><div class="fila"><span class="lab">' + esc(tr(nombre)) + '</span><b>' + Math.ceil(v) + '</b></div><i class="barra"><i style="width:' + Math.max(0, Math.min(100, v)) + '%;background:' + color + '"></i></i>' +
    (nota ? '<small>' + esc(tr(nota)) + '</small>' : '') + '</div>';
}
function pintaNecesidades(AJ, J) {
  const bajo = AJ.necesidades.aviso, estados = [];
  if (J.agacha && !J.duerme) estados.push('<span>' + esc(tr('AGACHADO')) + '</span>');
  if (J.duerme) estados.push('<span>' + esc(tr('DURMIENDO')) + '</span>');
  if (J.infeccion > 0) estados.push('<span class="malo">' + esc(tr('INFECTADO')) + ' ' + Math.ceil(J.infeccion) + '%</span>');
  if (ZOM.sangra(ZOM.AJ, J) > 0) estados.push('<span class="malo">' + esc(tr('SANGRAS (V)')) + '</span>');   // las heridas (js/heridas.js)
  if ((J.heridas || []).some((h) => h.tipo === 'fractura' && !h.tablilla)) estados.push('<span class="malo">' + esc(tr('HUESO ROTO')) + '</span>');
  if (ZOM.dolor(ZOM.AJ, J) > 30) estados.push('<span>' + esc(tr('DOLOR')) + '</span>');
  el('h-nec').innerHTML = barraHud('VIDA', J.vida / J.max * 100, 'var(--rk-bien)') + barraHud('AGUANTE', J.aguante, J.agotado ? 'var(--rk-mal)' : '#e8e0a0', J.agotado ? 'Agotado: no corres y pegas flojo' : '') +
    barraHud('HAMBRE', J.hambre, '#ffb03a', J.hambre < bajo ? 'Te suenan las tripas (pulsa E)' : '') + barraHud('SED', J.sed, '#58c8ff', J.sed < bajo ? 'Tienes sed (pulsa Q)' : '') +
    barraHud('SUEÑO', J.sueno, '#c99bff', J.sueno < bajo ? 'Te cuesta seguir despierto (pulsa Z)' : '') + '<div class="estados">' + estados.join('') + '</div>';
}
function pintaReloj(AJ, e) {
  const noche = ZOM.esNoche(AJ, e.min), h = ZOM.horaDe(e.min), falta = ZOM.anochece(AJ, e.min) - h;
  const nota = !noche && falta < 120 ? trf('Anochece en %1 min', Math.ceil(falta)) : noche ? tr('NOCHE: te ven menos, pero no ves nada') : '';
  el('h-reloj').innerHTML = '<span class="lab">' + esc(trf('DÍA %1', ZOM.diaDe(e.min))) + ' · ' + esc(tr(ZOM.estacion(AJ, e.min).n)) + (e.sinLuz ? ' · ' + esc(tr('SIN LUZ')) : '') + '</span>' + (e.planta ? '<span class="lab planta">' + esc(textoPlanta(AJ, e.planta)) + '</span>' : '') + '<b>' + ZOM.textoHora(e.min) + '</b><span class="zb-noche">' + esc(nota) + '</span>';
}
function pintaRuido(AJ, e) {
  const J = e.jugador, mio = e.ruidos.filter((r) => r.quien === 'jugador').reduce((m, r) => Math.max(m, r.r * r.t / r.max), 0);
  HUD.ruidoMax = Math.max(mio, HUD.ruidoMax - 0.4);
  const n = Math.min(5, Math.ceil(HUD.ruidoMax / 6)), txt = J.agacha ? 'Agachado: no haces ruido al andar' : J.corre ? 'Corriendo: te oyen de lejos' : 'Andando: te oyen de cerca';
  let extra = '';
  if (J.A.oye) { const k = ZOM.vivos(e).filter((z) => ZOM.dist(z.x, z.z, J.x, J.z) < J.A.oye).length; extra = '<small class="oye">' + esc(trf('Tus orejas oyen %1 fans cerca', k)) + '</small>'; }
  el('h-ruido').innerHTML = '<span class="lab">' + esc(tr('TU RUIDO')) + '</span><i class="zb-ondas">' + [1, 2, 3, 4, 5].map((i) => '<i' + (i > n ? ' class="off"' : '') + '></i>').join('') + '</i><small>' + esc(tr(txt)) + '</small>' + extra;
}
// lo que le queda al arma (barra verde a roja)
function barraDesgaste(AJ, J) {
  const a = ZOM.armaLleva(J, J.arma), p = a && a.p, W = AJ.armas[J.arma];
  if (!p || p.dur == null) return '';
  const f = p.dur / W.dur;
  return '<i class="barra"><i style="width:' + Math.round(f * 100) + '%;background:' + (f > 0.5 ? 'var(--rk-bien)' : f > 0.2 ? 'var(--rk-oro)' : 'var(--rk-mal)') + '"></i></i>';
}
function pintaHotbar(AJ, J) {
  const suma = (que) => Object.keys(AJ.objetos).reduce((s, id) => s + ((AJ.objetos[id].usa || {})[que] && que !== 'vida' ? ZOM.cuantosLleva(J, id) : 0), 0);
  const cosas = [['COMER', 'E', suma('hambre')], ['BEBER', 'Q', suma('sed')], ['VENDAS', 'V', ZOM.cuantosLleva(J, 'venda')], ['CARTUCHOS', '', ZOM.cuantosLleva(J, 'cartuchos')], ['MOCHILA', 'TAB', null]];
  el('h-mochila').innerHTML = cosas.map(([n, k, c]) => '<span class="' + (c === 0 ? 'vacio' : '') + '"><em>' + k + '</em>' + esc(tr(n)) + (c == null ? '' : '<b>' + c + '</b>') + '</span>').join('');
  const W = AJ.armas[J.arma];
  el('h-arma').innerHTML = '<span class="lab">' + esc(tr(W.n)) + ' · ' + (Object.keys(AJ.armas).indexOf(J.arma) + 1) + '</span>' + barraDesgaste(AJ, J) + '<b>' + (!ZOM.lleva(J, J.arma) ? '✕' : W.municion ? ZOM.cuantosLleva(J, W.municion) : '—') + '</b><span class="lab ' + (W.municion ? 'malo' : '') + '">' +
    esc(tr(W.municion ? 'DISPARAR = MUCHO RUIDO' : 'GOLPEAR = POCO RUIDO')) + '</span>';
}
// la etiqueta encima del sitio que puedes registrar, y la barra mientras registras
function pintaAccion(e, cerca, hueco) {
  const a = el('h-accion'), J = e.jugador, r = el('h-registro'), H = !cerca && hueco && e.huecos[hueco.id];
  a.hidden = (!cerca && !H) || !!J.registra || !!J.clava || !!J.desmonta;
  if (H && !J.registra && !J.clava) { const p = sueloAPantalla(hueco.x, 2.4, hueco.z); a.textContent = textoHueco(hueco, H, J); a.style.transform = 'translate(' + Math.round(p.x) + 'px,' + Math.round(p.y) + 'px) translate(-50%,-100%)'; }
  if (cerca && !J.registra) { const p = sueloAPantalla(cerca.x, 1.6, cerca.z); a.textContent = textoSitio(e, cerca); a.style.transform = 'translate(' + Math.round(p.x) + 'px,' + Math.round(p.y) + 'px) translate(-50%,-100%)'; }
  r.hidden = !J.registra && !J.clava && !J.desmonta;
  if (J.desmonta) { const p = sueloAPantalla(J.x, 2.8, J.z); r.style.transform = 'translate(' + Math.round(p.x) + 'px,' + Math.round(p.y) + 'px) translate(-50%,-100%)'; r.firstChild.style.width = (100 - J.desmonta.t / (J.desmonta.total || ZOM.AJ.desmontar.tiempo) * 100) + '%'; }
  if (J.clava) { const p = sueloAPantalla(J.x, 2.8, J.z); r.style.transform = 'translate(' + Math.round(p.x) + 'px,' + Math.round(p.y) + 'px) translate(-50%,-100%)'; r.firstChild.style.width = (100 - J.clava.t / (J.clava.total || ZOM.AJ.huecos.barricada.tiempo) * 100) + '%'; }
  if (J.registra) { const p = sueloAPantalla(J.x, 2.8, J.z), tot = ZOM.AJ.botin.tiempo * (J.A.registra || 1); r.style.transform = 'translate(' + Math.round(p.x) + 'px,' + Math.round(p.y) + 'px) translate(-50%,-100%)'; r.firstChild.style.width = (100 - J.registra.t / tot * 100) + '%'; }
}
// la radio: los avisos de lo que pasa (se van solos)
function avisa(txt, clase) { HUD.avisos.push({ txt, clase: clase || '', t: 6 }); if (HUD.avisos.length > 4) HUD.avisos.shift(); }
function pintaAvisos(dt) {
  HUD.avisos.forEach((a) => (a.t -= dt)); HUD.avisos = HUD.avisos.filter((a) => a.t > 0);
  const r = el('h-radio'); r.hidden = !HUD.avisos.length;
  r.innerHTML = '<b>' + esc(tr('RADIO')) + '</b>' + HUD.avisos.map((a) => '<p class="' + a.clase + '">' + esc(a.txt) + '</p>').join('');
  const p = el('h-parche'); HUD.tParche -= dt; p.hidden = !HUD.parche || HUD.tParche <= 0;
  if (HUD.parche && !p.hidden) p.innerHTML = '<b>' + esc(trf('PARCHE 1.0.%1 DE MICROBLIZZ', HUD.parche.dia)) + '</b><span>' + esc(tr(HUD.parche.parche.n)) + ' ' + esc(tr('«Lo sentimos (no)». — El equipo de Comunidad')) + '</span>';
}
// el cartel sobre un sitio: registrar, abrir o, en las escaleras, subir y bajar
function textoSitio(e, s) {
  if (s.tipo === 'torre') return tr('F  ENTRAR EN LA TORRE');
  if (s.coche) return textoCoche(e, s);
  if (s.tipo === 'superviviente') return trf('F  RESCATAR A %1', ZOM.AJ.animales[s.animal].n);
  if (s.tipo === 'escalera') return s.a === 0 ? tr('F  SALIR A LA CALLE') : s.a === ZOM.AZOTEA(ZOM.AJ) ? tr('F  SUBIR A LA AZOTEA') : trf(s.desdeArriba ? 'F  BAJAR A LA PLANTA %1' : 'F  SUBIR A LA PLANTA %1', s.a);
  return tr(e.registrados[s.id] ? 'F  ABRIR' : 'F  REGISTRAR');
}
const textoPlanta = (AJ, n) => (n === ZOM.AZOTEA(AJ) ? tr('AZOTEA DE LA TORRE') : trf('TORRE · PLANTA %1', n));
// la vida del CEO, arriba en el centro, mientras estás en la azotea
function pintaJefe(AJ, e) {
  const b = el('h-jefe'), ceo = e.planta === ZOM.AZOTEA(AJ) && e.zombis.find((z) => z.T.jefe && z.vida > 0);
  b.hidden = !ceo; if (!ceo) return;
  b.innerHTML = '<b>' + esc(tr('EL CEO DE MICROBLIZZ')) + '</b><span>' + esc(tr('«Esto es una reestructuración»')) + '</span><i><s style="width:' + Math.max(0, ceo.vida / ceo.T.vida * 100).toFixed(1) + '%"></s></i>';
}
// lo que se puede hacer en la puerta o ventana de al lado
function textoHueco(hueco, H, J) {
  const partes = [];
  if (hueco.tipo === 'puerta' && !H.roto && !H.tablas) partes.push(tr(H.abierta ? 'F  CERRAR' : 'F  ABRIR'));
  if (H.tablas < ZOM.AJ.huecos.barricada.max) partes.push(trf('B  TABLAS (%1/3)', H.tablas));
  else partes.push(tr('TAPADA (3/3)'));
  return partes.join('   ');
}
function pintaHud(AJ, e, cerca, dt, hueco) {
  const J = e.jugador;
  pintaJefe(AJ, e); pintaVolante(e);
  pintaNecesidades(AJ, J); pintaReloj(AJ, e); pintaRuido(AJ, e); pintaHotbar(AJ, J); pintaAccion(e, cerca, hueco); pintaAvisos(dt);
}
