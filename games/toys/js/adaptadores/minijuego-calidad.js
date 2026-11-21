// Fans of Toys · minijuego · CONTROL DE CALIDAD: doce juguetes pasan por la cinta y cinco están rotos (llevan una raya roja). Se tocan
// los rotos antes de que lleguen al final; tocar uno bueno resta. Pinta el escenario de TY.Minijuegos.escenario('calidad') y, al
// acabar, llama a termina({ aciertos, fallos, malos }). Devuelve la función que lo para.
'use strict';
TY.minijuegos.calidad = (area, esc, ctx) => {
  const C = TY.crea, cinta = C('div', { className: 'ty-cinta' }), LADO = 56;
  let aciertos = 0, fallos = 0, vivo = true, raf = 0;
  const inicio = performance.now();
  const muestra = () => { ctx.marcador.textContent = tr('Rotos cazados: {a} de {n}', { a: aciertos, n: esc.malos }); };
  const sale = (pieza, clase) => { pieza.estado = 'hecha'; pieza.boton.classList.add(clase); setTimeout(() => pieza.boton.remove(), 260); };
  const toca = pieza => {
    if (pieza.estado !== 'viaja') return;
    if (pieza.malo) { aciertos++; TY.sonido.suena('pop'); sale(pieza, 'ty-pop'); } else { fallos++; TY.sonido.suena('golpe'); sale(pieza, 'ty-mal'); }
    muestra();
  };
  const piezas = esc.piezas.map(d => {
    const pieza = { ...d, estado: 'espera', boton: C('button', { className: `ty-pieza${d.malo ? ' ty-rota' : ''}`, style: `width:${LADO}px;height:${LADO}px` }, TY.icono(ctx.juguete, LADO - 8)) };
    pieza.boton.onpointerdown = () => toca(pieza);
    return pieza;
  });
  // coloca una pieza según lo que lleva recorrido (0 a 1) y dice si sigue en la cinta
  const mueve = (pieza, t) => {
    if (pieza.estado === 'espera' && t >= pieza.t) { pieza.estado = 'viaja'; cinta.append(pieza.boton); }
    if (pieza.estado !== 'viaja') return pieza.estado === 'espera';
    const avance = (t - pieza.t) / esc.viaje;
    if (avance >= 1) { pieza.estado = 'fuera'; pieza.boton.remove(); return false; }
    pieza.boton.style.left = `calc(${avance * 100}% - ${avance * LADO}px)`;
    return true;
  };
  const paso = ahora => {
    if (!vivo) return;
    const quedan = piezas.filter(pieza => mueve(pieza, ahora - inicio)).length;
    if (quedan) raf = requestAnimationFrame(paso); else { vivo = false; ctx.termina({ aciertos, fallos, malos: esc.malos }); }
  };
  area.append(C('p', { className: 'ty-mj-leyenda', textContent: tr('Rotos: los de la raya roja') }), cinta);
  muestra();
  raf = requestAnimationFrame(paso);
  return () => { vivo = false; cancelAnimationFrame(raf); };
};
