// Fans of Karts · PvP, LAS PANTALLAS DE LIENZO: elegir piloto (con VOLVER, RANKING, AMIGOS y BUSCAR), cómo funciona, la clasificación y lo que añade el PvP
// a los resultados. La sala de espera y la de amigos van en HTML (pvp-sala.js).
'use strict';

// elegir piloto para la carrera por internet (la de siempre, con otro título y otro botón)
function pantallaPvp() {
  if (!KPVP.pendChecked && !KRED.esLocal() && KRED.vinculada()) { KPVP.pendChecked = true; Promise.resolve(KRED.red.pendientes()).then(l => { if (Array.isArray(l) && l.length) KPVP.aviso = trf('Abandonaste una carrera: %1 puntos', l.reduce((a, p) => a + (p.delta || 0), 0)); }).catch(() => { /* ya saldrá */ }); }
  paseo(18, 34); velo(0.6);
  if (KPVP.verInfo) { pvpInfoVentana(); return; }
  if (UI.tecla === 'izq' || UI.tecla === 'der') { PANT.piloto = (PANT.piloto + (UI.tecla === 'der' ? 1 : 5)) % 6; play('tick'); UI.tecla = null; }
  if (UI.tecla === 'arr' || UI.tecla === 'aba') UI.tecla = null;
  escribeB(lx, tr('PVP: HASTA 8 JUGADORES'), PW / 2, 5, '#ff5c8a', '#1c1028', 'centro');
  JUGABLES.forEach((p, i) => {
    const x = 4 + i * 39, sel = i === PANT.piloto;
    marco(x, 17, 37, 40, sel ? '#4a2f72' : '#2a1840', '#1c1028', sel ? '#ffcb3d' : '#5b3a86');
    figuraDe(p.id).pinta(lx, x + 18, 47, BASE_KART * 0.6, BASE_KART, sel ? RELOJ * 1.6 : Math.PI);
    PANT.acciones.push(() => { PANT.piloto = i; }); PANT.rects.push(x, 17, 37, 40);
  });
  const p = JUGABLES[PANT.piloto];
  marco(4, 60, 232, 80);
  figuraDe(p.id).pinta(lx, 44, 124, BASE_KART, BASE_KART, RELOJ * 1.2);
  escribeB(lx, tr(p.nombre), 84, 65, p.color, '#1c1028', 'izq', 2);
  mini(lx, tr(p.faccion) + ' · ' + tr(p.kart), 84, 82, '#bdb6d6');
  if (KPVP.error) escribeLineas(lx, tr(KPVP.error), 84, 91, 148, '#ff5c8a', null, 'izq', 9);
  else if (KPVP.aviso) escribeLineas(lx, tr(KPVP.aviso), 84, 91, 148, '#ffe9a8', null, 'izq', 9);
  else escribeLineas(lx, tr('¡Hasta 7 rivales y un nerfeo con tu nombre!'), 84, 91, 148, '#ffe9a8', null, 'izq', 9);
  [['VEL', p.vel, '#ff8a1f'], ['ACE', p.ace, '#5ef27a'], ['MAN', p.man, '#22e3ff'], ['PESO', p.peso, '#ff5c8a']].forEach(([n, v, c], j) => {      // sus números, como al elegir en solitario
    const x = 84 + (j % 2) * 80, y = 111 + Math.floor(j / 2) * 8;
    mini(lx, tr(n), x, y, '#ffffff'); barra(x + 20, y, v, c);
  });
  boton('INFO', 188, 126, 44, () => { KPVP.verInfo = true; }, 13);
  { const rg = rangoDe(SAVE.liga); mini(lx, trf('TUS PUNTOS: %1', SAVE.liga) + ' · ', 84, 129, '#ffffff'); mini(lx, tr(rg.nombre), 84 + anchoMini(trf('TUS PUNTOS: %1', SAVE.liga) + ' · ') + 2, 129, rg.color); }
  if (KRED.esLocal()) mini(lx, tr('PRUEBAS: PESTAÑAS'), 84, 134, '#22e3ff');
  const n0 = PANT.acciones.length;
  boton('VOLVER', 4, 143, 50, () => ve('titulo'));
  boton('RANKING', 57, 143, 56, () => { KPVP.clasif = null; KPVP.tClasif = 0; ve('pvp-clasif'); KRED.red.clasificacion().then(c => { KPVP.clasif = c || { lista: [] }; if (c && c.yo && c.yo.puntos != null) { SAVE.liga = c.yo.puntos; guardaPartida(); } }).catch(e => { KPVP.clasif = { lista: [], error: KRED.errorTexto(e) }; }); });
  boton('AMIGOS', 116, 143, 54, () => { KPVP.error = ''; ve('pvp-amigos'); }, 14, '#22e3ff');
  boton('BUSCAR', 173, 143, 63, () => pvpBuscar(), 14, '#ff5c8a');
  if (PANT.foco < n0) PANT.foco = n0 + 3;
  pvpTemporadaAlEntrar();
  PANT.atras = () => ve('titulo');
}
// cómo funciona el PvP, en una ventana aparte (la pantalla solo lleva la primera frase)
function pvpInfoVentana() {
  velo(0.5); marco(8, 10, 224, 142);
  escribeB(lx, tr('CÓMO FUNCIONA'), PW / 2, 15, '#ff5c8a', '#1c1028', 'centro');
  escribeLineas(lx, tr('Pulsa BUSCAR: el servidor te junta con hasta 7 jugadores. En cuanto sois 2, espera un minuto a que lleguen más.'), 16, 23, 208, '#ffe9a8', null, 'izq', 9);
  escribeLineas(lx, tr('Los huecos libres los ocupa la máquina. La pista se vota en la sala y la salida es al azar. Con AMIGOS, sala privada con código.'), 16, 53, 208, '#ffffff', null, 'izq', 9);
  escribeLineas(lx, tr('Cada puesto entre jugadores da o quita puntos; solo contra la máquina no se suma nada.'), 16, 82, 208, '#ffffff', null, 'izq', 9);
  escribeLineas(lx, tr('Microblizz no se hace responsable de los nerfeos.'), 16, 114, 208, '#ff8fb0', null, 'izq', 9);
  boton('CERRAR', 80, 134, 80, () => { KPVP.verInfo = false; }, 14, '#ff5c8a');
  PANT.atras = () => { KPVP.verInfo = false; };
}
// la clasificación (los 20 primeros y tú)
function pantallaPvpClasif(dt) {
  paseo(18, 34); velo(0.7); marco(4, 4, 232, 152);
  escribeB(lx, tr('CLASIFICACIÓN PVP'), 10, 9, '#ff5c8a', '#1c1028');
  const c = KPVP.clasif;
  KPVP.tClasif += dt;
  if (!c) escribe(lx, tr('Cargando…') + '.'.repeat(Math.floor(KPVP.tClasif * 2) % 3), PW / 2, 70, '#bdb6d6', null, 'centro');
  else if (c.error) escribeLineas(lx, tr(c.error), PW / 2, 60, 200, '#ff5c8a', null, 'centro', 9);
  else if (!c.lista.length) escribeLineas(lx, tr('Todavía no hay nadie. Sé el primero: Microblizz ya ha anunciado tu nerf.'), PW / 2, 60, 200, '#ffe9a8', null, 'centro', 9);
  else {
    const col = (x, y, t, color, al) => mini(lx, t, x, y, color, null, al);
    col(12, 22, tr('PUESTO'), '#bdb6d6'); col(44, 22, tr('JUGADOR'), '#bdb6d6'); col(160, 22, tr('CARRERAS'), '#bdb6d6', 'der'); col(228, 22, tr('PUNTOS'), '#bdb6d6', 'der');
    c.lista.slice(0, 13).forEach((f, i) => {
      const y = 31 + i * 8;
      if (f.yo) { lx.fillStyle = '#4a2f72'; lx.fillRect(8, y - 1, 224, 8); }
      col(12, y, puestoTxt(i + 1), COLOR_PUESTO[Math.min(i, 3)]); col(44, y, String(f.nombre || '').slice(0, 14), f.yo ? '#ffffff' : '#d8d2ea');
      col(160, y, f.ganadas + '/' + f.jugadas, '#bdb6d6', 'der'); col(228, y, String(f.puntos), f.yo ? '#ffe9a8' : '#ffffff', 'der');
    });
    if (c.yo) mini(lx, trf('TÚ: %1 · %2 PUNTOS · %3 CARRERAS', puestoTxt(c.yo.puesto), c.yo.puntos, c.yo.jugadas), 10, 140, '#ffe9a8');
    else mini(lx, tr('Todavía no has corrido ninguna carrera.'), 10, 140, '#bdb6d6');
  }
  boton('VOLVER', 172, 6, 60, () => ve('pvp'), 13);
  PANT.atras = () => ve('pvp');
}
// lo que añade el PvP a la pantalla de resultados: los puntos (dentro del cuadro de la izquierda, bajo los pilotos)
function pvpResultadoExtra() {
  const r = KPVP.resultado, yo = CARRERA.resultado.find(x => x.jugador);
  const txt = !r ? tr('Apuntando el resultado…') : r.copa ? trf('COPA ONLINE: CARRERA %1 DE %2', KPVP.carrera + 1, KPVP.copa ? KPVP.copa.pistas.length : 4) : r.privada ? tr('Sala con amigos: no suma puntos de liga') : r.error ? tr(r.error) : KPVP.jugadores.length < 2 ? tr('Sin otros jugadores: no suma puntos') : r.puntos != null ? trf('PUNTOS PVP: %1', r.puntos) + (r.delta != null ? ' (' + (r.delta >= 0 ? '+' : '') + r.delta + ')' : '') + (r.estado === 'discutida' ? ' · ' + tr('EN REVISIÓN') : '') : '';
  if (txt) mini(lx, txt, 71, 109, yo.puesto === 1 ? '#ffe9a8' : '#bdb6d6', null, 'centro');
}
