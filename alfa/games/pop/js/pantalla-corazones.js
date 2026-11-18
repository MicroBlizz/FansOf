// Fans of Pop · CORAZONES ENTRE AMIGOS, pantallas (composición; tarea #96, ADR 150): junta las reglas (js/corazones-buzon.js), los casos de uso
// con el servidor (js/corazones-servidor.js) y la partida de este móvil. De aquí cuelgan:
// · ppCorazonesActivo(): el flag 'corazones-amigos' de Pop. Cerrado, no hay botón PEDIR A AMIGOS ni se habla con el servidor.
// · PP_CORAZON_SRV: los casos de uso ya montados con la cuenta de core.
// · ppBotonPedirCorazones(t): añade a la ventana t el botón PEDIR A AMIGOS (solo con el flag abierto) y pide ya el enlace (PP_PEDIR), para que
//   el toque comparta sin esperar; si no se puede compartir ni copiar, el enlace sale en la ventana.
// · ppPedirCorazones(): la ventanita de pedir; ppBotonesPedirMapa(...) pone sus zonas de toque sobre los corazones del mapa.
// · ppCorazonAviso(motivo): el texto amable de cada motivo. Abrir el enlace: js/pantalla-corazones-enlace.js; el buzón: js/pantalla-buzon.js.
'use strict';
const ppCorazonesActivo = () => NUCLEO.flag('corazones-amigos', 'Pop: pedir y regalar corazones entre amigos (tarea #96, ADR 150)', false);
const PP_CORAZON_SRV = PP_CORAZONES.crea({
  cuenta: typeof CUENTA !== 'undefined' ? CUENTA : null, activo: ppCorazonesActivo,
  enLinea: () => navigator.onLine !== false, reglas: PP_CORAZONES_REGLAS,
});
// el aviso amable de cada motivo: una tabla de funciones con tr('texto literal'), para que el control de idioma vea cada frase
const PP_CORAZON_AVISO = {
  sin_red: () => tr('Sin conexión: prueba otra vez en un rato'), sin_sesion: () => tr('Para pedir corazones hace falta tu cuenta'),
  cerrado: () => tr('Los corazones entre amigos no están disponibles ahora'), servidor: () => tr('No se ha podido. Prueba otra vez.'),
  ya_hoy: () => tr('Ya le regalaste uno hoy. ¡Mañana puedes otra vez!'), tope: () => tr('Hoy ya le han regalado 5 corazones. ¡Prueba mañana!'),
  propio: () => tr('Este es tu enlace: pásaselo a tus amigos para que te regalen corazones.'), no_existe: () => tr('Este enlace no vale.'),
};
const ppCorazonAviso = motivo => (PP_CORAZON_AVISO[motivo] || PP_CORAZON_AVISO.servidor)();
// el enlace propio, pedido por adelantado al abrir una ventana con PEDIR A AMIGOS: así el toque comparte sin esperar al servidor
// (Safari solo deja compartir o copiar en el mismo toque, antes de cualquier await). Se guarda con su cuenta: otra cuenta, otro enlace.
const PP_PEDIR = { url: null, usuario: null, va: null };
const ppPedirUsuario = () => (typeof CUENTA !== 'undefined' ? CUENTA.usuario : null);
const ppPedirUrl = () => (PP_PEDIR.url && PP_PEDIR.usuario === ppPedirUsuario() ? PP_PEDIR.url : null);
// pide el enlace una vez (las demás esperan a la misma petición); devuelve lo que contesta el servidor, nunca falla
function ppPedirPrepara() {
  if (!PP_PEDIR.va) {
    PP_PEDIR.va = PP_CORAZON_SRV.miEnlace(location.origin + location.pathname).then(r => {
      if (r.ok) { PP_PEDIR.url = r.url; PP_PEDIR.usuario = ppPedirUsuario(); }
      return r;
    }).finally(() => { PP_PEDIR.va = null; });
  }
  return PP_PEDIR.va;
}
const ppPedirTexto = () => tr('¡Me he quedado sin corazones en Fans of Pop! ¿Me regalas uno?');
// si no se puede compartir ni copiar, el enlace sale en la ventana, justo debajo del botón y seleccionado, para copiarlo a mano
function ppPedirMuestra(boton, url) {
  let campo = boton.nextElementSibling;
  if (!campo || !campo.classList.contains('pp-cz-enlace')) {
    campo = document.createElement('input'); campo.className = 'pp-cz-enlace'; campo.readOnly = true; boton.insertAdjacentElement('afterend', campo);
  }
  campo.value = url; campo.focus(); campo.select();
}
function ppPedirCopia(boton, url) {
  if (!navigator.clipboard || !navigator.clipboard.writeText) { ppPedirMuestra(boton, url); return; }
  navigator.clipboard.writeText(ppPedirTexto() + ' ' + url).then(() => ppFlota(tr('¡Enlace copiado!'), 270, 300, '#4fc964'), () => ppPedirMuestra(boton, url));
}
// comparte en el mismo toque: el menú del móvil; si no hay o falla (salvo que se cancele), copiado; si tampoco, a la vista
function ppPedirComparte(boton, url) {
  if (!navigator.share) { ppPedirCopia(boton, url); return; }
  navigator.share({ title: 'Fans of Pop', text: ppPedirTexto(), url }).catch(e => { if (!e || e.name !== 'AbortError') ppPedirCopia(boton, url); });
}
// el toque de PEDIR A AMIGOS: con el enlace ya en memoria se comparte al momento; si aún no estaba, este toque lo pide, lo enseña
// y deja el botón en COMPARTIR para un segundo toque (ese ya va sin esperar)
function ppPideAAmigos(boton) {
  const url = ppPedirUrl();
  if (url) { ppPedirComparte(boton, url); return; }
  boton.disabled = true;
  ppPedirPrepara().then(r => {
    boton.disabled = false;
    if (!r.ok) { ppFlota(ppCorazonAviso(r.motivo), 270, 300, '#ff8a2a'); return; }
    boton.textContent = tr('COMPARTIR');
    ppPedirMuestra(boton, r.url);
  });
}
function ppBotonPedirCorazones(t) {
  if (!ppCorazonesActivo()) return;
  ppPedirPrepara();   // por adelantado: al tocar ya estará
  const b = ppBoton(tr('PEDIR A AMIGOS'), 'pp-btn2 pp-verde', () => ppPideAAmigos(b));
  t.appendChild(b);
}
// en el mapa, con algún corazón gastado y el flag abierto: un botón pequeño sobre cada corazón de la fila (x0, x0 + paso…, a la altura y),
// del tamaño del corazón, para no tapar las burbujas de nivel ni las estrellas de al lado
function ppBotonesPedirMapa(vidas, x0, paso, y) {
  if (vidas >= PP_CFG.vida || !ppCorazonesActivo()) return;
  for (let i = 0; i < PP_CFG.vida; i++) PP_BOTONES_MAPA.push({ x: x0 + i * paso, y, r: paso / 2 + 1, f: ppPedirCorazones });
}
function ppPedirCorazones() {
  const t = ppAbre(`<h2>${tr('Pide corazones')}</h2><div class="pp-cofre">${ppIcono('i-vida', 84, '#ff4a6a')}</div><p class="pp-sub">${tr('Pásale tu enlace a un amigo y te regalará un corazón.')}</p>`);
  ppBotonPedirCorazones(t);
  ppBotonBuzon(t);   // con regalos esperando (js/pantalla-buzon.js)
  t.appendChild(ppBoton(tr('VOLVER'), 'pp-btn2 pp-azul', ppCierra));
}
