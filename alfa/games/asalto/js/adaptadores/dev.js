// Fans of Asalto · ADAPTADORES · Las utilidades del panel DEV (core/js/sistema/desarrollo.js las enseña detrás de «Este juego», solo en
// el modo desarrollo y en la alfa): probar lo de los legendarios (tarea #109) sin tener que subir a un héroe al nivel 12. Llaman a los
// casos de uso de prueba (devLegendario, devSer) sobre la partida en curso; la pantalla enseña después sus avisos como en el juego.
'use strict';
const UTILIDADES_JUEGO = [{ titulo: 'Fans of Asalto: legendarios', pinta(caja) {
  const estado = Object.assign(document.createElement('p'), { style: 'margin:4px 0;color:#ffe14a' });
  const fila = document.createElement('div');
  fila.className = 'fila';
  caja.append(estado, fila);
  // los sitios del campo con un héroe, en orden
  const enCampo = () => AS.equipo.enCampo(AS.casos.partida.equipo).map(x => ({ donde: 'campo', i: x.i }));
  const dice = (r, bien) => { estado.textContent = r.ok ? bien : 'No se puede: ' + r.error; };
  const boton = (txt, hace) => fila.append(Object.assign(document.createElement('button'), { textContent: txt, onclick: () => {
    if (!AS.casos.partida) { estado.textContent = 'Empieza antes una partida'; return; }
    hace(enCampo());
  } }));
  boton('Hacer legendario', sitios => {
    if (!sitios.length) { estado.textContent = 'Pon antes un héroe en el campo'; return; }
    const r = AS.casos.devLegendario(sitios[0]);
    dice(r, 'Hecho: cierra el panel para verlo nacer');
    // la partida rehecha ya lo trae legendario y no avisa: el aviso se da aquí, para ver su pantalla como en el juego
    const h = r.ok && AS.equipo.leer(AS.casos.partida.equipo, sitios[0]);
    if (h) AS.ventanas.leyendas.avisa(AS.pantalla.E, { tipo: 'legendario', id: h.id, sitio: sitios[0], clave: AS.legendario.clave(h) });
  });
  boton('Ser secreto conejo+vaca', sitios => {
    if (sitios.length < 2) { estado.textContent = 'Hacen falta dos héroes en el campo'; return; }
    dice(AS.casos.devSer(sitios[1], sitios[0], ['heroe-bunny', 'heroe-mechavaca']), 'Hecho: cierra el panel para verlo nacer');
  });
  boton('Poder Dormido al máximo', () => {
    AS.casos.regalaPlumas(2000);
    while (AS.casos.dormidoSiguiente()) AS.casos.abreDormido();
    estado.textContent = 'Despertares I, II y III abiertos (valen para las partidas nuevas)';
  });
} }];
