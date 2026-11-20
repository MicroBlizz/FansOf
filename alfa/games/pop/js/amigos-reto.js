// Fans of Pop · RETAR A UN AMIGO y RETOS RECIBIDOS (tarea #145, ADR 189), sobre los duelos contra gente de js/pvp.js:
// · ppAmigosRetar(codigo, nombre): desde la hoja de un amigo. Abre una sala (ppPvpAbreSala), le avisa por el servidor (PP_AMIGOS_SRV.retar) y espera
//   con el código y COMPARTIR ENLACE por si el aviso no le llega. Si el aviso falla, la sala sigue abierta y se dice por qué.
// · ppAmigosRetos(lista): los retos que trae el latido (una sola vez cada uno). En la portada o el camino sin ventana abierta sale «¡X te reta!»
//   con ACEPTAR (entra en su sala) y AHORA NO; si no, esperan en la cola (js/amigos-reto-cola.js, 5 minutos) y salen al volver. Uno a la vez.
// · ppAmigosConocido(s): al empezar un duelo contra gente, apunta a los de la sala como sugeridos (amigos_conocido, con el id numérico de la sala).
// Todo va tras el flag de amigos (ppAmigosActivo): cerrado, no se enseña ni se llama al servidor.
'use strict';
const PP_AMR = { cola: PP_AMIGOS_RETO_COLA.vacia(), mira: null, conocida: null };
const PP_AMR_MIRA_MS = 1500;
/* ---------- retar ---------- */
function ppAmigosRetar(codigo, nombre) {
  ppPvpAbreSala(s => {
    const t = ppAbre(`<h2>${tr('Reta a un amigo')}</h2><p class="pp-sub" id="pp-amr-quien"></p><p class="pp-codigo">${s.codigo}</p>
      <p class="pp-sub" id="pp-pvp-estado">${tr('Esperando a que entre')}</p>`);
    $pp('#pp-amr-quien').textContent = tr('Retando a {nombre}…', { nombre });
    t.appendChild(ppBoton(tr('COMPARTIR ENLACE'), 'pp-btn', () => ppPvpComparte(s)));
    t.appendChild(ppBoton(tr('CANCELAR'), 'pp-btn2 pp-azul', ppAmRetoCancela));
    PP_AMIGOS_SRV.retar(codigo, s.codigo).then(r => {
      const el = $pp('#pp-pvp-estado');
      if (!r.ok && el && PP_PVP.sala === s) el.textContent = AMIGOS.motivoTexto(r.motivo) + ' ' + tr('Pásale el enlace tú.');
    });
  });
}
function ppAmRetoCancela() {
  ppPvpLimpia();
  if (typeof ppVentanaAmigos === 'function') ppVentanaAmigos(); else ppCierra();
}
/* ---------- recibir ---------- */
const ppAmRetoAhora = () => ppAmigosActivo() && (PP_PANT.actual === 'titulo' || PP_PANT.actual === 'mapa') && $pp('#pp-modal').hidden;
function ppAmigosRetos(lista) {
  if (!ppAmigosActivo() || !Array.isArray(lista) || !lista.length) return;
  PP_AMR.cola = PP_AMIGOS_RETO_COLA.anade(PP_AMR.cola, lista, Date.now());
  ppAmRetoMira();
}
// enseña el siguiente si se puede; si no, vuelve a mirar en un rato mientras haya alguno en la cola
function ppAmRetoMira() {
  clearTimeout(PP_AMR.mira); PP_AMR.mira = null;
  const { reto, resto } = PP_AMIGOS_RETO_COLA.siguiente(PP_AMR.cola, Date.now());
  if (!reto) { PP_AMR.cola = resto; return; }
  if (ppAmRetoAhora()) { PP_AMR.cola = resto; ppAmRetoVentana(reto); return; }
  PP_AMR.mira = setTimeout(ppAmRetoMira, PP_AMR_MIRA_MS);
}
function ppAmRetoVentana(r) {
  const t = ppAbre(`<h2 id="pp-amr-titulo"></h2><p class="pp-sub">${tr('Entra en su sala y empezáis el duelo.')}</p>`);
  $pp('#pp-amr-titulo').textContent = tr('¡{nombre} te reta a un duelo!', { nombre: r.nombre });
  t.appendChild(ppBoton(tr('ACEPTAR'), 'pp-btn', () => { ppCierra(); ppPvpEntraCodigo(r.sala); }));
  t.appendChild(ppBoton(tr('AHORA NO'), 'pp-btn2 pp-azul', () => { ppCierra(); ppAmRetoMira(); }));
}
/* ---------- sugeridos tras el duelo ---------- */
// una sola vez por sala; el servidor apunta a los demás de la sala como sugeridos (nunca lanza)
function ppAmigosConocido(s) {
  if (!ppAmigosActivo() || !s || !Number.isSafeInteger(s.sala) || PP_AMR.conocida === s.sala) return;
  PP_AMR.conocida = s.sala;
  PP_AMIGOS_SRV.conocido(s.sala);
}
