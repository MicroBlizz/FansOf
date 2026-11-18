// Fans of Dungeons · El tutorial de Lola: la primera partida empieza con una visita guiada (quién eres, cómo se anda y qué hace
// cada botón de abajo) y después salen avisos sueltos la primera vez que pasa algo (el primer enemigo, el primer objeto, la
// escalera, la vida baja, un jefe…). Cada aviso oscurece la pantalla menos lo que explica y lo señala. Se ve una vez; desde el
// menú se puede volver a ver o saltar. Lo visto se guarda en GUARDA.tuto.
'use strict';

const TUTO = { paso: null, t: 0, cola: [] };
const tutoVisto = id => !!(GUARDA.tuto && GUARDA.tuto[id]);
function tutoMarca(id) { GUARDA.tuto = GUARDA.tuto || {}; GUARDA.tuto[id] = true; guardaMeta(); }
const tutoApagado = () => !!(GUARDA.tuto && GUARDA.tuto.off);

// los pasos. objetivo(): el rectángulo que se señala (o null); espera(): si el paso termina solo al cumplirse (sin bloquear)
const BOTON_TXT = [
  ['Esperar', 'Pasas un turno sin moverte: deja que ellos vengan a ti. Encima de la escalera de subida, este botón se convierte en Subir.'],
  ['Explorar', 'Tu héroe camina solo hasta lo que falte por ver. Se para en cuanto aparece un enemigo. Tócalo otra vez para parar.'],
  ['Poder', 'Tu habilidad especial. Gasta Café (la barra azul). El número es lo que cuesta, o los turnos que faltan.'],
  ['Café', 'Bebe el primer café o pergamino de tu mochila. El café solo cura vida.'],
  ['Mochila', 'Tu equipo y tus objetos. Toca uno para ver qué hace, usarlo, equiparlo o soltarlo.'],
  ['Mirar', 'Tócalo y luego toca algo del mapa (un enemigo, un objeto, una casilla) para ver su ficha. El menú (las tres rayas) está junto a los mensajes.'],
];
function pasoTuto(id) {
  const h = J.heroe;
  if (id === 'yo') return { texto: fmt(tr('Este eres tú: {c}. Tienes que subir la Torre de Microblizz planta a planta, hasta el despacho del CEO.'), { c: CLASES[h.clase].nombre }), objetivo: () => rectEnt(h) };
  if (id === 'vida') return { texto: tr('Arriba tienes tu Vida (roja) y tu Café (azul). Si la vida llega a cero, te despiden y se acaba la partida.'), objetivo: () => ({ x: 0, y: 0, w: PAN.W, h: HUD_H }) };
  if (id === 'andar') return { texto: tr('Toca una casilla del suelo para ir andando hasta allí. Cada paso es un turno: cuando tú te mueves, se mueven los enemigos. Prueba ahora.'), objetivo: () => null, espera: () => J.turno >= 3 };
  if (id.startsWith('b')) { const i = +id.slice(1), [n, t] = BOTON_TXT[i]; return { texto: tr(n) + ': ' + tr(t), objetivo: () => BARRA[i] || null }; }
  if (id === 'enemigo') { const e = J.enemigos.find(q => visM(J.mapa, q.x, q.y) === 2 && !q.mimico); return e && { texto: tr('¡Un enemigo! Ponte a su lado y tócalo para pegarle. Su vida es la barra roja que sale encima. No le des la espalda: él también se mueve cuando tú te mueves.'), objetivo: () => rectEnt(e) }; }
  if (id === 'objeto') { const o = J.objetos.find(q => visM(J.mapa, q.x, q.y) === 2 && q.obj.id !== 'cofre'); return o && { texto: tr('Algo en el suelo. Pasa por encima para cogerlo: va a tu Mochila.'), objetivo: () => rectCas(o.x, o.y) }; }
  if (id === 'cofre') { const o = J.objetos.find(q => visM(J.mapa, q.x, q.y) === 2 && q.obj.id === 'cofre'); return o && { texto: tr('Un cofre. Písalo para abrirlo. Casi siempre trae monedas y un objeto… y a veces muerde.'), objetivo: () => rectCas(o.x, o.y) }; }
  if (id === 'escalera') { const m = J.mapa; return visM(m, m.salida.x, m.salida.y) === 2 && { texto: tr('¡La escalera de subida! Ve hasta ella y toca el botón Subir. Puedes dejarte enemigos atrás… o despedirlos para ganar experiencia.'), objetivo: () => rectCas(m.salida.x, m.salida.y) }; }
  if (id === 'pocavida') return { texto: tr('Te queda poca vida. Toca el botón Café para beber uno, o aléjate y espera a que vengan de uno en uno.'), objetivo: () => BARRA[3] || null };
  if (id === 'jefe') { const e = J.enemigos.find(q => q.jefe && visM(J.mapa, q.x, q.y) === 2); return e && { texto: tr('Un Jefe de planta. Vigila la escalera: hasta que no lo despidas, no se sube. Usa tu Poder y bebe café a tiempo.'), objetivo: () => rectEnt(e) }; }
  if (id === 'tienda') { const t = J.tienda; return t && visM(J.mapa, t.x, t.y) === 2 && { texto: t.lola ? tr('El puesto de Lola (sí, yo). Ponte a mi lado y tócame para comprar y vender.') : tr('Una máquina de Phony. Vende lo mismo que yo, pero más caro. Tócala desde al lado.'), objetivo: () => rectCas(t.x, t.y) }; }
  if (id === 'trampa') { for (const [k, tp] of J.mapa.trampas) if (tp.vista) { const x = k % 1000, y = Math.floor(k / 1000); if (visM(J.mapa, x, y) === 2) return { texto: tr('Una trampa. Ahora que la ves, el camino automático la esquiva. Si la pisas, duele.'), objetivo: () => rectCas(x, y) }; } return null; }
  if (id === 'intencion') { const e = J.enemigos.find(q => visM(J.mapa, q.x, q.y) === 2 && intencion(q)); return e && { texto: tr('Encima de cada enemigo: su barra de vida con el número, y un bocadillo con lo que hará en su turno. Espada y -3: te va a quitar 3 de vida. Diana: te dispara. VIENE: se acerca. PREPARA: un golpe fuerte en la casilla roja.'), objetivo: () => rectEnt(e) }; }
  if (id === 'rojo') { const e = J.enemigos.find(q => q.carga && visM(J.mapa, q.x, q.y) === 2); return e && { texto: tr('¡Golpe fuerte! Ese enemigo se ha preparado y la casilla roja es donde va a caer. Sal de ella este turno y fallará.'), objetivo: () => rectCas(e.carga.x, e.carga.y) }; }
  if (id === 'empuje') { const h = J.heroe, e = h.clase === 'bunny' && J.enemigos.find(q => visM(J.mapa, q.x, q.y) === 2 && !q.mimico && rey(q.x, q.y, h.x, h.y) <= 3); return e && { texto: tr('CrazyBunny empuja con cada golpe. Si lo estampas contra un muro o contra otro enemigo, hace más daño. Y si lo empujas a una trampa, se la come él.'), objetivo: () => rectEnt(e) }; }
  if (id === 'altar') { const a = casillaVisible(T.ALTAR); return a && { texto: tr('Un Altar de la Productividad. Tócalo desde al lado: eliges una mejora de tres. Algunas cuestan Vida máxima. Solo una vez.'), objetivo: () => rectCas(a[0], a[1]) }; }
  if (id === 'misterio') { const h = J.heroe; return h.mochila.some(o => !conocido(o)) && { texto: tr('Un café o un pergamino misterioso: no sabes qué hace hasta que lo pruebas. Sus colores cambian en cada partida. Lola sí sabe lo que vende.'), objetivo: () => BARRA[4] || null }; }
  if (id === 'rompible') { const r = casillaVisible(T.ROMPIBLE); return r && { texto: tr('Cajas, papeleras, urnas… todo eso se rompe. Ponte al lado y tócalo: suele haber monedas u objetos dentro. A veces, un becario.'), objetivo: () => rectCas(r[0], r[1]) }; }
  if (id === 'jaula') { const r = casillaVisible(T.JAULA); return r && { texto: tr('¡Una jaula con MadSquirrel dentro! Tócala desde al lado para abrirla: se une a ti y te acompaña de planta en planta.'), objetivo: () => rectCas(r[0], r[1]) }; }
  if (id === 'atril') { const r = casillaVisible(T.ATRIL); return r && { texto: tr('Una biblioteca. Toca el atril para leer el Manual del Empleado: descubres qué es cada café y cada pergamino.'), objetivo: () => rectCas(r[0], r[1]) }; }
  if (id === 'maldita') { const o = J.objetos.find(q => q.obj.maldito && visM(J.mapa, q.x, q.y) === 2); return o && { texto: tr('Un cofre maldito. Dentro hay algo muy bueno… pero al abrirlo se cierran las rejas y aparecen enemigos. Ábrelo solo si vas con la vida llena.'), objetivo: () => rectCas(o.x, o.y) }; }
  if (id === 'mini') { const e = J.enemigos.find(q => q.mini && visM(J.mapa, q.x, q.y) === 2); return e && { texto: fmt(tr('{e}: un mini-jefe, con corona grande. Pega fuerte y aguanta mucho, pero suelta muy buen botín.'), { e: tr(e.nombre) }), objetivo: () => rectEnt(e) }; }
  if (id === 'nivel') return { texto: tr('¡Has subido de nivel! Más Vida, Ataque y Café. La raya morada de arriba es lo que te falta para el siguiente.'), objetivo: () => ({ x: 0, y: HUD_H - 4, w: PAN.W, h: 5 }) };
  return null;
}
// la primera casilla de ese tipo que está a la vista (o null)
function casillaVisible(t) { const m = J.mapa, h = J.heroe, r = h.vision + 1; for (let y = h.y - r; y <= h.y + r; y++) for (let x = h.x - r; x <= h.x + r; x++) if (enM(m, x, y) === t && visM(m, x, y) === 2) return [x, y]; return null; }
const rectCas = (x, y) => ({ x: VISTA.x - VISTA.ox + x * TS, y: VISTA.y - VISTA.oy + y * TS, w: TS, h: TS });
function rectEnt(e) { const r = rectCas(e.x, e.y), alto = Math.max(TS, altoFigura(e.fig) + 6); return { x: r.x - 2, y: r.y + TS - alto, w: TS + 4, h: alto + 2 }; }

// arranca la visita guiada (la primera partida, o al pedirla desde el menú)
function iniciaTuto(forzar) {
  if (forzar) GUARDA.tuto = {};
  if (tutoApagado() || tutoVisto('yo')) return;
  TUTO.cola = ['yo', 'vida', 'andar', 'b1', 'b2', 'b3', 'b4', 'b0', 'b5'];
  sigueTuto();
}
function sigueTuto() {
  while (TUTO.cola.length) { const id = TUTO.cola.shift(), p = pasoTuto(id); if (p) { TUTO.paso = Object.assign(p, { id }); TUTO.t = 0; return; } }
  TUTO.paso = null;
}
function cierraPaso() { if (TUTO.paso) tutoMarca(TUTO.paso.id); TUTO.paso = null; sigueTuto(); }
const tutoBloquea = () => !!(TUTO.paso && !TUTO.paso.espera);
// cada fotograma: si el paso que espera ya se cumplió, sigue; si no hay paso, mira si toca algún aviso suelto
function revisaTuto(dt) {
  TUTO.t += dt;
  if (tutoApagado() || J.modo !== 'juego' || !J.heroe) return;
  if (TUTO.paso) { if (TUTO.paso.espera && TUTO.paso.espera()) cierraPaso(); return; }
  if (!tutoVisto('b5')) return;   // los avisos sueltos, cuando ya se ha visto la visita
  const h = J.heroe;
  const avisos = ['rojo', 'enemigo', 'intencion', 'empuje', 'mini', 'jefe', 'maldita', 'jaula', 'atril', 'tienda', 'altar', 'cofre', 'rompible', 'objeto', 'misterio', 'trampa', 'escalera'];
  if (h.vida < h.vidaMax * 0.45) avisos.unshift('pocavida');
  if (h.nivel >= 2) avisos.push('nivel');
  for (const id of avisos) { if (tutoVisto(id)) continue; const p = pasoTuto(id); if (p) { h.camino = []; h.explorando = false; TUTO.paso = Object.assign(p, { id }); TUTO.t = 0; sonido('rotulo'); return; } }
}
// un toque con el tutorial abierto: «Saltar tutorial» lo apaga; en un paso que bloquea, cualquier toque sigue
function tutoToque(x, y) {
  if (!TUTO.paso) return false;
  const s = TUTO.saltar;
  if (s && x >= s.x && y >= s.y && x < s.x + s.w && y < s.y + s.h) { GUARDA.tuto = Object.assign(GUARDA.tuto || {}, { off: true }); guardaMeta(); TUTO.paso = null; TUTO.cola = []; return true; }
  if (TUTO.paso.espera) return false;
  if (TUTO.t < 0.35) return true;   // que no se salte sin querer
  cierraPaso();
  return true;
}
function tutoTecla(k) { if (!tutoBloquea()) return false; if (k === 'Enter' || k === ' ' || k === 'Escape') { if (TUTO.t >= 0.35) cierraPaso(); } return true; }

function pintaTuto(ctx) {
  const p = TUTO.paso; if (!p || J.modo !== 'juego') return;
  const W = PAN.W, H = PAN.H, r = p.objetivo && p.objetivo();
  // oscurece todo menos lo que se explica
  ctx.fillStyle = 'rgba(0,0,0,' + (p.espera ? 0.25 : 0.6) + ')';
  if (r) { ctx.fillRect(0, 0, W, r.y); ctx.fillRect(0, r.y + r.h, W, H - r.y - r.h); ctx.fillRect(0, r.y, r.x, r.h); ctx.fillRect(r.x + r.w, r.y, W - r.x - r.w, r.h); }
  else if (!p.espera) ctx.fillRect(0, 0, W, H);
  if (r) { const on = Math.floor(TUTO.t * 3) % 2 === 0; ctx.fillStyle = on ? '#e8b840' : '#8a6a20'; ctx.fillRect(r.x - 2, r.y - 2, r.w + 4, 2); ctx.fillRect(r.x - 2, r.y + r.h, r.w + 4, 2); ctx.fillRect(r.x - 2, r.y, 2, r.h); ctx.fillRect(r.x + r.w, r.y, 2, r.h); }
  // el cuadro de Lola: arriba si lo señalado está abajo, y al revés
  const lineas = envuelve(p.texto, W - 64), bh = Math.max(56, 14 + lineas.length * LH + (p.espera ? 6 : 16));
  const abajo = !r || r.y + r.h / 2 < H * 0.5;
  const by = abajo ? H - BOT_H - LOG_H - bh - 6 : VISTA.y + 6 + (r && r.y < VISTA.y + 70 ? 70 : 0);
  ctx.fillStyle = '#120d12'; ctx.fillRect(4, by, W - 8, bh);
  ctx.fillStyle = '#c8a040'; ctx.fillRect(4, by, W - 8, 1); ctx.fillRect(4, by + bh - 1, W - 8, 1); ctx.fillRect(4, by, 1, bh); ctx.fillRect(W - 5, by, 1, bh);
  pintaFigura(ctx, 'lola', 26, by + bh - 6, { anim: 'quieto', f: Math.floor(TUTO.t * 4) % 4 });
  txt(ctx, 'LOLA', 10, by + 4, COL.oro);
  lineas.forEach((l, i) => txt(ctx, l, 52, by + 6 + i * LH, COL.texto));
  if (!p.espera && TUTO.t >= 0.35 && Math.floor(TUTO.t * 2) % 2 === 0) escribeMini(ctx, tr('TOCA PARA SEGUIR'), W - 10 - anchoMini(tr('TOCA PARA SEGUIR')), by + bh - 9, COL.oro);
  const st = tr('SALTAR TUTORIAL'), sw = anchoMini(st) + 8;
  TUTO.saltar = { x: 8, y: abajo ? by - 14 : by + bh + 2, w: sw, h: 12 };
  ctx.fillStyle = '#120d12'; ctx.fillRect(TUTO.saltar.x, TUTO.saltar.y, sw, 12); escribeMini(ctx, st, TUTO.saltar.x + 4, TUTO.saltar.y + 4, COL.apagado);
}
