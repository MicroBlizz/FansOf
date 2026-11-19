// Fans of Pop · EL MARCO DEL PANEL DE VICTORIA DE CADA MUNDO (tarea #168, Pepins, 19-11-2026: «este marquito blanco lo quiero
// personalizado por mundo, así es muy soso»). De momento va por código, como el boceto que vio (sin la costura de puntos, que le
// parecía muy fea): el borde, las casillas y las cajitas del color del mundo, un remate en el borde (hojitas, glaseado, olas…)
// y tres de las cositas que flotan en ese mundo en las esquinas. Está a la espera de los marcos que pinte Yoshi (se empieza por el
// Jardín). El dibujo, en css/victoria-marco.css; el panel, en js/pantalla-victoria.js.
'use strict';
const pvMarco = (c1, c2, remate, adornos) => Object.freeze({ c1, c2, remate, adornos: Object.freeze(adornos) });
// por el fondo del mundo (PP_MUNDOS[m].fondo); los adornos son flotantes de ese mundo (PP_FLOTA_MUNDO, js/sprites.js)
const PP_VIC_MARCOS = Object.freeze({
  'fondo-jardin': pvMarco('#7bd88f', '#3fae5d', 'hojas', ['f-mariposa', 'f-mariquita', 'f-girasol']),
  'fondo-pasteleria': pvMarco('#ff8fc0', '#e0559a', 'glaseado', ['f-cupcake', 'f-donut', 'f-macaron']),
  'fondo-heladeria': pvMarco('#8fe3d8', '#3fb5a6', 'glaseado', ['f-helado', 'f-polo', 'f-cucurucho']),
  'fondo-playa': pvMarco('#4fd1e8', '#1f9fbf', 'olas', ['f-cangrejo', 'f-estrellamar', 'f-sandia']),
  'fondo-feria': pvMarco('#ffd04d', '#d99a00', 'luces', ['f-algodon', 'f-globo', 'f-palomitas']),
  'fondo-nubes': pvMarco('#9fd4ff', '#4a9be0', 'nubes', ['f-nube', 'f-arcoiris', 'f-unicornio']),
  'fondo-bosque': pvMarco('#8ccf6a', '#4c8f2f', 'hojas', ['f-seta', 'f-zorrito', 'f-bellota']),
  'fondo-mar': pvMarco('#4fb8f0', '#1f74c8', 'olas', ['f-pezglobo', 'f-caballitomar', 'f-conchita']),
  'fondo-sakura': pvMarco('#ffb0cf', '#e06a9a', 'petalos', ['f-farolillo', 'f-sakura', 'f-dango']),
  'fondo-espacio': pvMarco('#6f7cf0', '#3a44b8', 'estrellas', ['f-planeta', 'f-cohetito', 'f-luna']),
});
// el marco del nivel `T` (null si no es un nivel de un mundo: entonces el panel lleva el borde blanco de siempre)
function ppVicMarcoDe(T) {
  const M = T && T.d && PP_MUNDOS[T.d.mundo];
  return (M && PP_VIC_MARCOS[M.fondo]) || null;
}
// lo que se le pone al panel: la clase, los colores y los tres adornos
function ppVicMarcoPon(panel, T) {
  const k = ppVicMarcoDe(T);
  if (!panel || !k) return;
  panel.classList.add('pp-vic-marco', 'pp-vic-remate-' + k.remate);
  panel.style.setProperty('--marco1', k.c1); panel.style.setProperty('--marco2', k.c2);
  k.adornos.forEach((f, i) => {
    if (!PP_IMG[f]) return;   // sin el dibujo cargado, sin adorno (mejor nada que una bolita)
    const s = document.createElement('span');
    s.className = 'pp-vic-adorno pp-vic-adorno-' + i; s.innerHTML = ppIcono(f, 60);
    panel.appendChild(s);
  });
}
