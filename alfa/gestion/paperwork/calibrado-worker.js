// Fans Of · /gestion → Paperwork → Calibrado: el WORKER que juega las partidas del calibrado sin congelar la página (ADR 122). Carga las
// reglas del juego (sin pantalla) y el calibrado de web/games/paperwork/js/calibrado/, y contesta a dos pedidos: 'cifras' (las cifras de
// PW.AJ que se pueden cambiar y los perfiles) y 'compara' (juega antes y después y devuelve resúmenes, series medianas y fórmulas).
'use strict';
// los archivos del juego sin pantalla, en el orden de su index.html (lo comprueba tests/gestion/calibrado-paperwork.test.mjs)
const ARCHIVOS = ['pw', 'ajustes', 'datos',
  'dominio/curvas', 'dominio/desbloqueos', 'dominio/hitos', 'dominio/mejoras', 'dominio/bonos', 'dominio/planta', 'dominio/partida', 'dominio/rebuscar', 'dominio/sellos', 'dominio/equipo', 'dominio/encargos', 'dominio/cartas', 'dominio/compras',
  'dominio/trituradora', 'dominio/despido', 'dominio/meritos', 'dominio/expediente', 'dominio/tienda', 'dominio/extras',
  'aplicacion/motor', 'aplicacion/casos', 'aplicacion/anuncio-correo',
  'calibrado/puertos', 'calibrado/jugador', 'calibrado/formulas', 'calibrado/ajusta'];
const VERSION = new URL(self.location.href).searchParams.get('v') || '';
importScripts(...ARCHIVOS.map(f => `../../games/paperwork/js/${f}.js?v=${VERSION}`));

// los campos de la serie que se dibujan
const CAMPOS = ['trituradora', 'plantaMax', 'meritos', 'paquetes', 'grapas', 'despidos'];

function cifras() {
  const A = PW.calibrado.ajusta, P = PW.calibrado.jugador.PERFILES;
  return { version: PW.AJ.version, cifras: A.rutas().map(r => [r, A.lee(r)]), perfiles: Object.keys(P).map(id => [id, P[id].nombre]) };
}
function compara({ cambios, perfil, horas, semillas }) {
  const A = PW.calibrado.ajusta, total = semillas.length * 2;
  let hechas = 0;
  const r = A.compara({ cambios, perfil, horas, semillas, progreso: () => postMessage({ progreso: ++hechas / total }) });
  if (!r.ok) return { error: r.error, datos: r.datos };
  const lado = l => ({ resumen: l.resumen, series: Object.fromEntries(CAMPOS.map(c => [c, A.serieMediana(l.partidas, c)])) });
  const nivel = Math.max(1, r.valor.cambiado.resumen.fin.trituradora);
  const formulas = A.formulas(cambios, perfil, nivel).valor;
  return { base: lado(r.valor.base), cambiado: lado(r.valor.cambiado), formulas, nivel, texto: A.texto(cambios) };
}
const PEDIDOS = { cifras, compara };
self.onmessage = ev => {
  const { pide, datos } = ev.data || {};
  postMessage(PEDIDOS[pide] ? { pide, respuesta: PEDIDOS[pide](datos || {}) } : { pide, respuesta: { error: 'pedido-desconocido' } });
};
