// Fans of Asalto · PANTALLAS: el menú principal (entrar en la mazmorra, equipo, herrería, logros, tienda y ajustes), las ventanas de
// la partida (la victoria con su cofre, elegir reliquia, el final de la partida o de la zona), el anuncio de PRUEBA (siempre
// voluntario) y los consejos de la guía (MeerCat), que salen una sola vez cada uno. Lo de fuera de la partida está en pantallas-fuera.js.
'use strict';
const AS_PANT = { actual: 'titulo', pausa: false };
function asH(s) { return String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]); }
// un dibujo de pixel art metido en la ventana: un muñeco, el cofre o un icono
function asLienzo(nombre, L, icono) {
  const cv = document.createElement('canvas'); cv.width = L; cv.height = L; cv.className = 'as-pix';
  const c = cv.getContext('2d');
  if (icono) asIcono(c, nombre, L / 2, L / 2, L * 0.9); else asRetrato(c, nombre, L / 2, L / 2, L);
  return cv;
}
function asModal(html, clase) {
  const m = $('#as-modal'), t = $('#as-tarjeta');
  t.className = 'as-tarjeta' + (clase ? ' ' + clase : ''); t.innerHTML = html; m.hidden = false;
  return t;
}
function asCierraModal() { $('#as-modal').hidden = true; }
function asPlumasHtml(n) { return `<span class="as-plumas"><i class="as-ico-pluma"></i>${n}</span>`; }

/* ---------- el menú principal ---------- */
function asMenu() {
  AS_PANT.actual = 'titulo'; AS_PANT.pausa = false; AS_P = null; AS_B = null; asCierraModal();
  $('#as-titulo').hidden = false; asMusica('menu');
  $('#as-mejor').textContent = SAVE.mejor ? tr('Mejor nivel: {n}', { n: SAVE.mejor }) : tr('Baja a la mazmorra de Microblizz');
  $('#as-plumas-menu').textContent = String(SAVE.plumas);
  const g = $('#as-pluma-ico').getContext('2d'); g.clearRect(0, 0, 22, 22); asIcono(g, 'pluma', 11, 11, 20);
  const pend = asLogrosPendientes().length; $('#as-logros').classList.toggle('as-aviso', pend > 0);
}
function asEntrar() {
  const filas = AS_ZONAS.map((z, i) => { const abierta = i === 0 || SAVE.zonas.includes(i - 1); return `<button class="as-zona${abierta ? '' : ' cerrada'}" data-z="${i}" type="button"><b>${asH(tr(z.nombre))}</b><small>${abierta ? tr('{n} niveles · jefe: {j}', { n: z.niveles, j: tr(AS_ENEMIGOS[z.jefe.tipo].nombre) }) + (SAVE.zonas.includes(i) ? ' · ' + tr('terminada') : '') : tr('Termina la zona anterior para abrirla')}</small></button>`; }).join('');
  const t = asModal(`<h2>${tr('LA MAZMORRA')}</h2><div class="as-zonas">${filas}</div><button class="as-btn2 as-gris" id="as-z-no" type="button">${tr('VOLVER')}</button>`);
  t.querySelectorAll('.as-zona').forEach(b => b.onclick = () => {
    const i = +b.dataset.z;
    if (b.classList.contains('cerrada')) { play('asNoVale'); toast(tr('Termina la zona anterior para abrirla')); return; }
    play('select'); asCierraModal(); asEmpiezaPartida(i);
  });
  $('#as-z-no').onclick = () => { play('select'); asCierraModal(); };
}
function asEmpiezaPartida(zona) {
  $('#as-titulo').hidden = true; AS_PANT.actual = 'partida';
  asNuevaPartida(zona); asMusica('animales');
  asConsejo('flechas0');
}

/* ---------- el anuncio de prueba ---------- */
function asAnuncio(alAcabar) {
  const ov = $('#as-anuncio'); let t = NUCLEO.desarrollo ? 1 : 5;
  ov.hidden = false; play('select');
  const ok = $('#as-ad-ok'), barra = $('#as-ad-barra');
  const tic = () => {
    if (t > 0) { ok.disabled = true; ok.textContent = tr('El premio llega en {t}…', { t }); barra.style.width = ((5 - t) / 5 * 100) + '%'; t--; ov._t = setTimeout(tic, 1000); return; }
    barra.style.width = '100%'; ok.disabled = false; ok.textContent = tr('RECOGER PREMIO'); play('levelup');
  };
  clearTimeout(ov._t); tic();
  ok.onclick = () => { if (t > 0) return; ov.hidden = true; alAcabar(); };
  $('#as-ad-no').onclick = () => { clearTimeout(ov._t); ov.hidden = true; play('select'); toast(tr('Anuncio cerrado: sin premio')); };
}

/* ---------- el cofre de la sala (lo pinta la arena; aquí se abre) ---------- */
function asAbreCofre(mult) {
  const C = AS_P.cofre; if (!C || C.abierto) return;
  C.abierto = true; C.tAbre = 0; C.oroDado = C.oro * mult; C.plumasDadas = C.plumas * mult;
  asGanaOro(C.oroDado); asGanaPlumas(C.plumasDadas); play('asCofre');
}
/* ---------- la victoria: el cofre con el oro (y en el jefe, plumas y objetos) ---------- */
function asVentanaVictoria(oro, plumas, objetos, alAcabar) {
  const jefe = plumas > 0;
  asGanaOro(oro); if (plumas) asGanaPlumas(plumas);
  const objs = objetos.map(o => `<div class="as-obj r${o.rareza}" title="${asH(tr(AS_EQUIPO.nombres[o.hueco]))}"><i data-ico="equipo-${o.hueco}"></i><small>+${o.valor} % ${asH(tr(AS_EQUIPO.stats[o.stat]))}</small></div>`).join('');
  const t = asModal(`<h2>${jefe ? tr('¡JEFE DERROTADO!') : tr('¡VICTORIA!')}</h2><div class="as-cofre" id="as-cofre"></div>
    <p class="as-premio"><b class="as-mas">+${oro}</b> ${tr('de oro')}${plumas ? ` · <b class="as-mas">+${plumas}</b> ${tr('plumas')}` : ''}</p>${objs ? `<p class="as-sub">${tr('Botín de equipo')}</p><div class="as-objs">${objs}</div>` : ''}
    <button class="as-btn2" id="as-sigue" type="button">${tr('SEGUIR')}</button>`);
  t.querySelectorAll('[data-ico]').forEach(i => i.appendChild(asLienzo(i.dataset.ico, 40, true)));
  const caja = $('#as-cofre'), cv = document.createElement('canvas'); cv.width = 160; cv.height = 120; cv.className = 'as-pix'; caja.appendChild(cv);
  const c = cv.getContext('2d'), t0 = performance.now();
  const pinta = () => {
    if (!cv.isConnected) return;
    const d = AS_TIRAS.cofre, k = 4, s = (performance.now() - t0) / 1000;
    c.clearRect(0, 0, 160, 120); c.imageSmoothingEnabled = false;
    if (d && AS_IMG.cofre) {
      const fi = Math.min(d.f.length - 1, Math.floor(s * 6));
      c.globalAlpha = 0.4; c.fillStyle = '#ffe27a'; c.fillRect(80 - 10 - s * 20 % 30, 0, 20 + s * 40 % 60, 120); c.globalAlpha = 1;
      c.drawImage(AS_IMG.cofre, fi * d.w, 0, d.w, d.h, 80 - d.w * k / 2, 112 - d.h * k, d.w * k, d.h * k);
      for (let i = 0; i < 8; i++) { const a = s * 3 + i; asIcono(c, 'moneda', 80 + Math.cos(a) * 50, 50 - (s * 60 + i * 9) % 60, 14); }
    }
    requestAnimationFrame(pinta);
  };
  pinta(); play('asCofre');
  if (objetos.length) { const fuera = asGuardaObjetos(objetos); if (fuera) toast(tr('Mochila llena: {n} objetos se han deshecho en plumas', { n: fuera })); }
  $('#as-sigue').onclick = () => { play('select'); asCierraModal(); alAcabar(); };
}

/* ---------- reliquias: 1 de 3, refrescar, o todas con anuncio ---------- */
function asVentanaReliquias(alAcabar) {
  const libres = Object.keys(AS_RELIQUIAS).filter(k => !AS_P.reliquias.includes(k));
  if (!libres.length) { asGanaOro(8); asAviso(tr('+8 de oro'), true); alAcabar(); return; }
  const tres = shuffle(libres.slice()).slice(0, 3);
  const t = asModal(`<h2>${tr('EL ALTAR')}</h2><p class="as-sub">${tr('Elige una reliquia: vale hasta el final de la partida.')}</p><div class="as-reliqs" id="as-reliqs"></div>
    <div class="as-fila"><button class="as-btn2 as-verde" id="as-r-ref" type="button">${tr('REFRESCAR')}</button><button class="as-btn2 as-rojo" id="as-r-todas" type="button">${tr('LAS QUIERO TODAS')}</button></div><small class="as-pie-ad">${tr('Las dos con anuncio de prueba.')}</small>`);
  const caja = $('#as-reliqs');
  for (const k of tres) {
    const r = AS_RELIQUIAS[k], b = document.createElement('button'); b.type = 'button'; b.className = 'as-reliq';
    b.appendChild(asLienzo(r.icono || (r.clase ? 'clase-' + r.clase : 'reliquia-' + k), 56, true));
    b.insertAdjacentHTML('beforeend', `<b>${asH(tr(r.nombre))}</b>${r.clase ? `<em>${asH(tr(AS_CLASES[r.clase].nombre))}</em>` : ''}<small>${asH(tr(r.txt))}</small>`);
    b.onclick = () => { play('asSube'); AS_P.reliquias.push(k); asCierraModal(); asAviso(tr(r.nombre), true); alAcabar(); };
    caja.appendChild(b);
  }
  $('#as-r-ref').onclick = () => asAnuncio(() => { play('asRefresca'); asVentanaReliquias(alAcabar); });
  $('#as-r-todas').onclick = () => asAnuncio(() => { for (const k of tres) AS_P.reliquias.push(k); play('asSube'); asCierraModal(); asAviso(tr('¡Tres reliquias!'), true); alAcabar(); });
}

/* ---------- el final: la zona terminada o la derrota ---------- */
function asVentanaFin(gano) {
  const P = AS_P, Z = asZona(), logros = asLogrosPendientes();
  const lis = `<ul class="as-datos"><li>${tr('Nivel alcanzado')}: <b>${P.nivel}</b> / ${Z.niveles}</li><li>${tr('Combates ganados')}: <b>${P.combates}</b></li><li>${tr('Plumas ganadas')}: <b>${P.plumas}</b></li></ul>`;
  asModal(`<h2>${gano ? tr('¡ZONA TERMINADA!') : tr('FIN DE LA PARTIDA')}</h2>
    ${gano ? `<div class="as-cofre" id="as-ceo"></div><p>${P.zona === AS_ZONAS.length - 1 ? tr('El CEO de Microblizz sale corriendo con su maletín. Los Animales Locos recuperan la mazmorra… por ahora.') : tr('{z} está limpia. Se abre la siguiente zona.', { z: tr(Z.nombre) })}</p>` : `<p>${tr('Tus héroes no pueden más. Las plumas y el equipo que has ganado se quedan contigo.')}</p>`}
    ${lis}${logros.length ? `<p class="as-sub">${tr('Logros nuevos: {n}. Cóbralos en el menú.', { n: logros.length })}</p>` : ''}
    <div class="as-fila"><button class="as-btn2" id="as-fin-otra" type="button">${tr('OTRA VEZ')}</button><button class="as-btn2 as-gris" id="as-fin-menu" type="button">${tr('MENÚ')}</button></div>`);
  if (gano) $('#as-ceo').appendChild(asLienzo(Z.jefe.tipo, 120));
  $('#as-fin-otra').onclick = () => { play('select'); asCierraModal(); asEmpiezaPartida(P.zona); };
  $('#as-fin-menu').onclick = () => { play('select'); asMenu(); };
}

/* ---------- la pausa y las opciones (las filas comunes de core: sonido, música, idioma y cuenta) ---------- */
function asOpciones(caja, alCerrar) {
  const { lista, version, cerrar } = OPCIONES.lista({
    filas: [
      OPCIONES.interruptor(tr('Sonido'), tr('Efectos y música.'), () => !SAVE.muted, v => { SAVE.muted = !v; asGuarda(); applyVolume(); }),
      OPCIONES.interruptor(tr('Música'), tr('La canción de fondo.'), () => SAVE.musica !== false, v => { SAVE.musica = v; asGuarda(); applyVolume(); }),
      'idioma', 'cuenta',
    ],
    versionTexto: 'Fans of Asalto · v' + VERSION,
    alCerrar,
  });
  caja.append(lista); if (version) caja.append(version); if (cerrar) caja.append(cerrar);
}
function asAbrePausa() {
  AS_PANT.pausa = true;
  const t = asModal(`<h2>${tr('PAUSA')}</h2><div class="as-fila"><button class="as-btn2" id="as-p-sigue" type="button">${tr('SEGUIR')}</button><button class="as-btn2 as-rojo" id="as-p-sale" type="button">${tr('ABANDONAR')}</button></div><div id="as-opc"></div>`, 'as-ancha');
  asOpciones(t.querySelector('#as-opc'));
  $('#as-p-sigue').onclick = () => { play('select'); asCierraModal(); AS_PANT.pausa = false; };
  $('#as-p-sale').onclick = () => confirmBox(tr('¿ABANDONAR?'), tr('Perderás la partida de ahora.'), tr('SÍ, SALIR'), () => { play('select'); asMenu(); });
}
function asAjustes() {
  const t = asModal(`<h2>${tr('AJUSTES')}</h2><div id="as-opc"></div>`, 'as-ancha');
  asOpciones(t.querySelector('#as-opc'), () => asCierraModal());
}

/* ---------- la guía: MeerCat da los consejos ---------- */
const AS_CONSEJOS = {
  flechas0: 'Toca la flecha azul de la arena para entrar en la primera sala.',
  tienda: 'Tienes 25 de oro. Toca un héroe de la tienda para comprarlo: cuesta lo que pone debajo.',
  mover: 'Arrastra a tus héroes por la cuadrícula: los de delante reciben los golpes. Si lo sueltas en la tienda, lo vendes.',
  clases: 'Mira arriba: con 2 héroes distintos de la misma clase se activa su habilidad. Toca el icono para ver qué hace.',
  repetir: 'Puedes comprar el mismo héroe muchas veces: cada compra es un muñeco más. Caben 32.',
  batalla: 'La batalla va sola. Cada enemigo derrotado suelta 1 de oro. Si quieres que vaya más rápido, toca x1 arriba.',
  flechas: 'Elige por dónde seguir con las flechas de la arena: abajo ves el mapa con lo que hay en cada sala.',
  tienda2: 'Mejora la tienda para que salgan héroes mejores (cuesta 5, 10, 15, 20 y 30). Refrescar cuesta 2.',
  cofre: 'Un cofre: ábrelo o dóblalo con un anuncio. Las plumas se quedan contigo para el equipo y la herrería.',
  altar: 'Un altar: elige una reliquia. Muchas son de una clase: mira qué héroes llevas.',
  jefe: 'El jefe pega fuerte. Pon a los tanques delante y a los magos y tiradores detrás.',
};
function asConsejo(id) {
  if (SAVE.consejos[id] || !AS_CONSEJOS[id]) return;
  SAVE.consejos[id] = 1; asGuarda();
  const b = $('#as-guia');
  $('#as-guia-txt').textContent = tr(AS_CONSEJOS[id]);
  const cara = $('#as-guia-cara'); cara.innerHTML = ''; cara.appendChild(asLienzo('heroe-suricata', 64));
  b.hidden = false; b.classList.remove('sale'); void b.offsetWidth; b.classList.add('sale');
  b.onclick = () => { play('select'); b.hidden = true; };
  clearTimeout(b._t); b._t = setTimeout(() => { b.hidden = true; }, 9000);
}
function asInfoClase(k) {
  const cl = AS_CLASES[k], { cuenta, act } = asSinergias(AS_P.equipo);
  const niveles = cl.umbral.map((u, i) => `<li class="${(act[k] || 0) > i ? 'on' : ''}"><b>(${u})</b> ${asH(tr(cl.txt, { v: cl.v[i] }))}</li>`).join('');
  const quien = Object.keys(AS_HEROES).filter(h => AS_HEROES[h].clases.includes(k));
  const t = asModal(`<h2>${asH(tr(cl.nombre)).toUpperCase()}</h2><p class="as-sub">${tr('{n} héroes distintos de esta clase. Más héroes distintos, más nivel.', { n: cuenta[k] || 0 })}</p><ul class="as-niveles">${niveles}</ul><div class="as-quien" id="as-quien"></div><button class="as-btn2" id="as-c-ok" type="button">${tr('VALE')}</button>`);
  for (const h of quien) { const d = document.createElement('div'); d.className = 'as-quien-h' + (AS_P.equipo.some(x => x.tipo === h) ? '' : ' apagado'); d.appendChild(asLienzo(h, 56)); d.insertAdjacentHTML('beforeend', `<small>${AS_HEROES[h].precio}</small>`); $('#as-quien').appendChild(d); }
  AS_PANT.pausa = true;
  $('#as-c-ok').onclick = () => { play('select'); asCierraModal(); AS_PANT.pausa = false; };
}
