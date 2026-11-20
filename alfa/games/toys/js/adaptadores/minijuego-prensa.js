// Fans of Toys · minijuego · LA PRENSA: tres golpes. Se mantiene pulsado el botón para cargar la prensa (la barra sube) y se suelta con
// la barra dentro de la zona verde; cuanto más al centro, mejor sale el lote. Cada golpe se puntúa con TY.Minijuegos.puntuaPrensa. Al
// acabar llama a termina({ puntos }). Devuelve la función que lo para.
'use strict';
TY.minijuegos.prensa = (area, esc, ctx) => {
  const C = TY.crea, zona = C('i', { className: 'ty-zona' }), nivel = C('i', { className: 'ty-nivel' }), dicho = C('p', { className: 'ty-golpe' });
  const juguete = TY.icono(ctx.juguete, 80), boton = C('button', { className: 'ty-boton ty-principal ty-pulsa', textContent: tr('Mantén pulsado') });
  let golpe = 0, inicio = null, posicion = 0, bloqueado = false, vivo = true, raf = 0, espera = 0;
  const puntos = [];
  const prepara = () => {
    const g = esc.intentos[golpe];
    zona.style.bottom = `${(g.centro - g.ancho / 2) * 100}%`; zona.style.height = `${g.ancho * 100}%`; nivel.style.height = '0%'; juguete.style.transform = '';
    dicho.textContent = ''; ctx.marcador.textContent = tr('Golpe {n} de 3', { n: golpe + 1 }); bloqueado = false;
  };
  const sube = ahora => {
    if (inicio === null) return;
    posicion = Math.min(1, (ahora - inicio) / esc.subida);
    nivel.style.height = `${posicion * 100}%`; juguete.style.transform = `scaleY(${1 - posicion * 0.45})`;
    if (posicion >= 1) suelta(); else raf = requestAnimationFrame(sube);
  };
  const empieza = () => { if (inicio !== null || bloqueado || !vivo) return; inicio = performance.now(); TY.sonido.suena('boton'); raf = requestAnimationFrame(sube); };
  const suelta = () => {
    if (inicio === null) return;
    cancelAnimationFrame(raf); inicio = null; bloqueado = true;
    const valor = TY.Minijuegos.puntuaPrensa(posicion, esc.intentos[golpe]);
    puntos.push(valor); golpe++;
    dicho.textContent = tr(valor >= 0.9 ? '¡Perfecto!' : valor >= 0.7 ? 'Bien' : valor > 0 ? 'Casi' : 'Fallo');
    TY.sonido.suena(valor >= 0.7 ? 'pop' : 'golpe');
    espera = setTimeout(() => { if (golpe >= esc.intentos.length) { vivo = false; ctx.termina({ puntos }); } else prepara(); }, 700);
  };
  boton.onpointerdown = e => { if (boton.setPointerCapture) boton.setPointerCapture(e.pointerId); empieza(); };
  boton.onpointerup = suelta; boton.onpointercancel = suelta;
  area.append(C('div', { className: 'ty-prensa' }, C('div', { className: 'ty-prensa-cuerpo' }, juguete, C('div', { className: 'ty-medidor' }, zona, nivel)), dicho, boton));
  prepara();
  return () => { vivo = false; cancelAnimationFrame(raf); clearTimeout(espera); };
};
