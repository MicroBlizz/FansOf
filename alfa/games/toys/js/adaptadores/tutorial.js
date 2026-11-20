// Fans of Toys · adaptador · TUTORIAL: el tutorial guiado de la primera partida. Sobre la pantalla aparece un velo con un agujero
// iluminado en lo que se explica y un globo con el texto (TY.TUTORIAL tiene los pasos de cada pantalla). Solo sale mientras la cuenta
// no lo haya visto (TY.sesion.datos.tutorialVisto) y solo en el primer mes: se acaba al cerrar el primer resultado o con «Saltar».
// TY.pantallas.ve llama a TY.tutorial.alMostrar(pantalla) cada vez que cambia de pantalla.
'use strict';
TY.tutorial = (() => {
  const C = TY.crea;
  let capa = null, vivo = 0;   // `vivo` sube con cada cierre: un tutorial que esperaba su turno se da cuenta de que ya no toca

  const cierra = () => { if (capa) capa.remove(); capa = null; vivo++; };
  const pasosDe = nombre => {
    const p = TY.sesion.partida, lista = TY.TUTORIAL[nombre];
    if (!p || !lista || TY.sesion.datos.tutorialVisto) return null;
    return (nombre === 'mejora' ? p.fase === 'director' : p.mes === 0) ? lista : null;
  };

  // el globo arriba o abajo del objetivo, según dónde esté; sin objetivo, en el centro
  const coloca = (paso, foco, globo, velo) => {
    const objetivo = paso.objetivo && document.querySelector(paso.objetivo);
    velo.classList.toggle('ty-tuto-sin', !objetivo);
    foco.style.display = objetivo ? '' : 'none';
    globo.style.cssText = '';
    if (!objetivo) return;
    objetivo.scrollIntoView({ block: 'center' });
    const esc = document.getElementById('ty-escenario').getBoundingClientRect(), r = objetivo.getBoundingClientRect();
    Object.assign(foco.style, { left: `${r.left - esc.left - 5}px`, top: `${r.top - esc.top - 5}px`, width: `${r.width + 10}px`, height: `${r.height + 10}px` });
    if (r.top - esc.top > esc.height / 2) globo.style.bottom = `${esc.bottom - r.top + 14}px`; else globo.style.top = `${r.bottom - esc.top + 14}px`;
  };

  const muestra = (nombre, lista) => {
    let i = 0;
    const velo = C('div', { className: 'ty-tuto' }), foco = C('div', { className: 'ty-tuto-foco' }), globo = C('div', { className: 'ty-tuto-globo' });
    const termina = () => { cierra(); if (nombre === 'resultado') TY.sesion.marcaTutorial(true); };
    const salta = () => { TY.sonido.suena('boton'); cierra(); TY.sesion.marcaTutorial(true); };
    const pinta = () => {
      const paso = lista[i], ultimo = i === lista.length - 1;
      globo.replaceChildren(C('small', { textContent: `${i + 1} / ${lista.length}` }), C('h3', { textContent: tr(paso.titulo) }), C('p', { textContent: tr(paso.texto) }),
        C('div', { className: 'ty-tuto-botones' },
          C('button', { className: 'ty-boton ty-principal', id: 'ty-tuto-sigue', textContent: tr(ultimo ? 'Entendido' : 'Siguiente'), onclick: () => { TY.sonido.suena('boton'); if (ultimo) termina(); else { i++; pinta(); } } }),
          C('button', { className: 'ty-tuto-saltar', id: 'ty-tuto-salta', textContent: tr('Saltar tutorial'), onclick: salta })));
      coloca(paso, foco, globo, velo);
    };
    velo.append(foco, globo);
    document.getElementById('ty-escenario').append(velo);
    capa = velo;
    pinta();
  };

  return {
    alMostrar(nombre) {
      cierra();
      const lista = pasosDe(nombre), mio = vivo;
      if (!lista) return;
      const arranca = () => { if (mio === vivo) muestra(nombre, lista); };
      // en el resultado las cuentas salen una a una: se espera a que estén
      if (nombre === 'resultado' && TY.animado) setTimeout(arranca, 2800); else requestAnimationFrame(arranca);
    },
    repite() { TY.sesion.marcaTutorial(false); },
    get activo() { return !!capa; },
  };
})();
