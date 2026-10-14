// Fans of Dark · las pantallas (título, preparar la bajada, alijo, partida y final), el HUD, el minimapa y los controles (teclado, ratón y táctil).
// El bucle de la partida también vive aquí: cada fotograma llama a dkPaso (juego.js) y a DK3D.pintar (retro.js). Los iconos los dibuja pixel-props.js.
'use strict';
const q = s => document.querySelector(s);
// ataca/lanza/esquiva/habilidad/pocion/usa/pausa duran un fotograma; bloquea y bloqueaBtn se mantienen mientras se sujeta la tecla o el botón
const ENTRADA = { mx: 0, my: 0, giro: 0, ataca: false, lanza: false, esquiva: false, bloquea: false, bloqueaBtn: false, habilidad: false, pocion: false, usa: false, pausa: false };
const TECLAS = {};
let pantallaActual = 'titulo', animId = 0, ultimoT = 0, hudT = 0, audioListo = false;

function dkArrancar() {
  dkCargar(); buildSprites();
  pxuEstilos();   // marcos, botones y pared de la interfaz (pixel-ui.js)
  const logo = () => { const c = pxuLogo(), d = q('#logo'); d.width = c.width; d.height = c.height; d.getContext('2d').drawImage(c, 0, 0); };
  logo(); if (document.fonts) document.fonts.load('24px "Press Start 2P"').then(logo, () => {});
  document.querySelectorAll('[data-ico]').forEach(i => { i.outerHTML = pxImgHtml(i.dataset.ico); });   // los iconos del HTML, dibujados a píxel
  DK3D.iniciar(q('#cv'));
  q('#t-version').textContent = 'Prototipo · v' + DK_VERSION;
  q('#b-bajar').onclick = () => irA('prep');
  q('#b-alijo').onclick = () => irA('alijo');
  q('#b-sonido').onclick = () => { SAVE.muted = !SAVE.muted; dkGuardar(); pintaSonido(); if (typeof applyVolume === 'function') applyVolume(); };
  document.querySelectorAll('[data-volver]').forEach(b => { b.onclick = () => irA(b.dataset.volver); });
  q('#b-entrar').onclick = empezarPartida;
  q('#b-pocion-compra').onclick = () => { if (DKS.oro >= DK_POCION.coste && DKS.pociones < DK_POCION.max) { DKS.oro -= DK_POCION.coste; DKS.pociones++; dkGuardar(); pintaPrep(); play('blip'); } else play('deny'); };
  q('#b-pausa').onclick = () => { ENTRADA.pausa = true; };
  q('#b-seguir').onclick = () => { ENTRADA.pausa = true; };
  q('#b-abandonar').onclick = () => { G.pausa = false; dkTerminar('muerto'); };
  q('#b-fin-volver').onclick = () => { DK3D.limpiar(); G = null; irA('titulo'); };
  controles();
  pintaSonido(); irA('titulo');
  requestAnimationFrame(bucle);
}
function sonar() { if (!audioListo) { audioInit(); audioListo = true; } }
function irA(id) {
  pantallaActual = id;
  if (id !== 'titulo') pxuEscenaAnima(null, false);
  document.querySelectorAll('.pantalla').forEach(p => { p.hidden = p.id !== 'p-' + id; });
  if (id === 'prep') pintaPrep(); if (id === 'alijo') pintaAlijo(); if (id === 'titulo') pintaTitulo();
  if (id !== 'partida' && audioListo) musicSet(TRACKS.menu ? 'menu' : undefined);
}
function pintaSonido() { q('#b-sonido').innerHTML = pxImgHtml(SAVE.muted ? 'silencio' : 'sonido'); }
function pintaTitulo() {
  q('#t-stats').textContent = DKS.bajadas ? `${DKS.bajadas} bajadas · ${DKS.salvos} con vida · ${DKS.muertes} muertes · mejor botín ${DKS.mejor} de oro` : 'Baja a la mazmorra, llena la mochila y sal por un portal antes de que la niebla te alcance.';
  pxuEscenaAnima(q('#cv-titulo'), true);
}
const retrato = (k, h = 72) => pxRetrato(k, Math.min(64, Math.round(h * 0.75)));   // a píxel, como todo el juego

/* ---------- preparar la bajada ---------- */
function pintaPrep() {
  q('#prep-oro').textContent = DKS.oro;
  const H = DK_HEROES[DKS.heroe];
  q('#heroes').innerHTML = DK_ORDEN_HEROES.map(k => `<button class="heroe ${k === DKS.heroe ? 'sel' : ''}" data-h="${k}"><img src="${retrato(k)}" alt=""><b>${DK_HEROES[k].nombre}</b></button>`).join('');
  q('#heroes').querySelectorAll('.heroe').forEach(b => { b.onclick = () => { DKS.heroe = b.dataset.h; dkGuardar(); pintaPrep(); play('blip'); }; });
  q('#heroe-ficha').innerHTML = `<h3>${H.nombre}</h3><p>${H.desc}</p><p class="hab"><b>${H.hab.nombre}</b> · ${H.hab.desc} <i>(${H.hab.cd} s)</i></p><p class="cifras">${pxImgHtml('vida')} ${H.hp + (DKS.lleva.armadura ? DKS.lleva.armadura.hp : 0)} ${pxImgHtml('espada')} ${H.dmg + (DKS.lleva.arma ? DKS.lleva.arma.dmg : 0)} ${pxImgHtml('armadura')} ${DKS.lleva.armadura ? DKS.lleva.armadura.arm : 0} ${pxImgHtml('esquiva')} ${H.vel}</p>`;
  q('#mazmorras').innerHTML = DK_ORDEN_MAZMORRAS.map(f => { const D = DK_MAZMORRAS[f], n = DKS.jefes[f] || 0; return `<button class="mazmorra ${f === DKS.mazmorra ? 'sel' : ''}" data-f="${f}" style="--c:${D.luz}"><img src="${retrato(D.jefe, 48)}" alt=""><span><b>${D.nombre}</b><small>${FACTIONS[f].name}${n ? ' · jefe vencido ×' + n : ''}</small></span></button>`; }).join('');
  q('#mazmorras').querySelectorAll('.mazmorra').forEach(b => { b.onclick = () => { DKS.mazmorra = b.dataset.f; dkGuardar(); pintaPrep(); play('blip'); }; });
  q('#mazmorra-desc').textContent = DK_MAZMORRAS[DKS.mazmorra].desc;
  q('#prep-equipo').innerHTML = ['arma', 'armadura'].map(t => { const o = DKS.lleva[t]; return `<div class="ranura">${pxImgHtml(DK_ICONO[t])} ${o ? `<b style="color:${DK_COLOR_RAREZA[o.rareza]}">${o.nombre}</b> <small>${dkTextoObjeto(o)}</small>` : `<small>Sin ${t}: elige una en el alijo</small>`}</div>`; }).join('');
  q('#prep-pociones').textContent = `${DKS.pociones} / ${DK_POCION.max}`;
  q('#b-pocion-compra').disabled = DKS.oro < DK_POCION.coste || DKS.pociones >= DK_POCION.max;
}
function empezarPartida() {
  sonar();
  irA('partida');
  dkBajar(DKS.mazmorra, DKS.heroe, (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0);
  DK3D.construir(G);
  const mus = DK_MAZMORRAS[DKS.mazmorra].musica; musicSet(TRACKS[mus] ? mus : 'animales');
  q('#fin-capa').hidden = true;
  pintaHud(true);
}

/* ---------- el alijo: vender y equipar ---------- */
function pintaAlijo() {
  q('#alijo-oro').textContent = DKS.oro;
  const lista = [...DKS.alijo].sort((a, b) => b.rareza - a.rareza || b.valor - a.valor);
  q('#alijo-lista').innerHTML = lista.length ? lista.map(o => `<div class="objeto" style="--c:${DK_COLOR_RAREZA[o.rareza]}"><span class="ic">${pxImgHtml(DK_ICONO[o.tipo])}</span><span class="nom"><b>${o.nombre}</b><small>${DK_NOMBRE_RAREZA[o.rareza]} · ${dkTextoObjeto(o)}</small></span>${o.tipo !== 'tesoro' ? `<button data-eq="${o.id}">EQUIPAR</button>` : ''}<button data-vende="${o.id}">VENDER ${o.valor}</button></div>`).join('')
    : '<p class="ayuda">El alijo está vacío. Lo que saques con vida de la mazmorra aparece aquí.</p>';
  q('#alijo-lleva').innerHTML = ['arma', 'armadura'].map(t => { const o = DKS.lleva[t]; return `<div class="ranura">${pxImgHtml(DK_ICONO[t])} ${o ? `<b style="color:${DK_COLOR_RAREZA[o.rareza]}">${o.nombre}</b> <small>${dkTextoObjeto(o)}</small> <button data-quita="${t}">QUITAR</button>` : `<small>Nada equipado</small>`}</div>`; }).join('');
  q('#p-alijo').querySelectorAll('[data-vende]').forEach(b => { b.onclick = () => { const i = DKS.alijo.findIndex(o => o.id === b.dataset.vende); if (i < 0) return; DKS.oro += DKS.alijo[i].valor; DKS.alijo.splice(i, 1); dkGuardar(); pintaAlijo(); play('blip'); }; });
  q('#p-alijo').querySelectorAll('[data-eq]').forEach(b => { b.onclick = () => { const i = DKS.alijo.findIndex(o => o.id === b.dataset.eq); if (i < 0) return; const o = DKS.alijo.splice(i, 1)[0]; if (DKS.lleva[o.tipo]) DKS.alijo.push(DKS.lleva[o.tipo]); DKS.lleva[o.tipo] = o; dkGuardar(); pintaAlijo(); play('clank'); }; });
  q('#p-alijo').querySelectorAll('[data-quita]').forEach(b => { b.onclick = () => { const t = b.dataset.quita; if (DKS.lleva[t]) { DKS.alijo.push(DKS.lleva[t]); DKS.lleva[t] = null; dkGuardar(); pintaAlijo(); } }; });
}

/* ---------- el bucle y el HUD ---------- */
function bucle(ts) {
  animId = requestAnimationFrame(bucle);
  const dt = Math.min(0.1, (ts - ultimoT) / 1000 || 0); ultimoT = ts;
  if (pantallaActual !== 'partida' || !G) return;
  leerTeclado(dt);
  if (!G.fin) dkPaso(dt, ENTRADA);
  ENTRADA.ataca = ENTRADA.lanza = ENTRADA.esquiva = ENTRADA.habilidad = ENTRADA.pocion = ENTRADA.usa = ENTRADA.pausa = false; ENTRADA.giro = 0;
  q('#pausa-capa').hidden = !G.pausa;
  DK3D.pintar(G);
  hudT += dt; if (hudT > 0.1) { hudT = 0; pintaHud(); }
}
function pintaHud(todo) {
  const P = G.p, H = DK_HEROES[G.heroe];
  q('#h-vida').style.width = (100 * P.hp / P.hpMax) + '%'; q('#h-vida-n').textContent = Math.ceil(P.hp) + ' / ' + P.hpMax;
  q('#h-oro').textContent = P.oro; q('#h-bolsa').textContent = P.bolsa.length + '/' + DK_BOLSA;
  q('#h-aguante').style.width = (100 * P.aguante / DK_COMBATE.aguante) + '%'; q('#h-aguante').classList.toggle('roto', P.sinAire > 0);
  const bl = q('#b-lanza'); bl.querySelector('b').textContent = P.municion; bl.classList.toggle('listo', P.municion > 0);
  bl.style.setProperty('--cd', P.municion < DK_COMBATE.municion ? 1 - P.municionT / DK_COMBATE.recarga : 0);
  q('#b-esquiva').classList.toggle('listo', P.aguante >= DK_COMBATE.costeEsquiva && P.esquivaT <= 0);
  const bb = q('#b-bloqueo'); bb.classList.toggle('activo', P.bloquea); bb.classList.toggle('roto', P.sinAire > 0); bb.classList.toggle('parry', P.bloquea && P.bloqueoT <= DK_COMBATE.parry);
  const bh = q('#b-hab'); bh.style.setProperty('--cd', (P.hab / P.habMax)); bh.classList.toggle('listo', P.hab <= 0); bh.querySelector('small').textContent = P.hab > 0 ? Math.ceil(P.hab) : H.hab.nombre;
  q('#b-pocion').querySelector('b').textContent = P.pociones; q('#b-pocion').classList.toggle('listo', P.pociones > 0 && P.pocionT <= 0);
  const cofre = G.cofres.some(c => !c.abierto && Math.hypot(c.x - P.x, c.y - P.y) < 1.2); q('#b-usa').hidden = !cofre;
  const t = G.t, faltan = Math.max(0, DK_NIEBLA.espera - t);
  q('#h-tiempo').textContent = faltan > 0 ? `NIEBLA ${Math.ceil(faltan)}s` : G.niebla.r <= DK_NIEBLA.rMin + 0.01 ? 'NIEBLA TOTAL' : 'LA NIEBLA SE CIERRA';
  q('#h-tiempo').classList.toggle('mal', faltan <= 0 && Math.hypot(P.x - G.niebla.cx, P.y - G.niebla.cy) > G.niebla.r);
  q('#h-portales').textContent = G.portales[0].abierto ? (G.extrayendo > 0 ? `SALIENDO ${Math.ceil(DK_EXTRAER - G.extrayendo)}` : 'PORTAL ABIERTO') : `PORTAL ${Math.ceil(G.portalesT - t)}s`;
  q('#h-avisos').innerHTML = G.avisos.map(a => `<p>${a.txt}</p>`).join('');
  q('#h-efecto').textContent = (P.efecto ? ({ frenesi: 'FRENESÍ', invisible: 'INVISIBLE', blindaje: 'BLINDAJE' })[P.efecto] + ' ' + Math.ceil(P.efectoT) : '') + (P.critico ? ' · CRÍTICO LISTO' : '');
  pintaMinimapa();
  if (todo) q('#h-heroe').innerHTML = `<img src="${retrato(G.heroe, 44)}" alt=""> ${H.nombre}`;
}
function pintaMinimapa() {
  const c = q('#minimapa'), x = c.getContext('2d'), m = G.m, P = G.p, e = 3, R = 20;   // e: píxeles por casilla; R: casillas a la vista
  c.width = c.height = R * 2 * e;
  x.fillStyle = 'rgba(10,6,16,.75)'; x.fillRect(0, 0, c.width, c.height);
  const ox = P.x - R, oy = P.y - R;
  for (let y = Math.max(0, Math.floor(oy)); y < Math.min(m.h, oy + R * 2 + 1); y++) for (let xx = Math.max(0, Math.floor(ox)); xx < Math.min(m.w, ox + R * 2 + 1); xx++) if (G.visto[y * m.w + xx]) { x.fillStyle = '#5a5070'; x.fillRect((xx - ox) * e, (y - oy) * e, e, e); }
  if (G.t > DK_NIEBLA.espera - 15) { x.strokeStyle = '#a05cff'; x.lineWidth = 1.5; x.beginPath(); x.arc((G.niebla.cx - ox) * e, (G.niebla.cy - oy) * e, G.niebla.r * e, 0, 6.29); x.stroke(); }
  for (const p of G.portales) if (p.abierto) { x.fillStyle = '#3bb5ff'; x.beginPath(); x.arc((p.x - ox) * e, (p.y - oy) * e, 3, 0, 6.29); x.fill(); }
  for (const c2 of G.cofres) if (!c2.abierto && G.visto[Math.floor(c2.y) * m.w + Math.floor(c2.x)]) { x.fillStyle = '#c89a3a'; x.fillRect((c2.x - ox) * e - 1.5, (c2.y - oy) * e - 1.5, 3, 3); }
  for (const en of G.mons) if (en.viva && en.estado === 'caza') { x.fillStyle = '#ff5b5b'; x.fillRect((en.x - ox) * e - 1.5, (en.y - oy) * e - 1.5, 3, 3); }
  x.fillStyle = '#ffd34d'; x.beginPath(); x.arc(R * e, R * e, 3, 0, 6.29); x.fill();
  x.strokeStyle = '#ffd34d'; x.beginPath(); x.moveTo(R * e, R * e); x.lineTo(R * e + Math.cos(P.ang) * 7, R * e + Math.sin(P.ang) * 7); x.stroke();
}
function dkFinPartida(r) {
  q('#fin-capa').hidden = false;
  q('#fin-titulo').textContent = r.como === 'salvo' ? '¡HAS SALIDO CON VIDA!' : 'TE HAN DESPEDIDO';
  q('#fin-titulo').className = r.como;
  q('#fin-texto').innerHTML = r.como === 'salvo'
    ? `Botín a salvo: <b>${r.objetos}</b> objetos que valen <b>${r.oro}</b> de oro.<br>${Math.floor(r.t / 60)}:${String(Math.floor(r.t % 60)).padStart(2, '0')} dentro · ${r.bajas} bajas${r.jefe ? ' · jefe vencido' : ''}`
    : `Pierdes la mochila (${r.objetos} objetos, ${r.oro} de oro) y lo que llevabas puesto.<br>${Math.floor(r.t / 60)}:${String(Math.floor(r.t % 60)).padStart(2, '0')} dentro · ${r.bajas} bajas. La próxima vez sal antes.`;
}

/* ---------- controles ---------- */
function controles() {
  addEventListener('keydown', e => { TECLAS[e.code] = true; if (pantallaActual !== 'partida') return; sonar();
    if (e.code === 'Space' || e.code === 'KeyJ') ENTRADA.ataca = true; if (e.code === 'KeyL' || e.code === 'KeyX') ENTRADA.lanza = true;
    if (e.code === 'ShiftLeft' || e.code === 'KeyC') ENTRADA.esquiva = true; if (e.code === 'KeyK' || e.code === 'KeyV') ENTRADA.habilidad = true;
    if (e.code === 'KeyR') ENTRADA.pocion = true; if (e.code === 'Escape' || e.code === 'KeyP') ENTRADA.pausa = true; if (e.code === 'KeyF') ENTRADA.usa = true;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault(); });
  addEventListener('keyup', e => { TECLAS[e.code] = false; });
  const cv = q('#cv'); let arrastre = null;
  cv.addEventListener('mousedown', e => { if (e.button === 2) { sonar(); ENTRADA.bloqueaBtn = true; return; } arrastre = { x: e.clientX, boton: e.button, movido: 0 }; });
  addEventListener('mousemove', e => { if (arrastre && arrastre.boton === 0) { ENTRADA.giro += (e.clientX - arrastre.x) * 0.005; arrastre.movido += Math.abs(e.clientX - arrastre.x); arrastre.x = e.clientX; } });
  addEventListener('mouseup', e => { if (e.button === 2) ENTRADA.bloqueaBtn = false; if (arrastre && arrastre.movido < 6) { sonar(); ENTRADA.ataca = true; } arrastre = null; });
  cv.addEventListener('contextmenu', e => e.preventDefault());
  // táctil: la mitad izquierda es la palanca de moverse; la derecha gira la cámara (un toque corto ataca)
  const toques = {};
  cv.addEventListener('touchstart', e => { sonar(); for (const t of e.changedTouches) toques[t.identifier] = { x0: t.clientX, y0: t.clientY, x: t.clientX, y: t.clientY, izq: t.clientX < innerWidth * 0.45, movido: 0 }; palanca(); e.preventDefault(); }, { passive: false });
  cv.addEventListener('touchmove', e => { for (const t of e.changedTouches) { const o = toques[t.identifier]; if (!o) continue; if (!o.izq) { ENTRADA.giro += (t.clientX - o.x) * 0.006; o.movido += Math.abs(t.clientX - o.x); } o.x = t.clientX; o.y = t.clientY; } palanca(); e.preventDefault(); }, { passive: false });
  const fin = e => { for (const t of e.changedTouches) { const o = toques[t.identifier]; if (o && !o.izq && o.movido < 8) ENTRADA.ataca = true; delete toques[t.identifier]; } palanca(); };
  cv.addEventListener('touchend', fin); cv.addEventListener('touchcancel', fin);
  function palanca() {
    const o = Object.values(toques).find(t => t.izq), pal = q('#palanca');
    if (!o) { ENTRADA.mx = ENTRADA.my = 0; ENTRADA.tactil = false; pal.hidden = true; return; }
    const dx = (o.x - o.x0) / 60, dy = (o.y - o.y0) / 60, l = Math.hypot(dx, dy), f = l > 1 ? 1 / l : 1;
    ENTRADA.mx = -dy * f; ENTRADA.my = dx * f; ENTRADA.tactil = true;   // arriba = adelante, derecha = derecha
    pal.hidden = false; pal.style.left = o.x0 + 'px'; pal.style.top = o.y0 + 'px'; pal.firstElementChild.style.transform = `translate(${dx * f * 40}px, ${dy * f * 40}px)`;
  }
  const boton = (id, campo) => { const b = q(id); const f = e => { e.preventDefault(); sonar(); ENTRADA[campo] = true; }; b.addEventListener('touchstart', f, { passive: false }); b.addEventListener('mousedown', f); };
  boton('#b-ataca', 'ataca'); boton('#b-lanza', 'lanza'); boton('#b-esquiva', 'esquiva'); boton('#b-hab', 'habilidad'); boton('#b-pocion', 'pocion'); boton('#b-usa', 'usa');
  // bloquear se mantiene mientras se sujeta el botón
  const bb = q('#b-bloqueo'), baja = e => { e.preventDefault(); sonar(); ENTRADA.bloqueaBtn = true; }, sube = () => { ENTRADA.bloqueaBtn = false; };
  bb.addEventListener('touchstart', baja, { passive: false }); bb.addEventListener('mousedown', baja);
  for (const ev of ['touchend', 'touchcancel', 'mouseup', 'mouseleave']) bb.addEventListener(ev, sube);
}
function leerTeclado(dt) {
  const tecla = (...c) => c.some(k => TECLAS[k]);
  let mx = 0, my = 0;
  if (tecla('KeyW', 'ArrowUp')) mx += 1; if (tecla('KeyS', 'ArrowDown')) mx -= 1; if (tecla('KeyD')) my += 1; if (tecla('KeyA')) my -= 1;
  if (mx || my) { ENTRADA.mx = mx; ENTRADA.my = my; } else if (!ENTRADA.tactil) { ENTRADA.mx = ENTRADA.my = 0; }
  if (tecla('ArrowLeft', 'KeyQ')) ENTRADA.giro -= 2.2 * dt; if (tecla('ArrowRight', 'KeyE')) ENTRADA.giro += 2.2 * dt;   // Q y E giran la cámara; las acciones van en F, J, L…
  ENTRADA.bloquea = ENTRADA.bloqueaBtn || tecla('KeyB', 'ControlLeft', 'ControlRight');
}
window.dkArrancar = dkArrancar;
