// Fans of Recruit · EL MENÚ DE OPCIONES: se abre desde el título o desde la pausa. Sonido, música, pantalla completa,
// instalar el juego como app (y jugar sin conexión) y borrar el récord. Instalar y la pantalla completa se hacen en el
// mismo toque o tecla (los navegadores solo los dejan así).
'use strict';

const OPC = { on: false, hecho: false };
const OPC_Y0 = 62, OPC_ALTO = 19;
function opcLista() {
  return [
    ['sonido', tr('SONIDO') + ': ' + siNo(!AJUSTES.mudo)],
    ['musica', tr('MÚSICA') + ': ' + siNo(!AJUSTES.sinMusica)],
    ['teclas', tr('CONTROLES DEL TECLADO')],
    ['completa', tr('PANTALLA COMPLETA') + ': ' + siNo(!!document.fullscreenElement)],
    ['instalar', INSTALAR.yaInstalada() ? tr('YA ESTÁ INSTALADO') : tr('INSTALAR EN EL MÓVIL')],
    ['record', tr('BORRAR RÉCORD')],
    ['volver', tr('VOLVER')],
  ];
}
function abreOpciones() { OPC.on = true; MENU.sel = 0; play('select'); }
function avisa(s) { AVISO.s = s; AVISO.t = 600; }
function opcHaz(q) {
  if (q === 'sonido') cambiaSonido();
  else if (q === 'musica') cambiaMusica();
  else if (q === 'teclas') abreTeclas();
  else if (q === 'completa') {
    try { if (document.fullscreenElement) document.exitFullscreen(); else { const p = document.documentElement.requestFullscreen({ navigationUI: 'hide' }); if (p && p.catch) p.catch(() => avisa('ESTE NAVEGADOR NO DEJA PONER LA PANTALLA COMPLETA.')); } }
    catch (_) { avisa('ESTE NAVEGADOR NO DEJA PONER LA PANTALLA COMPLETA.'); }
  } else if (q === 'instalar') { const s = INSTALAR.instala(); if (s) avisa(s); }
  else if (q === 'record') { AJUSTES.record = 0; guardaAjustes(); avisa('RÉCORD BORRADO. COMO SI NUNCA HUBIERAS TRABAJADO AQUÍ.'); }
  else if (q === 'volver') { OPC.on = false; MENU.sel = 0; }
}
// en el mismo toque o tecla: lo que el navegador solo deja hacer así (sin coordenadas = la tecla, sobre la opción elegida)
function opcionAlToque(x, y) {
  if (!OPC.on || AVISO.t || TUI.on) return;
  const L = opcLista();
  let k = MENU.sel;
  if (x !== undefined) { k = Math.floor((y - OPC_Y0 + 6) / OPC_ALTO); if (k < 0 || k >= L.length || Math.abs(x - J.W / 2) >= 110) return; }
  const q = L[k][0];
  if (q === 'instalar' || q === 'completa') { MENU.sel = k; OPC.hecho = true; play('select'); opcHaz(q); }
}
// un paso del menú; devuelve true si el menú (o su cartel) está abierto
function pasoOpciones() {
  if (OPC.hecho) { OPC.hecho = false; return true; }   // ese toque ya se usó (instalar o pantalla completa)
  if (pasoAviso()) return true;
  if (!OPC.on) return false;
  if (TUI.on) { pasoTeclas(); return true; }
  if (MANDO.p.pausa) { OPC.on = false; MENU.sel = 0; return true; }
  const L = opcLista(), k = pasoMenu(L.length, OPC_Y0, OPC_ALTO);
  if (k >= 0) opcHaz(L[k][0]);
  return true;
}
function pintaOpciones(g) {
  if (TUI.on) { pintaTeclas(g); return; }
  velo(g, 0.93);
  escribe(g, tr('OPCIONES'), J.W / 2, 24, { alin: 'centro', esc: 3, c: ORO_ROTULO });
  pintaMenu(g, opcLista().map(o => o[1]), OPC_Y0, OPC_ALTO);
  pintaAviso2(g);
}
