// Fans of Rumble: Tácticas · PANTALLAS: partida guardada, título, mapa, grupo, tienda, opciones, recompensa diaria y MONETIZACIÓN (pagos y anuncios simulados).
'use strict';
/* =========================================================
   PARTIDA GUARDADA (en este navegador)
   ========================================================= */
const CLAVE = 'for-tacticas-v1';
function partidaNueva() {
  const heroes = {}; for (const k of HEROE_ORDEN) heroes[k] = { lvl: 1, xp: 0, hp: null, mp: null };
  return { oro: 150, gemas: 30, heroes, desbloq: HEROE_ORDEN.filter(k => !HEROES[k].gemas), grupo: ['bunny', 'epicchampion', 'twitchking', 'necrolord'],
    items: { botiquin: 3, bebida: 2, pizza: 0, contrato: 1 }, hechos: {}, comprados: {}, sinAnuncios: false, pase: false,
    diario: { ultimo: '', dia: 0 }, anuncios: { fecha: '', n: 0 }, ajustes: { vol: 80, mus: 70, espera: true, vel: 1, mudo: false }, mundo: 0 };
}
let SAVE = partidaNueva();
try { const g = JSON.parse(localStorage.getItem(CLAVE)); if (g && g.heroes) SAVE = Object.assign(partidaNueva(), g, { ajustes: Object.assign(partidaNueva().ajustes, g.ajustes) }); } catch (e) { /* sin guardado */ }
function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(SAVE)); } catch (e) { /* almacenamiento bloqueado: se juega sin guardar */ } pintarCarteras(); }

/* ---------- héroes: nivel y experiencia ---------- */
function statsHeroe(key) {
  const b = HEROES[key], L = SAVE.heroes[key].lvl - 1, m = Math.pow(AJUSTES.crecer, L);
  return { hp: Math.round(b.hp * m), mp: Math.round(b.mp * Math.pow(AJUSTES.crecerCaos, L)), atk: Math.round(b.atk * m), def: Math.round(b.def * m), mag: Math.round(b.mag * m), spd: b.spd };
}
function darXp(key, n) {
  const g = SAVE.heroes[key]; let sube = 0; g.xp += n;
  while (g.xp >= AJUSTES.xpNivel(g.lvl)) {
    const antes = statsHeroe(key); g.xp -= AJUSTES.xpNivel(g.lvl); g.lvl++; sube++;
    const ahora = statsHeroe(key); if (g.hp != null && g.hp > 0) g.hp += ahora.hp - antes.hp; if (g.mp != null) g.mp += ahora.mp - antes.mp;
  }
  return sube;
}
const vidaDe = k => { const s = statsHeroe(k), g = SAVE.heroes[k]; return { hp: g.hp == null ? s.hp : g.hp, max: s.hp, mp: g.mp == null ? s.mp : g.mp, mpMax: s.mp }; };

/* =========================================================
   AUDIO (el motor de Fans Of: estos ajustes son los de este juego)
   ========================================================= */
const sonidoApagado = () => SAVE.ajustes.mudo;
const volGeneral = () => (SAVE.ajustes.mudo ? 0 : 0.55 * SAVE.ajustes.vol / 100);
const volMusica = () => 0.7 * SAVE.ajustes.mus / 100;

/* =========================================================
   AYUDAS DE PANTALLA
   ========================================================= */
function mostrar(id) { for (const p of document.querySelectorAll('.pantalla')) p.hidden = p.id !== id; window.scrollTo(0, 0); }
function moneda(tipo, n) { return `<span class="moneda ${tipo}">${tipo === 'oro' ? COIN_SVG : GEM_SVG}${fmt(n)}</span>`; }
function pintarCarteras() { for (const c of document.querySelectorAll('#cartera, [data-cartera]')) c.innerHTML = moneda('oro', SAVE.oro) + moneda('gemas', SAVE.gemas); }
document.addEventListener('click', e => { if (e.target.closest('.moneda.gemas') && !e.target.closest('.ventana')) abrirTienda('gemas'); });
let avisoT = null;
function aviso(t) { const a = $('#aviso'); a.textContent = t; a.hidden = false; clearTimeout(avisoT); avisoT = setTimeout(() => (a.hidden = true), 2200); }
function ventana(html, alMontar) { $('#ventana').innerHTML = html; $('#velo').hidden = false; if (alMontar) alMontar(); const b = $('#ventana button'); if (b) b.focus({ preventScroll: true }); }
function cerrarVentana() { $('#velo').hidden = true; $('#ventana').innerHTML = ''; }
function evento(nombre, datos) { console.info('[analítica]', nombre, datos || ''); }   // aquí se conectará la analítica (Firebase, etc.)
function hoy() { return todayStr(); }

/* =========================================================
   MONETIZACIÓN · los dos puntos que se conectan al publicar
   pagar(): Google Play Billing / App Store (por ejemplo, con Capacitor y RevenueCat)
   verAnuncio(): anuncios con premio de AdMob
   En el prototipo los dos simulan, para probar el circuito entero sin cobrar nada.
   ========================================================= */
function pagar(prod, alPagar) {
  evento('compra_abre', { id: prod.id });
  ventana(`<h3 class="ol">${prod.nombre}</h3><p>${prod.desc || (fmt(prod.gemas + (prod.extra || 0)) + ' gemas')}</p>
    <p style="font-family:var(--f-disp);font-size:28px;color:var(--tinta)">${prod.precio}</p>
    <p class="aviso-pago">Esto es un prototipo: no se cobra nada. En la app publicada aquí saldría el pago de Google Play o de la App Store.</p>
    <button class="btn dorado ol" id="pg-si">SIMULAR COMPRA</button><button class="btn-texto" id="pg-no">Cancelar</button>`, () => {
    $('#pg-si').onclick = () => { cerrarVentana(); alPagar(); play('crown'); evento('compra_ok', { id: prod.id, precio: prod.precio }); };
    $('#pg-no').onclick = cerrarVentana;
  });
}
function verAnuncio(motivo, alAcabar) {
  evento('anuncio', { motivo });
  if (SAVE.sinAnuncios) { alAcabar(); return; }
  const a = $('#anuncio'), n = $('#anuncio-cuenta'); let s = 5; n.textContent = s; a.hidden = false;
  const was = M.bus ? M.bus.gain.value : 0; if (M.bus) M.bus.gain.value = 0;
  const iv = setInterval(() => { s--; n.textContent = s; if (s <= 0) { clearInterval(iv); a.hidden = true; if (M.bus) M.bus.gain.value = was || volMusica(); alAcabar(); } }, 1000);
}

/* =========================================================
   TÍTULO
   ========================================================= */
function pintarTitulo() {
  const c = $('#cv-titulo'), r = c.getBoundingClientRect(), dpr = Math.min(3, window.devicePixelRatio || 1);
  c.width = Math.round(r.width * dpr); c.height = Math.round(r.height * dpr);
  const x = c.getContext('2d'), k = c.width / 420; x.setTransform(k, 0, 0, k, 0, 0);
  x.fillStyle = 'rgba(20,6,36,.35)'; x.beginPath(); x.ellipse(210, 178, 190, 12, 0, 0, Math.PI * 2); x.fill();
  pintarSprite(x, 'twitchking', 80, 172, 0.9, 1); pintarSprite(x, 'epicchampion', 340, 172, 0.9, -1);
  pintarSprite(x, 'ceo', 210, 120, 0.6, 1, { alfa: 0.35 });
  pintarSprite(x, 'bunny', 210, 180, 1.05, 1);
}
$('#t-version').textContent = 'Combate por turnos · Prototipo ' + NEWS_VER;
$('#b-opciones-t').onclick = () => { audioInit(); play('select'); abrirOpciones(); };
$('#b-novedades').onclick = () => { audioInit(); play('select'); abrirNovedades(); };
// el informe de la versión (lo monta el núcleo común: newsHtml); sale solo la primera vez que se abre tras actualizarse
function abrirNovedades() {
  ventana(`<h3 class="ol">NOVEDADES · ${NEWS_VER}</h3><div class="novedades">${newsHtml(NEWS)}</div><button class="btn naranja ol" id="n-ok">¡GENIAL!</button>`, () => {
    $('#n-ok').onclick = () => { play('select'); cerrarVentana(); if (SAVE.seenVer !== NEWS_VER) { SAVE.seenVer = NEWS_VER; guardar(); } };
  });
}
if (novedadesPendientes()) setTimeout(abrirNovedades, 600);
$('#b-jugar').onclick = () => { audioInit(); play('go'); musicSet('menu'); if (!SAVE.visto) { SAVE.visto = true; guardar(); } irMapa(SAVE.mundo || 0); setTimeout(comprobarDiario, 400); };

/* =========================================================
   MAPA
   ========================================================= */
let mundoVisto = 0;
const mundoAbierto = wi => wi === 0 || MUNDOS[wi - 1].niveles.every((_, li) => SAVE.hechos[(wi - 1) + '-' + li]);
function irMapa(wi = mundoVisto) {
  mundoVisto = wi; SAVE.mundo = wi; mostrar('p-mapa');
  if (M.name !== 'menu') musicSet('menu');
  pintarCarteras();
  $('#mundos').innerHTML = MUNDOS.map((m, i) => `<button class="mundo-tab" data-w="${i}" aria-current="${i === wi}" ${mundoAbierto(i) ? '' : 'disabled'}>${i + 1}. ${m.nombre}</button>`).join('');
  const m = MUNDOS[wi]; $('#mundo-nombre').textContent = m.nombre; $('#mundo-historia').textContent = m.historia;
  $('#camino').innerHTML = m.niveles.map((n, li) => {
    const hecho = SAVE.hechos[wi + '-' + li], abierto = li === 0 || SAVE.hechos[wi + '-' + (li - 1)];
    return `<li><button class="nodo ${hecho ? 'hecho' : ''} ${n.jefe ? 'jefe' : ''}" data-l="${li}" ${abierto ? '' : 'disabled'}>
      <canvas data-k="${n.e.find(k => ENEMIGOS[k].jefe) || n.e[n.e.length > 1 ? 1 : 0]}" ${n.e.some(k => ENEMIGOS[k].corrupto) ? 'data-c="1"' : ''}></canvas>
      <span class="n-txt"><span class="n-num">${n.jefe ? 'Jefe' : 'Combate ' + (li + 1)}</span><br><span class="n-nom">${n.nombre}</span></span>
      <span class="n-est">${hecho ? 'HECHO' : abierto ? '¡VAMOS!' : '🔒'}</span></button></li>`;
  }).join('');
  for (const c of document.querySelectorAll('#camino canvas')) retrato(c, c.dataset.k, { corrupto: !!c.dataset.c, gris: c.closest('.nodo').disabled });
  pintarGrupoMini();
  const v = SAVE.grupo.map(vidaDe), falta = v.some(x => x.hp < x.max || x.mp < x.mpMax);
  $('#b-cafe').disabled = !falta;
  $('#b-cafe').textContent = falta ? (SAVE.oro >= AJUSTES.cafe ? 'CAFÉ · ' + AJUSTES.cafe : 'CAFÉ · GRATIS') : 'CAFÉ';
}
function pintarGrupoMini() {
  $('#grupo-mini').innerHTML = SAVE.grupo.map(k => { const v = vidaDe(k);
    return `<div class="gm"><canvas data-k="${k}"></canvas><b>${nombreHeroe(k)}</b><small>Nv${SAVE.heroes[k].lvl} · ${v.hp}/${v.max}</small><div class="barrita"><i style="width:${100 * v.hp / v.max}%"></i></div></div>`; }).join('');
  for (const c of document.querySelectorAll('#grupo-mini canvas')) retrato(c, c.dataset.k, { gris: vidaDe(c.dataset.k).hp <= 0 });
}
$('#mundos').onclick = e => { const b = e.target.closest('[data-w]'); if (b && !b.disabled) { play('select'); irMapa(+b.dataset.w); } };
$('#camino').onclick = e => { const b = e.target.closest('.nodo'); if (!b || b.disabled) return; audioInit(); empezarBatalla(mundoVisto, +b.dataset.l); };
$('#b-cafe').onclick = () => {
  const gratis = SAVE.oro < AJUSTES.cafe; if (!gratis) SAVE.oro -= AJUSTES.cafe;
  for (const k of SAVE.grupo) { SAVE.heroes[k].hp = null; SAVE.heroes[k].mp = null; }
  guardar(); play('heal'); aviso(gratis ? 'Café de máquina, gratis. Grupo curado.' : 'Café de especialidad. Grupo curado.'); irMapa();
};
$('#b-grupo').onclick = () => { play('select'); abrirGrupo(); };
$('#b-tienda').onclick = () => { play('select'); abrirTienda('objetos'); };
$('#b-opciones').onclick = () => { play('select'); abrirOpciones(); };

/* =========================================================
   GRUPO
   ========================================================= */
let fichaDe = null;
function abrirGrupo() {
  mostrar('p-grupo'); pintarCarteras();
  $('#heroes').innerHTML = HEROE_ORDEN.map(k => {
    const tiene = SAVE.desbloq.includes(k), en = SAVE.grupo.includes(k);
    return `<button class="heroe ${en ? 'en-grupo' : ''} ${tiene ? '' : 'bloqueado'}" data-k="${k}">
      ${en ? `<span class="marca ol">${SAVE.grupo.indexOf(k) + 1}</span>` : ''}
      <canvas data-k="${k}"></canvas><b>${nombreHeroe(k)}</b>
      ${tiene ? `<small>${HEROES[k].rol} · Nv${SAVE.heroes[k].lvl}</small>` : `<span class="precio">${GEM_SVG}${HEROES[k].gemas}</span>`}</button>`;
  }).join('');
  for (const c of document.querySelectorAll('#heroes canvas')) retrato(c, c.dataset.k);
  pintarFicha();
}
function pintarFicha() {
  const f = $('#ficha'); if (!fichaDe) { f.hidden = true; return; }
  const k = fichaDe, s = statsHeroe(k), tiene = SAVE.desbloq.includes(k), en = SAVE.grupo.includes(k), g = SAVE.heroes[k];
  f.hidden = false;
  f.innerHTML = `<h3 class="ol">${nombreHeroe(k)}</h3><small>${FACTIONS[HEROES[k].fac].name} · ${HEROES[k].rol} · Nivel ${g.lvl} (${g.xp}/${AJUSTES.xpNivel(g.lvl)} XP)</small>
    <div class="stats"><div><span>Vida</span> ${s.hp}</div><div><span>CAOS</span> ${s.mp}</div><div><span>Ataque</span> ${s.atk}</div><div><span>Defensa</span> ${s.def}</div><div><span>Magia</span> ${s.mag}</div><div><span>Velocidad</span> ${s.spd}</div></div>
    ${HEROES[k].tec.map(id => `<div class="tec"><b>${TECNICAS[id].nombre}</b> · ${TECNICAS[id].mp} CAOS<br>${TECNICAS[id].desc}</div>`).join('')}
    <div class="fila-btn">${tiene ? `<button class="btn ${en ? '' : 'naranja'} ol" id="f-grupo">${en ? 'SACAR DEL GRUPO' : 'METER EN EL GRUPO'}</button>` : `<button class="btn dorado ol" id="f-comprar">DESBLOQUEAR · ${HEROES[k].gemas} GEMAS</button>`}</div>`;
  const bg = $('#f-grupo'); if (bg) bg.onclick = () => {
    if (en) { if (SAVE.grupo.length <= 1) { aviso('Necesitas al menos un héroe.'); return; } SAVE.grupo = SAVE.grupo.filter(x => x !== k); }
    else { if (SAVE.grupo.length >= 4) { aviso('El grupo ya tiene 4. Saca a alguien primero.'); return; } SAVE.grupo.push(k); }
    guardar(); play('card'); abrirGrupo();
  };
  const bc = $('#f-comprar'); if (bc) bc.onclick = () => {
    if (SAVE.gemas < HEROES[k].gemas) { aviso('Te faltan gemas.'); abrirTienda('gemas'); return; }
    SAVE.gemas -= HEROES[k].gemas; SAVE.desbloq.push(k); guardar(); play('crown'); evento('heroe_desbloqueado', { k }); aviso(nombreHeroe(k) + ' se une a la resistencia.'); abrirGrupo();
  };
}
$('#heroes').onclick = e => { const b = e.target.closest('.heroe'); if (!b) return; fichaDe = b.dataset.k; play('select'); pintarFicha(); $('#ficha').scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'nearest' }); };
$('#b-grupo-volver').onclick = () => irMapa();

/* =========================================================
   TIENDA
   ========================================================= */
let pestana = 'objetos';
function abrirTienda(p = pestana) {
  pestana = p; mostrar('p-tienda'); pintarCarteras();
  for (const b of document.querySelectorAll('.pest')) b.setAttribute('aria-selected', b.dataset.pest === p);
  const t = $('#tienda');
  if (p === 'objetos') {
    t.innerHTML = OBJETO_ORDEN.map(k => { const o = OBJETOS[k];
      return `<div class="prod"><div class="p-txt"><div class="p-nom">${o.nombre}</div><div class="p-desc">${o.desc}</div><div class="p-ten">Tienes ${SAVE.items[k]}</div></div>
        <button class="btn naranja ol" data-item="${k}" ${SAVE.oro < o.precio ? 'disabled' : ''}>${COIN_SVG}${o.precio}</button></div>`; }).join('')
      + `<div class="prod"><div class="ico">${GEM_SVG}</div><div class="p-txt"><div class="p-nom">Gemas gratis</div><div class="p-desc">Mira un anuncio y llévate ${TIENDA.gemasAnuncio} gemas. Quedan ${anunciosQuedan()} hoy.</div></div>
        <button class="btn verde ol" id="t-anuncio" ${anunciosQuedan() ? '' : 'disabled'}>VER</button></div>`;
  } else if (p === 'gemas') {
    t.innerHTML = TIENDA.gemas.map(g => `<div class="prod">${g.destacado ? `<span class="cinta">${g.destacado}</span>` : ''}<div class="ico">${GEM_SVG}</div>
      <div class="p-txt"><div class="p-nom">${g.nombre}</div><div class="p-desc">${fmt(g.gemas)} gemas${g.extra ? ` <b style="color:var(--dorado)">+${fmt(g.extra)} de regalo</b>` : ''}</div></div>
      <button class="btn dorado ol" data-gemas="${g.id}">${g.precio}</button></div>`).join('')
      + `<p class="aviso-pago">Prototipo: las compras están simuladas y no cobran nada.</p>`;
  } else {
    t.innerHTML = TIENDA.ofertas.map(o => { const ya = o.unaVez && SAVE.comprados[o.id];
      return `<div class="prod ${ya ? 'comprado' : ''}"><div class="p-txt"><div class="p-nom">${o.nombre}</div><div class="p-desc">${o.desc}</div></div>
        <button class="btn dorado ol" data-oferta="${o.id}" ${ya ? 'disabled' : ''}>${ya ? 'TUYO' : o.precio}</button></div>`; }).join('')
      + `<p class="aviso-pago">Prototipo: las compras están simuladas y no cobran nada.</p>`;
  }
}
function anunciosQuedan() { if (SAVE.anuncios.fecha !== hoy()) SAVE.anuncios = { fecha: hoy(), n: 0 }; return Math.max(0, TIENDA.anunciosDia - SAVE.anuncios.n); }
function darPremio(da) {
  if (da.oro) SAVE.oro += da.oro; if (da.gemas) SAVE.gemas += da.gemas;
  if (da.items) for (const k in da.items) SAVE.items[k] = (SAVE.items[k] || 0) + da.items[k];
  if (da.heroe && !SAVE.desbloq.includes(da.heroe)) SAVE.desbloq.push(da.heroe);
  if (da.sinAnuncios) SAVE.sinAnuncios = true; if (da.pase) SAVE.pase = true;
  guardar();
}
$('.pestanas').onclick = e => { const b = e.target.closest('.pest'); if (b) { play('select'); abrirTienda(b.dataset.pest); } };
$('#tienda').onclick = e => {
  const b = e.target.closest('button'); if (!b || b.disabled) return;
  if (b.dataset.item) { const o = OBJETOS[b.dataset.item]; SAVE.oro -= o.precio; SAVE.items[b.dataset.item]++; guardar(); play('card'); evento('compra_oro', { item: b.dataset.item }); abrirTienda(); }
  else if (b.id === 't-anuncio') verAnuncio('gemas_gratis', () => { SAVE.anuncios.n++; SAVE.gemas += TIENDA.gemasAnuncio; guardar(); play('crown'); aviso('+' + TIENDA.gemasAnuncio + ' gemas'); abrirTienda(); });
  else if (b.dataset.gemas) { const g = TIENDA.gemas.find(x => x.id === b.dataset.gemas); pagar(g, () => { darPremio({ gemas: g.gemas + g.extra }); aviso('+' + fmt(g.gemas + g.extra) + ' gemas'); abrirTienda(); }); }
  else if (b.dataset.oferta) { const o = TIENDA.ofertas.find(x => x.id === b.dataset.oferta); pagar(o, () => { SAVE.comprados[o.id] = true; darPremio(o.da); aviso('¡' + o.nombre + ' activado!'); abrirTienda(); }); }
};
$('#b-tienda-volver').onclick = () => irMapa();

/* =========================================================
   RECOMPENSA DIARIA (7 días seguidos)
   ========================================================= */
function premioTxt(p) { return p.oro ? moneda('oro', p.oro) : p.gemas ? moneda('gemas', p.gemas) : Object.keys(p.items).map(k => `<span class="moneda">${p.items[k]} ${OBJETOS[k].nombre}</span>`).join(''); }
function comprobarDiario() {
  if (SAVE.diario.ultimo === hoy()) return;
  const ayer = new Date(); ayer.setDate(ayer.getDate() - 1);
  const ayerStr = `${ayer.getFullYear()}-${ayer.getMonth() + 1}-${ayer.getDate()}`;
  const dia = SAVE.diario.ultimo === ayerStr ? (SAVE.diario.dia % 7) : 0;
  const p = TIENDA.diario[dia];
  ventana(`<h3 class="ol">REGALO DIARIO</h3><p>Entra cada día para no perder la racha.</p>
    <div class="dias">${TIENDA.diario.map((q, i) => `<div class="dia ${i === dia ? 'hoy' : i < dia ? 'cobrado' : ''}">Día ${i + 1}${q.oro ? COIN_SVG : q.gemas ? GEM_SVG : '<span>🎁</span>'}</div>`).join('')}</div>
    <div class="premios">${premioTxt(p)}</div><button class="btn naranja ol" id="dd-ok">COBRAR</button>`, () => {
    $('#dd-ok').onclick = () => { darPremio(p); SAVE.diario = { ultimo: hoy(), dia: dia + 1 }; guardar(); play('crown'); evento('diario', { dia: dia + 1 }); cerrarVentana(); irMapa(); };
  });
}

/* =========================================================
   OPCIONES
   ========================================================= */
function ajustesHtml() {
  const a = SAVE.ajustes;
  return `<label class="ajuste" for="o-vol">Volumen <input type="range" id="o-vol" min="0" max="100" value="${a.vol}"></label>
    <label class="ajuste" for="o-mus">Música <input type="range" id="o-mus" min="0" max="100" value="${a.mus}"></label>
    <div class="ajuste">Combate <span class="seg" id="o-modo"><button aria-pressed="${a.espera}" data-v="1">Espera</button><button aria-pressed="${!a.espera}" data-v="0">Activo</button></span></div>
    <div class="ajuste">Velocidad <span class="seg" id="o-vel">${[1, 1.5, 2].map(v => `<button aria-pressed="${a.vel === v}" data-v="${v}">x${fmtV(v)}</button>`).join('')}</span></div>
    <p class="aviso-pago">Espera: el tiempo se para mientras eliges. Activo: los enemigos siguen atacando.</p>`;
}
function montarAjustes() {
  $('#o-vol').oninput = e => { SAVE.ajustes.vol = +e.target.value; applyVolume(); guardar(); };
  $('#o-mus').oninput = e => { SAVE.ajustes.mus = +e.target.value; applyVolume(); guardar(); };
  $('#o-modo').onclick = e => { const b = e.target.closest('button'); if (!b) return; SAVE.ajustes.espera = b.dataset.v === '1'; guardar(); for (const x of $('#o-modo').children) x.setAttribute('aria-pressed', x === b); };
  $('#o-vel').onclick = e => { const b = e.target.closest('button'); if (!b) return; SAVE.ajustes.vel = +b.dataset.v; guardar(); for (const x of $('#o-vel').children) x.setAttribute('aria-pressed', x === b); };
}
function abrirOpciones() {
  ventana(`<h3 class="ol">OPCIONES</h3>${ajustesHtml()}
    <button class="btn violeta ol" id="o-news">NOVEDADES</button>
    <button class="btn naranja ol" id="o-ok">LISTO</button>
    <p class="nota">Versión ${NEWS_VER}</p>
    <button class="btn-texto" id="o-borrar">Borrar la partida y empezar de cero</button>`, () => {
    montarAjustes(); $('#o-ok').onclick = cerrarVentana; $('#o-news').onclick = abrirNovedades;
    $('#o-borrar').onclick = () => ventana(`<h3 class="ol mal">¿BORRAR TODO?</h3><p>Perderás niveles, oro, gemas y héroes. No se puede deshacer.</p>
      <button class="btn ol" id="ob-si" style="background:#ff4b5c">SÍ, BORRAR</button><button class="btn naranja ol" id="ob-no">NO, VOLVER</button>`, () => {
      $('#ob-si').onclick = () => { const aj = SAVE.ajustes; SAVE = partidaNueva(); SAVE.ajustes = aj; guardar(); cerrarVentana(); irMapa(0); aviso('Partida nueva.'); };
      $('#ob-no').onclick = abrirOpciones;
    });
  });
}

/* =========================================================
   ARRANQUE
   ========================================================= */
buildSprites();
pintarCarteras();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { pintarTitulo(); });
pintarTitulo();
