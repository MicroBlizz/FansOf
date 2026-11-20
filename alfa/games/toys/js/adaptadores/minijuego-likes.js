// Fans of Toys · minijuego · LIKES DEL CHAT: caen likes y mensajes del chat y se tocan al vuelo. El like vale 1, el mensaje 3 y el SPAM
// (en rojo) resta 2. Pinta el escenario de TY.Minijuegos.escenario('likes') y, al acabar, llama a termina({ puntos, maximo }). Devuelve
// la función que lo para.
'use strict';
TY.minijuegos.likes = (area, esc, ctx) => {
  const C = TY.crea, PALABRAS = ['GG', 'XD', 'POG', 'F', 'LOL'], ALTO = 46;
  let puntos = 0, vivo = true, raf = 0;
  const inicio = performance.now();
  const muestra = () => { ctx.marcador.textContent = tr('Puntos: {n}', { n: puntos }); };
  const texto = (cosa, i) => (cosa.clase === 'like' ? 'LIKE' : cosa.clase === 'chat' ? PALABRAS[i % PALABRAS.length] : 'SPAM');
  const toca = cosa => {
    if (cosa.estado !== 'cae') return;
    cosa.estado = 'hecha'; puntos += TY.Minijuegos.PUNTOS_LIKES[cosa.clase];
    TY.sonido.suena(cosa.clase === 'spam' ? 'golpe' : 'pop');
    cosa.boton.classList.add(cosa.clase === 'spam' ? 'ty-mal' : 'ty-pop'); setTimeout(() => cosa.boton.remove(), 260); muestra();
  };
  const cosas = esc.cosas.map((d, i) => {
    const cosa = { ...d, estado: 'espera', boton: C('button', { className: `ty-cosa ty-c-${d.clase}`, textContent: texto(d, i), style: `left:${d.x * 100}%` }) };
    cosa.boton.onpointerdown = () => toca(cosa);
    return cosa;
  });
  const cae = (cosa, t, alto) => {
    if (cosa.estado === 'espera' && t >= cosa.t) { cosa.estado = 'cae'; area.append(cosa.boton); }
    if (cosa.estado !== 'cae') return cosa.estado === 'espera';
    const avance = (t - cosa.t) / esc.caida;
    if (avance >= 1) { cosa.estado = 'fuera'; cosa.boton.remove(); return false; }
    cosa.boton.style.top = `${avance * (alto + ALTO) - ALTO}px`;
    return true;
  };
  const paso = ahora => {
    if (!vivo) return;
    const quedan = cosas.filter(cosa => cae(cosa, ahora - inicio, area.clientHeight)).length;
    if (quedan) raf = requestAnimationFrame(paso); else { vivo = false; ctx.termina({ puntos, maximo: esc.maximo }); }
  };
  muestra();
  raf = requestAnimationFrame(paso);
  return () => { vivo = false; cancelAnimationFrame(raf); };
};
