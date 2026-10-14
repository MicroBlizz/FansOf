// Fans of Crush · PANTALLAS: lo que va en HTML encima del lienzo. La portada, la barra del mapa (oro, estrellas, maletín, tienda y opciones)
// y las ventanas: el memorándum antes de cada nivel, el final (ganar o perder), la pausa, las opciones, la máquina de café y el maletín.
'use strict';
const CR_SVG = {
  oro: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#ffd36b" stroke="#4a2d6b" stroke-width="2.4"/><circle cx="12" cy="12" r="6" fill="none" stroke="#e0a21a" stroke-width="2"/></svg>',
  estrella: '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z" fill="#ffd36b" stroke="#4a2d6b" stroke-width="2.2" stroke-linejoin="round"/></svg>',
  estrellaOff: '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z" fill="#e2d6ff" stroke="#4a2d6b" stroke-width="2.2" stroke-linejoin="round"/></svg>',
  rueda: '<svg viewBox="0 0 24 24"><path d="M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm8.6 4.8l1.9 1.5-2 3.4-2.3-.8a8 8 0 01-2.1 1.2l-.4 2.4h-4l-.4-2.4a8 8 0 01-2.1-1.2l-2.3.8-2-3.4 1.9-1.5a8 8 0 010-2.6L1.5 8.7l2-3.4 2.3.8A8 8 0 017.9 4.9l.4-2.4h4l.4 2.4a8 8 0 012.1 1.2l2.3-.8 2 3.4-1.9 1.5a8 8 0 010 2.6z" fill="#ffffff" stroke="#4a2d6b" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  taza: '<svg viewBox="0 0 24 24"><path d="M4 8h12v7a5 5 0 01-5 5H9a5 5 0 01-5-5z" fill="#ffffff" stroke="#4a2d6b" stroke-width="2.2"/><path d="M16 10h1.5a2.5 2.5 0 010 5H16" fill="none" stroke="#4a2d6b" stroke-width="2.2"/><path d="M8 3c1 1.2-1 2 0 3.2M12 3c1 1.2-1 2 0 3.2" fill="none" stroke="#b79cff" stroke-width="1.8" stroke-linecap="round"/></svg>',
  maletin: '<svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="3" fill="#ff8fa8" stroke="#4a2d6b" stroke-width="2.2"/><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" fill="none" stroke="#4a2d6b" stroke-width="2.2"/><rect x="10" y="11" width="4" height="4" rx="1" fill="#ffd36b" stroke="#4a2d6b" stroke-width="1.6"/></svg>',
  cerrar: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="#4a2d6b" stroke-width="3.2" stroke-linecap="round"/></svg>',
  movil: '<svg viewBox="0 0 24 24"><rect x="6" y="2.5" width="12" height="19" rx="3" fill="#ffffff" stroke="#4a2d6b" stroke-width="2.2"/><path d="M12 7v7m-3-3l3 3 3-3" fill="none" stroke="#ff7a96" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};
const crH = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const CR_ICONO_IMG = {};
function crIconoImg(tipo, c) {   // el icono de un objetivo (dibujado en un lienzo) como imagen para el HTML
  const k = tipo + ':' + c; if (CR_ICONO_IMG[k]) return CR_ICONO_IMG[k];
  const cv = document.createElement('canvas'); cv.width = cv.height = 96; const x = cv.getContext('2d');
  crIcono(x, tipo, c, 48, 54, 34); return (CR_ICONO_IMG[k] = cv.toDataURL());
}
/* ---------- qué pantalla se ve ---------- */
const CR_PANT = { actual: 'titulo', pausa: false };
function crIrA(p) {
  CR_PANT.actual = p; CR_PANT.pausa = false; crCierraModal();
  $('#cr-titulo').hidden = p !== 'titulo';
  $('#cr-barra').hidden = p !== 'mapa';
  if (p === 'mapa') { crMusica('menu'); crPintaBarra(); crMapaCentra(crSiguienteNivel()); if (!SAVE.vistos.mapa) { SAVE.vistos.mapa = 1; crGuarda(); crDespues(0.5, () => crAviso(tr('LA ESCALERA CORPORATIVA'), tr('Sube nivel a nivel por la torre de Microblizz hasta el despacho de Recursos Humanos. Cada estrella llena tu maletín de bonus.'))); } }
  if (p === 'titulo') crMusica('menu');
}
function crModal(html, clase = '') {
  const m = $('#cr-modal'); m.hidden = false; m.className = 'cr-modal ' + clase;
  $('#cr-tarjeta').innerHTML = html;
  const x = $('#cr-tarjeta .cr-x'); if (x) x.onclick = () => { play('select'); crCierraModal(); };
}
function crCierraModal() { $('#cr-modal').hidden = true; $('#cr-tarjeta').innerHTML = ''; }
function crAviso(titulo, texto) {
  crModal(`<span class="cr-quien">${tr('LOLA · DESPEDIDA POR MICROBLIZZ')}</span><h3>${crH(titulo)}</h3><p class="cr-txt">${crH(texto)}</p><button class="cr-btn" id="cr-ok">${tr('¡VALE!')}</button>`, 'cr-aviso');
  $('#cr-ok').onclick = () => { play('select'); crCierraModal(); };
}
/* ---------- la barra del mapa ---------- */
function crPintaBarra() {
  const total = crEstrellasTotal(), lleno = SAVE.maletin >= CR_MALETIN;
  $('#cr-barra').innerHTML = `
    <span class="cr-pill">${CR_SVG.oro}<b>${fmt(SAVE.oro)}</b></span>
    <span class="cr-pill">${CR_SVG.estrella}<b>${total}</b><i class="cr-mini"><i style="width:${Math.min(100, (SAVE.maletin / CR_MALETIN) * 100)}%"></i></i></span>
    ${lleno ? `<button class="cr-redondo cr-brilla" id="cr-b-maletin" aria-label="${tr('Maletín de bonus')}">${CR_SVG.maletin}</button>` : ''}
    <span class="cr-hueco"></span>
    <button class="cr-redondo" id="cr-b-tienda" aria-label="${tr('Máquina de café')}">${CR_SVG.taza}</button>
    <button class="cr-redondo" id="cr-b-opc" aria-label="${tr('Opciones')}">${CR_SVG.rueda}</button>`;
  $('#cr-b-tienda').onclick = () => { play('select'); crAbreTienda(); };
  $('#cr-b-opc').onclick = () => { play('select'); crAbreOpciones(); };
  if (lleno) $('#cr-b-maletin').onclick = () => { play('select'); crAbreMaletin(); };
}
/* ---------- el memorándum antes de jugar ---------- */
function crAbreIntro(id) {
  const N = crNivel(id), est = crEstrellasDe(id), rec = SAVE.niveles[id] ? SAVE.niveles[id].p : 0;
  const objs = N.obj.map(o => `<li><img src="${crIconoImg(o.t === 'puntos' ? 'puntos' : o.t, o.c || 0)}" alt=""><span>${crH(crTextoObjetivo(o))}</span></li>`).join('');
  crModal(`<button class="cr-x" aria-label="${tr('Cerrar')}">${CR_SVG.cerrar}</button>
    <small class="cr-planta">${tr(CR_PLANTAS[0].n)}</small><h2 class="cr-nivel">${tr('NIVEL ' + id)}</h2><p class="cr-nombre">${crH(tr(N.nombre))}</p>
    <div class="cr-memo"><b>${tr('MEMORÁNDUM INTERNO')}</b><p>${crH(tr(N.memo))}</p></div>
    <ul class="cr-objs">${objs}</ul>
    <p class="cr-movs">${tr(N.movs + ' movimientos')}</p>
    <div class="cr-estr">${[0, 1, 2].map(k => (k < est ? CR_SVG.estrella : CR_SVG.estrellaOff)).join('')}${rec ? `<small>${tr('Récord: ' + fmt(rec))}</small>` : ''}</div>
    <button class="cr-btn" id="cr-ya">${tr('¡A TRABAJAR!')}</button>`, 'cr-intro');
  $('#cr-ya').onclick = () => { play('go'); crJugarNivel(id); };
}
function crJugarNivel(id) {
  crCierraModal(); crIrA('partida'); CR_IN.sel = null; CR_IN.martillo = false; CR_IN.arrastra = false;
  crEmpieza(id); crTutoEmpieza();
}
/* ---------- el final de un nivel ---------- */
const CR_FRASES_GANA = ['Recursos Humanos lo llama «rendimiento aceptable».', 'Te han subido el sueldo un 0 %. ¡Enhorabuena!', 'Microblizz se atribuye tu éxito en una nota de prensa.', 'Tu jefe ha dicho «bien» sin mirarte. Es un récord.'];
const CR_FRASES_PIERDE = ['Recursos Humanos ha tomado nota. Con boli rojo.', 'No pasa nada: aquí nadie mira los resultados. Salvo todos.', 'Microblizz lo llama «oportunidad de crecimiento».'];
const crPrecioMas5 = () => 300 * (CR_P.mas5 + 1);
function crPantallaFin(gana) {
  const P = CR_P, N = P.N;
  if (gana) {
    const R = P.premio, sig = crNivel(N.id + 1);
    crModal(`<h2 class="cr-titulo-fin">${tr('¡NIVEL SUPERADO!')}</h2>
      <div class="cr-estr cr-grande">${[0, 1, 2].map(k => `<span class="cr-e${k < P.estrellas ? ' on' : ''}" style="animation-delay:${0.25 + k * 0.35}s">${k < P.estrellas ? CR_SVG.estrella : CR_SVG.estrellaOff}</span>`).join('')}</div>
      <p class="cr-puntos">${fmt(P.puntos)} <small>${tr('PUNTOS')}</small></p>
      ${R.record ? `<p class="cr-record">${tr('¡NUEVO RÉCORD!')}</p>` : ''}
      <div class="cr-premios"><span class="cr-pill">${CR_SVG.oro}<b>+${R.oro}</b></span>${R.nuevas ? `<span class="cr-pill">${CR_SVG.estrella}<b>+${R.nuevas}</b></span>` : ''}</div>
      <div class="cr-maletin"><span>${tr('Maletín de bonus')}</span><i class="cr-mini cr-ancha"><i style="width:${Math.min(100, (SAVE.maletin / CR_MALETIN) * 100)}%"></i></i><b>${Math.min(SAVE.maletin, CR_MALETIN)}/${CR_MALETIN}</b></div>
      <p class="cr-txt">${crH(tr(crElige(CR_FRASES_GANA)))}</p>
      <div class="cr-fila">${sig ? `<button class="cr-btn" id="cr-sig">${tr('SIGUIENTE')}</button>` : ''}<button class="cr-btn2" id="cr-mapa">${tr('MAPA')}</button></div>`, 'cr-fin');
    [0, 1, 2].forEach(k => { if (k < P.estrellas) crDespues(0.25 + k * 0.35, () => play('crEstrella', k)); });
    if (sig) $('#cr-sig').onclick = () => { play('select'); crAbreIntro(sig.id); };
    $('#cr-mapa').onclick = () => { play('select'); crIrA('mapa'); };
    return;
  }
  const faltan = P.obj.filter(o => !crObjListo(o)).map(o => {
    const n = o.t === 'puntos' ? fmt(o.n - P.puntos) : o.t === 'jefe' ? Math.ceil(P.jefe.vida) : o.total - o.hecho;
    return `<li><img src="${crIconoImg(o.t === 'puntos' ? 'puntos' : o.t, o.c || 0)}" alt=""><b>${n}</b></li>`;
  }).join('');
  const cafe = SAVE.potes.cafe > 0, precio = crPrecioMas5(), puede = P.mas5 < 2 && (cafe || SAVE.oro >= precio);
  crModal(`<h2 class="cr-titulo-fin cr-pierde">${tr('¡SIN MOVIMIENTOS!')}</h2>
    <p class="cr-txt">${tr('Te faltaba muy poco:')}</p><ul class="cr-faltan">${faltan}</ul>
    ${puede ? `<button class="cr-btn cr-oferta" id="cr-mas5"><b>${tr('+5 MOVIMIENTOS')}</b><small>${cafe ? tr('Gasta 1 café') : tr(precio + ' de oro')}</small></button>` : ''}
    <p class="cr-txt">${crH(tr(crElige(CR_FRASES_PIERDE)))}</p>
    <div class="cr-fila"><button class="cr-btn${puede ? '2' : ''}" id="cr-otra">${tr('REINTENTAR')}</button><button class="cr-btn2" id="cr-mapa">${tr('MAPA')}</button></div>`, 'cr-fin');
  if (puede) $('#cr-mas5').onclick = () => { if (cafe) SAVE.potes.cafe--; else SAVE.oro -= precio; crGuarda(); crCierraModal(); crMusica(N.musica); crMasMovs(5); };
  $('#cr-otra').onclick = () => { play('select'); crJugarNivel(N.id); };
  $('#cr-mapa').onclick = () => { play('select'); crIrA('mapa'); };
}
/* ---------- pausa y opciones ---------- */
function crAbrePausa() {
  if (CR_P.estado !== 'jugando') return;
  CR_PANT.pausa = true;
  crModal(`<h2 class="cr-titulo-fin">${tr('PAUSA')}</h2><p class="cr-txt">${tr('Microblizz también para a tomar café. Diez minutos. Sin cobrar.')}</p>
    <button class="cr-btn" id="cr-seguir">${tr('SEGUIR')}</button>
    <div class="cr-fila"><button class="cr-btn2" id="cr-otra">${tr('REINTENTAR')}</button><button class="cr-btn2" id="cr-mapa">${tr('MAPA')}</button></div>
    <button class="cr-enlace" id="cr-opc">${tr('Opciones')}</button>`, 'cr-pausa');
  $('#cr-seguir').onclick = () => { play('select'); crCierraModal(); CR_PANT.pausa = false; };
  $('#cr-otra').onclick = () => { play('select'); crJugarNivel(CR_P.N.id); };
  $('#cr-mapa').onclick = () => { play('select'); crParaTodo(); CR_P.estado = 'nada'; crIrA('mapa'); };
  $('#cr-opc').onclick = () => { play('select'); crAbreOpciones(true); };
}
function crAbreOpciones(desdePausa) {
  crModal(`<button class="cr-x" aria-label="${tr('Cerrar')}">${CR_SVG.cerrar}</button><h2 class="cr-titulo-fin">${tr('OPCIONES')}</h2>
    <div class="opt-list cr-opts">
      <div class="opt-row"><span><b>${tr('Sonido')}</b></span><button class="cr-btn2 cr-peq" id="cr-o-son"></button></div>
      <div class="opt-row"><span><b>${tr('Música')}</b></span><button class="cr-btn2 cr-peq" id="cr-o-mus"></button></div>
      <div class="opt-row"><span><b>${tr('Idioma / Language')}</b><br>${tr('Automático: el del navegador. Al cambiarlo se recarga la página.')}</span><span class="idioma-fl" id="idioma-banderas"></span></div>
      <div class="opt-row" id="cr-o-inst" hidden><span><b>${tr('Instalar como app')}</b><br>${tr('Juega desde la pantalla de inicio, sin barras del navegador.')}</span><button class="cr-btn2 cr-peq" id="cr-o-instb">${CR_SVG.movil}${tr('INSTALAR')}</button></div>
      <div class="opt-row"><span><b>${tr('Empezar de cero')}</b><br>${tr('Borra tus estrellas, tu oro y tus ayudas.')}</span><button class="cr-btn2 cr-peq cr-peligro" id="cr-o-borra">${tr('BORRAR')}</button></div>
    </div>
    <p class="cr-ver">${tr('Fans of Crush · versión ' + VERSION)}</p>`, 'cr-opciones');
  if (window.filaCuenta) $('.cr-opts').insertBefore(window.filaCuenta, $('#cr-o-inst'));
  try { pintarBanderas($('#idioma-banderas'))(); } catch (e) { /* sin banderas */ }
  const pinta = () => { $('#cr-o-son').textContent = SAVE.muted ? tr('APAGADO') : tr('ENCENDIDO'); $('#cr-o-mus').textContent = SAVE.musica === false ? tr('APAGADA') : tr('ENCENDIDA'); };
  pinta();
  $('#cr-o-son').onclick = () => { SAVE.muted = !SAVE.muted; applyVolume(); crGuarda(); play('select'); pinta(); };
  $('#cr-o-mus').onclick = () => { SAVE.musica = SAVE.musica === false; applyVolume(); crGuarda(); play('select'); pinta(); };
  if (crPuedeInstalar()) { $('#cr-o-inst').hidden = false; $('#cr-o-instb').onclick = crInstala; }
  $('#cr-o-borra').onclick = () => confirmBox(tr('¿EMPEZAR DE CERO?'), tr('Se borran tus estrellas, tu oro y tus ayudas. No se puede deshacer.'), tr('BORRAR'), () => { crBorraTodo(); crIrA('mapa'); });
  if (desdePausa) $('#cr-tarjeta .cr-x').onclick = () => { play('select'); crAbrePausa(); };
}
/* ---------- la máquina de café (tienda) y el maletín de bonus ---------- */
const CR_TIENDA = [
  { k: 'martillo', n: 'MARTILLO', d: 'Despide una ficha o rompe una capa, sin gastar movimiento.', p: 250 },
  { k: 'cafe', n: 'CAFÉ +5', d: 'Cinco movimientos más. Recién hecho.', p: 400 },
  { k: 'mezcla', n: 'REESTRUCTURAR', d: 'Mezcla el tablero. Como hace Microblizz cada lunes.', p: 150 },
];
function crIconoPoteImg(k) {
  const clave = 'pote:' + k; if (CR_ICONO_IMG[clave]) return CR_ICONO_IMG[clave];
  const cv = document.createElement('canvas'); cv.width = cv.height = 96; const x = cv.getContext('2d'); x.translate(48, 50); x.scale(1.5, 1.5);
  x.beginPath(); x.arc(0, 0, 28, 0, CR_TAU); x.fillStyle = '#ffffff'; x.fill(); x.lineWidth = 3; x.strokeStyle = CR_COL.tinta; x.stroke();
  crIconoPote(x, k, CR_POTES.find(P => P.k === k).col); return (CR_ICONO_IMG[clave] = cv.toDataURL());
}
function crAbreTienda() {
  const vuelve = CR_PANT.actual === 'partida';
  const filas = CR_TIENDA.map(T => `<li><img src="${crIconoPoteImg(T.k)}" alt=""><span><b>${tr(T.n)}</b><small>${tr(T.d)}</small><em>${tr('Tienes: ' + (SAVE.potes[T.k] || 0))}</em></span><button class="cr-btn cr-peq" data-k="${T.k}"${SAVE.oro < T.p ? ' disabled' : ''}>${CR_SVG.oro}${T.p}</button></li>`).join('');
  crModal(`<button class="cr-x" aria-label="${tr('Cerrar')}">${CR_SVG.cerrar}</button><h2 class="cr-titulo-fin">${tr('MÁQUINA DE CAFÉ')}</h2>
    <p class="cr-txt">${tr('Acepta oro. No devuelve cambio.')}</p><span class="cr-pill cr-centro">${CR_SVG.oro}<b>${fmt(SAVE.oro)}</b></span>
    <ul class="cr-tienda">${filas}</ul>`, 'cr-tienda-m');
  for (const b of document.querySelectorAll('.cr-tienda button')) b.onclick = () => {
    const T = CR_TIENDA.find(q => q.k === b.dataset.k); if (!T || SAVE.oro < T.p) return;
    SAVE.oro -= T.p; SAVE.potes[T.k] = (SAVE.potes[T.k] || 0) + 1; crGuarda(); play('crMoneda'); crAbreTienda(); if (!vuelve) crPintaBarra();
  };
  if (vuelve) { CR_PANT.pausa = true; $('#cr-tarjeta .cr-x').onclick = () => { play('select'); crCierraModal(); CR_PANT.pausa = false; }; }
  else $('#cr-tarjeta .cr-x').onclick = () => { play('select'); crCierraModal(); crPintaBarra(); };
}
function crAbreMaletin() {
  if (SAVE.maletin < CR_MALETIN) return;
  SAVE.maletin -= CR_MALETIN;
  const potes = ['martillo', 'cafe', 'mezcla'], uno = crElige(potes), otro = crElige(potes.filter(k => k !== uno)), oro = 150;
  SAVE.potes[uno] += 2; SAVE.potes[otro] += 1; SAVE.oro += oro; crGuarda();
  const nombre = k => tr(CR_POTES.find(P => P.k === k).n);
  crModal(`<h2 class="cr-titulo-fin">${tr('MALETÍN DE BONUS')}</h2><div class="cr-abre">${CR_SVG.maletin}</div>
    <p class="cr-txt">${tr('Como los de la directiva, pero con cosas útiles dentro.')}</p>
    <ul class="cr-faltan cr-regalos"><li><img src="${crIconoPoteImg(uno)}" alt=""><b>×2</b><small>${nombre(uno)}</small></li><li><img src="${crIconoPoteImg(otro)}" alt=""><b>×1</b><small>${nombre(otro)}</small></li><li>${CR_SVG.oro}<b>+${oro}</b><small>${tr('ORO')}</small></li></ul>
    <button class="cr-btn" id="cr-ok">${tr('¡GENIAL!')}</button>`, 'cr-fin');
  play('crRescate'); crConfeti(90);
  $('#cr-ok').onclick = () => { play('select'); crCierraModal(); crPintaBarra(); };
}
