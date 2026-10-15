// Fans of Ratkov · EL TUTORIAL: «El Patio del Refugio», un patio pequeño y seguro (fuera del Distrito, al este del mapa) donde un cartel
// te enseña paso a paso: andar, registrar, coger, disparar a un becario de prácticas que casi no pega, curarte, calentarte y salir.
// Se juega con un equipo prestado (lo tuyo no se toca) y al acabar BoomBeaver te da un premio. Sale la primera vez y se repite desde
// la pestaña INCURSIÓN.
'use strict';
const TUTO = { x0: 108, x1: 152, z0: -12, z1: 12, paso: 0, caja: null, becario: null, marca: null, t: 0 };
const TUTO_SALIDA = { id: 'patio', n: 'La puerta del refugio', x: 148, z: 0, r: 2.2, siempre: true };
const PREMIO_TUTO = { chapas: 300, obj: [['venda', 2], ['te', 1], ['m9', 30]] };

// el patio: muros de nieve, una caja, un bidón con fuego, unas dianas y la puerta del refugio
function construyeTutorial() {
  const o = new Obra(), { x0, x1, z0, z1 } = TUTO;
  const muro = (a, b, c, d) => { o.caja(Math.abs(c - a) || 1.2, 1.8, Math.abs(d - b) || 1.2, 0xd6dee8, (a + c) / 2, 0.9, (b + d) / 2); o.caja((Math.abs(c - a) || 1.2) + 0.1, 0.3, (Math.abs(d - b) || 1.2) + 0.1, 0xe8eef4, (a + c) / 2, 1.9, (b + d) / 2); solido(Math.min(a, c) - (a === c ? 0.6 : 0), Math.min(b, d) - (b === d ? 0.6 : 0), Math.max(a, c) + (a === c ? 0.6 : 0), Math.max(b, d) + (b === d ? 0.6 : 0), 1.8, 'muro'); };
  muro(x0, z0, x1, z0); muro(x0, z1, x1, z1); muro(x0, z0, x0, z1); muro(x1, z0, x1, -2.4); muro(x1, 2.4, x1, z1);
  // un suelo pisado
  const suelos = new Obra(); suelos.plano(x1 - x0, z1 - z0, textura(16, 16, g => { g.fillStyle = '#a8a49e'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#bcb8b2'; g.fillRect(0, 0, 8, 8); g.fillRect(8, 8, 8, 8); }), 11, 6, (x0 + x1) / 2, 0.03, 0, 0, true); MOTOR.escena.add(suelos.hecha(false));
  // la caja de las prácticas, el bidón, sacos para cubrirse y la puerta con su luz
  o.caja(1.2, 0.8, 0.8, 0x4a5a3a, 126, 0.4, -5); o.caja(1.22, 0.08, 0.82, 0x3a4a2a, 126, 0.82, -5); solido(125.4, -5.4, 126.6, -4.6, 0.8, 'bajo');
  TUTO.caja = contenedor('caja', 126, -4.1, { tuto: true, fijo: [['tuberia', 1], ['figura', 1], ['venda', 1], ['m9', 16], ['taza', 1]] });
  // la caja fuerte con cerradura (para el minijuego)
  o.caja(1.3, 1.3, 1.1, 0x07090c, 144, 0.65, 8.6); o.caja(1.2, 1.2, 1.0, 0x5c6670, 144, 0.65, 8.6); o.caja(0.5, 0.5, 0.06, 0xc99a3a, 144, 0.8, 8.06); solido(143.4, 8.1, 144.6, 9.1, 1.3, 'bajo');
  TUTO.fuerte = contenedor('caja_fuerte', 144, 7.6, { tuto: true, fijo: [['blizzcoin', 1], ['m9', 20]] });
  bidonFuego(o, 140, -6);
  sacos(o, 131, 4, 4, 0.2);
  for (const s of [-1, 1]) o.caja(0.3, 3, 0.3, 0x8a2a2a, 148.5, 1.5, s * 2.3); o.caja(0.4, 0.5, 5, 0x8a2a2a, 148.5, 3, 0);
  o.caja(1.4, 0.7, 0.1, 0xf9c531, 148.3, 3.1, 0, Math.PI / 2);
  for (let i = 0; i < 8; i++) arbolPelado(o, x0 + 4 + i * 5, z1 + 2 + (i % 2), 1, semilla(i + 3));
  MOTOR.escena.add(o.hecha());
  // el anillo que marca adonde ir
  const anillo = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.25, 20), new THREE.MeshBasicMaterial({ color: 0xffcb3d, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false }));
  anillo.rotation.x = -Math.PI / 2; anillo.position.y = 0.06; anillo.visible = false; MOTOR.escena.add(anillo); TUTO.marca = anillo;
}

// los pasos: qué dice el cartel (en el ordenador y en el móvil), adónde señala y cuándo se cumple
const PASOS_TUTO = [
  { t: 'Bienvenido al patio. Anda hasta el anillo amarillo.', pc: 'Anda con WASD o las flechas.', movil: 'Anda con la palanca de la izquierda.', donde: () => [121, 0], hecho: J => lejos(J.x, J.z, 121, 0) < 1.6 },
  { t: 'Ahora corre hasta el siguiente anillo. Correr gasta AGUANTE (la barra azul) y hace ruido, y corriendo no se puede disparar.', pcT: () => trf('Mantén %1 mientras andas.', nombreTecla(teclasDe('correr')[0])), movil: 'Lleva el dedo de la palanca bien lejos, más allá del aro: el aro se pone dorado.', donde: () => [133, -1], hecho: J => { if (J.corre) TUTO.corrio = true; return TUTO.corrio && lejos(J.x, J.z, 133, -1) < 1.6; } },
  { t: 'Esa caja militar tiene cosas. Regístrala: ponte al lado y espera a que se abra.', pc: 'Mantén E.', movil: () => (modoAuto() ? 'Toca el botón grande: junto a una caja se convierte en REGISTRAR.' : 'Toca REGISTRAR.'), donde: () => [126, -3.6], hecho: () => TUTO.caja.abierto },
  { t: 'Tu mochila es un Tetris: cada cosa tiene su forma. Arrastra cada objeto a tu mochila. Si algo no cabe, gíralo.', pc: 'Arrastra con el ratón. Para girar: R, o haz doble clic.', movil: 'Arrastra con el dedo. Para girar: toca dos veces, o el botón GIRAR mientras arrastras.', donde: () => [126, -3.6], hecho: () => TUTO.caja.cosas && !TUTO.caja.cosas.length },
  { t: 'Ahí viene un becario de prácticas. Casi no pega: dispárale hasta que caiga.', pc: 'Apunta con el ratón y haz clic (la pistola dispara una vez por clic).', movil: () => (modoAuto() ? 'Mantén el botón DISPARAR: apunta solo.' : 'Lleva la palanca derecha hacia él, hasta el borde.'), donde: () => (TUTO.becario ? [TUTO.becario.x, TUTO.becario.z] : null), empieza: () => { cierraTodas(); TUTO.becario = creaEnemigo('practicas', 140, 4); TUTO.becario.estado = 'busca'; TUTO.becario.obj = { x: JUG.x, z: JUG.z }; TUTO.becario.alerta = 0.9; }, hecho: () => TUTO.becario && !TUTO.becario.vivo },
  { t: 'Algunos cuerpos esconden algo. Registra al becario y toca ALGO ABULTA… REBUSCAR. Luego frota encima de lo que brilla, adelante y atrás.', pc: 'Frota arrastrando el ratón.', movil: 'Frota con el dedo.', donde: () => (TUTO.becario ? [TUTO.becario.x, TUTO.becario.z] : null), hecho: () => MAPA.contenedores.some(c => c.tipo === 'cadaver' && c.escondite && c.escondite.hecho) },
  { t: 'Ese becario está de espaldas y no te ha visto. Agáchate, acércate por detrás y despídelo de un golpe, sin hacer ruido. Hace falta un abrecartas: te hemos dejado uno en el bolsillo 2 (se mella con cada despido).', pcT: () => trf('%1 para agacharte y %2 para despedir.', nombreTecla(teclasDe('agacha')[0]), nombreTecla(teclasDe('despide')[0])), movil: 'Toca AGACHARSE, acércate por detrás y toca DESPEDIR.', donde: () => (TUTO.despistado && TUTO.despistado.vivo ? [TUTO.despistado.x, TUTO.despistado.z - 1.6] : null), empieza: () => { cierraTodas(); const e = creaEnemigo('practicas', 128, 9); e.a = 0; e.mod.grupo.rotation.y = 0; e.quieto = true; TUTO.despistado = e; }, hecho: () => TUTO.despistado && !TUTO.despistado.vivo },
  { t: 'Te ha rozado y estás sangrando: la vida baja sola. Ponte una venda.', pc: 'Pulsa 1 (la venda está en el primer bolsillo).', movil: 'Toca el bolsillo 1, el de la venda.', empieza: () => { cierraTodas(); JUG.sangra = true; JUG.vida = Math.min(JUG.vida, 70); if (!cuantos(RAID.bolsillos, 'venda')) RAID.bolsillos[0] = { id: 'venda', n: 1 }; }, hecho: J => !J.sangra },
  { t: 'Hace mucho frío. Mira la barra de FRÍO: si llega al final, pierdes vida. Métete en el círculo naranja del bidón con fuego y frótate las manos.', pcT: () => trf('Pulsa %1 muchas veces seguidas.', nombreTecla(teclasDe('accion')[0])), movil: 'Toca FROTAR MANOS muchas veces seguidas.', donde: () => [140, -4.4], empieza: () => { JUG.frio = Math.max(JUG.frio, 75); }, hecho: J => J.frio < 25 },
  { t: 'Con las manos calientes, abre la caja fuerte. Toca cuando la aguja pase por la zona dorada. Si fallas, haces ruido; con frío, te tiemblan las manos.', pcT: () => trf('%1 para tocar.', nombreTecla(teclasDe('accion')[0])), movil: 'Toca ¡AHORA! o la cerradura.', donde: () => [144, 7.4], hecho: () => TUTO.fuerte.abierto },
  { t: 'Ya sabes lo básico. Sal por la puerta del refugio: quédate dentro unos segundos. En el Distrito habrá que salir antes de la ventisca.', pc: '', movil: '', donde: () => [TUTO_SALIDA.x, TUTO_SALIDA.z], hecho: () => false },
];

function empiezaTutorial() {
  const cf = document.getElementById('scr-confirm'); if (cf) cf.hidden = true;
  // un equipo prestado: lo tuyo se queda en el refugio, sin tocar
  RAID.tuto = true;
  RAID.eq = { arma1: { id: 'pistola', n: 1, mods: {}, bal: 8 }, arma2: null, chaleco: null, casco: null, mochila: { id: 'mochila-p', n: 1 } };
  RAID.mochila = [{ id: 'm9', n: 24 }]; RAID.bolsillos = [{ id: 'venda', n: 1 }, { id: 'abrecartas', n: 1, dur: 4 }, null]; RAID.rinonera = [];
  colocaTodo(RAID.mochila, casillasMochila(RAID.eq));
  RAID.dur = 99999; RAID.t = 0; RAID.ventisca = 0; RAID.dano = 0; RAID.deDonde = null; RAID.registro = null; RAID.salida = null; RAID.abierto = null;
  RAID.cuentas = { bajas: 0, carroneros: 0, auditor: 0, lag: 0 }; RAID.valorEntrada = 0; RAID.salidas = { patio: true };
  MAPA.contenedores = MAPA.contenedores.filter(c => c.tipo !== 'cadaver');
  TUTO.caja.abierto = false; TUTO.caja.cosas = null; TUTO.caja.dim = null;
  TUTO.fuerte.abierto = false; TUTO.fuerte.cosas = null; TUTO.fuerte.dim = null; TUTO.fuerte.cerradura = true;
  limpiaEnemigos(); limpiaBalas(); quitaJugador();
  ALCANCE.set = null;   // en el patio no hay huecos cerrados: sin mapa de alcance
  creaJugador(112, 0, Math.PI / 2);
  el('titulo').hidden = true; el('refugio').hidden = true;
  RAID.activa = true; MOTOR.escena.fog.near = 50; MOTOR.escena.fog.far = 95;
  muestraHud(true); musica('olvidados'); document.body.classList.add('en-tuto');
  TUTO.paso = -1; TUTO.corrio = false; TUTO.despistado = null; siguientePaso();
}
function siguientePaso() {
  TUTO.paso++; const P = PASOS_TUTO[TUTO.paso]; if (!P) return;
  if (P.empieza) P.empieza();
  // el texto de ayuda: en español (se traduce aquí) o ya traducido (pcT/movilT, cuando lleva la tecla que hayas elegido)
  const lado = ENT.tactil ? 'movil' : 'pc', ya = P[lado + 'T'], cr = P[lado];
  const extra = ya ? ya() : tr((typeof cr === 'function' ? cr() : cr) || '');
  el('h-tuto').innerHTML = '<span>' + esc(trf('PASO %1 DE %2', TUTO.paso + 1, PASOS_TUTO.length)) + '</span><b>' + esc(tr(P.t)) + '</b>' + (extra ? '<em>' + esc(extra) + '</em>' : '');
  el('h-tuto').hidden = false; if (TUTO.paso) play('levelup');
}
function avanzaTutorial(dt) {
  const J = JUG, P = PASOS_TUTO[TUTO.paso]; if (!J || !P) return;
  // en el patio no se muere nadie
  if (J.vida < 15) J.vida = 15;
  const d = P.donde && P.donde();
  TUTO.marca.visible = !!d; if (d) { TUTO.marca.position.x = d[0]; TUTO.marca.position.z = d[1]; TUTO.t += dt; TUTO.marca.scale.setScalar(1 + Math.sin(TUTO.t * 5) * 0.12); }
  if (P.hecho(J)) siguientePaso();
}
function terminaTutorial() {
  RAID.activa = false; RAID.tuto = false; cierraTodas(); vientoCalla(); el('h-tuto').hidden = true; TUTO.marca.visible = false; document.body.classList.remove('en-tuto');
  const primera = !SAVE.visto.tuto; SAVE.visto.tuto = true;
  if (primera) { SAVE.chapas += PREMIO_TUTO.chapas; for (const [id, n] of PREMIO_TUTO.obj) meterAlijo(nuevoObj(id, n)); }
  guardaPartida(); musica('win'); muestraHud(false);
  let h = '<div class="fin bien"><p class="fin-pre">' + esc(tr('¡TUTORIAL SUPERADO!')) + '</p><h2>' + esc(tr('Ya sabes registrar, disparar, curarte y salir. Ahora, al Distrito Microblizz.')) + '</h2>';
  if (primera) h += '<h4>' + esc(tr('EL PREMIO DE BOOMBEAVER')) + '</h4><div class="lista corta"><div class="fila-obj r1">' + imgObj('_chapa') + '<div class="fo-t"><b>' + miles(PREMIO_TUTO.chapas) + ' ' + esc(tr('chapas')) + '</b></div></div>' + PREMIO_TUTO.obj.map(([id, n]) => filaObj(nuevoObj(id, n), '')).join('') + '</div>';
  h += '<p class="nota">' + esc(tr('Consejo: empieza en dificultad Becario (Opciones). Cuando te sientas fuerte, pásate a Normal.')) + '</p>';
  h += '<button type="button" class="btn-grande" id="fin-ok">' + esc(tr('VOLVER AL REFUGIO')) + '</button></div>';
  const v = abreVentana('v-fin', h);
  el('fin-ok').onclick = () => { play('select'); v.hidden = true; quitaJugador(); limpiaEnemigos(); limpiaBalas(); abreRefugio('incursion'); };
}
