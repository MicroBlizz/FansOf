// Fans Of Pets · CUIDADOS: lo que hace cada botón. La entrevista (las respuestas solo se mezclan con un número al azar para sacar la semilla
// de los huevos y se olvidan), elegir huevo, el horario de vida, tocar y abrigar el huevo, y los cuidados del bebé (comer, beber, dormir o
// despertar, bañar), cada uno con su animación, su sonido y una frase. Las cifras, en ajustes.js.
'use strict';
const ptClic = (id, fn) => { const b = $pt('#' + id); if (b) b.onclick = () => { ptSonido(); fn(); }; };
function ptSonido(n = 'select') { if (typeof play === 'function') play(n); }

function ptEngancha() {
  ptClic('pt-empezar', () => { PT_UI.paso = 0; PT_UI.respuestas = []; ptPantalla(); });
  document.querySelectorAll('.pt-respuesta').forEach(b => { b.onclick = () => { ptSonido(); ptResponde(+b.dataset.r); }; });
  ptClic('pt-yahora', ptFinEntrevista);
  ptClic('pt-quedo', () => { if (PT_UI.elegido < 0) return; SAVE.criatura = SAVE.huevos[PT_UI.elegido]; SAVE.fase = 'horario'; ptGuarda(); ptPantalla(); });
  ptClic('pt-horario-listo', ptGuardaHorario);
  ptClic('pt-tocar', () => { PT_UI.wob = 1.2; ptDice(ptFrase('tocar')); });
  ptClic('pt-abrigar', () => { PT_UI.bufanda = true; ptDice(ptFrase('abrigar')); });
  ptClic('pt-comer', () => ptCuida('comer'));
  ptClic('pt-beber', () => ptCuida('beber'));
  ptClic('pt-banar', () => ptCuida('banar'));
  ptClic('pt-dormir', ptDormir);
  ptClic('pt-horario', () => { PT_UI.volverA = SAVE.fase; ptPantalla(); });
  ptClic('pt-sonido', () => { SAVE.muted = !SAVE.muted; ptGuarda(); ptRefresca(); });
}

// la entrevista: cada respuesta se apunta solo en memoria; la del ritmo sí se guarda, porque cambia la partida
function ptResponde(i) {
  const q = PT_ENTREVISTA[PT_UI.paso];
  PT_UI.respuestas.push(i);
  if (q.ritmo) SAVE.ritmo = q.valores[i];
  PT_UI.paso = PT_UI.paso + 1 < PT_ENTREVISTA.length ? PT_UI.paso + 1 : 'fin';
  ptPantalla();
}
function ptFinEntrevista() {
  let azar = Math.floor(Math.random() * 4294967296);
  try { azar = crypto.getRandomValues(new Uint32Array(1))[0]; } catch (e) { /* sin crypto: vale Math.random */ }
  SAVE.semilla = ptHash(PT_UI.respuestas.join('-') + '|' + azar);
  PT_UI.respuestas = [];   // las respuestas no se guardan ni se envían
  SAVE.huevos = ptHuevosDe(SAVE.semilla); SAVE.fase = 'huevos'; PT_UI.elegido = -1;
  ptGuarda(); ptPantalla();
}
function ptEligeHuevo(i) {
  PT_UI.elegido = i; ptSonido('pop');
  const b = $pt('#pt-quedo'); if (b) b.textContent = tr('ME QUEDO ESTE');
  document.querySelectorAll('#pt-elige button').forEach((x, j) => x.setAttribute('aria-pressed', String(j === i)));
}

function ptGuardaHorario() {
  const d = +$pt('#pt-despierta').value, a = +$pt('#pt-acuesta').value, H = PETS.horario;
  const despierta = (a - d + 1440) % 1440, err = $pt('#pt-horario-error');
  if (despierta < H.minDespierta || 1440 - despierta < H.minDuerme) {
    err.hidden = false; err.textContent = tr('Tiene que estar despierta al menos {d} h y dormir al menos {n} h.', { d: H.minDespierta / 60, n: H.minDuerme / 60 });
    ptSonido('deny'); return;
  }
  if (SAVE.fase === 'bebe') ptSimula();   // lo pasado hasta ahora cuenta con el horario de antes
  SAVE.horario = { despierta: d, acuesta: a };
  if (SAVE.fase === 'horario') { SAVE.fase = 'huevo'; SAVE.huevoDesde = ptAhora(); PT_UI.bocadillo = ''; }
  PT_UI.volverA = ''; ptGuarda(); ptPantalla();
}

// los cuidados del bebé
function ptAnima(tipo) { PT_UI.anim = tipo; PT_UI.at = performance.now() / 1000; }
function ptCuida(tipo) {
  if (SAVE.dormida) { ptDice(ptFrase('durmiendo')); ptSonido('deny'); return; }
  const efecto = PETS.cuidados[tipo], k = Object.keys(efecto)[0];
  if (SAVE.nec[k] >= PETS.llena) { ptDice(tr(PT_FRASES.llena[tipo])); ptSonido('deny'); return; }
  SAVE.nec[k] = clamp(SAVE.nec[k] + efecto[k], 0, 100);
  ptAnima(tipo); ptSonido(tipo === 'comer' ? 'pop' : tipo === 'beber' ? 'blip' : 'heal');
  ptDice(ptFrase(tipo)); ptGuarda(); ptRefresca();
}
function ptDormir() {
  const ahora = ptAhora();
  if (!SAVE.dormida) { ptDuerme(ptEnHorario(ahora) ? 'siesta' : 'noche'); ptAnima('dormir'); ptSonido('note'); ptDice(ptFrase('dormir')); }
  else if (ptEnHorario(ahora)) { ptDespierta(); ptAnima('despertar'); ptDice(ptFrase('despertar')); }
  else {   // de noche: se levanta un rato, con sueño (y desde ahora se sabe que se puede: la siesta llegará más adelante)
    ptDespierta(); SAVE.despiertaHasta = ahora + PETS.noche.rato * PT_MIN; SAVE.nec.sueno = Math.min(SAVE.nec.sueno, PETS.noche.suenoMax); SAVE.siesta = true;
    ptAnima('despertar'); ptSonido('womp'); ptDice(ptFrase('noche'));
  }
  ptGuarda(); ptRefresca();
}
