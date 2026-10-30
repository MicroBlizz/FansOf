// Fans of Ratkov · EL REFUGIO (2): BoomBeaver el mercader (comprar y vender), el banco (fabricar con lo que traes), el taller (montar piezas
// y anomalías bugueadas: cuesta chapas y a veces deja un efecto secundario), el escuadrón (elegir y desbloquear animales), los encargos,
// las opciones y el cómo se juega.
'use strict';
/* ---------- MERCADER ---------- */
function pintaMercader(raiz) {
  let h = '<section class="tarjeta prepara"><img class="retrato" alt="" src="' + retratoCastor() + '"><div><p class="sup">' + esc(tr('EL MERCADER')) + '</p><h2>BoomBeaver</h2><p>' + esc(tr('«Compro de todo y vendo lo justo. Si explota, no se devuelve.» Paga la mitad de lo que vale, más o menos.')) + '</p></div></section>';
  h += '<section class="tarjeta"><h3>' + esc(tr('COMPRAR')) + '</h3><div class="lista">';
  for (const id of TIENDA) { const n = lotesTienda[id] || 1, precio = precioCompra(id) * n; h += filaObj(Object.assign(nuevoObj(id, n), ARMAS[id] ? { bal: 0 } : {}), '<button type="button" class="mini bien" data-a="compra" data-i="' + id + '"' + (SAVE.chapas < precio ? ' disabled' : '') + '>' + miles(precio) + '</button>'); }
  h += '</div></section><section class="tarjeta"><h3>' + esc(tr('VENDER')) + ' ' + boton('VENDER TODO EL BOTÍN', 'vbotin', 0, 'bien') + '</h3><div class="lista">';
  const lista = SAVE.alijo.map((o, i) => [o, i]).filter(([o]) => o);
  if (!lista.length) h += '<p class="vacio">' + esc(tr('No tienes nada en el alijo.')) + '</p>';
  for (const [o, i] of lista) h += filaObj(o, '<button type="button" class="mini" data-a="vende" data-i="' + i + '">' + esc(tr('VENDER')) + ' ' + miles(Math.round(valorDe(o) * PAGA)) + '</button>');
  h += '</div></section>';
  raiz.innerHTML = h;
  conClick(raiz, (a, i) => {
    if (a === 'compra') { const n = lotesTienda[i] || 1, precio = precioCompra(i) * n; if (SAVE.chapas < precio) return; const o = nuevoObj(i, n); if (meterAlijo(o)) { toast(tr('El alijo está lleno.')); return; } SAVE.chapas -= precio; play('compra'); }
    if (a === 'vende') { const o = SAVE.alijo[+i]; if (!o) return; SAVE.chapas += Math.round(valorDe(o) * PAGA); SAVE.alijo[+i] = null; compacta(SAVE.alijo); play('compra'); }
    if (a === 'vbotin') { let t = 0; SAVE.alijo = SAVE.alijo.filter(o => { if (o && OBJ[o.id].t === 'botin') { t += Math.round(valorDe(o) * PAGA); return false; } return true; }); if (!t) { toast(tr('No tienes botín para vender.')); return; } SAVE.chapas += t; play('compra'); toast(trf('+%1 chapas', miles(t)), true); }
    guardaPartida(); repinta();
  });
}
// BoomBeaver no está en el escuadrón: su retrato se dibuja aparte con el mismo sistema
function retratoCastor() {
  if (RETRATOS.castor) return RETRATOS.castor;
  ANIMAL_MODELO.castor = o => {
    cuerpoBase(o, { chaqueta: 0x8a5a33, chaleco: 0x6b4a2e, bufanda: 0xe2463b, mochila: { c: 0xd8b030, h: 0.5, w: 0.5 } });
    const c = cabezaBase(o, { pelo: 0x8a5a33, hocico: 0xc79a6b, nariz: 0x4e3420 });
    c(0.2, 0.12, 0.04, 0xf1e3c6, 0, -0.24, 0.36); for (const s of [-1, 1]) c(0.14, 0.12, 0.08, 0x6b4a2e, s * 0.27, 0.24, 0);
    c(0.66, 0.18, 0.56, 0xe2463b, 0, 0.27, 0); c(0.7, 0.05, 0.3, 0xe2463b, 0, 0.2, 0.3);
    const k = en(o, [0, 0, 0]); k(0.5, 0.12, 0.9, 0x4e3420, 0, 0.3, -0.6, -0.3);
    return { pantalon: 0x4e3420 };
  };
  ANIMALES.castor = ANIMALES.castor || { n: 'BoomBeaver' };
  return (RETRATOS.castor = retrato('castor'));
}

/* ---------- BANCO ---------- */
function pintaBanco(raiz) {
  let h = '<section class="tarjeta"><h3>' + esc(tr('EL BANCO DE TRABAJO')) + '</h3><p>' + esc(tr('Fabrica con lo que tengas en el alijo. Lo que sale va al alijo.')) + '</p></section><section class="tarjeta"><div class="lista">';
  RECETAS.forEach((r, i) => {
    const puede = r.con.every(([id, n]) => cuantos(SAVE.alijo, id) >= n);
    const pide = r.con.map(([id, n]) => '<span class="' + (cuantos(SAVE.alijo, id) >= n ? 'si' : 'no') + '">' + imgObj(id) + n + '/' + cuantos(SAVE.alijo, id) + '</span>').join('');
    h += filaObj(nuevoObj(r.sale[0], r.sale[1]), '<button type="button" class="mini bien" data-a="hace" data-i="' + i + '"' + (puede ? '' : ' disabled') + '>' + esc(tr('FABRICAR')) + '</button>', '<div class="pide">' + pide + '</div>');
  });
  h += '</div></section>';
  raiz.innerHTML = h;
  conClick(raiz, (a, i) => {
    const r = RECETAS[+i]; if (!r.con.every(([id, n]) => cuantos(SAVE.alijo, id) >= n)) return;
    const o = nuevoObj(r.sale[0], r.sale[1]); if (!cabe(SAVE.alijo, o, ALIJO_MAX)) { toast(tr('El alijo está lleno.')); return; }
    for (const [id, n] of r.con) quitar(SAVE.alijo, id, n); compacta(SAVE.alijo); o.fir = true; meterAlijo(o); // lo fabricado cuenta como encontrado
    play('fabrica'); toast(trf('Fabricado: %1', nombreDe(o.id)), true); guardaPartida(); repinta();
  });
}

/* ---------- TALLER ---------- */
let TALLER_SEL = 'arma1';
function armaTaller(k) { return k === 'arma1' || k === 'arma2' ? SAVE.equipo[k] : SAVE.alijo[+k]; }
function pintaTaller(raiz) {
  const armas = [['arma1', SAVE.equipo.arma1], ['arma2', SAVE.equipo.arma2], ...SAVE.alijo.map((o, i) => [String(i), o])].filter(([, o]) => o && ARMAS[o.id]);
  if (!armas.find(([k]) => k === TALLER_SEL)) TALLER_SEL = armas.length ? armas[0][0] : null;
  let h = '<section class="tarjeta"><h3>' + esc(tr('EL TALLER')) + '</h3><p>' + esc(tr('Monta piezas en tus armas. Las anomalías bugueadas hacen cosas que no deberían; montarlas cuesta 150 chapas y una de cada tres veces dejan un efecto secundario.')) + '</p><div class="filtros">';
  for (const [k, o] of armas) h += '<button type="button" class="mini' + (k === TALLER_SEL ? ' activa' : '') + '" data-a="sel" data-i="' + k + '">' + esc(tr(OBJ[o.id].n)) + (k.startsWith('arma') ? ' · ' + esc(tr(k === 'arma1' ? 'ARMA 1' : 'ARMA 2')) : '') + '</button>';
  if (!armas.length) h += '<p class="vacio">' + esc(tr('No tienes armas.')) + '</p>';
  h += '</div></section>';
  const o = TALLER_SEL ? armaTaller(TALLER_SEL) : null;
  if (o) {
    const st = statsArma(o);
    h += '<section class="tarjeta taller"><div class="arma-grande">' + imgObj(o.id) + '<div><h2>' + esc(tr(OBJ[o.id].n)) + '</h2><p>' + esc(tr(OBJ[o.id].d)) + '</p></div></div>';
    h += '<div class="stats">' + [['DAÑO', Math.round(st.dano * st.perd)], ['DISPAROS/S', (1 / st.cad).toFixed(1)], ['CARGADOR', st.carg], ['ALCANCE', Math.round(st.alc)], ['PRECISIÓN', Math.round(100 - st.disp * 250)], ['RUIDO', Math.round(st.ruido * 100)], ['PESO', st.peso.toFixed(1)]].map(([n, v]) => '<div><span>' + esc(tr(n)) + '</span><b>' + v + '</b></div>').join('') + '</div>';
    if (o.efecto) h += '<p class="malo efecto">' + esc(tr('EFECTO SECUNDARIO')) + ': <b>' + esc(tr(EFECTOS[o.efecto].n)) + '</b> · ' + esc(tr(EFECTOS[o.efecto].d)) + '</p>';
    h += '<div class="lista">';
    for (const r of [...RANURAS, 'anom']) {
      const puesta = r === 'anom' ? o.anom : (o.mods || {})[r];
      const hay = SAVE.alijo.filter(x => x && (r === 'anom' ? OBJ[x.id].t === 'anom' : OBJ[x.id].t === 'mod' && OBJ[x.id].ranura === r)).map(x => x.id);
      const opciones = [...new Set(hay)].map(id => '<button type="button" class="mini ' + (r === 'anom' ? 'raro' : 'bien') + '" data-a="monta" data-i="' + r + ':' + id + '">' + esc(tr('MONTAR')) + ' ' + esc(tr(OBJ[id].n)) + (r === 'anom' ? ' (' + COSTE_ANOMALIA + ')' : '') + '</button>').join('');
      h += '<div class="fila-obj ranura' + (r === 'anom' ? ' r4' : '') + '">' + (puesta ? imgObj(puesta) : '<i class="ic"></i>') + '<div class="fo-t"><em>' + esc(tr(NOMBRE_RANURA[r])) + '</em><b>' + esc(puesta ? tr(OBJ[puesta].n) : tr('vacío')) + '</b><span>' + esc(puesta ? tr(OBJ[puesta].d) : '') + '</span></div><div class="fo-b">' + (puesta ? boton('QUITAR', 'quita', r) : '') + opciones + '</div></div>';
    }
    h += '</div></section>';
  }
  raiz.innerHTML = h;
  conClick(raiz, (a, i) => {
    if (a === 'sel') { TALLER_SEL = i; return repinta(); }
    const arma = armaTaller(TALLER_SEL); if (!arma) return;
    arma.mods = arma.mods || {};
    if (a === 'quita') {
      const id = i === 'anom' ? arma.anom : arma.mods[i]; if (!id) return;
      if (meterAlijo(nuevoObj(id))) { toast(tr('El alijo está lleno.')); return; }
      if (i === 'anom') { arma.anom = null; arma.efecto = null; } else arma.mods[i] = null;
      ajustaCargador(arma); play('select');
    }
    if (a === 'monta') {
      const [r, id] = i.split(':');
      if (r === 'anom' && SAVE.chapas < COSTE_ANOMALIA) { toast(tr('No tienes chapas para pagar a BoomBeaver.')); return; }
      // lo que hubiera vuelve al alijo y la pieza nueva sale de él
      const vieja = r === 'anom' ? arma.anom : arma.mods[r];
      quitar(SAVE.alijo, id, 1); compacta(SAVE.alijo); if (vieja) meterAlijo(nuevoObj(vieja));
      if (r === 'anom') {
        SAVE.chapas -= COSTE_ANOMALIA; arma.anom = id; arma.efecto = null; SAVE.cuentas.anomalias++;
        if (azar(PROB_EFECTO)) { arma.efecto = pick(Object.keys(EFECTOS)); play('cuelgue'); confirmBox(tr('LA ANOMALÍA SE HA PEGADO MAL'), esc(trf('Tu arma ahora es %1: %2', tr(EFECTOS[arma.efecto].n), tr(EFECTOS[arma.efecto].d))), null, null, tr('VAYA')); }
        else { play('raro'); toast(tr('La anomalía encaja. El arma hace un ruido raro, pero funciona.'), true); }
      } else { arma.mods[r] = id; play('fabrica'); }
      ajustaCargador(arma);
    }
    guardaPartida(); repinta();
  });
}
// si el cargador encoge, las balas que sobran vuelven al alijo
function ajustaCargador(arma) { const st = statsArma(arma); if ((arma.bal || 0) > st.carg) { meterAlijo(nuevoObj(st.cal, arma.bal - st.carg)); arma.bal = st.carg; } }

/* ---------- ESCUADRÓN ---------- */
function pintaEscuadron(raiz) {
  let h = '<section class="tarjeta"><h3>' + esc(tr('EL ESCUADRÓN')) + '</h3><p>' + esc(tr('Elige con quién entras. Cada animal tiene su ventaja. Los que no tienes se contratan con chapas.')) + '</p></section>';
  for (const id of ORDEN_ANIMALES) {
    const A = ANIMALES[id], tiene = SAVE.desbloq.includes(id), elegido = SAVE.animal === id;
    h += '<section class="tarjeta prepara' + (elegido ? ' elegido' : '') + '"><img class="retrato" alt="" src="' + retrato(id) + '"><div><p class="sup">' + esc(tr(A.rol)) + '</p><h2>' + esc(A.n) + '</h2><p>' + esc(tr(A.d)) + '</p><p class="datos">' + esc(tr('VIDA')) + ' <b>' + A.vida + '</b> · ' + esc(tr('VELOCIDAD')) + ' <b>' + Math.round(A.vel * 100) + '%</b></p>' +
      (elegido ? '<p class="bien"><b>' + esc(tr('ELEGIDO')) + '</b></p>' : tiene ? '<button type="button" class="btn" data-a="elige" data-i="' + id + '">' + esc(tr('ELEGIR')) + '</button>' : '<button type="button" class="btn" data-a="compra" data-i="' + id + '"' + (SAVE.chapas < A.precio ? ' disabled' : '') + '>' + esc(trf('CONTRATAR · %1 chapas', miles(A.precio))) + '</button>') + '</div></section>';
  }
  raiz.innerHTML = h;
  conClick(raiz, (a, i) => {
    if (a === 'compra') { const A = ANIMALES[i]; if (SAVE.chapas < A.precio) return; SAVE.chapas -= A.precio; SAVE.desbloq.push(i); SAVE.animal = i; play('crown'); }
    if (a === 'elige') { SAVE.animal = i; play('select'); }
    sobraMochila(); guardaPartida(); repinta();
  });
}

/* ---------- ENCARGOS ---------- */
// las entregas solo aceptan lo ENCONTRADO EN INCURSIÓN (sacado del Distrito, no comprado)
const encargoListo = e => (e.tipo === 'cuenta' ? (SAVE.cuentas[e.cuenta] || 0) >= e.meta : e.pide.every(([id, n]) => cuantosFir(SAVE.alijo, id) >= n));
function revisaEncargos() { /* los encargos se cobran a mano en su pestaña; aquí solo se mira si hay alguno listo (lo dice el resumen) */ }
function pintaEncargos(raiz) {
  let h = '<section class="tarjeta prepara"><img class="retrato" alt="" src="' + retratoCastor() + '"><div><p class="sup">' + esc(tr('ENCARGOS DE BOOMBEAVER')) + '</p><h2>' + esc(tr('Trabajitos')) + '</h2><p>' + esc(tr('«Hazme unos recados y te pago. En chapas, en cosas o en las dos. No hago preguntas.»')) + '</p></div></section>';
  for (const e of ENCARGOS) {
    const hecho = !!SAVE.encargos[e.id], listo = encargoListo(e);
    const premio = [e.premio.chapas ? miles(e.premio.chapas) + ' ' + tr('chapas') : '', e.premio.obj ? tr(OBJ[e.premio.obj[0]].n) : ''].filter(Boolean).join(' + ');
    const prog = e.tipo === 'cuenta' ? Math.min(e.meta, SAVE.cuentas[e.cuenta] || 0) + '/' + e.meta : e.pide.map(([id, n]) => Math.min(n, cuantosFir(SAVE.alijo, id)) + '/' + n + ' ' + tr(OBJ[id].n)).join(' · ') + ' · ' + tr('solo lo encontrado en incursión');
    h += '<section class="tarjeta encargo' + (hecho ? ' hecho' : '') + '"><h3>' + esc(tr(e.n)) + (hecho ? ' <small class="bien">' + esc(tr('HECHO')) + '</small>' : '') + '</h3><p>' + esc(tr(e.d)) + '</p><p class="datos">' + esc(tr('PREMIO')) + ': <b>' + esc(premio) + '</b> · ' + esc(prog) + '</p>' +
      (!hecho ? '<button type="button" class="btn" data-a="cobra" data-i="' + e.id + '"' + (listo ? '' : ' disabled') + '>' + esc(tr(e.tipo === 'entrega' ? 'ENTREGAR' : 'COBRAR')) + '</button>' : '') + '</section>';
  }
  raiz.innerHTML = h;
  conClick(raiz, (a, i) => {
    const e = ENCARGOS.find(x => x.id === i); if (!e || SAVE.encargos[e.id] || !encargoListo(e)) return;
    if (e.tipo === 'entrega') { for (const [id, n] of e.pide) quitar(SAVE.alijo, id, n, true); compacta(SAVE.alijo); }
    if (e.premio.chapas) SAVE.chapas += e.premio.chapas;
    if (e.premio.obj) meterAlijo(nuevoObj(e.premio.obj[0], e.premio.obj[1]));
    SAVE.encargos[e.id] = true; play('win'); toast(trf('Encargo cumplido: %1', tr(e.n)), true); guardaPartida(); repinta();
  });
}

/* ---------- OPCIONES y CÓMO SE JUEGA ---------- */
let OPC_NOTA = '';
function muestraOpciones() {
  const cal = { baja: 'CALIDAD: BAJA', auto: 'CALIDAD: AUTOMÁTICA', alta: 'CALIDAD: ALTA' };
  const h = cabecera(tr('OPCIONES')) + '<div class="botones">' +
    '<button type="button" class="btn" data-a="son">' + esc(tr(AJUSTES.mudo ? 'SONIDO: NO' : 'SONIDO: SÍ')) + '</button>' +
    '<button type="button" class="btn" data-a="mus">' + esc(tr(AJUSTES.sinMusica ? 'MÚSICA: NO' : 'MÚSICA: SÍ')) + '</button>' +
    '<button type="button" class="btn" data-a="cal">' + esc(tr(cal[AJUSTES.calidad] || cal.auto)) + '</button>' +
    '<button type="button" class="btn" data-a="dif">' + esc(tr('DIFICULTAD')) + ': ' + esc(tr(dif().n)) + '</button>' +
    (ENT.tactil ? '<button type="button" class="btn" data-a="vibra">' + esc(tr(AJUSTES.vibra === false ? 'VIBRACIÓN: NO' : 'VIBRACIÓN: SÍ')) + '</button>' : '') +
    '<button type="button" class="btn" data-a="vert">' + esc(tr(AJUSTES.autoApunta === false ? 'APUNTADO AUTOMÁTICO: NO' : 'APUNTADO AUTOMÁTICO: SÍ')) + '</button>' +
    '<p class="nota">' + esc(tr(AJUSTES.autoApunta === false ? 'En el móvil: una palanca para andar y otra para apuntar y disparar.' : 'En el móvil: una palanca para andar y un botón grande de disparar que apunta solo al enemigo más cercano.')) + ' ' + esc(tr('El juego se da cuenta solo de si tienes el móvil de pie o tumbado y coloca los mandos.')) + '</p>' +
    (RAID.activa ? '' : '<button type="button" class="btn" data-a="tuto">' + esc(tr('VER TUTORIAL')) + '</button><p class="nota">' + esc(tr(SAVE.visto.tuto ? 'Ya lo hiciste: esta vez no hay premio.' : 'Al acabarlo, BoomBeaver te da un premio.')) + '</p>') +
    '<button type="button" class="btn" data-a="copias">' + esc(tr('COPIAS DE SEGURIDAD')) + '</button>' +
    (ENT.tactil ? '' : '<button type="button" class="btn" data-a="teclas">' + esc(tr('TECLAS')) + '</button>') +
    '<button type="button" class="btn" data-a="instala">' + esc(tr(INSTALAR.yaInstalada() ? 'YA INSTALADO' : 'INSTALAR')) + '</button>' +
    (OPC_NOTA ? '<p class="nota">' + esc(tr(OPC_NOTA)) + '</p>' : '') +
    '<div class="banderas" id="op-banderas"></div>' +
    '<button type="button" class="btn" data-a="cuenta">' + esc(tr('CUENTA')) + '</button>' +
    '<button type="button" class="btn malo" data-a="borra">' + esc(tr('EMPEZAR DE CERO')) + '</button></div>';
  const v = abreVentana('v-opciones', h); enganchaCerrar(v, 'v-opciones'); v.querySelector('[data-cierra]').addEventListener('click', () => { OPC_NOTA = ''; });
  try { pintarBanderas(el('op-banderas'))(); } catch (e) { /* sin banderas */ }
  v.querySelectorAll('[data-a]').forEach(b => (b.onclick = () => {
    const a = b.dataset.a;
    if (a === 'son') cambiaSonido(); if (a === 'mus') cambiaMusica();
    if (a === 'cal') { AJUSTES.calidad = { auto: 'alta', alta: 'baja', baja: 'auto' }[AJUSTES.calidad] || 'auto'; guardaAjustes(); ajustaTamano(); play('select'); }
    if (a === 'dif') { AJUSTES.dificultad = AJUSTES.dificultad === 'normal' ? 'becario' : 'normal'; guardaAjustes(); play('select'); if (!el('refugio').hidden) repinta(); }
    if (a === 'vibra') { AJUSTES.vibra = AJUSTES.vibra === false; guardaAjustes(); vibra(60); play('select'); muestraOpciones(); return; }
    if (a === 'vert') { AJUSTES.autoApunta = AJUSTES.autoApunta === false; guardaAjustes(); ponOrientacion(); play('select'); }
    if (a === 'instala') { OPC_NOTA = INSTALAR.instala() || 'Sigue los pasos de la ventana del navegador.'; play('select'); }
    if (a === 'cuenta') { abreCuentaR(); return; }
    if (a === 'copias') { cierraVentana('v-opciones'); play('select'); abreCopias(); return; }
    if (a === 'teclas') { cierraVentana('v-opciones'); play('select'); abreTeclas(muestraOpciones); return; }
    if (a === 'tuto') { cierraVentana('v-opciones'); play('go'); empiezaTutorial(); return; }
    if (a === 'borra') { confirmBox(tr('¿EMPEZAR DE CERO?'), esc(tr('Se borra tu alijo, tus chapas, tu escuadrón y tus encargos. Queda una copia de seguridad en Opciones, por si acaso.')), tr('BORRAR'), () => { copiaSeguridad(true); Object.keys(SAVE).forEach(k => delete SAVE[k]); Object.assign(SAVE, partidaNueva()); guardaPartida(); location.reload(); }); return; }
    muestraOpciones();
  }));
}
const CAJA_CUENTA = document.createElement('section'); CAJA_CUENTA.id = 'fok-cuenta'; CAJA_CUENTA.className = 'screen modal'; CAJA_CUENTA.hidden = true; document.body.appendChild(CAJA_CUENTA);
function abreCuentaR() {
  if (!window.filaCuenta) { toast(tr('La cuenta no está disponible ahora.')); return; }
  CAJA_CUENTA.innerHTML = '<div class="modal-card"><h3 class="ol">' + tr('CUENTA') + '</h3><div class="opt-list"></div><button class="btn-ghost ol" id="fok-cuenta-ok">' + tr('VOLVER') + '</button></div>';
  CAJA_CUENTA.querySelector('.opt-list').appendChild(window.filaCuenta); CAJA_CUENTA.hidden = false;
  el('fok-cuenta-ok').onclick = () => { play('select'); CAJA_CUENTA.hidden = true; };
}
hook('cuenta', () => { if (!CAJA_CUENTA.hidden) abreCuentaR(); });
function muestraComo() {
  const p = t => '<p>' + t + '</p>';
  const h = cabecera(tr('CÓMO SE JUEGA')) + '<div class="texto">' +
    '<h4>' + esc(tr('EL PLAN')) + '</h4>' + p(esc(tr('Prepara lo que llevas en el refugio, entra en el Distrito Microblizz, registra todo lo que puedas y sal por una salida antes de que llegue la ventisca. Si caes, pierdes todo lo que llevabas encima menos la riñonera.'))) +
    '<h4>' + esc(tr('EN EL ORDENADOR')) + '</h4>' + p(esc(tr('Ratón: apuntar · Clic: disparar · Clic derecho: zanahoria bomba · Esc: pausa. Las teclas se cambian en Opciones > TECLAS.'))) + p(esc(ACCIONES_TECLA.map(a => tr(a.n) + ': ' + teclasDe(a.id).map(nombreTecla).join(' / ')).join(' · '))) +
    '<h4>' + esc(tr('EN EL MÓVIL')) + '</h4>' + p(esc(tr('Palanca izquierda para andar y botón grande de DISPARAR, que apunta solo al enemigo más cercano. Si quitas el apuntado automático en Opciones, la palanca derecha apunta y, llevándola al borde, dispara. Vale de pie o tumbado: el juego coloca los mandos solo. Junto a un contenedor, el botón grande se convierte en REGISTRAR: tócalo una vez.')) + ' ' + esc(tr('Para correr, lleva el dedo de la palanca más allá del aro. AGACHARSE tiene su botón. Agachado y a la espalda de un enemigo despistado, el botón grande dice DESPEDIR.'))) +
    '<h4>' + esc(tr('EL FRÍO')) + '</h4>' + p(esc(tr('Fuera hace frío y la barra sube poco a poco. Junto a un bidón con fuego baja. El té caliente también ayuda. Con el frío al máximo pierdes vida. Cuando llega la ventisca, sube muy deprisa.'))) +
    '<h4>' + esc(tr('EL PESO')) + '</h4>' + p(esc(trf('Hasta %1 kg vas normal; con más, vas más lento. Elige qué te llevas.', PESO_LIBRE))) +
    '<h4>' + esc(tr('LAS ANOMALÍAS')) + '</h4>' + p(esc(tr('En la grieta de la estatua, en El Lag y en las cajas fuertes salen piezas bugueadas. Móntalas en el taller: balas que rebotan, que salen dos veces, que atraviesan… y a veces un efecto secundario.'))) +
    '<h4>' + esc(tr('LOS ENEMIGOS')) + '</h4>' + p(esc(tr('Los becarios carroñeros van por libre. Seguridad Microblizz va en grupo y su escudo para los disparos de frente: rodéalos o usa una zanahoria bomba. El Auditor guarda la torre y lleva la tarjeta roja del Despacho del Director. El Lag... mejor de lejos.'))) +
    '</div>';
  const v = abreVentana('v-como', h); enganchaCerrar(v, 'v-como');
}
