// Fans of Basement · Guardado (adaptador): el progreso (monedas, mejoras, récord) y los ajustes de sonido, en localStorage con la
// clave SAVE_KEY (de js/ajustes.js). Al guardar avisa a la cuenta para que suba la partida a la nube. Si el navegador no deja
// guardar, se juega igual con lo de fábrica. La validación de lo leído está en el dominio (progreso.js: progresoDesde).
'use strict';
const SAVE = { musica: 1, efectos: 1, progreso: null, tuto: {}, retos: null };

function basCarga() {
  let d = {};
  try { d = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}') || {}; } catch (e) { console.warn('Basement: no se lee lo guardado', e); }
  SAVE.musica = d.musica === 0 ? 0 : 1;
  SAVE.efectos = d.efectos === 0 ? 0 : 1;
  SAVE.progreso = BAS.progresoDesde(BAS.AJ, d.progreso);
  SAVE.tuto = d.tuto && typeof d.tuto === 'object' ? { ...d.tuto } : {};   // lo que Lola ya te ha contado (js/tutorial.js)
  SAVE.retos = d.retos && typeof d.retos === 'object' ? d.retos : null;   // misiones y logros (RETOSL, js/retos.js)
}

function basGuarda() {
  const datos = { musica: SAVE.musica, efectos: SAVE.efectos, progreso: BAS.progresoAGuardar(SAVE.progreso), tuto: SAVE.tuto, retos: SAVE.retos };
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(datos)); } catch (e) { console.warn('Basement: no se guarda', e); }
  if (typeof CUENTA !== 'undefined' && CUENTA.cambio) try { CUENTA.cambio(); } catch (e) { console.warn('Basement: sin cuenta', e); }
}
