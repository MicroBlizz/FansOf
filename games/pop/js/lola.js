// Fans of Pop · LOLA, la que explica el juego: sus consejos (PP_TUTO), su bocadillo abajo y cuándo habla. Reglas (Pepins, 19-11-2026, tras
// el informe de 5 probadores, tarea #140):
// · Un globo corto por momento (unas 8 palabras, sin palabras difíciles): cada consejo es UNA frase.
// · Nunca habla mientras juegas, y un globo por momento: lo que sale a mitad de un nivel (un combo…) o con Lola ocupada espera al
//   principio del nivel siguiente, antes del primer toque (así cada consejo sale donde tiene sentido).
// · Con ¡VALE! no se puede tocar nada más hasta pulsarlo (lo de detrás se oscurece, css/lola.css). Las frases `toque` (la manita del
//   nivel 1) esperan a que toques la burbuja y no llevan ¡VALE!.
// · «Saltar» apaga los consejos (SAVE.sinConsejos); se vuelven a encender en Opciones. Los estrenos de los primeros pasos
//   (ppLolaDice, js/primeros-pasos-juego.js) salen igual: traen un regalo.
// Los `encima` salen aunque haya una ventana abierta (tienda, pase…); con una ventana abierta, el globo va arriba para no tapar sus botones.
'use strict';
const PP_TUTO = {
  w1n1: [{ t: '¡Hola, soy Lola! Toca donde señala la manita.', toque: true }],
  w1n2: [{ t: '¡Haz pop! Caen también las de al lado.', toque: true }],   // por qué se hunden las demás (tarea #182)
  w1n3: [{ t: 'Arriba ves los toques que te quedan.' }],
  amigo: [{ t: '¡Tienes un amigo! Te ayuda cuando llena su barrita.' }],
  combo: [{ t: '¡Combo! Haz pop en 3 o más de un toque.' }],
  dificil: [{ t: 'Nivel difícil: muy pocos toques. ¡Piensa bien!' }],
  jefe: [{ t: '¡Nivel jefe! El CEO casi nunca falla.' }],
  nimNivel: [{ t: 'Por turnos, pop en una fila. ¡Pierde quien haga la última!' }],
  monedas: [{ t: '¡Monedas! Las ganas al pasar niveles nuevos.' }],
  modoPesadilla: [{ t: '¡Pesadilla! Tocar hunde, pero también levanta.' }],
  modoDificil: [{ t: 'Modo difícil: menos toques y el doble de monedas.' }],
  duelo: [{ t: 'Por turnos, pop en una fila. ¡Pierde quien haga la última!' }],
  memoria: [{ t: 'Mira en qué orden se hunden y repítelo.' }],
  w2n1: [{ t: 'Las de nata necesitan dos golpes.' }],
  w3n1: [{ t: 'Las heladas solo hacen pop si las tocas a ellas.' }],
  w4n1: [{ t: 'Si tocas una concha, solo hace pop ella.' }],
  w5n1: [{ t: 'Las de cereza necesitan tres golpes.' }],
  w6n1: [{ t: '¡Aquí está todo mezclado! Piensa cada toque.' }],
  w7n1: [{ t: 'Un cohete hace pop en toda su fila.' }],
  w8n1: [{ t: 'Las burbujeantes hacen pop en todo su alrededor.' }],
  w9n1: [{ t: 'Un pétalo hace pop en toda su columna.' }],
  w10n1: [{ t: '¡El Espacio! Al final te espera el CEO espacial.' }],
  ayudas: [{ t: 'Abajo tienes ayudas. ¡No gastan toques!' }],
  ayudasDuelo: [{ t: 'Deshacer vuelve atrás. La lupa te da la jugada buena.' }],
  arcoiris: [{ t: '¡Una burbuja arcoíris! Tócala la primera o se escapa.' }],
  trucoNim: [{ t: 'Truco: deja al rival filas iguales, por parejas.' }],
  despedidos: [{ t: 'En pesadilla tus amigos no ayudan. ¡Solo tú!' }],
  tienda: [{ t: 'Las perlas cuestan dinero de verdad. Si eres menor, pide permiso.', encima: true, bloquea: true }],   // precios honestos (tarea #177): este sí se lee antes de tocar
  sinCorazones: [{ t: 'Vuelve un corazón cada 30 minutos. ¡O llénalos aquí!', encima: true }],
  regalo: [{ t: '¡Un regalo cada día! El del domingo es el mejor.', encima: true }],
  pase: [{ t: 'Pasa niveles nuevos y sube escalones con premio.', encima: true }],
  hucha: [{ t: 'La hucha se llena al pasar niveles. ¡Rómpela!', encima: true }],
  racha: [{ t: 'Gana sin fallar y empiezas con más toques.', encima: true }],
  equipoLleno: [{ t: 'Equipo lleno: elige quién descansa o compra un hueco.', encima: true }],
};
// ¿este globo deja la pantalla oscura y sin responder hasta pulsar ¡VALE!? (tarea #248, Pepins 20-11-2026: ¡ABRIR! del regalo no respondía)
// Los consejos que explican una ventana (`encima`) solo informan: no bloquean, y el botón de la ventana funciona al primer toque.
// Siguen bloqueando la manita (`toque`, no lleva ¡VALE!), los que traen regalo y los que marcan `bloquea` (la tienda, que habla de dinero).
const ppLolaBloquea = f => !f.toque && (!f.encima || !!f.bloquea);
// un toque en lo oscuro (no responde nada): el ¡VALE! salta para que se vea qué hay que pulsar (tarea #248)
function ppLolaSacude() {
  const caja = $pp('#pp-lola'), vale = $pp('#pp-lola-vale');
  if (!PP_LOLA.actual || caja.hidden || !ppLolaBloquea(PP_LOLA.actual)) return false;
  vale.classList.remove('pp-sacude'); void vale.offsetWidth; vale.classList.add('pp-sacude');
  return true;
}
// cola: lo que dice ahora y después; espera: consejos que salieron a mitad de un nivel o con Lola ocupada (se dicen en el siguiente momento libre)
const PP_LOLA = { cola: [], actual: null, espera: [] };
// ¿se está jugando un nivel ya empezado? (desde el primer toque hasta que acaba)
const ppLolaEnJuego = () => !!(PP_P && PP_P.T && !PP_P.T.hecho && PP_P.T.tocado && (PP_PANT.actual === 'sala' || PP_PANT.actual === 'duelo'));
function ppTutorial(k) {
  if (!PP_TUTO[k] || SAVE.tuto[k] || SAVE.sinConsejos || ppPrimerosEspera(k)) return;   // ppPrimerosEspera: tarea #140
  // un globo por momento. Los `encima` explican la ventana que se acaba de abrir: si Lola está ocupada, salen la próxima vez que se abra
  const ventana = !!PP_TUTO[k][0].encima, ocupada = !!PP_LOLA.actual || PP_LOLA.cola.length > 0;
  if (ventana ? ocupada : ocupada || ppLolaEnJuego()) { if (!ventana && !PP_LOLA.espera.includes(k)) PP_LOLA.espera.push(k); return; }
  SAVE.tuto[k] = true; ppGuarda();
  PP_LOLA.cola.push(...PP_TUTO[k]);
  if (!ppCortActiva()) ppLolaSiguiente();   // con la cortinilla del jefe puesta, Lola espera a que acabe (ppEmpiezaNivel)
}
// el principio de un nivel, si Lola no ha dicho nada: UNO de los consejos que esperaban (lo llama ppEmpiezaNivel)
function ppLolaMomento() {
  if (ppLolaEnJuego() || PP_LOLA.actual || PP_LOLA.cola.length) return;
  const k = PP_LOLA.espera.shift();
  if (k) ppTutorial(k);
}
// la cortinilla de duelo tapa la pantalla: lo que Lola estuviera diciendo se guarda para después (Pepins, 16-11-2026, tarea #71)
function ppLolaAparca() {
  if (!PP_LOLA.actual) return;
  PP_LOLA.cola.unshift(PP_LOLA.actual); PP_LOLA.actual = null; $pp('#pp-lola').hidden = true;
}
function ppLolaSiguiente() {
  const caja = $pp('#pp-lola'), f = PP_LOLA.cola.shift();
  PP_LOLA.actual = f || null;
  if (!f) { caja.hidden = true; return; }
  const cara = $pp('#pp-lola-cara'); cara.innerHTML = ''; cara.appendChild(ppMiniatura('sl-lola', 92));
  $pp('#pp-lola-texto').textContent = f.ya ? f.t : tr(f.t);   // ya: llega traducido (ppLolaDice)
  $pp('#pp-lola-vale').textContent = tr('¡VALE!'); $pp('#pp-lola-vale').hidden = !!f.toque;
  const saltar = $pp('#pp-lola-saltar'); saltar.textContent = tr('Saltar'); saltar.hidden = !!f.ya;   // los estrenos traen regalo: no se saltan
  // con ¡VALE! no se puede tocar nada más hasta pulsarlo (Pepins, 19-11-2026: así sabes que lo has leído); sale encima de las ventanas
  caja.classList.toggle('pp-encima', !!f.encima || !f.toque); caja.classList.toggle('pp-espera', ppLolaBloquea(f));
  caja.hidden = false; caja.classList.remove('pp-entra'); void caja.offsetWidth; caja.classList.add('pp-entra');
  play('ppPista');
}
// la frase que espera a que toques una burbuja
function ppLolaToque() { if (PP_LOLA.actual && PP_LOLA.actual.toque) ppLolaSiguiente(); }
function ppLolaCierra() { PP_LOLA.cola = []; PP_LOLA.actual = null; const c = $pp('#pp-lola'); if (c) c.hidden = true; }
// «Saltar»: Lola se calla y no da más consejos (se encienden otra vez en Opciones). Lo que quedaba por decir se olvida.
function ppLolaSalta() {
  SAVE.sinConsejos = true; ppGuarda();
  PP_LOLA.espera = []; PP_LOLA.cola = PP_LOLA.cola.filter(f => f.ya);   // los estrenos que esperaban, sí
  ppLolaSiguiente();
}
// el botón de Opciones: consejos de Lola sí o no
function ppBotonConsejos() {
  const texto = () => (SAVE.sinConsejos ? tr('CONSEJOS DE LOLA: NO') : tr('CONSEJOS DE LOLA: SÍ'));
  const b = ppBoton(texto(), 'pp-btn2 pp-sec', () => { SAVE.sinConsejos = !SAVE.sinConsejos; ppGuarda(); b.textContent = texto(); });
  return b;
}
