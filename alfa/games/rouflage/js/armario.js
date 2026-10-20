// Fans of Rouflage · ARMARIO y PERFIL: dos pantallas del menú del título. En el armario se viste la galleta con lo del catálogo
// (armario-datos.js): tocar una cosa te la prueba; si es tuya, se queda puesta. Un conjunto se pone entero. En el perfil están tu galleta
// con su marco, tu título y lo que llevas coleccionado, y un botón de pruebas para desbloquearlo todo (se quitará en el juego final).
// Lo puesto se guarda en SAVE.armario y se ve en la habitación (habitacion.js: `ropaDe()` es lo que se le pone al personaje).
// Desde la 0.2.26 lo ve todo el mundo (antes solo la alfa y desarrollo): armarioVisible lo deja encendido y sigue siendo el interruptor de todo lo que cuelga de él (diario, economía, tienda, habitación, ropa en partida).
'use strict';
const ARMARIO = { cat: 'conjuntos', sel: null, prueba: null, desde: 'titulo' };
function armarioVisible() { return true; }
function armarioEstado() {
  if (!SAVE.armario) SAVE.armario = { tengo: [], puesto: {}, todo: false };
  const a = SAVE.armario, p = a.puesto;
  if (typeof SAVE.migas === 'number') { SAVE.gotas = (SAVE.gotas || 0) + SAVE.migas; delete SAVE.migas; }      // las monedas se llamaban Migas y Purpurina
  if (typeof SAVE.purpurina === 'number') { SAVE.acciones = (SAVE.acciones || 0) + SAVE.purpurina; delete SAVE.purpurina; }
  if (p.papel === 'monopoly') p.papel = 'arcoiris';      // el billete de Monopoly se quitó: ahora es el papel arcoíris
  { const i = a.tengo.indexOf('papel:monopoly'); if (i >= 0) a.tengo[i] = 'papel:arcoiris'; }
  if (!p.mascotas) p.mascotas = 'conejo';      // todos empiezan con su mascota puesta y no se puede ir sin ella
  for (const cat of CATALOGO_AR) if (cat.conjuntos) continue; else if (!(cat.id in p)) p[cat.id] = cat.vacio ? null : cat.items[0].id;   // la galleta empieza con la cara de la campaña y sin adornos
  return a;
}
const arCat = id => CATALOGO_AR.find(c => c.id === id);
const arItem = (cat, id) => { const c = arCat(cat); return c && id ? c.items.find(x => x.id === id) || null : null; };
function arTiene(cat, it) {
  const a = armarioEstado(); if (a.todo || it.de === 'base' || a.tengo.includes(cat + ':' + it.id)) return true;
  if (it.de === 'conjunto') { const cj = arCat('conjuntos').items.find(k => Object.values(k.piezas).includes(it.id) && k.piezas[cat] === it.id); return !!cj && arTiene('conjuntos', cj); }   // una pieza de conjunto es tuya si lo es el conjunto
  return false;
}
function arCuenta() { let t = 0, n = 0; for (const c of CATALOGO_AR) for (const it of c.items) { n++; if (arTiene(c.id, it)) t++; } return [t, n]; }
// ¿llevas puesto este conjunto entero?
function arConjuntoPuesto(cj) { const p = armarioEstado().puesto; return Object.keys(cj.piezas).every(cat => (p[cat] || null) === (cj.piezas[cat] || null)); }
// lo que se le pone a la galleta (para ARD.vestida y para el personaje): lo puesto y, encima, lo que te estás probando
function ropaDe(prueba) {
  const p = Object.assign({}, armarioEstado().puesto);
  if (prueba) { if (prueba.cat === 'conjuntos') Object.assign(p, prueba.it.piezas); else p[prueba.cat] = prueba.it ? prueba.it.id : null; }
  return ropaDeIds(p);
}
// lo mismo a partir de los ids (lo tuyo o lo que manda otro jugador por la red): ojos, boca, papel, cabeza, espalda, los colores del humo y el fantasma
function ropaDeIds(p) {
  const v = cat => { const it = arItem(cat, p[cat]); return it ? it.v : null; }, h = arItem('humo', p.humo), l = arItem('linterna', p.linterna), t = arItem('titulos', p.titulos);
  return { ojos: ARD.OJOS[v('ojos')] || null, boca: ARD.BOCAS[v('bocas')] || null, papel: v('papel') || 'blanco', cabeza: v('cabeza'), espalda: v('espalda'),
    humo: (h && h.x && h.x.colores) || null, fantasma: arItem('fantasma', p.fantasma) ? p.fantasma : null,
    silbido: arItem('silbido', p.silbido) ? p.silbido : null, congelar: arItem('congelar', p.congelar) ? p.congelar : null, sello: arItem('sello', p.sello) ? p.sello : null,
    linterna: (l && l.x && l.x.color) ? { color: l.x.color, borde: l.x.borde } : null, marco: arItem('marcos', p.marcos) ? p.marcos : null,
    titulo: (t && t.x && t.x.texto) ? { texto: t.x.texto, color: t.x.color } : null, gesto: arItem('gestos', p.gestos) ? p.gestos : null, mascota: arItem('mascotas', p.mascotas) ? p.mascotas : null, ids: p };
}
// EN LA PARTIDA (de momento, como el armario, solo en la alfa y en desarrollo): lo que va en el cuerpo, el humo, el fantasma y el papel (el camaleón lo lleva
// mientras anda: al congelarse o abrir el pincel vuelve a ser un lienzo en blanco, así que no cambia el camuflaje; el becario lo lleva siempre). Contra bots se lo pone tu personaje; en el PvP viaja a los demás en un aviso `rp` (pvp-sync.js) y cada uno lo dibuja.
const ROPA_PARTIDA = ['papel', 'ojos', 'bocas', 'cabeza', 'espalda', 'humo', 'fantasma', 'silbido', 'congelar', 'sello', 'linterna', 'marcos', 'titulos', 'gestos', 'mascotas'];      // (lo de la tanda 2 se dibuja en armario-partida.js)
function ropaPartida() {
  if (!armarioVisible()) return null;
  const p = armarioEstado().puesto, r = {};
  for (const k of ROPA_PARTIDA) if (p[k]) r[k] = p[k];
  return r;
}
// se lo pone a un personaje de la partida: pasa a ser la galleta (tipo fan) con sus adornos; la piel (la pintura) no se toca. Solo se aceptan cosas que existen
function vistePartida(e, ids) {
  if (!e || !ids || typeof ids !== 'object') return;
  const p = {}; for (const k of ROPA_PARTIDA) if (typeof ids[k] === 'string' && arItem(k, ids[k])) p[k] = ids[k];
  e.tipo = 'fan'; e.ropa = ropaDeIds(p);
  if (e.clase === 'cazador' || (!['cuenta', 'caza', 'fin'].includes(J.fase) && !e.congelado && !e.pintado)) ponPapel(e);      // el colado, solo antes de empezar a pintarse
}
// el papel como piel: su color y, si tiene, su dibujo (lo mismo que en la habitación)
function ponPapel(e) {
  const papel = (e.ropa && e.ropa.papel) || 'blanco', postura = e.postura || 'firmes';
  if (papel === 'blanco' && e.clase !== 'cazador') { if (e.papelPuesto) lienzoBlanco(e); return; }
  const [cv, g] = nuevaPiel(e.clase === 'cazador' && papel === 'blanco' ? '#aab4c4' : ARD.COLOR_PAPEL[papel] || BLANCO_PIEL, postura);
  if (ARD.PAPEL[papel]) { g.save(); g.scale(ESC_PIEL, ESC_PIEL); g.translate(PIE_X, PIE_Y); g.beginPath(); trazaAlubia(g, null, postura); g.clip(); ARD.PAPEL[papel](g); g.restore(); }
  e.piel = cv; e.pctx = g; e.papelPuesto = e.clase === 'camaleon'; if (e.pasos) e.pasos.length = 0;
}
// al congelarse o abrir el pincel, el colado vuelve a ser un lienzo en blanco para pintarse
function lienzoBlanco(e) {
  if (!e.papelPuesto) return;
  e.papelPuesto = false; [e.piel, e.pctx] = nuevaPiel(BLANCO_PIEL, e.postura || 'firmes'); if (e.pasos) e.pasos.length = 0;
}
const RAREZA_AR = { comun: 'Común', rara: 'Rara', epica: 'Épica', legend: 'Legendaria' };
function arEuros(n) { const e = (n / 100 * 0.99).toFixed(2); return IDIOMA_RF === 'es' ? e.replace('.', ',') : e; }
function arTextoDe(it) {
  const t = it.txt; let m;
  if (typeof t === 'number' && it.r !== 'epica' && it.r !== 'legend') return tr('Solo en el gachapón, con Gotas');
  if (typeof t === 'number') return tr('{n} Acciones (≈ {e} €)', { n: t, e: arEuros(t) });
  if ((m = /^Pase (gratis|premium) · nv (\d+)$/.exec(t))) return tr(m[1] === 'gratis' ? 'Pase gratis · nv {n}' : 'Pase premium · nv {n}', { n: m[2] });
  if ((m = /^(\d+) Gotas$/.exec(t))) return tr('{n} Gotas', { n: m[1] });
  if ((m = /^Diario · día 7 \(semana (\d)\)$/.exec(t))) return tr('Diario · día 7 (semana {n})', { n: m[1] });
  if ((m = /^Diario · día (\d+)$/.exec(t))) return tr('Diario · día {n}', { n: m[1] });
  if ((m = /^Conjunto (.+)$/.exec(t))) return tr('Conjunto {n}', { n: m[1] });
  return tr(t);
}
// un lienzo nítido (al doble) de w×h en pantalla
function arLienzo(w, h, clase) { const k = document.createElement('canvas'); k.width = w * 2; k.height = h * 2; k.style.width = w + 'px'; k.style.height = h + 'px'; if (clase) k.className = clase; return k; }
function arPinta(k, f) { const c = k.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, k.width, k.height); c.save(); try { f(c, k.width, k.height); } catch (e) { console.warn('[armario]', e); } c.restore(); }

/* ---------- el armario ---------- */
function abreArmario(cat, desde) {
  armarioEstado(); if (cat) ARMARIO.cat = cat; ARMARIO.prueba = null; ARMARIO.sel = null; ARMARIO.desde = desde || 'titulo';
  E('b-ar-volver').textContent = ARMARIO.desde === 'habitacion' ? tr('HABITACIÓN') : tr('VOLVER');
  pantalla('p-armario'); arPintaPestanas(); arPintaTodo();
}
function cierraArmario() { play('select'); if (ARMARIO.desde === 'habitacion') habitacionVuelve(); else irTitulo(); }
function arPintaTodo() { arPintaVista(); arPintaInfo(); arPintaRejilla(); const [t, n] = arCuenta(); E('ar-cuenta').textContent = tr('{t} de {n}', { t, n }); }
function arPintaPestanas() {
  const fila = E('ar-pestanas'); fila.innerHTML = '';
  for (const cat of CATALOGO_AR) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'ar-pest' + (cat.id === ARMARIO.cat ? ' activa' : '');
    b.textContent = tr(cat.corto);
    b.onclick = () => { play('select'); ARMARIO.cat = cat.id; ARMARIO.prueba = null; ARMARIO.sel = null; arPintaPestanas(); arPintaTodo(); };
    fila.appendChild(b);
  }
  const act = fila.querySelector('.activa'); if (act && act.scrollIntoView) act.scrollIntoView({ block: 'nearest', inline: 'center' });
}
function arPintaVista() {
  const cat = arCat(ARMARIO.cat), pr = ARMARIO.prueba;
  arPinta(E('ar-vista'), (c, w, h) => ARD.vestida(c, w, h * .93, Object.assign({ esc: h / 92 }, ropaDe(cat.cuerpo ? pr : null))));
  // lo que no se lleva en el cuerpo (humo, silbido, fantasma…): en grande, lo puesto o lo que te estás probando
  const ex = E('ar-extra'); ex.hidden = !!cat.cuerpo; E('ar-vista').hidden = !cat.cuerpo;
  if (!cat.cuerpo) { const it = pr ? pr.it : arItem(cat.id, armarioEstado().puesto[cat.id]); arPinta(ex, (c, w) => { if (it) it.x(c, w); }); }
}
function arPintaInfo() {
  const cat = arCat(ARMARIO.cat), a = armarioEstado(), sel = ARMARIO.sel;
  const it = sel === 'nada' ? null : sel || (cat.conjuntos ? cat.items.find(arConjuntoPuesto) || null : arItem(cat.id, a.puesto[cat.id]));
  const nom = E('ar-nombre'), de = E('ar-de'), est = E('ar-estado');
  E('ar-nota').textContent = tr(cat.nombre) + (cat.nota ? ' · ' + tr(cat.nota) : '');
  if (!it) {
    nom.textContent = cat.conjuntos ? tr('Piezas mezcladas') : tr('Sin nada'); nom.className = '';
    de.textContent = cat.conjuntos ? tr('Toca un conjunto para vestirte entero') : cat.vacio ? tr('La galleta sin adornos, como al empezar') : ''; est.textContent = ''; est.className = 'ar-estado'; arPintaCompra(cat, null); return;
  }
  nom.textContent = tr(it.n); nom.className = 'r-' + it.r;
  de.textContent = tr(RAREZA_AR[it.r]) + ' · ' + arTextoDe(it);
  const tuyo = arTiene(cat.id, it), puesto = cat.conjuntos ? arConjuntoPuesto(it) : a.puesto[cat.id] === it.id;
  est.className = 'ar-estado ' + (puesto ? 'puesto' : tuyo ? 'tuyo' : 'bloq');
  est.textContent = puesto ? tr('PUESTO') : tuyo ? tr('ES TUYO') : tr('TE LO ESTÁS PROBANDO');
  arPintaCompra(cat, it);      // el botón COMPRAR y lo que tienes (economia.js)
}
function arPintaRejilla() {
  const cat = arCat(ARMARIO.cat), a = armarioEstado(), rej = E('ar-rejilla'); rej.innerHTML = '';
  const casilla = (it, tuyo, puesto, alTocar, dibuja, nombre, rar) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'ar-casilla r-' + rar + (puesto ? ' puesto' : '') + (tuyo ? '' : ' bloq') + (ARMARIO.sel === it ? ' sel' : '');
    const k = arLienzo(64, 64); arPinta(k, dibuja); b.appendChild(k);
    const s = document.createElement('small'); s.textContent = nombre; b.appendChild(s);
    if (!tuyo) { const cd = arLienzo(22, 22, 'ar-candado'); arPinta(cd, (c, w) => ARD.ICONOS.candado(c, w)); b.appendChild(cd); }
    b.onclick = alTocar; rej.appendChild(b);
  };
  if (cat.vacio) casilla('nada', true, a.puesto[cat.id] === null, () => { play('select'); a.puesto[cat.id] = null; ARMARIO.sel = 'nada'; ARMARIO.prueba = null; guardaPartida(); arPintaTodo(); }, (c, w) => ARD.ICONOS.nada(c, w), tr('Nada'), 'comun');
  for (const it of cat.items) {
    const tuyo = arTiene(cat.id, it), puesto = cat.conjuntos ? arConjuntoPuesto(it) : a.puesto[cat.id] === it.id;
    casilla(it, tuyo, puesto, () => {
      ARMARIO.sel = it;
      if (tuyo) { play('select'); if (cat.conjuntos) Object.assign(a.puesto, it.piezas); else a.puesto[cat.id] = it.id; ARMARIO.prueba = null; guardaPartida(); }
      else { play('tick'); ARMARIO.prueba = { cat: cat.id, it }; }
      arPintaTodo();
    }, (c, w) => it.x(c, w), tr(it.n), it.r);
  }
}

/* ---------- el perfil ---------- */
function abrePerfil() {
  const a = armarioEstado(); pantalla('p-perfil');
  const marcoId = a.puesto.marcos || 'madera', tit = arItem('titulos', a.puesto.titulos);
  arPinta(E('pf-galleta'), (c, w, h) => ARD.marco(c, w, marcoId, (g, ww, hh) => ARD.vestida(g, ww, hh * .86, Object.assign({ esc: hh / 100 }, ropaDe(null))), h));
  arPinta(E('pf-titulo'), (c, w, h) => { if (tit) { c.translate(0, (h - w) / 2); tit.x(c, w); } });
  const [t, n] = arCuenta();
  E('pf-cosas').textContent = tr('{t} de {n}', { t, n });
  E('pf-nivel').textContent = tr('Nivel {n}', { n: 1 });
  E('pf-nombre').textContent = tr('Fan sin nombre');
  Promise.resolve(CUENTA.perfil()).then(p => { if (p && p.nombre) E('pf-nombre').textContent = p.nombre; }).catch(() => {});
  E('pf-pvp').textContent = '–';
  try { Promise.resolve(RFRED.red.clasificacion()).then(r => { const y = r && r.yo; E('pf-pvp').textContent = y ? tr('{p} puntos · {g} ganadas de {j}', { p: y.puntos, g: y.ganadas, j: y.jugadas }) : tr('Sin partidas'); }).catch(() => {}); } catch (_) { /* sin red */ }
  const col = E('pf-coleccion'); col.innerHTML = '';
  for (const cat of CATALOGO_AR) {
    const tiene = cat.items.filter(it => arTiene(cat.id, it)).length;
    const f = document.createElement('button'); f.type = 'button'; f.className = 'pf-fila';
    f.innerHTML = '<span></span><i class="barra"><i></i></i><b></b>';
    f.children[0].textContent = tr(cat.corto); f.children[1].firstChild.style.width = Math.round(tiene / cat.items.length * 100) + '%'; f.children[2].textContent = tiene + '/' + cat.items.length;
    f.onclick = () => { play('select'); abreArmario(cat.id); };
    col.appendChild(f);
  }
  E('b-pf-todo').textContent = a.todo ? tr('VOLVER A BLOQUEAR') : tr('DESBLOQUEAR TODO');
}
function arDesbloqueaTodo() {
  const a = armarioEstado(); a.todo = !a.todo;
  if (!a.todo) for (const cat of CATALOGO_AR) { if (cat.conjuntos) continue; const it = arItem(cat.id, a.puesto[cat.id]); if (it && !arTiene(cat.id, it)) a.puesto[cat.id] = cat.vacio ? null : cat.items[0].id; }   // lo que ya no es tuyo, fuera
  guardaPartida(); play('pop'); abrePerfil();
}
function preparaArmario() {
  PANTALLAS.push('p-armario', 'p-perfil');
  E('fila-armario').hidden = !armarioVisible();
  E('b-habitacion').onclick = () => { play('select'); empiezaHabitacion('camaleon'); };
  E('b-armario').onclick = () => { play('select'); abreArmario(); };
  E('b-perfil').onclick = () => { play('select'); abrePerfil(); };
  E('b-ar-perfil').onclick = () => { play('select'); abrePerfil(); };
  E('b-ar-volver').onclick = cierraArmario;
  E('b-pf-armario').onclick = () => { play('select'); abreArmario(); };
  E('b-pf-volver').onclick = () => { play('select'); irTitulo(); };
  E('b-pf-todo').onclick = arDesbloqueaTodo;
  const ev = arLienzo(150, 172); ev.id = 'ar-vista'; E('ar-vista-sitio').appendChild(ev);
  const ex = arLienzo(150, 150, 'ar-extra'); ex.id = 'ar-extra'; E('ar-vista-sitio').appendChild(ex);
  const pg = arLienzo(170, 200); pg.id = 'pf-galleta'; E('pf-galleta-sitio').appendChild(pg);
  const pt = arLienzo(190, 64); pt.id = 'pf-titulo'; E('pf-titulo-sitio').appendChild(pt);
}
