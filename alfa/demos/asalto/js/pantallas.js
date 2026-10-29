// Fans of Asalto · PANTALLAS: el menú principal (entrar en la mazmorra, equipo, herrería, logros, tienda y ajustes), las ventanas de
// la partida (el cofre con su doble premio, elegir reliquia, perder un corazón, el final), el anuncio de PRUEBA (siempre voluntario)
// y los consejos de la guía (MeerCat), que salen una sola vez cada uno.
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

/* ---------- el menú principal ---------- */
function asMenu() {
  AS_PANT.actual = 'titulo'; AS_PANT.pausa = false; AS_P = null; AS_B = null; asCierraModal();
  $('#as-titulo').hidden = false; asMusica('menu');
  $('#as-mejor').textContent = SAVE.mejor ? tr('Mejor piso: {n}', { n: SAVE.mejor }) : tr('Baja a la mazmorra de Microblizz');
  $('#as-gemas-menu').textContent = String(SAVE.gemas);
  const g = $('#as-gema-ico').getContext('2d'); g.clearRect(0, 0, 22, 22); asIcono(g, 'gema', 11, 11, 20);
}
function asEntrar() {
  // elegir zona: de momento solo la primera está abierta
  const filas = AS_ZONAS.map((z, i) => `<button class="as-zona${z.bloqueada ? ' cerrada' : ''}" data-z="${i}" type="button"><b>${asH(tr(z.nombre))}</b><small>${z.bloqueada ? tr('Próximamente') : tr('{n} pisos · jefe final: el CEO', { n: z.pisos.length })}</small></button>`).join('');
  const t = asModal(`<h2>${tr('LA MAZMORRA')}</h2><div class="as-zonas">${filas}</div><button class="as-btn2 as-gris" id="as-z-no" type="button">${tr('VOLVER')}</button>`);
  t.querySelectorAll('.as-zona').forEach(b => b.onclick = () => {
    const z = AS_ZONAS[+b.dataset.z];
    if (z.bloqueada) { play('asNoVale'); toast(tr('Esta zona llegará pronto')); return; }
    play('select'); asCierraModal(); asEmpiezaPartida();
  });
  $('#as-z-no').onclick = () => { play('select'); asCierraModal(); };
}
function asEmpiezaPartida() {
  $('#as-titulo').hidden = true; AS_PANT.actual = 'partida';
  asNuevaPartida(); asMusica('animales');
  asConsejo('tienda');
}
function asProximamente(que) { play('select'); toast(tr('{q}: próximamente', { q: que })); }

/* ---------- el anuncio de prueba ---------- */
function asAnuncio(alAcabar) {
  const ov = $('#as-anuncio'); let t = 5;
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

/* ---------- el cofre: abrir normal o doble premio con anuncio ---------- */
function asVentanaCofre(oro, jefe, alAcabar) {
  const t = asModal(`<h2>${jefe ? tr('¡JEFE DERROTADO!') : AS_B ? tr('¡VICTORIA!') : tr('UN COFRE')}</h2><div class="as-cofre" id="as-cofre"></div>
    <p class="as-premio" id="as-premio">${tr('Dentro hay {n} de oro', { n: oro })}${jefe ? '<br>' + tr('y {n} gemas', { n: AS_CFG.gemasJefe }) : ''}</p>
    <div class="as-fila" id="as-cofre-btns"><button class="as-btn2 as-azul" id="as-abrir" type="button">${tr('ABRIR')}</button><button class="as-btn2 as-oro" id="as-doble" type="button">${tr('X2 CON ANUNCIO')}</button></div>`);
  const caja = $('#as-cofre');
  const cv = document.createElement('canvas'); cv.width = 180; cv.height = 150; cv.className = 'as-pix'; caja.appendChild(cv);
  const c = cv.getContext('2d'); let abierto = false, t0 = performance.now();
  const pinta = () => {
    if (!cv.isConnected) return;
    const d = AS_TIRAS.cofre, k = 5, s = (performance.now() - t0) / 1000;
    c.clearRect(0, 0, 180, 150); c.imageSmoothingEnabled = false;
    if (d && AS_IMG.cofre) {
      const fi = abierto ? Math.min(d.f.length - 1, Math.floor(s * 6)) : 0, sal = abierto ? 0 : Math.round(Math.abs(Math.sin(s * 5)) * -6);
      if (abierto) { c.globalAlpha = 0.5; c.fillStyle = '#ffe27a'; c.fillRect(90 - 10 - s * 20 % 30, 0, 20 + s * 40 % 60, 150); c.globalAlpha = 1; }
      c.drawImage(AS_IMG.cofre, fi * d.w, 0, d.w, d.h, 90 - d.w * k / 2, 140 - d.h * k + sal, d.w * k, d.h * k);
      if (abierto && d.f.length < 2) for (let i = 0; i < 8; i++) { const a = s * 3 + i; asIcono(c, 'moneda', 90 + Math.cos(a) * 50, 60 - (s * 60 + i * 9) % 60, 18); }
    }
    requestAnimationFrame(pinta);
  };
  pinta();
  const abre = mult => {
    abierto = true; t0 = performance.now(); play('asCofre');
    AS_P.oro += oro * mult;
    $('#as-premio').innerHTML = `<b class="as-mas">+${oro * mult}</b> ${tr('de oro')}${mult > 1 ? ' ' + tr('(¡doble!)') : ''}`;
    $('#as-cofre-btns').innerHTML = `<button class="as-btn2" id="as-sigue" type="button">${tr('SEGUIR')}</button>`;
    $('#as-sigue').onclick = () => { play('select'); asCierraModal(); alAcabar(); };
  };
  $('#as-abrir').onclick = () => abre(1);
  $('#as-doble').onclick = () => asAnuncio(() => abre(2));
}

/* ---------- reliquias: 1 de 3, refrescar, o todas con anuncio ---------- */
function asVentanaReliquias(alAcabar) {
  const libres = Object.keys(AS_RELIQUIAS).filter(k => !AS_P.reliquias.includes(k));
  if (!libres.length) { asVentanaCofre(8, false, alAcabar); return; }
  const tres = shuffle(libres.slice()).slice(0, 3);
  const t = asModal(`<h2>${tr('ELIGE UNA RELIQUIA')}</h2><p class="as-sub">${tr('Vale para todo el grupo hasta el final de la partida.')}</p><div class="as-reliqs" id="as-reliqs"></div>
    <div class="as-fila"><button class="as-btn2 as-verde" id="as-r-ref" type="button">${tr('REFRESCAR')} · 2</button><button class="as-btn2 as-oro" id="as-r-todas" type="button">${tr('TODAS CON ANUNCIO')}</button></div>`);
  const caja = $('#as-reliqs');
  for (const k of tres) {
    const r = AS_RELIQUIAS[k], b = document.createElement('button'); b.type = 'button'; b.className = 'as-reliq';
    b.appendChild(asLienzo('reliquia-' + k, 64, true));
    b.insertAdjacentHTML('beforeend', `<b>${asH(tr(r.nombre))}</b><small>${asH(tr(r.txt))}</small>`);
    b.onclick = () => { play('asSube'); AS_P.reliquias.push(k); asCierraModal(); asAviso(tr(r.nombre), true); alAcabar(); };
    caja.appendChild(b);
  }
  $('#as-r-ref').onclick = () => { if (AS_P.oro < 2) { play('asNoVale'); toast(tr('No tienes oro suficiente')); return; } AS_P.oro -= 2; play('asRefresca'); asVentanaReliquias(alAcabar); };
  $('#as-r-todas').onclick = () => asAnuncio(() => { for (const k of tres) AS_P.reliquias.push(k); play('asSube'); asCierraModal(); asAviso(tr('¡Tres reliquias!'), true); alAcabar(); });
}

/* ---------- perder un corazón y el final ---------- */
function asVentanaDerrota(alAcabar) {
  asModal(`<h2>${tr('¡DERROTA!')}</h2><div class="as-fila as-corazones">${'<span class="as-cor"></span>'.repeat(AS_P.corazones)}<span class="as-cor roto"></span></div>
    <p>${tr('Has perdido un corazón. Mejora el equipo y vuelve a intentarlo: te damos 2 de oro.')}</p><button class="as-btn2" id="as-otra" type="button">${tr('A LA TIENDA')}</button>`);
  document.querySelectorAll('.as-cor').forEach(e => e.appendChild(asLienzo('corazon', 40, true)));
  $('#as-otra').onclick = () => { play('select'); asCierraModal(); alAcabar(); };
}
function asVentanaFin(gano) {
  const P = AS_P;
  asModal(`<h2>${gano ? tr('¡HAS ECHADO AL CEO!') : tr('FIN DE LA PARTIDA')}</h2>
    ${gano ? `<div class="as-cofre" id="as-ceo"></div><p>${tr('El CEO de Microblizz sale corriendo con su maletín. Los Animales Locos recuperan la mazmorra… por ahora.')}</p>` : `<p>${tr('Tus héroes no pueden más. La próxima vez, prueba otra combinación de clases.')}</p>`}
    <ul class="as-datos"><li>${tr('Piso alcanzado')}: <b>${P.piso + 1}</b></li><li>${tr('Combates ganados')}: <b>${P.combates}</b></li><li>${tr('Gemas ganadas')}: <b>${P.gemas}</b></li></ul>
    <div class="as-fila"><button class="as-btn2" id="as-fin-otra" type="button">${tr('OTRA VEZ')}</button><button class="as-btn2 as-gris" id="as-fin-menu" type="button">${tr('MENÚ')}</button></div>`);
  if (gano) $('#as-ceo').appendChild(asLienzo('jefe-ceo', 140));
  $('#as-fin-otra').onclick = () => { play('select'); asCierraModal(); asEmpiezaPartida(); };
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
  tienda: 'Toca un héroe de la tienda para comprarlo. Cuesta el oro que pone abajo.',
  mover: 'Arrastra a tus héroes por la cuadrícula: los de delante reciben los golpes. Si lo sueltas en la tienda, lo vendes.',
  clases: 'Mira arriba: con 2 héroes distintos de la misma clase se activa su habilidad. Toca el icono para ver qué hace.',
  batalla: 'La batalla va sola. Si quieres que vaya más rápido, toca x1 arriba.',
  mapa: 'Elige la siguiente sala del mapa: combates, cofres con oro o reliquias para todo el grupo. Al final del piso espera el jefe.',
  tienda2: 'Comprar un héroe que ya tienes le sube de nivel. Mejora la tienda para que salgan héroes mejores y quepan más.',
  jefe: 'El jefe del piso pega fuerte. Pon a los tanques delante y a los magos y tiradores detrás.',
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
  const niveles = cl.umbral.map((u, i) => `<li class="${(act[k] || 0) > i ? 'on' : ''}"><b>${u}</b> · ${asH(tr(cl.txt[i]))}</li>`).join('');
  const quien = Object.keys(AS_HEROES).filter(h => AS_HEROES[h].clases.includes(k));
  const t = asModal(`<h2>${asH(tr(cl.nombre)).toUpperCase()}</h2><p class="as-sub">${tr('Tienes {n} distintos', { n: cuenta[k] || 0 })}</p><ul class="as-niveles">${niveles}</ul><div class="as-quien" id="as-quien"></div><button class="as-btn2" id="as-c-ok" type="button">${tr('VALE')}</button>`);
  for (const h of quien) { const el = asLienzo(h, 56); if (!asEnEquipo(h)) el.classList.add('apagado'); $('#as-quien').appendChild(el); }
  AS_PANT.pausa = true;
  $('#as-c-ok').onclick = () => { play('select'); asCierraModal(); AS_PANT.pausa = false; };
}
