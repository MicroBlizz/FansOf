// Fans of Pop · RAID, los botones del panel DEV (tarea 448, nodo n4; solo alfa y localhost): «Raid de prueba» rehace en el servidor la raid
// pequeña de pruebas (48x48 burbujas, depósito de 200 toques y jefe de 100; pide rol alfa) y la abre, y «Ver la raid de la semana» abre la de
// verdad. Se apuntan en UTILIDADES_JUEGO (js/dev.js), que el panel DEV de core pinta detrás de «Este juego».
'use strict';
UTILIDADES_JUEGO.push({ titulo: 'Fans of Pop: raid entre todos', pinta(caja) {
  const estado = Object.assign(document.createElement('p'), { textContent: 'Ábrela desde la portada o desde el camino. La de prueba se rehace cada vez (48x48 burbujas, 200 toques, jefe de 100).', style: 'margin:4px 0;color:#cdb9ea' });
  const fila = document.createElement('div'); fila.className = 'fila';
  const boton = (txt, f) => fila.append(Object.assign(document.createElement('button'), { textContent: txt, onclick: async () => {
    estado.textContent = 'Abriendo…';
    const aviso = await f();
    estado.textContent = aviso || 'Abierta: cierra este panel para verla.';
  } }));
  boton('Raid de prueba', () => PP_RAID_PANTALLA.prueba());
  boton('Ver la raid de la semana', () => PP_RAID_PANTALLA.abre(null));
  caja.append(estado, fila);
} });
